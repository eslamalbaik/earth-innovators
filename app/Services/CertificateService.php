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

    public function __construct()
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
        ?string $dateFormat = 'Y-m-d'
    ): string {
        // Use default template if not provided
        $templatePath = $templatePath ?? public_path('Certificate.pdf');
        
        if (!file_exists($templatePath)) {
            throw new \Exception("Certificate template not found at: {$templatePath}");
        }

        // Get student data
        $data = $this->prepareCertificateData($student, $issuer, $overrides, $dateFormat);

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
        string $dateFormat
    ): array {
        $issueDate = Carbon::now();
        
        $data = [
            'student_name' => $overrides['student_name'] ?? $student->name,
            'student_id' => $overrides['student_id'] ?? (string)$student->id,
            'membership_number' => $overrides['membership_number'] ?? $student->membership_number ?? 'N/A',
            'course_name' => $overrides['course_name'] ?? 'دورة تدريبية',
            'subject' => $overrides['subject'] ?? '',
            'grade' => $overrides['grade'] ?? '',
            'date' => $this->formatDate($issueDate, $dateFormat),
            'issue_date' => $this->formatDate($issueDate, $dateFormat),
            'signature' => $overrides['signature'] ?? '',
            'issued_by' => $overrides['issued_by'] ?? $issuer->name,
            'certificate_number' => $overrides['certificate_number'] ?? $this->generateCertificateNumber($student),
        ];

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

        // Create FPDI instance (extends TCPDF)
        $pdf = new Fpdi('L', 'mm', 'A4', true, 'UTF-8', false);
        
        // Remove default header/footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        
        // Set margins
        $pdf->SetMargins(0, 0, 0);
        $pdf->SetAutoPageBreak(false, 0);
        
        // Import existing PDF page
        $pageCount = $pdf->setSourceFile($templatePath);
        $tplId = $pdf->importPage(1);
        $pdf->AddPage();
        $pdf->useTemplate($tplId, 0, 0, null, null, true);
        
        // Set font for Arabic text (DejaVu Sans supports Arabic)
        $pdf->SetFont('dejavusans', '', 12);
        
        // Fill fields based on field map
        foreach ($this->fieldMap as $fieldName => $fieldConfig) {
            if (!isset($data[$fieldName]) || empty($data[$fieldName])) {
                continue;
            }

            $x = $fieldConfig['x'] ?? 0;
            $y = $fieldConfig['y'] ?? 0;
            $fontSize = $fieldConfig['font_size'] ?? 12;
            $align = $fieldConfig['align'] ?? 'left';
            
            // Set font size
            $pdf->SetFont('dejavusans', '', $fontSize);
            
            // Set alignment
            $alignMap = [
                'left' => 'L',
                'center' => 'C',
                'right' => 'R',
            ];
            $textAlign = $alignMap[$align] ?? 'L';
            
            // Write text
            $pdf->SetXY($x, $y);
            $pdf->Cell(0, 0, $data[$fieldName], 0, 0, $textAlign, false, '', 0, false, 'T', 'C');
        }
        
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
    protected function generateCertificateNumber(User $student): string
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

    /**
     * Save certificate record to database
     */
    public function saveCertificate(
        User $student,
        User $issuer,
        string $filePath,
        array $data = []
    ): Certificate {
        $certificate = Certificate::create([
            'user_id' => $student->id,
            'school_id' => $student->school_id,
            'type' => 'student',
            'title' => $data['course_name'] ?? 'شهادة إتمام',
            'title_ar' => $data['course_name'] ?? 'شهادة إتمام',
            'description' => $data['description'] ?? null,
            'description_ar' => $data['description_ar'] ?? null,
            'certificate_number' => $data['certificate_number'] ?? $this->generateCertificateNumber($student),
            'issue_date' => Carbon::now(),
            'expiry_date' => isset($data['expiry_date']) ? Carbon::parse($data['expiry_date']) : null,
            'template' => 'default',
            'file_path' => $filePath,
            'issued_by' => $issuer->id,
            'is_active' => true,
        ]);

        return $certificate;
    }
}

