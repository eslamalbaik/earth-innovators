<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SchoolBadgeController extends Controller
{
    /**
     * عرض قائمة الشارات المعلقة للمراجعة
     */
    public function pending(Request $request)
    {
        $school = Auth::user();
        
        $query = Badge::when(!$school->canAccessAllSchoolData(), function($q) use ($school) {
                return $q->where('school_id', $school->id);
            })
            ->where('status', 'pending')
            ->with(['creator', 'approver']);
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('name_ar', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        $badges = $query->latest()->paginate(15)->withQueryString();
        
        return Inertia::render('School/Badges/Pending', [
            'badges' => $badges,
        ]);
    }

    /**
     * عرض جميع الشارات المرسلة لهذه المدرسة
     */
    public function index(Request $request)
    {
        $school = Auth::user();
        
        $query = Badge::when(!$school->canAccessAllSchoolData(), function($q) use ($school) {
                return $q->where('school_id', $school->id);
            })
            ->with(['creator', 'approver']);
        
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('name_ar', 'like', "%{$search}%");
            });
        }
        
        $badges = $query->latest()->paginate(15)->withQueryString();
        
        return Inertia::render('School/Badges/Index', [
            'badges' => $badges,
        ]);
    }

    /**
     * قبول شارة
     */
    public function approve(Badge $badge)
    {
        $school = Auth::user();
        
        if (!$school->canAccessAllSchoolData() && ($badge->school_id !== $school->id || $badge->status !== 'pending')) {
            abort(403, 'غير مصرح لك بقبول هذه الشارة');
        }
        
        $badge->update([
            'status' => 'approved',
            'approved_by' => $school->id,
            'approved_at' => now(),
            'is_active' => true,
        ]);
        
        return redirect()->back()->with('success', 'تم قبول الشارة بنجاح');
    }

    /**
     * رفض شارة
     */
    public function reject(Request $request, Badge $badge)
    {
        $school = Auth::user();
        
        if (!$school->canAccessAllSchoolData() && ($badge->school_id !== $school->id || $badge->status !== 'pending')) {
            abort(403, 'غير مصرح لك برفض هذه الشارة');
        }
        
        $validated = $request->validate([
            'rejection_reason' => 'nullable|string|max:1000',
        ]);
        
        $badge->update([
            'status' => 'rejected',
            'approved_by' => $school->id,
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);
        
        return redirect()->back()->with('success', 'تم رفض الشارة');
    }

    /**
     * عرض تفاصيل شارة
     */
    public function show(Badge $badge)
    {
        $school = Auth::user();
        
        if (!$school->canAccessAllSchoolData() && $badge->school_id !== $school->id) {
            abort(403, 'غير مصرح لك بعرض هذه الشارة');
        }
        
        $badge->load(['creator', 'approver', 'school']);
        
        return Inertia::render('School/Badges/Show', [
            'badge' => $badge,
        ]);
    }
}

