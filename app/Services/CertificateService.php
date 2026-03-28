<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\User;
// Note: Requires tecnickcom/tcpdf to be installed
// Run: composer require tecnickcom/tcpdf
use setasign\Fpdi\Tcpdf\Fpdi;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class CertificateService
{
    protected $fieldMap;

    public function __construct(
        private MembershipService $membershipService
    )
    {
        $fieldMapPath = config_path('certificate_fields.json');
        if (file_exists($fieldMapPath)) {
            $this->fieldMap = json_decode(file_get_contents($fieldMapPath), true);
        } else {
            $this->fieldMap = [];
        }
    }

    /**
     * Generate a PDF certificate for a student
     */
    public function generateCertificate(
        User $student,
        User $issuer,
        array $overrides = [],
        ?string $templatePath = null,
        ?string $dateFormat = 'Y-m-d',
        string $certificateType = 'student'
    ): string {
        // Use default template if not provided
        $templatePath = $templatePath ?? public_path('Certificate.pdf');
        
        if (!file_exists($templatePath)) {
            throw new \Exception("Certificate template not found at: {$templatePath}");
        }

        // Get student data
        $data = $this->prepareCertificateData($student, $issuer, $overrides, $dateFormat, $certificateType);

        // Generate PDF
        $pdfPath = $this->fillPdfTemplate($templatePath, $data);

        return $pdfPath;
    }

    /**
     * Prepare certificate data from student and overrides
     */
    protected function prepareCertificateData(
        User $student,
        User $issuer,
        array $overrides,
        string $dateFormat,
        string $certificateType = 'student'
    ): array {
        $issueDate = $this->resolveDateOverride(
            $overrides['issue_date'] ?? $overrides['date'] ?? null
        ) ?? Carbon::now();
        $now = Carbon::now();
        $membershipNumber = $overrides['membership_number']
            ?? $student->membership_number
            ?? $this->membershipService->ensureMembershipNumber($student);
        
        $data = [
            'student_name' => $overrides['student_name'] ?? $student->name,
            'student_id' => $overrides['student_id'] ?? (string)$student->id,
            'membership_number' => $membershipNumber,
            'course_name' => $overrides['course_name'] ?? 'دورة تدريبية',
            'date' => $this->formatDate($issueDate, $dateFormat),
            'issue_date' => $this->formatDate($issueDate, $dateFormat),
            'signature' => $overrides['signature'] ?? '',
            'issued_by' => $overrides['issued_by'] ?? $issuer->name,
            'certificate_number' => $overrides['certificate_number'] ?? $this->generateCertificateNumber($student),
        ];

        // Add membership certificate specific fields
        if ($certificateType === 'membership') {
            // Join date: use created_at of user as default
            $joinDate = isset($overrides['join_date']) 
                ? Carbon::parse($overrides['join_date']) 
                : ($student->created_at ? Carbon::parse($student->created_at) : $now);
            
            // Issue time: current time
            $issueTime = $this->resolveDateOverride($overrides['issue_time'] ?? null) ?? $issueDate;
            
            // Today's date: current date
            $todayDate = $this->resolveDateOverride($overrides['today_date'] ?? null) ?? $issueDate;

            $data['join_date'] = $this->formatDate($joinDate, $dateFormat);
            $data['issue_time'] = $issueTime->format('H:i:s'); // Time format: HH:MM:SS
            $data['today_date'] = $this->formatDate($todayDate, $dateFormat);
            
            // Override course_name for membership certificate
            $data['course_name'] = $overrides['course_name'] ?? 'شهادة عضوية';
        }

        return $data;
    }

    /**
     * Fill PDF template with data
     */
    protected function fillPdfTemplate(string $templatePath, array $data): string
    {
        // Ensure TCPDF is loaded before FPDI (FPDI extends TCPDF)
        if (!class_exists('\TCPDF', false)) {
            // Try to require TCPDF directly
            $tcpdfPath = base_path('vendor/tecnickcom/tcpdf/tcpdf.php');
            if (file_exists($tcpdfPath)) {
                require_once $tcpdfPath;
            } else {
                throw new \Exception('TCPDF library is required. Please run: composer require tecnickcom/tcpdf');
            }
        }

        // Verify TCPDF is now available
        if (!class_exists('\TCPDF')) {
            throw new \Exception('TCPDF library could not be loaded. Please run: composer require tecnickcom/tcpdf');
        }

        // Check if FPDI class exists
        if (!class_exists('\setasign\Fpdi\Tcpdf\Fpdi')) {
            throw new \Exception('FPDI library is required. Please run: composer require setasign/fpdi');
        }

        // The field map coordinates are stored in points to match the PDF template.
        $pdf = new Fpdi('P', 'pt', 'A4', true, 'UTF-8', false);
        
        // Remove default header/footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        
        // Set margins
        $pdf->SetMargins(0, 0, 0);
        $pdf->SetAutoPageBreak(false, 0);
        
        // Import existing PDF page
        $pageCount = $pdf->setSourceFile($templatePath);
        $tplId = $pdf->importPage(1);
        $templateSize = $pdf->getTemplateSize($tplId);
        $pdf->AddPage($templateSize['orientation'], [$templateSize['width'], $templateSize['height']]);
        $pdf->useTemplate($tplId, 0, 0, $templateSize['width'], $templateSize['height'], true);
        
        // Set font for Arabic text (DejaVu Sans supports Arabic)
        $pdf->SetFont('dejavusans', '', 12);
        $pdf->SetTextColor(34, 34, 34);
        
        // Fill fields based on field map
        foreach ($this->fieldMap as $fieldName => $fieldConfig) {
            if (!isset($data[$fieldName]) || empty($data[$fieldName])) {
                continue;
            }

            $x = $fieldConfig['x'] ?? 0;
            $y = $fieldConfig['y'] ?? 0;
            $fontSize = $fieldConfig['font_size'] ?? 12;
            $align = $fieldConfig['align'] ?? 'left';
            $fontFamily = $fieldConfig['font_family'] ?? 'dejavusans';
            $width = $fieldConfig['width'] ?? $this->resolveFieldWidth($fieldConfig, $templateSize['width']);
            $height = $fieldConfig['height'] ?? max($fontSize * 1.4, 18);
            $value = (string) $data[$fieldName];
            
            // Set font size
            $pdf->SetFont(strtolower($fontFamily), '', $fontSize);
            
            // Set alignment
            $alignMap = [
                'left' => 'L',
                'center' => 'C',
                'right' => 'R',
            ];
            $textAlign = $alignMap[$align] ?? 'L';
            
            $pdf->setRTL($this->containsArabicCharacters($value));

            // Write text
            $pdf->SetXY($x, $y);
            $pdf->Cell($width, $height, $value, 0, 0, $textAlign, false, '', 0, false, 'M', 'M');
        }

        $pdf->setRTL(false);
        
        // Generate unique filename
        $year = date('Y');
        $filename = "certificates/{$year}/" . uniqid('cert_', true) . '.pdf';
        
        // Save to public disk (storage/app/public) so it's accessible via symlink
        $fullPath = storage_path('app/public/' . $filename);
        $dir = dirname($fullPath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        
        // Save PDF
        $pdf->Output($fullPath, 'F');
        
        // Return path relative to public disk
        return $filename;
    }

    /**
     * Format date according to format preference
     */
    protected function formatDate(Carbon $date, string $format): string
    {
        if ($format === 'long') {
            // Arabic long format: 9 ديسمبر 2025
            $months = [
                1 => 'يناير', 2 => 'فبراير', 3 => 'مارس', 4 => 'أبريل',
                5 => 'مايو', 6 => 'يونيو', 7 => 'يوليو', 8 => 'أغسطس',
                9 => 'سبتمبر', 10 => 'أكتوبر', 11 => 'نوفمبر', 12 => 'ديسمبر'
            ];
            $day = $date->day;
            $month = $months[$date->month] ?? $date->month;
            $year = $date->year;
            return "{$day} {$month} {$year}";
        } elseif ($format === 'short') {
            return $date->format('d-m-Y');
        } else {
            return $date->format($format);
        }
    }

    /**
     * Generate unique certificate number
     */
    public function generateCertificateNumber(User $student): string
    {
        $year = date('Y');
        $baseNumber = str_pad($student->id, 4, '0', STR_PAD_LEFT);
        
        // Count existing certificates for this student in the current year
        $existingCount = Certificate::where('user_id', $student->id)
            ->whereYear('created_at', $year)
            ->count();
        
        // If no existing certificates, use base format
        if ($existingCount === 0) {
            $certificateNumber = "CERT-{$year}-{$baseNumber}";
        } else {
            // Append sequence number for uniqueness
            $sequence = str_pad($existingCount + 1, 3, '0', STR_PAD_LEFT);
            $certificateNumber = "CERT-{$year}-{$baseNumber}-{$sequence}";
        }
        
        // Double-check uniqueness (in case of race condition)
        $counter = 1;
        $originalNumber = $certificateNumber;
        while (Certificate::where('certificate_number', $certificateNumber)->exists()) {
            $sequence = str_pad($existingCount + 1 + $counter, 3, '0', STR_PAD_LEFT);
            $certificateNumber = "CERT-{$year}-{$baseNumber}-{$sequence}";
            $counter++;
            
            // Safety check to prevent infinite loop
            if ($counter > 999) {
                // Fallback: use timestamp for uniqueness
                $certificateNumber = "CERT-{$year}-{$baseNumber}-" . time();
                break;
            }
        }
        
        return $certificateNumber;
    }

    public function rebuildCertificateFile(Certificate $certificate): string
    {
        $recipient = $certificate->user;

        if (!$recipient && $certificate->school_id) {
            $recipient = User::findOrFail($certificate->school_id);
        }

        if (!$recipient) {
            throw new \RuntimeException('Certificate recipient could not be resolved.');
        }

        $issuer = $certificate->issuer ?? $recipient;
        $issueDate = $certificate->approved_at ?? $certificate->issue_date ?? $certificate->created_at ?? now();
        $certificateNumber = str_starts_with((string) $certificate->certificate_number, 'REQ-')
            ? $this->generateCertificateNumber($recipient)
            : $certificate->certificate_number;

        $overrides = [
            'course_name' => $certificate->title_ar ?? $certificate->title,
            'description' => $certificate->description_ar ?? $certificate->description,
            'description_ar' => $certificate->description_ar ?? $certificate->description,
            'certificate_number' => $certificateNumber,
            'issue_date' => $issueDate->toDateString(),
            'date' => $issueDate->toDateString(),
            'membership_number' => $recipient->membership_number,
        ];

        if ($certificate->type === 'membership') {
            $overrides['join_date'] = optional($recipient->created_at)->toDateString() ?? $issueDate->toDateString();
            $overrides['today_date'] = $issueDate->toDateString();
            $overrides['issue_time'] = $issueDate->format('H:i:s');
        }

        $templatePath = $this->resolveTemplatePath($certificate->template);

        if ($certificate->file_path && Storage::disk('public')->exists($certificate->file_path)) {
            Storage::disk('public')->delete($certificate->file_path);
        }

        $filePath = $this->generateCertificate(
            $recipient,
            $issuer,
            $overrides,
            $templatePath,
            $certificate->type === 'membership' ? 'long' : 'Y-m-d',
            $certificate->type
        );

        $certificate->update([
            'certificate_number' => $certificateNumber,
            'issue_date' => $issueDate,
            'file_path' => $filePath,
        ]);

        return $filePath;
    }

    /**
     * Save certificate record to database
     */
    public function saveCertificate(
        User $student,
        User $issuer,
        string $filePath,
        array $data = [],
        string $certificateType = 'student'
    ): Certificate {
        // Determine title based on certificate type
        $defaultTitle = $certificateType === 'membership' ? 'شهادة عضوية' : 'شهادة إتمام';
        $title = $data['course_name'] ?? $defaultTitle;
        
        $certificate = Certificate::create([
            'user_id' => $student->id,
            'school_id' => $student->school_id,
            'type' => $certificateType,
            'title' => $title,
            'title_ar' => $title,
            'description' => $data['description'] ?? null,
            'description_ar' => $data['description_ar'] ?? null,
            'certificate_number' => $data['certificate_number'] ?? $this->generateCertificateNumber($student),
            'issue_date' => isset($data['issue_date']) ? Carbon::parse($data['issue_date']) : Carbon::now(),
            'expiry_date' => isset($data['expiry_date']) ? Carbon::parse($data['expiry_date']) : null,
            'template' => $data['template'] ?? 'default',
            'file_path' => $filePath,
            'issued_by' => $issuer->id,
            'is_active' => true,
            'therapeutic_plan' => $data['therapeutic_plan'] ?? null,
        ]);

        return $certificate;
    }

    protected function resolveDateOverride(mixed $value): ?Carbon
    {
        if ($value instanceof Carbon) {
            return $value;
        }

        if (!$value) {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable $exception) {
            return null;
        }
    }

    protected function resolveFieldWidth(array $fieldConfig, float $pageWidth): float
    {
        $x = (float) ($fieldConfig['x'] ?? 0);
        $align = $fieldConfig['align'] ?? 'left';

        if ($align === 'center') {
            return max($pageWidth - ($x * 2), 120);
        }

        return max($pageWidth - $x - 40, 120);
    }

    protected function containsArabicCharacters(string $value): bool
    {
        return preg_match('/\p{Arabic}/u', $value) === 1;
    }

    protected function resolveTemplatePath(?string $template): ?string
    {
        if (!$template || $template === 'default') {
            return null;
        }

        if (file_exists($template)) {
            return $template;
        }

        $publicCandidate = public_path(ltrim($template, '/'));
        if (file_exists($publicCandidate)) {
            return $publicCandidate;
        }

        return null;
    }
}
