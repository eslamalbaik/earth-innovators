<?php

namespace App\Jobs;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdateTeacherRating implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 2;
    public $timeout = 60;

    public function __construct(
        private int $teacherId
    ) {}

    public function handle(): void
    {
        try {
            $avgRating = DB::table('reviews')
                ->where('teacher_id', $this->teacherId)
                ->where('is_published', true)
                ->avg('rating');

            $reviewsCount = DB::table('reviews')
                ->where('teacher_id', $this->teacherId)
                ->where('is_published', true)
                ->count();

            Teacher::where('id', $this->teacherId)->update([
                'rating' => round((float) ($avgRating ?? 0), 2),
                'reviews_count' => (int) $reviewsCount,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update teacher rating', [
                'teacher_id' => $this->teacherId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}

