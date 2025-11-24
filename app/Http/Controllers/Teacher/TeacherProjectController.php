<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TeacherProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}
    /**
     * عرض قائمة المشاريع المرسلة من المعلم
     */
    public function index()
    {
        $user = Auth::user();
        $teacher = $user->teacher;
        
        if (!$teacher) {
            return redirect()->route('teacher.dashboard')
                ->with('error', 'لم يتم العثور على بيانات المعلم');
        }
        
        $projects = $this->projectService->getTeacherProjects($teacher->id, 10);

        return Inertia::render('Teacher/Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * عرض صفحة إنشاء مشروع جديد
     */
    public function create()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return redirect()->route('login');
            }
            
            // الحصول على مدرسة المعلم (من user model)
            $school = $user->school;
            
            // الحصول على قائمة المدارس المتاحة (اختياري - يمكن للمعلم اختيار مدرسة)
            $schools = User::where('role', 'school')
                ->select('id', 'name')
                ->get();

            return Inertia::render('Teacher/Projects/Create', [
                'school' => $school ? [
                    'id' => $school->id,
                    'name' => $school->name,
                ] : null,
                'schools' => $schools,
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in TeacherProjectController@create: ' . $e->getMessage());
            return redirect()->route('teacher.dashboard')
                ->with('error', 'حدث خطأ أثناء تحميل الصفحة: ' . $e->getMessage());
        }
    }

    /**
     * حفظ مشروع جديد
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $teacher = $user->teacher;
        
        if (!$teacher) {
            return back()->withErrors([
                'error' => 'لم يتم العثور على بيانات المعلم',
            ])->withInput();
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|in:science,technology,engineering,mathematics,arts,other',
            'school_id' => 'nullable|exists:users,id',
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,gif,mp4,avi,mov',
        ], [
            'title.required' => 'عنوان المشروع مطلوب',
            'description.required' => 'وصف المشروع مطلوب',
            'category.in' => 'فئة المشروع غير صحيحة',
            'school_id.exists' => 'المدرسة المحددة غير موجودة',
            'files.*.max' => 'حجم الملف يجب ألا يتجاوز 10 ميجابايت',
            'files.*.mimes' => 'نوع الملف المدعوم: صور، فيديو، PDF',
        ]);

        // الحصول على school_id من الطلب أو من المستخدم
        $schoolId = $validated['school_id'] ?? $user->school_id;

        // التحقق من أن المدرسة موجودة إذا تم تحديدها
        if ($schoolId) {
            $school = User::where('id', $schoolId)
                ->where('role', 'school')
                ->first();
            
            if (!$school) {
                return back()->withErrors([
                    'school_id' => 'المدرسة المحددة غير موجودة.',
                ])->withInput();
            }
        }

        $project = Project::create([
            'user_id' => $user->id,
            'teacher_id' => $teacher->id,
            'school_id' => $schoolId,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'] ?? 'other',
            'status' => 'pending', // بانتظار موافقة المدرسة (إن وجدت)
        ]);

        // تحديث المشروع للتأكد من الحفظ
        $project->refresh();

        // رفع الملفات
        if ($request->hasFile('files')) {
            $uploadedFiles = [];
            foreach ($request->file('files') as $file) {
                // تحديد نوع الملف (صورة أو فيديو أو PDF)
                $mimeType = $file->getMimeType();
                if (str_starts_with($mimeType, 'image/')) {
                    $path = $file->store('projects/images', 'public');
                } elseif (str_starts_with($mimeType, 'video/')) {
                    $path = $file->store('projects/videos', 'public');
                } else {
                    $path = $file->store('projects/files', 'public');
                }
                $uploadedFiles[] = $path;
            }
            $project->files = $uploadedFiles;
            $project->save();
        }

        // إرسال حدث إنشاء مشروع من معلم (دائماً إذا كان هناك school_id)
        if ($project->school_id) {
            // تحديث المشروع لضمان أن العلاقات محملة
            $project->refresh();
            $project->load('teacher.user');
            
            // إرسال الإشعار مباشرة للتأكد من عمله
            try {
                $school = \App\Models\User::find($project->school_id);
                if ($school && $school->role === 'school') {
                    $school->notify(new \App\Notifications\TeacherProjectCreatedNotification($project));
                }
            } catch (\Exception $e) {
                \Log::error('Failed to send notification directly: ' . $e->getMessage(), [
                    'trace' => $e->getTraceAsString(),
                ]);
            }
            
            // أيضاً إرسال الحدث
            event(new \App\Events\TeacherProjectCreated($project));
        }

        // مسح الكاش لضمان ظهور المشروع الجديد في القائمة
        $this->projectService->clearProjectCache($project->id, null, $teacher->id, $schoolId);
        
        // مسح الكاش مباشرة للتأكد (يعمل مع جميع أنواع cache drivers)
        $cacheDriver = config('cache.default');
        if (in_array($cacheDriver, ['redis', 'memcached'])) {
            \Cache::tags(["teacher_projects_{$teacher->id}"])->flush();
        } else {
            // مسح مباشر بدون tags - مسح جميع الصفحات المحتملة
            for ($page = 1; $page <= 20; $page++) {
                \Cache::forget("teacher_projects_{$teacher->id}_{$page}");
            }
        }

        return redirect()->route('teacher.projects.index')
            ->with('success', 'تم إرسال المشروع بنجاح! سيتم مراجعته من قبل المدرسة قريباً.');
    }

    /**
     * عرض تفاصيل مشروع
     */
    public function show(Project $project)
    {
        $user = Auth::user();
        $teacher = $user->teacher;
        
        if (!$teacher) {
            abort(403, 'لم يتم العثور على بيانات المعلم');
        }
        
        // التحقق من أن المشروع منشأ من قبل هذا المعلم
        if ($project->teacher_id !== $teacher->id) {
            abort(403, 'غير مصرح لك بعرض هذا المشروع');
        }

        $project->load(['school', 'approver', 'user', 'teacher']);

        return Inertia::render('Teacher/Projects/Show', [
            'project' => $project,
        ]);
    }

    /**
     * عرض صفحة تعديل مشروع
     */
    public function edit(Project $project)
    {
        $user = Auth::user();
        $teacher = $user->teacher;
        
        if (!$teacher) {
            abort(403, 'لم يتم العثور على بيانات المعلم');
        }
        
        // التحقق من أن المشروع منشأ من قبل هذا المعلم
        if ($project->teacher_id !== $teacher->id) {
            abort(403, 'غير مصرح لك بتعديل هذا المشروع');
        }

        // السماح بالتعديل فقط إذا كان المشروع في حالة pending
        if ($project->status !== 'pending') {
            return redirect()->route('teacher.projects.index')
                ->with('error', 'لا يمكن تعديل المشروع بعد الموافقة عليه أو رفضه');
        }

        $project->load(['school']);

        // الحصول على قائمة المدارس المتاحة
        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->get();

        return Inertia::render('Teacher/Projects/Edit', [
            'project' => $project,
            'school' => $project->school ? [
                'id' => $project->school->id,
                'name' => $project->school->name,
            ] : null,
            'schools' => $schools,
        ]);
    }

    /**
     * تحديث مشروع
     */
    public function update(Request $request, Project $project)
    {
        $user = Auth::user();
        $teacher = $user->teacher;
        
        if (!$teacher) {
            abort(403, 'لم يتم العثور على بيانات المعلم');
        }
        
        // التحقق من أن المشروع منشأ من قبل هذا المعلم
        if ($project->teacher_id !== $teacher->id) {
            abort(403, 'غير مصرح لك بتعديل هذا المشروع');
        }

        // السماح بالتعديل فقط إذا كان المشروع في حالة pending
        if ($project->status !== 'pending') {
            return back()->withErrors([
                'error' => 'لا يمكن تعديل المشروع بعد الموافقة عليه أو رفضه',
            ]);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|in:science,technology,engineering,mathematics,arts,other',
            'school_id' => 'nullable|exists:users,id',
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,gif,mp4,avi,mov',
            'remove_files' => 'nullable|array',
            'remove_files.*' => 'string',
        ], [
            'title.required' => 'عنوان المشروع مطلوب',
            'description.required' => 'وصف المشروع مطلوب',
            'category.in' => 'فئة المشروع غير صحيحة',
            'school_id.exists' => 'المدرسة المحددة غير موجودة',
            'files.*.max' => 'حجم الملف يجب ألا يتجاوز 10 ميجابايت',
            'files.*.mimes' => 'نوع الملف المدعوم: صور، فيديو، PDF',
        ]);

        // الحصول على school_id من الطلب أو من المستخدم
        $schoolId = $validated['school_id'] ?? $user->school_id;

        // التحقق من أن المدرسة موجودة إذا تم تحديدها
        if ($schoolId) {
            $school = User::where('id', $schoolId)
                ->where('role', 'school')
                ->first();
            
            if (!$school) {
                return back()->withErrors([
                    'school_id' => 'المدرسة المحددة غير موجودة.',
                ])->withInput();
            }
        }

        // حذف الملفات المحددة للحذف
        if (!empty($validated['remove_files'])) {
            $currentFiles = $project->files ?? [];
            foreach ($validated['remove_files'] as $fileToRemove) {
                if (in_array($fileToRemove, $currentFiles)) {
                    Storage::disk('public')->delete($fileToRemove);
                    $currentFiles = array_values(array_diff($currentFiles, [$fileToRemove]));
                }
            }
            $project->files = $currentFiles;
        }

        // رفع الملفات الجديدة
        if ($request->hasFile('files')) {
            $uploadedFiles = $project->files ?? [];
            foreach ($request->file('files') as $file) {
                // تحديد نوع الملف (صورة أو فيديو أو PDF)
                $mimeType = $file->getMimeType();
                if (str_starts_with($mimeType, 'image/')) {
                    $path = $file->store('projects/images', 'public');
                } elseif (str_starts_with($mimeType, 'video/')) {
                    $path = $file->store('projects/videos', 'public');
                } else {
                    $path = $file->store('projects/files', 'public');
                }
                $uploadedFiles[] = $path;
            }
            $project->files = $uploadedFiles;
        }

        // تحديث بيانات المشروع
        $project->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'] ?? 'other',
            'school_id' => $schoolId,
        ]);

        // مسح الكاش
        $this->projectService->clearProjectCache($project->id, null, $teacher->id, $schoolId);

        return redirect()->route('teacher.projects.index')
            ->with('success', 'تم تحديث المشروع بنجاح!');
    }

    /**
     * حذف مشروع
     */
    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        $teacher = $user->teacher;
        
        if (!$teacher) {
            abort(403, 'لم يتم العثور على بيانات المعلم');
        }

        // البحث عن المشروع
        $project = Project::find($id);
        
        if (!$project) {
            return back()->withErrors([
                'error' => 'المشروع غير موجود',
            ]);
        }
        
        // التحقق من أن المشروع منشأ من قبل هذا المعلم
        if ($project->teacher_id !== $teacher->id) {
            abort(403, 'غير مصرح لك بحذف هذا المشروع');
        }

        // السماح بالحذف فقط إذا كان المشروع في حالة pending
        if ($project->status !== 'pending') {
            return back()->withErrors([
                'error' => 'لا يمكن حذف المشروع بعد الموافقة عليه أو رفضه',
            ]);
        }

        try {
            // حذف الملفات المرتبطة
            if ($project->files && is_array($project->files)) {
                foreach ($project->files as $file) {
                    if ($file) {
                        Storage::disk('public')->delete($file);
                    }
                }
            }

            $schoolId = $project->school_id;
            $projectId = $project->id;

            // حذف المشروع
            $project->delete();

            // مسح الكاش
            $this->projectService->clearProjectCache($projectId, null, $teacher->id, $schoolId);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'تم حذف المشروع بنجاح!',
                ]);
            }

            return redirect()->route('teacher.projects.index')
                ->with('success', 'تم حذف المشروع بنجاح!');
        } catch (\Exception $e) {
            \Log::error('Error deleting project: ' . $e->getMessage(), [
                'project_id' => $project->id,
                'teacher_id' => $teacher->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors([
                'error' => 'حدث خطأ أثناء حذف المشروع. يرجى المحاولة مرة أخرى.',
            ]);
        }
    }
}

