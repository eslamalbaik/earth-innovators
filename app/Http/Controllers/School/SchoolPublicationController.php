<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Http\Requests\Publication\StorePublicationRequest;
use App\Models\Publication;
use App\Services\PublicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SchoolPublicationController extends Controller
{
    public function __construct(
        private PublicationService $publicationService
    ) {}
    /**
     * عرض قائمة مقالات المدرسة
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $publications = $this->publicationService->getSchoolPublications(
            $user->canAccessAllSchoolData() ? 0 : $user->id,
            $request->get('status'),
            10
        );

        // Accessor in Model handles image path normalization automatically
        $stats = $this->publicationService->getSchoolPublicationStats($user->canAccessAllSchoolData() ? 0 : $user->id);

        return Inertia::render('School/Publications/Index', [
            'publications' => $publications,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * عرض المقالات المعلقة التي تحتاج موافقة
     */
    public function pending(): Response
    {
        $user = Auth::user();

        $publications = $this->publicationService->getSchoolPendingPublications($user->canAccessAllSchoolData() ? 0 : $user->id, 10);

        // Accessor in Model handles image path normalization automatically
        return Inertia::render('School/Publications/Pending', [
            'publications' => $publications,
        ]);
    }

    /**
     * عرض نموذج إنشاء مقال جديد (للمدرسة مباشرة)
     */
    public function create(): Response
    {
        return Inertia::render('School/Publications/Create');
    }

    /**
     * حفظ مقال جديد (للمدرسة مباشرة - بدون موافقة)
     */
    public function store(StorePublicationRequest $request)
    {
        $user = Auth::user();

        $data = $request->validated();
        $data['author_id'] = $user->id;
        $data['school_id'] = $user->id;
        $data['status'] = 'approved';
        $data['approved_by'] = $user->id;
        $data['approved_at'] = now();
        // تعيين اسم الناشر تلقائياً باسم المدرسة
        $data['publisher_name'] = $user->name;
        // تعيين تاريخ النشر تلقائياً
        $data['publish_date'] = now()->toDateString();

        // Handle file uploads
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image');
        }

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file');
        }

        try {
            $publication = $this->publicationService->createPublication($data);

            // إرسال إشعار لجميع الطلاب والمعلمين في المدرسة عند نشر المقال مباشرة
            if ($publication->status === 'approved') {
                // إرسال مباشر بدون queue لضمان وصول الإشعارات فوراً
                try {
                    $publication->refresh();
                    $publication->load(['author', 'school']);
                    
                    if ($publication->school_id) {
                        $users = \App\Models\User::where('school_id', $publication->school_id)
                            ->whereIn('role', ['student', 'teacher'])
                            ->get();
                        
                        foreach ($users as $user) {
                            try {
                                $user->notify(new \App\Notifications\NewPublicationNotification($publication));
                            } catch (\Exception $e) {
                                \Log::error('Failed to send publication notification to user', [
                                    'user_id' => $user->id,
                                    'publication_id' => $publication->id,
                                    'error' => $e->getMessage(),
                                ]);
                            }
                        }
                        
                        \Log::info('Publication notifications sent', [
                            'publication_id' => $publication->id,
                            'users_count' => $users->count(),
                        ]);
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to send publication notifications', [
                        'publication_id' => $publication->id,
                        'error' => $e->getMessage(),
                    ]);
                    // لا نوقف العملية إذا فشل إرسال الإشعارات
                }
            }

            return redirect()
                ->route('school.publications.index')
                ->with('success', 'تم نشر المقال بنجاح!');
        } catch (\Exception $e) {
            \Log::error('Error creating publication: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء إنشاء المقال: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * الموافقة على مقال من معلم
     */
    public function approve(Publication $publication)
    {
        $user = Auth::user();

        // التحقق من أن المقال يتبع هذه المدرسة
        if (!$user->canAccessAllSchoolData() && $publication->school_id !== $user->id) {
            abort(403);
        }

        // التحقق من أن المقال معلق
        if ($publication->status !== 'pending') {
            return redirect()
                ->route('school.publications.pending')
                ->with('error', 'هذا المقال غير معلق.');
        }

        $this->publicationService->approvePublication($publication, $user->id);

        return redirect()
            ->route('school.publications.pending')
            ->with('success', 'تم الموافقة على المقال بنجاح!');
    }

    /**
     * رفض مقال من معلم
     */
    public function reject(Publication $publication, Request $request)
    {
        $user = Auth::user();

        // التحقق من أن المقال يتبع هذه المدرسة
        if (!$user->canAccessAllSchoolData() && $publication->school_id !== $user->id) {
            abort(403);
        }

        $publication->update([
            'status' => 'rejected',
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        return redirect()
            ->route('school.publications.pending')
            ->with('success', 'تم رفض المقال.');
    }

    /**
     * عرض مقال معين
     */
    public function show(Publication $publication): Response
    {
        $user = Auth::user();

        // التحقق من أن المقال يتبع هذه المدرسة
        if (!$user->canAccessAllSchoolData() && $publication->school_id !== $user->id) {
            abort(403);
        }

        $publication->load(['author', 'school']);

        // Accessor in Model handles image path normalization automatically
        return Inertia::render('School/Publications/Show', [
            'publication' => $publication,
        ]);
    }

    /**
     * عرض نموذج تعديل مقال
     */
    public function edit(Publication $publication): Response
    {
        $user = Auth::user();

        // التحقق من أن المقال يتبع هذه المدرسة
        if (!$user->canAccessAllSchoolData() && $publication->school_id !== $user->id) {
            abort(403);
        }

        // Accessor in Model handles image path normalization automatically
        return Inertia::render('School/Publications/Edit', [
            'publication' => $publication,
        ]);
    }

    /**
     * تحديث مقال
     */
    public function update(Request $request, Publication $publication)
    {
        $user = Auth::user();

        // التحقق من أن المقال يتبع هذه المدرسة
        if (!$user->canAccessAllSchoolData() && $publication->school_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:magazine,booklet,report,article',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'file' => 'nullable|file|mimes:pdf|max:10240',
            'issue_number' => 'nullable|integer|min:1',
            'publish_date' => 'nullable|date',
            'publisher_name' => 'nullable|string|max:255',
        ]);

        // حذف الصورة القديمة إذا تم رفع صورة جديدة
        if ($request->hasFile('cover_image')) {
            if ($publication->cover_image) {
                Storage::disk('public')->delete($publication->cover_image);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('publications/covers', 'public');
        }

        // حذف الملف القديم إذا تم رفع ملف جديد
        if ($request->hasFile('file')) {
            if ($publication->file) {
                Storage::disk('public')->delete($publication->file);
            }
            $validated['file'] = $request->file('file')->store('publications/files', 'public');
        }

        try {
            $publication->update($validated);

            // Clear cache
            $this->publicationService->clearPublicationCache($publication->school_id, $publication->author_id);

            return redirect()
                ->route('school.publications.index')
                ->with('success', 'تم تحديث المقال بنجاح!');
        } catch (\Exception $e) {
            \Log::error('Error updating publication: ' . $e->getMessage(), [
                'publication_id' => $publication->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء تحديث المقال: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * حذف مقال
     */
    public function destroy(Publication $publication)
    {
        $user = Auth::user();

        // التحقق من أن المقال يتبع هذه المدرسة
        if (!$user->canAccessAllSchoolData() && $publication->school_id !== $user->id) {
            abort(403);
        }

        try {
            // Use service to delete (handles file deletion and cache clearing)
            $this->publicationService->deletePublication($publication);

            return redirect()
                ->route('school.publications.index')
                ->with('success', 'تم حذف المقال بنجاح!');
        } catch (\Exception $e) {
            \Log::error('Error deleting publication: ' . $e->getMessage(), [
                'publication_id' => $publication->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء حذف المقال: ' . $e->getMessage()]);
        }
    }
}
