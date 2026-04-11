<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Challenge;
use App\Models\Project;
use App\Models\Publication;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SchoolReportController extends Controller
{
    public function index(Request $request)
    {
        $reportData = $this->buildReportData(Auth::user(), $request);

        return inertia('School/Reports/Index', $reportData);
    }

    public function exportPdf(Request $request)
    {
        $reportData = $this->buildReportData(Auth::user(), $request);
        $pdfContent = $this->renderPdfReport($reportData);
        $filename = 'school-report-' . now()->format('Y-m-d-H-i-s') . '.pdf';

        return response($pdfContent, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function exportExcel(Request $request)
    {
        $reportData = $this->buildReportData(Auth::user(), $request);
        $filename = 'school-report-' . now()->format('Y-m-d-H-i-s') . '.xls';

        return response($this->renderExcelReport($reportData), 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    public function create()
    {
        return inertia('School/Reports/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'title' => 'required|string',
            'description' => 'nullable|string',
            'year' => 'required|integer',
            'month' => 'required|integer',
        ]);

        return redirect()->route('school.reports.index')
            ->with('success', 'تم إنشاء التقرير بنجاح');
    }

    private function buildReportData(User $user, Request $request): array
    {
        $schoolId = $this->resolveSchoolId($user);
        $school = User::select('id', 'name')->find($schoolId);
        $year = (int) $request->integer('year', now()->year);
        $month = $request->filled('month') ? (int) $request->integer('month') : null;
        $type = $request->get('type', 'all');

        $projectsBaseQuery = Project::query()->where('school_id', $schoolId);
        $this->applyDateFilters($projectsBaseQuery, $year, $month);

        $challengesBaseQuery = Challenge::query()->where('school_id', $schoolId);
        $this->applyDateFilters($challengesBaseQuery, $year, $month);

        $newStudentsBaseQuery = User::query()
            ->where('school_id', $schoolId)
            ->where('role', 'student');
        $this->applyDateFilters($newStudentsBaseQuery, $year, $month);

        $certificatesBaseQuery = Certificate::query()->whereHas('user', function (Builder $query) use ($schoolId) {
            $query->where('school_id', $schoolId);
        });
        $this->applyDateFilters($certificatesBaseQuery, $year, $month);

        $publicationsBaseQuery = Publication::query()->where('school_id', $schoolId);
        $this->applyDateFilters($publicationsBaseQuery, $year, $month);

        $stats = [
            'projects' => (clone $projectsBaseQuery)->count(),
            'approvedProjects' => (clone $projectsBaseQuery)->where('status', 'approved')->count(),
            'pendingProjects' => (clone $projectsBaseQuery)->where('status', 'pending')->count(),
            'challenges' => (clone $challengesBaseQuery)->count(),
            'activeChallenges' => (clone $challengesBaseQuery)->where('status', 'active')->count(),
            'totalStudents' => User::query()->where('school_id', $schoolId)->where('role', 'student')->count(),
            'newStudents' => (clone $newStudentsBaseQuery)->count(),
            'certificates' => (clone $certificatesBaseQuery)->count(),
            'publications' => (clone $publicationsBaseQuery)->count(),
        ];

        return [
            'stats' => $stats,
            'filters' => [
                'year' => (string) $year,
                'month' => $month ? (string) $month : '',
                'type' => $type,
            ],
            'availableYears' => range(now()->year, now()->year - 5),
            'reportMeta' => [
                'schoolName' => $school?->name ?? $user->name,
                'generatedAt' => now()->format('Y-m-d H:i'),
                'year' => $year,
                'month' => $month,
            ],
        ];
    }

    private function resolveSchoolId(User $user): int
    {
        if ($user->isSchool()) {
            return (int) $user->id;
        }

        if ($user->school_id) {
            return (int) $user->school_id;
        }

        if ($user->teacher?->school_id) {
            return (int) $user->teacher->school_id;
        }

        abort(403, 'لا يمكن تحديد المدرسة المرتبطة بهذا الحساب.');
    }

    private function applyDateFilters(Builder $query, int $year, ?int $month): void
    {
        $query->whereYear('created_at', $year);

        if ($month) {
            $query->whereMonth('created_at', $month);
        }
    }

    private function renderExcelReport(array $reportData): string
    {
        $meta = $reportData['reportMeta'];
        $stats = $reportData['stats'];
        $period = $meta['month']
            ? "{$meta['year']}/{$meta['month']}"
            : (string) $meta['year'];

        $rows = [
            ['المؤشر', 'القيمة'],
            ['إجمالي المشاريع', $stats['projects']],
            ['المشاريع المعتمدة', $stats['approvedProjects']],
            ['المشاريع المعلقة', $stats['pendingProjects']],
            ['إجمالي التحديات', $stats['challenges']],
            ['التحديات النشطة', $stats['activeChallenges']],
            ['إجمالي الطلبة', $stats['totalStudents']],
            ['الطلبة الجدد', $stats['newStudents']],
            ['الشهادات', $stats['certificates']],
            ['المنشورات', $stats['publications']],
        ];

        $tableRows = collect($rows)->map(function (array $row) {
            return '<tr><td style="border:1px solid #d1d5db;padding:10px;">' . e((string) $row[0]) . '</td><td style="border:1px solid #d1d5db;padding:10px;">' . e((string) $row[1]) . '</td></tr>';
        })->implode('');

        return '<html dir="rtl"><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;">'
            . '<h2>تقرير المدرسة</h2>'
            . '<p><strong>المدرسة:</strong> ' . e($meta['schoolName']) . '</p>'
            . '<p><strong>الفترة:</strong> ' . e($period) . '</p>'
            . '<p><strong>تاريخ الإنشاء:</strong> ' . e($meta['generatedAt']) . '</p>'
            . '<table style="border-collapse:collapse;width:100%;margin-top:20px;">'
            . $tableRows
            . '</table></body></html>';
    }

    private function renderPdfReport(array $reportData): string
    {
        if (!class_exists(\TCPDF::class)) {
            $tcpdfPath = base_path('vendor/tecnickcom/tcpdf/tcpdf.php');
            if (file_exists($tcpdfPath)) {
                require_once $tcpdfPath;
            }
        }

        if (!class_exists(\TCPDF::class)) {
            abort(500, 'مكتبة PDF غير متاحة حاليًا.');
        }

        $meta = $reportData['reportMeta'];
        $stats = $reportData['stats'];
        $period = $meta['month']
            ? "{$meta['year']}/{$meta['month']}"
            : (string) $meta['year'];

        $pdf = new \TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        $pdf->SetCreator('Earth Innovators');
        $pdf->SetAuthor('Earth Innovators');
        $pdf->SetTitle('School Report');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetMargins(12, 12, 12);
        $pdf->SetAutoPageBreak(true, 12);
        $pdf->setRTL(true);
        $pdf->SetFont('dejavusans', '', 11);
        $pdf->AddPage();

        $html = '
            <h1 style="text-align:center;">تقرير المدرسة</h1>
            <p><strong>المدرسة:</strong> ' . e($meta['schoolName']) . '</p>
            <p><strong>الفترة:</strong> ' . e($period) . '</p>
            <p><strong>تاريخ الإنشاء:</strong> ' . e($meta['generatedAt']) . '</p>
            <table border="1" cellpadding="8">
                <thead>
                    <tr style="background-color:#f3f4f6;">
                        <th width="70%">المؤشر</th>
                        <th width="30%">القيمة</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>إجمالي المشاريع</td><td>' . $stats['projects'] . '</td></tr>
                    <tr><td>المشاريع المعتمدة</td><td>' . $stats['approvedProjects'] . '</td></tr>
                    <tr><td>المشاريع المعلقة</td><td>' . $stats['pendingProjects'] . '</td></tr>
                    <tr><td>إجمالي التحديات</td><td>' . $stats['challenges'] . '</td></tr>
                    <tr><td>التحديات النشطة</td><td>' . $stats['activeChallenges'] . '</td></tr>
                    <tr><td>إجمالي الطلبة</td><td>' . $stats['totalStudents'] . '</td></tr>
                    <tr><td>الطلبة الجدد</td><td>' . $stats['newStudents'] . '</td></tr>
                    <tr><td>الشهادات</td><td>' . $stats['certificates'] . '</td></tr>
                    <tr><td>المنشورات</td><td>' . $stats['publications'] . '</td></tr>
                </tbody>
            </table>
        ';

        $pdf->writeHTML($html, true, false, true, false, '');

        return $pdf->Output('', 'S');
    }
}
