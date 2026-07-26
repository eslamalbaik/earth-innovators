<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function __construct(private AnalyticsService $analyticsService) {}

    /**
     * Get top schools by engagement (likes + views)
     */
    public function topSchools(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->analyticsService->topSchools(5),
        ]);
    }

    /**
     * Get top students by engagement (likes + views)
     */
    public function topStudents(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->analyticsService->topStudents(5),
        ]);
    }

    /**
     * Get dashboard analytics stats
     */
    public function dashboardStats(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $this->analyticsService->getDashboardStats(),
        ]);
    }
}
