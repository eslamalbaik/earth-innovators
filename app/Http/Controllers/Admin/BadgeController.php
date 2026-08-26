<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Badge\StoreBadgeRequest;
use App\Http\Requests\Badge\UpdateBadgeRequest;
use App\Http\Requests\Badge\AwardBadgeRequest;
use App\Models\Badge;
use App\Models\User;
use App\Services\AIEngine\GeminiClient;
use App\Services\BadgeService;
use App\Support\StorageUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BadgeController extends Controller
{
    public function __construct(
        private BadgeService $badgeService
    ) {}

    public function index(Request $request)
    {
        $badges = $this->badgeService->getAllBadges(
            $request->get('search'),
            20,
            $request->get('status'),
            $request->get('type')
        );

        $stats = $this->badgeService->getBadgeStats();

        return Inertia::render('Admin/Badges/Index', [
            'badges' => $badges,
            'stats' => $stats,
            'users' => User::whereIn('role', ['student', 'teacher', 'school', 'educational_institution'])
                ->select('id', 'name', 'email', 'role')
                ->orderBy('name')
                ->orderBy('email')
                ->get(),
            'filters' => [
                'search' => $request->get('search'),
                'status' => $request->get('status'),
                'type' => $request->get('type'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Badges/Create');
    }

    /**
     * توليد تفاصيل شارة بالذكاء الاصطناعي
     */
    public function generate(Request $request, GeminiClient $client)
    {
        $request->validate([
            'idea' => 'required|string|max:500',
        ]);

        $idea = $request->input('idea');

        // توليد الشارة قد يستغرق حتى 360 ثانية (4 محاولات × 90 ثانية) بسبب إعادة المحاولة التلقائية
        // في GeminiClient، بينما max_execution_time الافتراضي على السيرفر 30 ثانية فقط.
        set_time_limit(300);

        try {
            $aiResponse = $client->chatWithJson([
                GeminiClient::systemMessage(
                    'أنت خبير في تصميم شارات التحفيز والإنجاز لمنصة تعليمية وابتكارية للطلاب. '
                    . 'بناءً على الفكرة التي يقدمها المستخدم، قم بإنشاء تفاصيل شارة كاملة ومحفزة. '
                    . 'قم باختيار إحدى الأنواع التالية حصراً: rank_first, rank_second, rank_third, excellent_innovator, active_participant, custom. '
                    . 'اقترح أيضاً رمزاً تعبيرياً واحداً (emoji) مناسباً للشارة، وكلمة مفتاحية واحدة بالإنجليزية للبحث عن صورة من Unsplash. '
                    . 'أجب بصيغة JSON فقط مع الحقول التالية، ولا تترك أياً منها فارغاً: '
                    . 'name (اسم الشارة بالإنجليزية), '
                    . 'name_ar (اسم الشارة بالعربية، جذاب ومختصر), '
                    . 'description (وصف قصير محفز للشارة بالإنجليزية، جملة أو جملتين), '
                    . 'description_ar (وصف قصير محفز للشارة بالعربية، جملة أو جملتين), '
                    . 'icon (رمز تعبيري واحد فقط), '
                    . 'type (أحد الأنواع المسموحة فقط), '
                    . 'points_required (عدد نقاط مقترح كرقم صحيح مناسب لصعوبة تحقيق الشارة), '
                    . 'image_keyword (كلمة مفتاحية واحدة بالإنجليزية).'
                ),
                GeminiClient::userMessage('فكرة الشارة: ' . $idea),
            ]);

            if (!$aiResponse) {
                return response()->json(['error' => 'فشل في توليد تفاصيل الشارة من الذكاء الاصطناعي.'], 500);
            }

            $name = $aiResponse['name'] ?? 'New Badge';
            $nameAr = $aiResponse['name_ar'] ?? '';
            $description = trim($aiResponse['description'] ?? '');
            $descriptionAr = trim($aiResponse['description_ar'] ?? '');
            $icon = $aiResponse['icon'] ?? '🏅';
            $type = $aiResponse['type'] ?? 'custom';
            $pointsRequired = (int) ($aiResponse['points_required'] ?? 0);
            $keyword = $aiResponse['image_keyword'] ?? 'achievement badge';

            $allowedTypes = ['rank_first', 'rank_second', 'rank_third', 'excellent_innovator', 'active_participant', 'custom'];
            if (!in_array($type, $allowedTypes)) {
                $type = 'custom';
            }

            $incompleteFields = array_keys(array_filter([
                'name_ar' => $nameAr === '',
                'description' => $description === '',
                'description_ar' => $descriptionAr === '',
            ]));

            $imageUrl = null;
            $unsplashAccessKey = config('services.unsplash.access_key');
            if ($unsplashAccessKey) {
                $unsplashResponse = Http::get('https://api.unsplash.com/search/photos', [
                    'query' => $keyword,
                    'client_id' => $unsplashAccessKey,
                    'per_page' => 1,
                    'orientation' => 'squarish',
                ]);

                if ($unsplashResponse->successful()) {
                    $results = $unsplashResponse->json('results');
                    if (!empty($results)) {
                        $imageUrl = $results[0]['urls']['regular'] ?? null;
                    }
                }
            }

            return response()->json([
                'name' => $name,
                'name_ar' => $nameAr,
                'description' => $description,
                'description_ar' => $descriptionAr,
                'icon' => $icon,
                'type' => $type,
                'points_required' => $pointsRequired,
                'image_url' => $imageUrl,
                'incomplete_fields' => $incompleteFields,
            ]);

        } catch (\Throwable $e) {
            Log::error('Error generating AI badge (admin): ' . $e->getMessage());
            return response()->json(['error' => 'حدث خطأ غير متوقع أثناء توليد تفاصيل الشارة.'], 500);
        }
    }

    public function store(StoreBadgeRequest $request)
    {
        $this->badgeService->createBadge($request->validated());

        return redirect()->route('admin.badges.index')
            ->with('success', __('messages.msg_035'));
    }

    public function edit(Badge $badge)
    {
        $badgePayload = $badge->toArray();
        $badgePayload['image'] = StorageUrl::url($badge->image);

        return Inertia::render('Admin/Badges/Edit', [
            'badge' => $badgePayload,
        ]);
    }

    public function update(UpdateBadgeRequest $request, Badge $badge)
    {
        $this->badgeService->updateBadge($badge, $request->validated());

        return redirect()->route('admin.badges.index')
            ->with('success', __('messages.msg_036'));
    }

    public function destroy(Badge $badge)
    {
        $this->badgeService->deleteBadge($badge);

        return redirect()->route('admin.badges.index')
            ->with('success', __('messages.msg_037'));
    }

    public function award(AwardBadgeRequest $request, Badge $badge)
    {
        $validated = $request->validated();

        $this->badgeService->awardBadge(
            $validated['user_id'],
            $badge->id,
            $validated['project_id'] ?? null,
            $validated['challenge_id'] ?? null,
            $validated['reason'] ?? null,
            auth()->id()
        );

        return redirect()->back()
            ->with('success', __('messages.msg_038'));
    }
}
