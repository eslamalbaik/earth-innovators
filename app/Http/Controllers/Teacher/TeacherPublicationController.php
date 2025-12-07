<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Publication\StorePublicationRequest;
use App\Models\Publication;
use App\Services\PublicationService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TeacherPublicationController extends Controller
{
    public function __construct(
        private PublicationService $publicationService
    ) {}
    /**
     * عرض قائمة مقالات المعلم
     */
    public function index(): Response
    {
        $user = Auth::user();

        $publications = $this->publicationService->getTeacherPublications($user->id, 10);

        // Accessor in Model handles image path normalization automatically

        return Inertia::render('Teacher/Publications/Index', [
            'publications' => $publications,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * عرض نموذج إنشاء مقال جديد
     */
    public function create(): Response
    {
        $user = Auth::user();

        // الحصول على مدرسة المعلم
        $school = $user->school;

        return Inertia::render('Teacher/Publications/Create', [
            'school' => $school ? [
                'id' => $school->id,
                'name' => $school->name,
            ] : null,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * حفظ مقال جديد
     */
    public function store(StorePublicationRequest $request)
    {
        $user = Auth::user();

        // التحقق من أن المعلم مرتبط بمدرسة
        if (!$user->school_id) {
            return back()->withErrors([
                'school_id' => 'يجب أن تكون مرتبطاً بمدرسة لنشر المقالات.',
            ])->withInput();
        }

        // التحقق من أن المدرسة موجودة
        $school = \App\Models\User::where('id', $user->school_id)
            ->where('role', 'school')
            ->firstOrFail();

        $data = $request->validated();
        $data['author_id'] = $user->id;
        $data['school_id'] = $school->id;
        $data['status'] = 'pending';

        // Handle file uploads
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image');
        }

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file');
        }

        try {
            $publication = $this->publicationService->createPublication($data);

            // Clear cache explicitly to ensure the new publication appears
            $this->publicationService->clearPublicationCache($publication->school_id, $publication->author_id);

            return redirect()
                ->route('teacher.publications.index')
                ->with('success', 'تم إنشاء المقال بنجاح! سيتم نشره بعد موافقة المدرسة.');
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
     * عرض مقال معين
     */
    public function show(Publication $publication): Response
    {
        // التحقق من أن المقال للمعلم الحالي
        if ($publication->author_id !== Auth::id()) {
            abort(403);
        }

        $publication->load(['school']);

        // Accessor in Model handles image path normalization automatically
        return Inertia::render('Teacher/Publications/Show', [
            'publication' => $publication,
        ]);
    }

    /**
     * عرض نموذج تعديل مقال
     */
    public function edit(Publication $publication): Response|RedirectResponse
    {
        $user = Auth::user();

        // التحقق من أن المقال للمعلم الحالي
        if ($publication->author_id !== $user->id) {
            abort(403);
        }

        // لا يمكن تعديل المقال بعد الموافقة عليه
        if ($publication->status === 'approved') {
            return redirect()
                ->route('teacher.publications.index')
                ->with('error', 'لا يمكن تعديل المقال بعد الموافقة عليه.');
        }

        $publication->load(['school']);

        // Accessor in Model handles image path normalization automatically
        return Inertia::render('Teacher/Publications/Edit', [
            'publication' => $publication,
            'auth' => [
                'user' => $user,
            ],
        ]);
    }

    /**
     * تحديث مقال
     */
    public function update(Request $request, Publication $publication)
    {
        $user = Auth::user();

        // التحقق من أن المقال للمعلم الحالي
        if ($publication->author_id !== $user->id) {
            abort(403);
        }

        // لا يمكن تعديل المقال بعد الموافقة عليه
        if ($publication->status === 'approved') {
            return redirect()
                ->route('teacher.publications.index')
                ->with('error', 'لا يمكن تعديل المقال بعد الموافقة عليه.');
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

        try {
            // Handle file uploads - pass file objects directly to service
            if ($request->hasFile('cover_image')) {
                $validated['cover_image'] = $request->file('cover_image');
            }

            if ($request->hasFile('file')) {
                $validated['file'] = $request->file('file');
            }

            // Use service to update publication (handles file deletion and cache clearing)
            $this->publicationService->updatePublication($publication, $validated);

            // Refresh to get updated data including normalized paths
            $publication->refresh();

            return redirect()
                ->route('teacher.publications.index')
                ->with('success', 'تم تحديث المقال بنجاح!');
        } catch (\Exception $e) {
            \Log::error('Error updating publication: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء تحديث المقال: ' . $e->getMessage()]);
        }
    }

    /**
     * حذف مقال
     */
    public function destroy(Publication $publication)
    {
        $user = Auth::user();

        // التحقق من أن المقال للمعلم الحالي
        if ($publication->author_id !== $user->id) {
            abort(403);
        }

        try {
            // Use service to delete publication (handles file deletion and cache clearing)
            $this->publicationService->deletePublication($publication);

            return redirect()
                ->route('teacher.publications.index')
                ->with('success', 'تم حذف المقال بنجاح!');
        } catch (\Exception $e) {
            \Log::error('Error deleting publication: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء حذف المقال: ' . $e->getMessage()]);
        }
    }
}
