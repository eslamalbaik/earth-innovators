<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\SubmissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentSubmissionController extends Controller
{
    public function __construct(
        private SubmissionService $submissionService
    ) {}

    public function index(Request $request): Response
    {
        $student = Auth::user();
        if (! $student || ! $student->isStudent()) {
            abort(403);
        }

        $status = $request->query('status');
        if ($status !== null && $status !== '' && ! in_array($status, ['submitted', 'reviewed', 'approved', 'rejected'], true)) {
            $status = null;
        }

        $submissions = $this->submissionService->paginateStudentSubmissionsForList(
            $student->id,
            12,
            $status ?: null
        );

        return Inertia::render('Student/Submissions/Index', [
            'submissions' => $submissions,
            'filterStatus' => $status ?: 'all',
        ]);
    }
}
