<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\StatisticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StatisticsController extends Controller
{
    public function __construct(
        private StatisticsService $statisticsService
    ) {}

    public function index(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now()->endOfMonth());
        
        $data = $this->statisticsService->getAdminStatistics($dateFrom, $dateTo);
        return Inertia::render('Admin/Statistics', [
            'stats' => $data['stats'],
            'monthly' => $data['monthly'],
            'subjectsDistribution' => $data['subjectsDistribution'],
            'topTeachers' => $data['topTeachers'],
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
