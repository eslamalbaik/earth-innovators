<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use Illuminate\Console\Command;

class PruneAiAuditLogs extends Command
{
    protected $signature = 'ai:prune-logs
        {--days= : Override the retention window in days (defaults to config ai.audit_retention_days)}';

    protected $description = 'Delete AI audit log entries older than the configured retention window (AI Ethics data-retention policy)';

    public function handle(): int
    {
        $days = (int) ($this->option('days') ?? config('services.ai.audit_retention_days', 365));

        $deleted = ActivityLog::where('action', 'ai_call')
            ->where('created_at', '<', now()->subDays($days))
            ->delete();

        $this->info("Deleted {$deleted} AI audit log entries older than {$days} days.");

        return self::SUCCESS;
    }
}
