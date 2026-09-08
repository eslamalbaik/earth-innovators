<?php

namespace App\Services\AIEngine;

use App\Models\User;
use App\Models\InnovationIndex;
use App\Models\Achievement;
use Illuminate\Support\Facades\DB;

/**
 * AI Ethics: measures whether AI-derived scores and AI validation outcomes
 * differ systematically across schools, using real platform data (no synthetic
 * or proxy figures). Gender-based slicing is intentionally omitted — the
 * `users` table has no gender column, and fabricating a proxy would produce
 * a misleading fairness signal.
 */
class BiasMeasurementService
{
    private const FLAG_DEVIATION_POINTS = 10.0; // overall_score points from platform mean
    private const FLAG_APPROVAL_RATE_DELTA = 15.0; // percentage points from platform mean

    public function schoolFairnessReport(): array
    {
        $schools = User::whereIn('role', ['school', 'educational_institution'])
            ->get(['id', 'name']);

        $indexStats = InnovationIndex::query()
            ->join('users', 'users.id', '=', 'innovation_indexes.user_id')
            ->whereNotNull('users.school_id')
            ->select('users.school_id')
            ->selectRaw('COUNT(*) as student_count')
            ->selectRaw('AVG(innovation_indexes.overall_score) as avg_score')
            ->groupBy('users.school_id')
            ->get()
            ->keyBy('school_id');

        $classificationStats = InnovationIndex::query()
            ->join('users', 'users.id', '=', 'innovation_indexes.user_id')
            ->whereNotNull('users.school_id')
            ->select('users.school_id', 'innovation_indexes.classification')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('users.school_id', 'innovation_indexes.classification')
            ->get()
            ->groupBy('school_id');

        $achievementStats = Achievement::query()
            ->join('users', 'users.id', '=', 'achievements.user_id')
            ->whereNotNull('users.school_id')
            ->select('users.school_id', 'achievements.ai_validation_status')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('users.school_id', 'achievements.ai_validation_status')
            ->get()
            ->groupBy('school_id');

        $platformAvgScore = InnovationIndex::avg('overall_score');

        $platformFlaggedRate = $this->rateFor(
            Achievement::where('ai_validation_status', 'flagged')->count(),
            Achievement::count()
        );

        $rows = [];
        foreach ($schools as $school) {
            $index = $indexStats->get($school->id);
            $avgScore = $index && $index->avg_score !== null ? round((float) $index->avg_score, 1) : null;
            $studentCount = $index?->student_count ?? 0;

            $classifications = [];
            foreach ($classificationStats->get($school->id, collect()) as $row) {
                $classifications[$row->classification] = (int) $row->count;
            }

            $achievementRows = $achievementStats->get($school->id, collect());
            $totalAchievements = $achievementRows->sum('count');
            $flaggedCount = (int) $achievementRows->firstWhere('ai_validation_status', 'flagged')?->count ?? 0;
            $flaggedRate = $this->rateFor($flaggedCount, $totalAchievements);

            $scoreDeviation = $avgScore !== null && $platformAvgScore !== null
                ? round($avgScore - $platformAvgScore, 1)
                : null;

            $flaggedRateDeviation = $flaggedRate !== null && $platformFlaggedRate !== null
                ? round($flaggedRate - $platformFlaggedRate, 1)
                : null;

            $flags = [];
            if ($scoreDeviation !== null && abs($scoreDeviation) >= self::FLAG_DEVIATION_POINTS) {
                $flags[] = 'score_deviation';
            }
            if ($flaggedRateDeviation !== null && abs($flaggedRateDeviation) >= self::FLAG_APPROVAL_RATE_DELTA) {
                $flags[] = 'flagged_rate_deviation';
            }

            $rows[] = [
                'school_id' => $school->id,
                'school_name' => $school->name,
                'student_count' => $studentCount,
                'avg_overall_score' => $avgScore,
                'score_deviation_from_platform' => $scoreDeviation,
                'classification_distribution' => $classifications,
                'total_achievements' => $totalAchievements,
                'ai_flagged_rate' => $flaggedRate,
                'flagged_rate_deviation_from_platform' => $flaggedRateDeviation,
                'flags' => $flags,
            ];
        }

        return [
            'platform_avg_score' => $platformAvgScore !== null ? round((float) $platformAvgScore, 1) : null,
            'platform_ai_flagged_rate' => $platformFlaggedRate,
            'schools' => $rows,
            'thresholds' => [
                'score_deviation_points' => self::FLAG_DEVIATION_POINTS,
                'approval_rate_delta_points' => self::FLAG_APPROVAL_RATE_DELTA,
            ],
            'limitations' => [
                'No gender or demographic field exists on the users table, so gender-based fairness slicing is not available.',
                'Small student counts per school make averages noisy — treat flags as a starting point for manual review, not proof of bias.',
            ],
        ];
    }

    private function rateFor(int $part, int $total): ?float
    {
        if ($total === 0) {
            return null;
        }

        return round(($part / $total) * 100, 1);
    }
}
