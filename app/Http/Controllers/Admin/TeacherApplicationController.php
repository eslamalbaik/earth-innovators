<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeacherApplication;
use App\Services\TeacherApplicationService;
use Illuminate\Http\Request;

class TeacherApplicationController extends Controller
{
    public function __construct(
        private TeacherApplicationService $applicationService
    ) {}

    public function index(Request $request)
    {
        $applications = $this->applicationService->getAllApplications(
            $request->get('status'),
            $request->get('search'),
            15
        )->withQueryString();

        $stats = $this->applicationService->getApplicationStats();

        return inertia('Admin/TeacherApplications', [
            'applications' => $applications,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search'])
        ]);
    }

    public function show(TeacherApplication $application)
    {
        $application->load(['user', 'teacher', 'reviewer', 'teacher.subjects']);

        return inertia('Admin/TeacherApplicationDetails', [
            'application' => $application
        ]);
    }

    public function approve(Request $request, TeacherApplication $application)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            $this->applicationService->approveApplication(
                $application,
                $request->get('notes'),
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'تم الموافقة على طلب الانضمام بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الموافقة على الطلب',
                'error' => config('app.debug') ? $e->getMessage() : 'خطأ غير معروف'
            ], 500);
        }
    }

    public function reject(Request $request, TeacherApplication $application)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:1000',
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            $this->applicationService->rejectApplication(
                $application,
                $request->rejection_reason,
                $request->get('notes'),
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'تم رفض طلب الانضمام'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء رفض الطلب',
                'error' => config('app.debug') ? $e->getMessage() : 'خطأ غير معروف'
            ], 500);
        }
    }

    public function markUnderReview(Request $request, TeacherApplication $application)
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            $this->applicationService->markUnderReview(
                $application,
                $request->get('notes'),
                auth()->id()
            );

            return response()->json([
                'success' => true,
                'message' => 'تم وضع الطلب قيد المراجعة'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تحديث حالة الطلب',
                'error' => config('app.debug') ? $e->getMessage() : 'خطأ غير معروف'
            ], 500);
        }
    }

    public function statistics()
    {
        $stats = $this->applicationService->getApplicationStats();

        $monthlyData = TeacherApplication::selectRaw('
                DATE_FORMAT(submitted_at, "%Y-%m") as month,
                COUNT(*) as count
            ')
            ->where('submitted_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        return response()->json([
            'stats' => $stats,
            'monthly_data' => $monthlyData
        ]);
    }
}
