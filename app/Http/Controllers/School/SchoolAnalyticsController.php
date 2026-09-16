<?php

namespace App\Http\Controllers\School;

use App\Exports\SchoolAnalyticsExport;
use App\Http\Controllers\Controller;
use App\Models\InnovationIndex;
use App\Models\NationalLevelSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

/**
 * School-wide innovation analytics — requirement 8.2: L1-L5 distribution,
 * performance trend, teacher/section comparison, and a low-performer
 * intervention list, all reading the same InnovationIndex data the
 * teacher-facing evaluation report reads (requirement 8.1's "no
 * discrepancy" guarantee), scoped to this school's own students.
 */
class SchoolAnalyticsController extends Controller
{
    public function index(): Response
    {
        $school = Auth::user();

        return Inertia::render('School/Analytics/Index', $this->buildReport($school));
    }

    public function exportExcel()
    {
        $school = Auth::user();

        return Excel::download(
            new SchoolAnalyticsExport($this->studentIndexesQuery($school)->get()),
            'school-analytics-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    private function buildReport(User $school): array
    {
        $indexes = $this->studentIndexesQuery($school)->get();
        $levels = NationalLevelSetting::orderBy('sort_order')->get();

        // L1-L5 distribution
        $distribution = $levels->map(function ($level) use ($indexes) {
            $count = $indexes->filter(fn ($i) => (float) $i->overall_score >= $level->min_score && (float) $i->overall_score <= $level->max_score)->count();

            return [
                'code' => $level->code, 'label_ar' => $level->label_ar, 'color' => $level->color, 'count' => $count,
            ];
        })->values();

        // Performance trend over the last 6 months (avg overall_score per month)
        $monthExpr = match (DB::connection()->getDriverName()) {
            'sqlite' => "strftime('%Y-%m', calculated_at)",
            'pgsql' => "to_char(calculated_at, 'YYYY-MM')",
            default => "DATE_FORMAT(calculated_at, '%Y-%m')",
        };

        $trend = $this->studentIndexesQuery($school)
            ->selectRaw("{$monthExpr} as ym, AVG(overall_score) as avg_score, COUNT(*) as n")
            ->whereNotNull('calculated_at')
            ->where('calculated_at', '>=', now()->subMonths(6))
            ->groupBy('ym')
            ->orderBy('ym')
            ->get()
            ->map(fn ($row) => ['month' => $row->ym, 'avgScore' => round((float) $row->avg_score, 1), 'count' => $row->n]);

        // Teacher comparison — avg score of students under each teacher
        $teacherComparison = User::where('school_id', $school->id)
            ->where('role', 'teacher')
            ->get(['id', 'name'])
            ->map(function ($teacher) use ($indexes) {
                $studentIds = User::where('teacher_id', $teacher->id)->pluck('id');
                $teacherIndexes = $indexes->whereIn('user_id', $studentIds);

                return [
                    'teacherId'   => $teacher->id,
                    'teacherName' => $teacher->name,
                    'studentCount' => $teacherIndexes->count(),
                    'avgScore'    => $teacherIndexes->count() ? round((float) $teacherIndexes->avg('overall_score'), 1) : null,
                ];
            })
            ->filter(fn ($row) => $row['studentCount'] > 0)
            ->sortByDesc('avgScore')
            ->values();

        // Low performers needing intervention — lowest overall_score first
        $lowPerformers = $indexes->sortBy('overall_score')->take(10)->map(function ($index) {
            $user = User::find($index->user_id);

            return [
                'userId' => $index->user_id,
                'name'   => $user?->name,
                'role'   => $user?->role,
                'score'  => round((float) $index->overall_score, 1),
                'nationalLevel' => $index->getNationalLevelDetails(),
            ];
        })->values();

        return [
            'distribution'      => $distribution,
            'trend'             => $trend,
            'teacherComparison' => $teacherComparison,
            'lowPerformers'     => $lowPerformers,
            'totalStudents'     => User::where('school_id', $school->id)->where('role', 'student')->count(),
            'evaluatedStudents' => $indexes->count(),
            'generatedAt'       => now()->toDateTimeString(),
        ];
    }

    private function studentIndexesQuery(User $school)
    {
        $studentIds = User::where('school_id', $school->id)->where('role', 'student')->pluck('id');

        return InnovationIndex::whereIn('user_id', $studentIds)
            ->whereIn('id', function ($query) {
                $query->selectRaw('MAX(id)')->from('innovation_indexes')->groupBy('user_id');
            });
    }
}
