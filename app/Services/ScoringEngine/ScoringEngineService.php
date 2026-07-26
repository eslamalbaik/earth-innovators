<?php

namespace App\Services\ScoringEngine;

use App\Models\User;
use App\Models\InnovationIndex;
use Illuminate\Support\Facades\DB;

/**
 * المحرك الرياضي الثابت لحساب المؤشرات
 * Deterministic Mathematical Scoring Engine
 *
 * This engine does NOT use AI. It relies on fixed formulas and weights.
 */
class ScoringEngineService
{
    public function __construct(
        private SkillsIndexCalculator $skillsCalculator,
        private InnovationIndexCalculator $innovationCalculator,
        private IntelligenceIndexCalculator $intelligenceCalculator,
        private CreativityIndexCalculator $creativityCalculator,
        private ProjectsIndexCalculator $projectsCalculator,
        private LeadershipIndexCalculator $leadershipCalculator,
        private IPIndexCalculator $ipCalculator,
        private FutureReadinessCalculator $futureReadinessCalculator,
    ) {}

    /**
     * Calculate all 8 indexes for a user and save results
     */
    public function calculateAllIndexes(User $user): InnovationIndex
    {
        $user->load([
            'achievements.attachments',
            'userSkills',
            'qualifications',
            'projects',
            'certificates',
            'badges',
            'challenges',
            'challengeParticipations',
        ]);

        $metadata = [];

        // Calculate each index
        $indexes = [
            'skills'           => $this->skillsCalculator->calculate($user, $metadata),
            'innovation'       => $this->innovationCalculator->calculate($user, $metadata),
            'intelligence'     => $this->intelligenceCalculator->calculate($user, $metadata),
            'creativity'       => $this->creativityCalculator->calculate($user, $metadata),
            'projects'         => $this->projectsCalculator->calculate($user, $metadata),
            'leadership'       => $this->leadershipCalculator->calculate($user, $metadata),
            'ip'               => $this->ipCalculator->calculate($user, $metadata),
            'future_readiness' => $this->futureReadinessCalculator->calculate($user, $metadata),
        ];

        // Calculate overall score
        $overallScore = $this->calculateOverallScore($indexes);
        $classification = InnovationIndex::classifyScore($overallScore);

        // Save to database
        return DB::transaction(function () use ($user, $indexes, $overallScore, $classification, $metadata) {
            // Track history for changed indexes
            $existingIndex = $user->latestInnovationIndex;

            $innovationIndex = InnovationIndex::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'skills_index'           => $indexes['skills'],
                    'innovation_index'       => $indexes['innovation'],
                    'intelligence_index'     => $indexes['intelligence'],
                    'creativity_index'       => $indexes['creativity'],
                    'projects_index'         => $indexes['projects'],
                    'leadership_index'       => $indexes['leadership'],
                    'ip_index'               => $indexes['ip'],
                    'future_readiness_index' => $indexes['future_readiness'],
                    'overall_score'          => $overallScore,
                    'classification'         => $classification,
                    'calculation_metadata'   => $metadata,
                    'calculated_at'          => now(),
                ]
            );

            // Record history
            if ($existingIndex) {
                $this->recordHistory($user, $existingIndex, $innovationIndex);
            }

            // Update user's classification
            $user->update([
                'innovator_classification'   => $classification,
                'overall_innovation_score'   => $overallScore,
            ]);

            return $innovationIndex;
        });
    }

    /**
     * Calculate weighted overall score using configurable weights
     */
    public function calculateOverallScore(array $indexes): float
    {
        $weights = DB::table('index_weights')
            ->where('is_active', true)
            ->pluck('weight', 'index_name')
            ->toArray();

        // Default weights if none configured
        if (empty($weights)) {
            $weights = [
                'skills'           => 0.15,
                'innovation'       => 0.15,
                'intelligence'     => 0.12,
                'creativity'       => 0.13,
                'projects'         => 0.15,
                'leadership'       => 0.12,
                'ip'               => 0.08,
                'future_readiness' => 0.10,
            ];
        }

        $score = 0;
        $totalWeight = 0;

        foreach ($indexes as $name => $value) {
            $weight = $weights[$name] ?? 0;
            $score += $value * $weight;
            $totalWeight += $weight;
        }

        // Normalize if weights don't sum to 1
        if ($totalWeight > 0 && $totalWeight != 1) {
            $score = $score / $totalWeight;
        }

        return round(min(100, max(0, $score)), 2);
    }

    /**
     * Record history entries for changed indexes
     */
    private function recordHistory(User $user, InnovationIndex $old, InnovationIndex $new): void
    {
        $indexFields = [
            'skills'           => 'skills_index',
            'innovation'       => 'innovation_index',
            'intelligence'     => 'intelligence_index',
            'creativity'       => 'creativity_index',
            'projects'         => 'projects_index',
            'leadership'       => 'leadership_index',
            'ip'               => 'ip_index',
            'future_readiness' => 'future_readiness_index',
            'overall'          => 'overall_score',
        ];

        $records = [];

        foreach ($indexFields as $name => $field) {
            $oldVal = (float) $old->$field;
            $newVal = (float) $new->$field;

            if (abs($oldVal - $newVal) > 0.01) {
                $records[] = [
                    'user_id'      => $user->id,
                    'index_name'   => $name,
                    'old_value'    => $oldVal,
                    'new_value'    => $newVal,
                    'trigger_type' => 'system_recalc',
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ];
            }
        }

        if (!empty($records)) {
            DB::table('index_history')->insert($records);
        }
    }

    /**
     * Recalculate indexes for a specific user (public method)
     */
    public function recalculateForUser(User $user): InnovationIndex
    {
        return $this->calculateAllIndexes($user);
    }

    /**
     * Get index history for timeline charts
     */
    public function getHistory(User $user, ?string $indexName = null, int $limit = 50): array
    {
        $query = DB::table('index_history')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        if ($indexName) {
            $query->where('index_name', $indexName);
        }

        return $query->get()->toArray();
    }
}
