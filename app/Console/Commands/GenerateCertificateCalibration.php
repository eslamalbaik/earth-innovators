<?php

namespace App\Console\Commands;

use App\Services\CertificateService;
use Illuminate\Console\Command;

class GenerateCertificateCalibration extends Command
{
    protected $signature = 'certificate:calibrate {--template= : Optional path to a specific template PDF}';

    protected $description = 'Overlay a design-pixel coordinate grid on the certificate template for field calibration';

    public function handle(CertificateService $certificateService): int
    {
        try {
            $path = $certificateService->generateCalibrationGrid(
                $this->option('template') ?: null
            );

            $this->info('Calibration grid generated successfully.');
            $this->line('Open: ' . url('storage/' . $path));
            $this->line('Read the design-pixel (x, y) of each label/blank from the red grid, then update config/certificate_fields.json.');

            return self::SUCCESS;
        } catch (\Throwable $exception) {
            $this->error('Failed to generate calibration grid: ' . $exception->getMessage());

            return self::FAILURE;
        }
    }
}
