<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SchoolProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}
    // عرض المشاريع المعلقة للمراجعة
    public function pending(Request $request)
    {
        $school = Auth::user();

        $projects = $this->projectService->getSchoolPendingProjects(
            $school->canAccessAllSchoolData() ? 0 : $school->id,
            $request->get('search'),
            $request->get('category'),
            15
        )->withQueryString();

        return Inertia::render('School/Projects/Pending', [
            'projects' => $projects,
        ]);
    }

    // عرض جميع مشاريع المدرسة
    public function index(Request $request)
    {
        $school = Auth::user();

        $projects = $this->projectService->getSchoolProjects(
            $school->canAccessAllSchoolData() ? 0 : $school->id,
            $request->get('search'),
            $request->get('status'),
            $request->get('category'),
            15,
            false
        )->withQueryString();

        return Inertia::render('School/Projects/Index', [
            'projects' => $projects,
        ]);
    }

    // إنشاء مشروع جديد من قبل المدرسة
    public function create()
    {
        return Inertia::render('School/Projects/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:science,technology,engineering,mathematics,arts,other',
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120',
            'report' => 'nullable|string',
        ]);

        $school = Auth::user();

        $project = Project::create([
            'user_id' => $school->id,
            'school_id' => $school->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'status' => 'approved',
            'approved_by' => $school->id,
            'approved_at' => now(),
            'report' => $validated['report'] ?? null,
        ]);

        // رفع الملفات
        if ($request->hasFile('files')) {
            $files = [];
            foreach ($request->file('files') as $file) {
                $files[] = $file->store('projects/files', 'public');
            }
            $project->files = $files;
        }

        // رفع الصور
        if ($request->hasFile('images')) {
            $images = [];
            foreach ($request->file('images') as $image) {
                $images[] = $image->store('projects/images', 'public');
            }
            $project->images = $images;
        }

        $project->save();

        // إرسال إشعار لجميع الطلاب في المدرسة
        \App\Jobs\SendNewProjectNotification::dispatch($project);

        return redirect()->route('school.projects.index')
            ->with('success', 'تم إنشاء المشروع بنجاح');
    }

    // قبول مشروع
    public function approve(Project $project)
    {
        $school = Auth::user();

        // إعادة تحميل المشروع للتأكد من الحصول على أحدث البيانات
        $project->refresh();
        $project->load(['user', 'teacher', 'school']);

        // الحصول على قائمة طلاب المدرسة (مطابق لمنطق getSchoolPendingProjects)
        $students = User::where('school_id', $school->id)->where('role', 'student')->pluck('id')->toArray();

        // التحقق من الصلاحية: إما مشروع طالب أو مشروع معلم مرسل لهذه المدرسة
        // يجب أن يكون منطق التحقق مطابقاً تماماً لمنطق getSchoolPendingProjects
        $isStudentProject = in_array($project->user_id, $students);

        // للمشاريع من المعلمين: التحقق من أن teacher_id موجود و school_id مطابق
        // هذا مطابق تماماً لشرط getSchoolPendingProjects: whereNotNull('teacher_id') && where('school_id', $schoolId)
        $isTeacherProject = $project->teacher_id !== null && $project->school_id === $school->id;

        // Logging للتشخيص
        Log::info('Project approval attempt', [
            'project_id' => $project->id,
            'project_status' => $project->status,
            'project_school_id' => $project->school_id,
            'current_school_id' => $school->id,
            'project_teacher_id' => $project->teacher_id,
            'project_user_id' => $project->user_id,
            'isStudentProject' => $isStudentProject,
            'isTeacherProject' => $isTeacherProject,
            'students' => $students,
        ]);

        if (!$school->canAccessAllSchoolData() && ((!$isStudentProject && !$isTeacherProject) || $project->status !== 'pending')) {
            Log::warning('Project approval denied', [
                'project_id' => $project->id,
                'reason' => !$isStudentProject && !$isTeacherProject ? 'not_authorized' : 'not_pending',
                'status' => $project->status,
            ]);
            abort(403, 'غير مصرح لك بقبول هذا المشروع');
        }

        // تحديث المشروع
        $updated = $project->update([
            'status' => 'approved',
            'approved_by' => $school->id,
            'approved_at' => now(),
            'school_id' => $school->id, // التأكد من تعيين school_id
        ]);

        if (!$updated) {
            Log::error('Failed to update project status', [
                'project_id' => $project->id,
                'school_id' => $school->id,
            ]);
            return redirect()->back()->with('error', 'حدث خطأ أثناء قبول المشروع');
        }

        // تحديث المشروع للتأكد من الحفظ
        $project->refresh();
        $project->load(['school', 'teacher', 'user']);

        // التحقق من أن المشروع تم قبوله بشكل صحيح
        if ($project->status !== 'approved') {
            Log::error('Project status not updated correctly', [
                'project_id' => $project->id,
                'status' => $project->status,
                'expected' => 'approved',
            ]);
            return redirect()->back()->with('error', 'حدث خطأ أثناء قبول المشروع');
        }

        Log::info('Project approved successfully', [
            'project_id' => $project->id,
            'status' => $project->status,
            'school_id' => $project->school_id,
            'approved_by' => $project->approved_by,
        ]);

        // إرسال حدث قبول المشروع
        \App\Events\ProjectApproved::dispatch($project);

        // إرسال إشعار لجميع الطلاب والمعلمين في المدرسة عند قبول المشروع
        \App\Jobs\SendNewProjectNotification::dispatch($project);

        // منح نقاط للطالب أو المعلم
        $pointsService = app(\App\Services\PointsService::class);
        $user = $project->user;
        
        if ($user && $user->role === 'student') {
            $pointsToAdd = 10; // نقاط عند قبول المشروع
            // Use PointsService for proper integration
            $pointsService->awardPoints(
                $user->id,
                $pointsToAdd,
                'project_approval',
                $project->id,
                "Project approved: {$project->title}",
                "تم قبول المشروع: {$project->title}"
            );

            // Note: PointsService handles Point::create and user->increment automatically

            $project->update(['points_earned' => $pointsToAdd]);
        } elseif ($project->teacher_id) {
            // منح نقاط للمعلم أيضاً
            $teacher = User::find($project->teacher_id);
            if ($teacher) {
                $pointsToAdd = 15; // نقاط أكثر للمعلم
                
                // Use PointsService for proper integration
                $pointsService->awardPoints(
                    $teacher->id,
                    $pointsToAdd,
                    'teacher_project_approval',
                    $project->id,
                    "Teacher project approved: {$project->title}",
                    "موافقة على مشروع المعلم: {$project->title}"
                );
            }
        }

        return redirect()->back()->with('success', 'تم قبول المشروع بنجاح');
    }

    // رفض مشروع
    public function reject(Request $request, Project $project)
    {
        $school = Auth::user();
        $students = User::where('school_id', $school->id)->where('role', 'student')->pluck('id');

        // التحقق من الصلاحية: إما مشروع طالب أو مشروع معلم مرسل لهذه المدرسة
        $isStudentProject = in_array($project->user_id, $students->toArray());
        $isTeacherProject = $project->teacher_id !== null && $project->school_id === $school->id;

        if (!$school->canAccessAllSchoolData() && ((!$isStudentProject && !$isTeacherProject) || $project->status !== 'pending')) {
            abort(403, 'غير مصرح لك برفض هذا المشروع');
        }

        $project->update([
            'status' => 'rejected',
            'approved_by' => $school->id,
            'approved_at' => now(),
        ]);

        // إرسال حدث رفض المشروع
        \App\Events\ProjectRejected::dispatch($project);

        return redirect()->back()->with('success', 'تم رفض المشروع');
    }

    // عرض تفاصيل المشروع
    public function show(Project $project)
    {
        $school = Auth::user();
        $students = User::where('school_id', $school->id)->where('role', 'student')->pluck('id');

        // التحقق من الصلاحية
        if (!$school->canAccessAllSchoolData() && !in_array($project->user_id, $students->toArray()) && $project->school_id !== $school->id) {
            abort(403, 'غير مصرح لك بعرض هذا المشروع');
        }

        $project->load('user', 'challenges', 'school', 'approver');

        return Inertia::render('School/Projects/Show', [
            'project' => $project,
        ]);
    }

    // تعديل مشروع
    public function edit(Project $project)
    {
        $school = Auth::user();
        $students = User::where('school_id', $school->id)->where('role', 'student')->pluck('id')->toArray();

        // التحقق من الصلاحية: إما مشروع المدرسة مباشرة أو مشروع طالب في المدرسة أو مشروع معلم في المدرسة
        $isSchoolProject = $project->school_id === $school->id && $project->user_id === $school->id;
        $isStudentProject = in_array($project->user_id, $students) && $project->school_id === $school->id;
        $isTeacherProject = $project->teacher_id !== null && $project->school_id === $school->id;
        if (!$school->canAccessAllSchoolData() && !$isSchoolProject && !$isStudentProject && !$isTeacherProject) {
            abort(403, 'غير مصرح لك بتعديل هذا المشروع');
        }

        return Inertia::render('School/Projects/Edit', [
            'project' => $project,
        ]);
    }

    // تحديث مشروع
    public function update(Request $request, Project $project)
    {
        $school = Auth::user();
        $students = User::where('school_id', $school->id)->where('role', 'student')->pluck('id')->toArray();

        // التحقق من الصلاحية: إما مشروع المدرسة مباشرة أو مشروع طالب في المدرسة أو مشروع معلم في المدرسة
        $isSchoolProject = $project->school_id === $school->id && $project->user_id === $school->id;
        $isStudentProject = in_array($project->user_id, $students) && $project->school_id === $school->id;
        $isTeacherProject = $project->teacher_id !== null && $project->school_id === $school->id;
        if (!$school->canAccessAllSchoolData() && !$isSchoolProject && !$isStudentProject && !$isTeacherProject) {
            abort(403, 'غير مصرح لك بتعديل هذا المشروع');
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:science,technology,engineering,mathematics,arts,other',
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240',
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120',
            'report' => 'nullable|string',
            'existing_files' => 'nullable|array',
            'existing_files.*' => 'string',
            'existing_images' => 'nullable|array',
            'existing_images.*' => 'string',
        ]);

        $project->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'report' => $validated['report'] ?? null,
        ]);

        // تحديث الملفات - دمج الملفات المتبقية مع الجديدة
        $allFiles = [];

        // إضافة الملفات المتبقية
        if ($request->has('existing_files') && is_array($request->existing_files)) {
            $allFiles = array_merge($allFiles, $request->existing_files);
        }

        // إضافة الملفات الجديدة
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $allFiles[] = $file->store('projects/files', 'public');
            }
        }

        // حذف الملفات القديمة التي لم تعد موجودة
        if ($project->files) {
            foreach ($project->files as $oldFile) {
                if (!in_array($oldFile, $allFiles)) {
                    Storage::disk('public')->delete($oldFile);
                }
            }
        }

        $project->files = $allFiles;

        // تحديث الصور - دمج الصور المتبقية مع الجديدة
        $allImages = [];

        // إضافة الصور المتبقية
        if ($request->has('existing_images') && is_array($request->existing_images)) {
            $allImages = array_merge($allImages, $request->existing_images);
        }

        // إضافة الصور الجديدة
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $allImages[] = $image->store('projects/images', 'public');
            }
        }

        // حذف الصور القديمة التي لم تعد موجودة
        if ($project->images) {
            foreach ($project->images as $oldImage) {
                if (!in_array($oldImage, $allImages)) {
                    Storage::disk('public')->delete($oldImage);
                }
            }
        }

        $project->images = $allImages;

        $project->save();

        return redirect()->route('school.projects.index')
            ->with('success', 'تم تحديث المشروع بنجاح');
    }

    // حذف مشروع
    public function destroy(Project $project)
    {
        $school = Auth::user();
        $students = User::where('school_id', $school->id)->where('role', 'student')->pluck('id')->toArray();

        // التحقق من الصلاحية: إما مشروع المدرسة مباشرة أو مشروع طالب في المدرسة أو مشروع معلم في المدرسة
        $isSchoolProject = $project->school_id === $school->id && $project->user_id === $school->id;
        $isStudentProject = in_array($project->user_id, $students) && $project->school_id === $school->id;
        $isTeacherProject = $project->teacher_id !== null && $project->school_id === $school->id;

        if (!$school->canAccessAllSchoolData() && !$isSchoolProject && !$isStudentProject && !$isTeacherProject) {
            abort(403, 'غير مصرح لك بحذف هذا المشروع');
        }

        // حذف الملفات
        if ($project->files) {
            foreach ($project->files as $file) {
                Storage::disk('public')->delete($file);
            }
        }

        if ($project->images) {
            foreach ($project->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $project->delete();

        return redirect()->route('school.projects.index')
            ->with('success', 'تم حذف المشروع بنجاح');
    }
}
