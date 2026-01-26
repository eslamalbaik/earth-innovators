<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Services\StudentEvaluationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentEvaluationController extends Controller
{
    public function __construct(
        private StudentEvaluationService $evaluationService
    ) {}

    /**
     * Display student evaluation report
     */
    public function index(Request $request)
    {
        $schoolId = auth()->user()->school_id;
        $source = $request->get('source', 'projects'); // 'projects' or 'challenges'

        $report = $this->evaluationService->getEvaluationReport($schoolId, $source);

        return Inertia::render('School/Students/EvaluationReport', [
            'report' => $report,
            'source' => $source,
            'categories' => $this->evaluationService->getAllCategories(),
        ]);
    }

    /**
     * Get student evaluation summary
     */
    public function show(int $studentId, Request $request)
    {
        $source = $request->get('source', 'projects');
        
        $summary = $this->evaluationService->getStudentEvaluationSummary($studentId, $source);

        return response()->json($summary);
    }
}

