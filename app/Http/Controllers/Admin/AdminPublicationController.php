<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Publication\StorePublicationRequest;
use App\Models\Publication;
use App\Models\User;
use App\Services\PublicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminPublicationController extends Controller
{
    public function __construct(
        private PublicationService $publicationService
    ) {}

    /**
     * عرض قائمة جميع المقالات
     */
    public function index(Request $request): Response
    {
        $publications = Publication::with(['author:id,name', 'school:id,name', 'approver:id,name'])
            ->select('id', 'title', 'description', 'type', 'status', 'author_id', 'school_id', 'approved_by', 'created_at', 'cover_image')
            ->when($request->has('search') && $request->search, function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->has('status') && $request->status, function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->has('type') && $request->type, function ($q) use ($request) {
                $q->where('type', $request->type);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => Publication::count(),
            'pending' => Publication::where('status', 'pending')->count(),
            'approved' => Publication::where('status', 'approved')->count(),
            'rejected' => Publication::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Publications/Index', [
            'publications' => $publications,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'type' => $request->type,
            ],
        ]);
    }

    /**
     * عرض نموذج إنشاء مقال جديد
     */
    public function create(): Response
    {
        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Publications/Create', [
            'schools' => $schools,
        ]);
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

        // توليد المقال قد يستغرق وقتاً طويلاً بسبب إعادة المحاولة التلقائية في
        // GeminiClient، بينما max_execution_time الافتراضي على السيرفر أقل من ذلك.
        set_time_limit(300);

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
            \Log::error('Error generating AI publication (admin): ' . $e->getMessage());
            return response()->json(['error' => 'حدث خطأ غير متوقع أثناء توليد المحتوى.'], 500);
        }
    }

    /**
     * حفظ مقال جديد
     */
    public function store(StorePublicationRequest $request)
    {
        $user = Auth::user();

        $data = $request->validated();
        $data['author_id'] = $user->id;
        if (!empty($data['school_id'])) {
            $data['school_id'] = $data['school_id'];
        } else {
            $data['school_id'] = null;
        }
        $data['status'] = 'approved';
        $data['approved_by'] = $user->id;
        $data['approved_at'] = now();
        $data['publisher_name'] = $user->name;
        $data['publish_date'] = now()->toDateString();
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image');
        }

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file');
        }

        try {
            $publication = $this->publicationService->createPublication($data);
            if ($publication->status === 'approved' && $publication->school_id) {
                try {
                    $publication->refresh();
                    $publication->load(['author', 'school']);
                    
                    $users = User::where('school_id', $publication->school_id)
                        ->whereIn('role', ['student', 'teacher'])
                        ->get();
                    
                    foreach ($users as $user) {
                        try {
                            $user->notify(new \App\Notifications\NewPublicationNotification($publication));
                        } catch (\Exception $e) {
                        }
                    }
                } catch (\Exception $e) {
                }
            }

            return redirect()
                ->route('admin.publications.index')
                ->with('success', __('messages.msg_029'));
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء إنشاء المقال: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function show(Publication $publication): Response
    {
        $publication->load(['author:id,name,email', 'school:id,name', 'approver:id,name']);

        return Inertia::render('Admin/Publications/Show', [
            'publication' => $publication,
        ]);
    }

    public function edit(Publication $publication): Response
    {
        $publication->load(['author:id,name', 'school:id,name']);

        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Publications/Edit', [
            'publication' => $publication,
            'schools'     => $schools,
        ]);
    }

    public function update(StorePublicationRequest $request, Publication $publication)
    {
        $validated = $request->validated();

        // Normalize empty youtube_url to null
        if (array_key_exists('youtube_url', $validated)) {
            $validated['youtube_url'] = !empty($validated['youtube_url']) ? $validated['youtube_url'] : null;
        }

        if ($request->hasFile('cover_image')) {
            $rawCover = $publication->getAttributes()['cover_image'] ?? null;
            if ($rawCover) {
                Storage::disk('public')->delete($rawCover);
            }
            $validated['cover_image'] = $request->file('cover_image')->store('publications/covers', 'public');
        } else {
            unset($validated['cover_image']);
        }

        if ($request->hasFile('file')) {
            $rawFile = $publication->getAttributes()['file'] ?? null;
            if ($rawFile) {
                Storage::disk('public')->delete($rawFile);
            }
            $validated['file'] = $request->file('file')->store('publications/files', 'public');
        } else {
            unset($validated['file']);
        }

        $publication->update($validated);

        return redirect()
            ->route('admin.publications.show', $publication->id)
            ->with('success', __('messages.msg_030'));
    }

    public function approve(Publication $publication)
    {
        $user = auth()->user();

        $this->publicationService->approvePublication($publication, $user->id);

        return redirect()
            ->back()
            ->with('success', __('messages.msg_031'));
    }

    public function reject(Request $request, Publication $publication)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        $this->publicationService->rejectPublication($publication, $user->id, $validated['reason'] ?? null);

        return redirect()
            ->back()
            ->with('success', __('messages.msg_032'));
    }

    public function destroy(Publication $publication)
    {
        // Use raw attributes — accessor returns full URL which breaks Storage::delete
        $rawCover = $publication->getAttributes()['cover_image'] ?? null;
        if ($rawCover) {
            Storage::disk('public')->delete($rawCover);
        }
        $rawFile = $publication->getAttributes()['file'] ?? null;
        if ($rawFile) {
            Storage::disk('public')->delete($rawFile);
        }

        $publication->delete();

        return redirect()
            ->route('admin.publications.index')
            ->with('success', __('messages.msg_033'));
    }
}
