<?php

namespace App\Services;

use App\Models\User;
use App\Models\InnovationIndex;
use Illuminate\Support\Facades\DB;

/**
 * AI-024: Benchmarking Service
 *
 * Compares a user's indexes against cohorts, institutions, fields, etc.
 */
class BenchmarkingService
{
    /**
     * Compare user with their cohort (same year)
     */
    public function compareWithCohort(User $user): array
    {
        $index = $user->latestInnovationIndex;
        if (!$index) {
            return ['message' => 'لم يتم حساب المؤشرات بعد'];
        }

        $cohortQuery = InnovationIndex::query()
            ->whereHas('user', function ($q) use ($user) {
                $q->where('role', $user->role);
                if ($user->year) {
                    $q->where('year', $user->year);
                }
            })
            ->where('user_id', '!=', $user->id);

        return $this->buildComparison($index, $cohortQuery, 'الدفعة');
    }

    /**
     * Compare user with their institution
     */
    public function compareWithInstitution(User $user): array
    {
        $index = $user->latestInnovationIndex;
        if (!$index) {
            return ['message' => 'لم يتم حساب المؤشرات بعد'];
        }

        $instQuery = InnovationIndex::query()
            ->whereHas('user', function ($q) use ($user) {
                if ($user->school_id) {
                    $q->where('school_id', $user->school_id);
                } elseif ($user->institution) {
                    $q->where('institution', $user->institution);
                }
            })
            ->where('user_id', '!=', $user->id);

        return $this->buildComparison($index, $instQuery, 'المؤسسة');
    }

    /**
     * Compare user with their field (all users)
     */
    public function compareWithField(User $user): array
    {
        $index = $user->latestInnovationIndex;
        if (!$index) {
            return ['message' => 'لم يتم حساب المؤشرات بعد'];
        }

        $allQuery = InnovationIndex::query()
            ->where('user_id', '!=', $user->id);

        return $this->buildComparison($index, $allQuery, 'الجميع');
    }

    /**
     * Get percentile rank for a user
     */
    public function getPercentileRank(User $user, string $scope = 'all'): int
    {
        $index = $user->latestInnovationIndex;
        if (!$index) {
            return 0;
        }

        $query = InnovationIndex::query();

        if ($scope === 'institution' && $user->school_id) {
            $query->whereHas('user', fn($q) => $q->where('school_id', $user->school_id));
        } elseif ($scope === 'cohort' && $user->year) {
            $query->whereHas('user', fn($q) => $q->where('year', $user->year));
        }

        $totalCount = $query->count();
        $belowCount = (clone $query)->where('overall_score', '<', $index->overall_score)->count();

        return $totalCount > 0 ? round(($belowCount / $totalCount) * 100) : 0;
    }

    /**
     * Build comparison data
     */
    private function buildComparison(InnovationIndex $userIndex, $query, string $scopeLabel): array
    {
        $indexFields = [
            'skills_index', 'innovation_index', 'intelligence_index',
            'creativity_index', 'projects_index', 'leadership_index',
            'ip_index', 'future_readiness_index', 'overall_score',
        ];

        $averages = [];
        foreach ($indexFields as $field) {
            $avg = (clone $query)->avg($field) ?? 0;
            $userValue = (float) $userIndex->$field;

            $averages[$field] = [
                'user_value'   => round($userValue, 2),
                'avg_value'    => round($avg, 2),
                'difference'   => round($userValue - $avg, 2),
                'above_average' => $userValue >= $avg,
            ];
        }

        $totalInScope = (clone $query)->count();
        $rank = (clone $query)->where('overall_score', '>', $userIndex->overall_score)->count() + 1;

        return [
            'scope'        => $scopeLabel,
            'total_users'  => $totalInScope + 1,
            'user_rank'    => $rank,
            'comparisons'  => $averages,
            'percentile'   => $totalInScope > 0 ? round((1 - ($rank - 1) / ($totalInScope + 1)) * 100) : 100,
        ];
    }
}
