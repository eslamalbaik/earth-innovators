<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Services\StatisticsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SchoolStatisticsController extends Controller
{
    public function __construct(
        private StatisticsService $statisticsService
    ) {}

    public function index(Request $request)
    {
        $school = Auth::user();
        
        $data = $this->statisticsService->getSchoolStatistics($school->id);
        return Inertia::render('School/Statistics', [
            'projectsByStatus' => $data['projectsByStatus'],
            'projectsByCategory' => $data['projectsByCategory'],
            'pointsByMonth' => $data['pointsByMonth'],
            'topStudents' => $data['topStudents'],
            'badgesStats' => $data['badgesStats'],
        ]);
    }
}
