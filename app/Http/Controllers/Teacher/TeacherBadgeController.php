<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TeacherBadgeController extends Controller
{
    /**
     * عرض قائمة الشارات المرسلة من المعلم
     */
    public function index()
    {
        $teacher = Auth::user();
        
        $badges = Badge::where('created_by', $teacher->id)
            ->with(['school', 'approver'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Teacher/Badges/Index', [
            'badges' => $badges,
        ]);
    }

    /**
     * عرض صفحة إنشاء شارة جديدة
     */
    public function create()
    {
        // الحصول على جميع المدارس (يمكن تحسينها لاحقاً للتحقق من ارتباط المعلم بالمدرسة)
        $schools = User::where('role', 'school')
            ->get(['id', 'name']);

        return Inertia::render('Teacher/Badges/Create', [
            'schools' => $schools,
        ]);
    }

    /**
     * حفظ شارة جديدة
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'name_ar' => 'required|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'icon' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
            'type' => 'required|in:rank_first,rank_second,rank_third,excellent_innovator,active_participant,custom',
            'points_required' => 'required|integer|min:0',
            'school_id' => 'required|exists:users,id',
        ]);

        $teacher = Auth::user();

        // التحقق من أن المدرسة موجودة
        $school = User::where('id', $validated['school_id'])
            ->where('role', 'school')
            ->firstOrFail();

        $badgeData = [
            'name' => $validated['name'],
            'name_ar' => $validated['name_ar'],
            'description' => $validated['description'] ?? null,
            'description_ar' => $validated['description_ar'] ?? null,
            'icon' => $validated['icon'] ?? null,
            'type' => $validated['type'],
            'points_required' => $validated['points_required'],
            'status' => 'pending',
            'created_by' => $teacher->id,
            'school_id' => $school->id,
            'is_active' => false, // غير نشط حتى الموافقة
        ];

        if ($request->hasFile('image')) {
            $badgeData['image'] = $request->file('image')->store('badges', 'public');
        }

        Badge::create($badgeData);

        return redirect()->route('teacher.badges.index')
            ->with('success', 'تم إرسال الشارة للمراجعة بنجاح');
    }

    /**
     * عرض تفاصيل شارة
     */
    public function show(Badge $badge)
    {
        $teacher = Auth::user();
        
        // التحقق من أن الشارة منشأة من قبل هذا المعلم
        if ($badge->created_by !== $teacher->id) {
            abort(403, 'غير مصرح لك بعرض هذه الشارة');
        }

        $badge->load(['school', 'approver', 'creator']);

        return Inertia::render('Teacher/Badges/Show', [
            'badge' => $badge,
        ]);
    }
}

