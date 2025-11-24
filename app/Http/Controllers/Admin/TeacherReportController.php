<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeacherReportController extends Controller
{
    public function __construct(
        private ReportService $reportService
    ) {}

    public function show(Teacher $teacher, Request $request)
    {
        $month = $request->get('month', now()->format('Y-m'));
        
        $report = $this->reportService->getTeacherReport($teacher, $month);

        return Inertia::render('Admin/Teachers/Report', [
            'teacher' => [
                'id' => $teacher->id,
                'name_ar' => $teacher->name_ar,
                'name_en' => $teacher->name_en,
            ],
            'month' => $month,
            'summary' => $report['summary'],
            'byDay' => $report['byDay'],
            'bookings' => $report['bookings'],
        ]);
    }
}


