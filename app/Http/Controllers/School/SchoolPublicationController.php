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
            $user->id,
            $request->get('status'),
            10
        );

        $stats = $this->publicationService->getSchoolPublicationStats($user->id);

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

        $publications = $this->publicationService->getSchoolPendingPublications($user->id, 10);

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

        // Handle file uploads
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image');
        }

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file');
        }

        $publication = $this->publicationService->createPublication($data);

        // إرسال إشعار لجميع الطلاب والمعلمين في المدرسة عند نشر المقال مباشرة
        if ($publication->status === 'approved') {
            \App\Jobs\SendNewPublicationNotification::dispatch($publication);
        }

        return redirect()
            ->route('school.publications.index')
            ->with('success', 'تم نشر المقال بنجاح!');
    }

    /**
     * الموافقة على مقال من معلم
     */
    public function approve(Publication $publication)
    {
        $user = Auth::user();

        // التحقق من أن المقال يتبع هذه المدرسة
        if ($publication->school_id !== $user->id) {
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
        if ($publication->school_id !== $user->id) {
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
        if ($publication->school_id !== $user->id) {
            abort(403);
        }

        $publication->load(['author', 'school']);

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
        if ($publication->school_id !== $user->id) {
            abort(403);
        }

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
        if ($publication->school_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => 'required|in:magazine,booklet,report',
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

        $publication->update($validated);

        return redirect()
            ->route('school.publications.index')
            ->with('success', 'تم تحديث المقال بنجاح!');
    }

    /**
     * حذف مقال
     */
    public function destroy(Publication $publication)
    {
        $user = Auth::user();

        // التحقق من أن المقال يتبع هذه المدرسة
        if ($publication->school_id !== $user->id) {
            abort(403);
        }

        // حذف الصور والملفات
        if ($publication->cover_image) {
            Storage::disk('public')->delete($publication->cover_image);
        }
        if ($publication->file) {
            Storage::disk('public')->delete($publication->file);
        }

        $publication->delete();

        return redirect()
            ->route('school.publications.index')
            ->with('success', 'تم حذف المقال بنجاح!');
    }
}
