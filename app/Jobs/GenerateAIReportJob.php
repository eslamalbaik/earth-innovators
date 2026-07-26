<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\AIEngine\ReportGenerator;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;

/**
 * Background job to generate AI-powered reports.
 */
class GenerateAIReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 120;

    public function __construct(
        private User $user,
        private string $reportType = 'student', // student or institutional
    ) {}

    public function handle(ReportGenerator $reportGenerator): void
    {
        Log::info("Generating {$this->reportType} report for user #{$this->user->id}");

        try {
            if ($this->reportType === 'institutional') {
                $report = $reportGenerator->generateInstitutionalReport($this->user);
            } else {
                $report = $reportGenerator->generateStudentReport($this->user);
            }

            // Store the report as JSON
            $filename = "reports/{$this->user->id}/{$this->reportType}_" . now()->format('Y-m-d_His') . '.json';
            Storage::disk('local')->put($filename, json_encode($report, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

            Log::info("Report generated for user #{$this->user->id}: {$filename}");

        } catch (\Throwable $e) {
            Log::error("Error generating report for user #{$this->user->id}: {$e->getMessage()}");
            throw $e;
        }

        // Only clear cache on success — retries keep the "generating" state visible
        Cache::forget("generating_report_{$this->user->id}");
    }

    /**
     * Handle final failure after all retries exhausted.
     */
    public function failed(\Throwable $exception): void
    {
        Cache::forget("generating_report_{$this->user->id}");
        Log::error("Final failure generating report for user #{$this->user->id}: {$exception->getMessage()}");
    }
}
