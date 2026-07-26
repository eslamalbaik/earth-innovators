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
     * توليد محتوى المقال بالذكاء الاصطناعي
     */
    public function generate(Request $request, \App\Services\AIEngine\DeepSeekClient $deepSeekClient)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $title = $request->input('title');

        try {
            $aiResponse = $deepSeekClient->chatWithJson([
                \App\Services\AIEngine\DeepSeekClient::systemMessage(
                    'أنت كاتب مقالات محترف. '
                    . 'مهمتك هي كتابة مقال تعليمي مطول جداً ومفصل وشامل بناءً على العنوان المقدم. '
                    . 'هام جداً: يجب أن يتجاوز طول المقال 600 كلمة. '
                    . 'قم بتقسيم المقال إلى 4 فقرات رئيسية على الأقل: مقدمة جذابة، صلب الموضوع (يحتوي على شرح مفصل وأمثلة)، التطبيقات العملية، وخاتمة شاملة. '
                    . 'توسع في الشرح ولا تختصر إطلاقاً. '
                    . 'هام جداً للتنسيق: يجب أن يكون محتوى المقال (content و content_ar) منسقاً باستخدام وسوم HTML (مثل <h2>, <h3>, <p>, <strong>, <ul>, <li>). لا ترجع نصاً عادياً بل كود HTML جاهز للعرض. '
                    . 'يجب توفير المحتوى والوصف باللغتين العربية والإنجليزية. '
                    . 'بالإضافة لذلك، قم باقتراح كلمة مفتاحية واحدة باللغة الإنجليزية للبحث عن صورة مناسبة للمقال على موقع Unsplash. '
                    . 'أجب بصيغة JSON فقط مع الحقول التالية: '
                    . 'content (المقال بالعربية بصيغة HTML، يجب أن يكون طويلاً ومفصلاً جداً), content_ar (نفس المحتوى بالعربية بصيغة HTML), '
                    . 'title (عنوان المقال بالإنجليزية), title_ar (عنوان المقال بالعربية), '
                    . 'description (وصف قصير للعرض النصي العادي), description_ar (وصف قصير بالعربية)، '
                    . 'image_keyword (كلمة مفتاحية واحدة بالإنجليزية للبحث في Unsplash).'
                ),
                \App\Services\AIEngine\DeepSeekClient::userMessage("عنوان المقال: " . $title),
            ]);

            if (!$aiResponse) {
                return response()->json(['error' => 'فشل في توليد المحتوى من الذكاء الاصطناعي.'], 500);
            }

            // Fallbacks for structure
            $content = $aiResponse['content'] ?? '';
            $content_ar = $aiResponse['content_ar'] ?? $content;
            $title_en = $aiResponse['title'] ?? $title;
            $title_ar = $aiResponse['title_ar'] ?? $title;
            $description = $aiResponse['description'] ?? '';
            $description_ar = $aiResponse['description_ar'] ?? $description;
            $keyword = $aiResponse['image_keyword'] ?? 'education';

            // Fetch image from Unsplash
            $imageUrl = null;
            $unsplashAccessKey = config('services.unsplash.access_key');
            if ($unsplashAccessKey) {
                $unsplashResponse = \Illuminate\Support\Facades\Http::get('https://api.unsplash.com/search/photos', [
                    'query' => $keyword,
                    'client_id' => $unsplashAccessKey,
                    'per_page' => 1,
                    'orientation' => 'landscape'
                ]);

                if ($unsplashResponse->successful()) {
                    $results = $unsplashResponse->json('results');
                    if (!empty($results)) {
                        $imageUrl = $results[0]['urls']['regular'] ?? null;
                    }
                }
            }

            return response()->json([
                'title' => $title_en,
                'title_ar' => $title_ar,
                'content' => $content,
                'content_ar' => $content_ar,
                'description' => $description,
                'description_ar' => $description_ar,
                'image_url' => $imageUrl
            ]);

        } catch (\Exception $e) {
            \Log::error('Error generating AI publication: ' . $e->getMessage());
            return response()->json(['error' => 'حدث خطأ غير متوقع أثناء توليد المحتوى.'], 500);
        }
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
            $this->publicationService->clearPublicationCache($publication->school_id, $publication->author_id, $publication->id);

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
    public function update(StorePublicationRequest $request, Publication $publication)
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

        $validated = $request->validated();

        try {
            // Normalize empty youtube_url to null
            if (array_key_exists('youtube_url', $validated)) {
                $validated['youtube_url'] = !empty($validated['youtube_url']) ? $validated['youtube_url'] : null;
            }

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
