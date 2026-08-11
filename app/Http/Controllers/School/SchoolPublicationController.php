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
     * توليد محتوى المقال بالذكاء الاصطناعي
     */
    public function generate(Request $request, \App\Services\AIEngine\GeminiClient $deepSeekClient)
    {
        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $title = $request->input('title');

        try {
            $aiResponse = $deepSeekClient->chatWithJson([
                \App\Services\AIEngine\GeminiClient::systemMessage(
                    'أنت كاتب مقالات محترف. '
                    . 'مهمتك هي كتابة مقال تعليمي مطول جداً ومفصل وشامل بناءً على العنوان المقدم. '
                    . 'هام جداً: يجب أن يتجاوز طول المقال 600 كلمة. '
                    . 'قم بتقسيم المقال إلى 4 فقرات رئيسية على الأقل: مقدمة جذابة، صلب الموضوع (يحتوي على شرح مفصل وأمثلة)، التطبيقات العملية، وخاتمة شاملة. '
                    . 'توسع في الشرح ولا تختصر إطلاقاً. '
                    . 'هام جداً للتنسيق: يجب أن يكون محتوى المقال (content و content_ar) منسقاً باستخدام وسوم HTML (مثل <h2>, <h3>, <p>, <strong>, <ul>, <li>). لا ترجع نصاً عادياً بل كود HTML جاهز للعرض. '
                    . 'يجب توفير المحتوى والوصف باللغتين العربية والإنجليزية. '
                    . 'بالإضافة لذلك، قم باقتراح كلمة مفتاحية واحدة باللغة الإنجليزية للبحث عن صورة مناسبة للمقال على موقع Unsplash. '
                    . 'أجب بصيغة JSON فقط مع الحقول التالية: '
                    . 'content (المقال كاملاً بالإنجليزية بصيغة HTML، يجب أن يكون طويلاً ومفصلاً جداً), content_ar (المقال كاملاً بالعربية بصيغة HTML بنفس مستوى التفصيل), '
                    . 'title (عنوان المقال بالإنجليزية), title_ar (عنوان المقال بالعربية), '
                    . 'description (وصف قصير بالإنجليزية), description_ar (وصف قصير بالعربية)، '
                    . 'image_keyword (كلمة مفتاحية واحدة بالإنجليزية للبحث في Unsplash).'
                ),
                \App\Services\AIEngine\GeminiClient::userMessage("عنوان المقال: " . $title),
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
    public function update(StorePublicationRequest $request, Publication $publication)
    {
        $user = Auth::user();

        // التحقق من أن المقال يتبع هذه المدرسة
        if (!$user->canAccessAllSchoolData() && $publication->school_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validated();

        // Normalize empty youtube_url to null
        if (array_key_exists('youtube_url', $validated)) {
            $validated['youtube_url'] = !empty($validated['youtube_url']) ? $validated['youtube_url'] : null;
        }

        // حذف الصورة القديمة إذا تم رفع صورة جديدة
        if ($request->hasFile('cover_image')) {
            $rawCover = $publication->getAttributes()['cover_image'] ?? null;
            if ($rawCover) {
                Storage::disk('public')->delete($rawCover);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('publications/covers', 'public');
        }

        // حذف الملف القديم إذا تم رفع ملف جديد
        if ($request->hasFile('file')) {
            $rawFile = $publication->getAttributes()['file'] ?? null;
            if ($rawFile) {
                Storage::disk('public')->delete($rawFile);
            }
            $validated['file'] = $request->file('file')->store('publications/files', 'public');
        }

        try {
            $publication->update($validated);

            // Clear cache
            $this->publicationService->clearPublicationCache($publication->school_id, $publication->author_id, $publication->id);

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
