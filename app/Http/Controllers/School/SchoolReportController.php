<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Challenge;
use App\Models\User;
use App\Models\Certificate;
use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SchoolReportController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        // Get school_id from user or from teacher relationship
        $schoolId = $user->school_id;
        
        if (!$schoolId && $user->teacher) {
            $schoolId = $user->teacher->school_id;
        }

        // Get filter parameters
        $year = $request->get('year', date('Y'));
        $month = $request->get('month', date('m'));
        $type = $request->get('type', 'all');

        // Projects Statistics
        $projectsQuery = Project::where('school_id', $schoolId);
        if ($year) {
            $projectsQuery->whereYear('created_at', $year);
        }
        if ($month) {
            $projectsQuery->whereMonth('created_at', $month);
        }
        $projects = $projectsQuery->count();
        $approvedProjects = $projectsQuery->where('status', 'approved')->count();
        $pendingProjects = $projectsQuery->where('status', 'pending')->count();

        // Challenges Statistics
        $challengesQuery = Challenge::where('school_id', $schoolId);
        if ($year) {
            $challengesQuery->whereYear('created_at', $year);
        }
        if ($month) {
            $challengesQuery->whereMonth('created_at', $month);
        }
        $challenges = $challengesQuery->count();
        $activeChallenges = $challengesQuery->where('status', 'active')->count();

        // Students Statistics
        $studentsQuery = User::where('school_id', $schoolId)->where('role', 'student');
        if ($year) {
            $studentsQuery->whereYear('created_at', $year);
        }
        if ($month) {
            $studentsQuery->whereMonth('created_at', $month);
        }
        $totalStudents = User::where('school_id', $schoolId)->where('role', 'student')->count();
        $newStudents = $studentsQuery->count();

        // Certificates Statistics
        $certificatesQuery = Certificate::whereHas('user', function ($query) use ($schoolId) {
            $query->where('school_id', $schoolId);
        });
        if ($year) {
            $certificatesQuery->whereYear('created_at', $year);
        }
        if ($month) {
            $certificatesQuery->whereMonth('created_at', $month);
        }
        $certificates = $certificatesQuery->count();

        // Publications Statistics
        $publicationsQuery = Publication::where('school_id', $schoolId);
        if ($year) {
            $publicationsQuery->whereYear('created_at', $year);
        }
        if ($month) {
            $publicationsQuery->whereMonth('created_at', $month);
        }
        $publications = $publicationsQuery->count();

        // Get available years for filter
        $availableYears = range(date('Y'), date('Y') - 5);

        return inertia('School/Reports/Index', [
            'stats' => [
                'projects' => $projects,
                'approvedProjects' => $approvedProjects,
                'pendingProjects' => $pendingProjects,
                'challenges' => $challenges,
                'activeChallenges' => $activeChallenges,
                'totalStudents' => $totalStudents,
                'newStudents' => $newStudents,
                'certificates' => $certificates,
                'publications' => $publications,
            ],
            'filters' => [
                'year' => $year,
                'month' => $month,
                'type' => $type,
            ],
            'availableYears' => $availableYears,
        ]);
    }

    public function create()
    {
        return inertia('School/Reports/Create');
    }

    public function store(Request $request)
    {
        // Handle report creation based on type
        $validated = $request->validate([
            'type' => 'required|string',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'year' => 'required|integer',
            'month' => 'required|integer',
        ]);

        // Store report logic here
        // This could save to a reports table if needed

        return redirect()->route('school.reports.index')
            ->with('success', 'تم إنشاء التقرير بنجاح');
    }
}
