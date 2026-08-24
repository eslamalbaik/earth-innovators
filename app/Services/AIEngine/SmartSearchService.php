<?php

namespace App\Services\AIEngine;

use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * AI-023: Smart Search Service
 *
 * Allows natural language search like "طالب لديه قيادة عالية ويجيد Python"
 */
class SmartSearchService
{
    public function __construct(
        private GeminiClient $client,
    ) {}

    /**
     * Perform a smart search based on natural language query
     */
    public function search(string $query, int $limit = 20): array
    {
        // Step 1: Parse the query with AI to extract search criteria
        $criteria = $this->parseQuery($query);

        if (!$criteria) {
            return ['results' => [], 'message' => 'تعذر تحليل الاستعلام'];
        }

        // Step 2: Build database query based on extracted criteria
        $results = $this->executeSearch($criteria, $limit);

        return [
            'query'    => $query,
            'criteria' => $criteria,
            'results'  => $results,
            'total'    => count($results),
        ];
    }

    /**
     * Parse natural language query into structured criteria
     */
    private function parseQuery(string $query): ?array
    {
        $result = $this->client->chatWithJson([
            GeminiClient::systemMessage(
                'أنت محلل استعلامات بحث. قم بتحليل استعلام البحث واستخراج المعايير. '
                . 'أجب بصيغة JSON مع الحقول: '
                . 'skills (array of strings), '
                . 'min_scores (object with index names as keys and min scores as values), '
                . 'classification (string or null), '
                . 'role (student/teacher/school or null), '
                . 'keywords (array of strings)'
            ),
            GeminiClient::userMessage("استعلام البحث: {$query}"),
        ], temperature: 0.2, maxTokens: 500);

        return $result;
    }

    /**
     * Execute database search based on parsed criteria
     */
    private function executeSearch(array $criteria, int $limit): array
    {
        $query = User::query()
            ->with(['latestInnovationIndex', 'userSkills']);

        // Filter by role
        if (!empty($criteria['role'])) {
            $query->where('role', $criteria['role']);
        }

        // Filter by classification
        if (!empty($criteria['classification'])) {
            $query->where('innovator_classification', $criteria['classification']);
        }

        // Filter by skills
        if (!empty($criteria['skills'])) {
            $query->whereHas('userSkills', function ($q) use ($criteria) {
                $q->whereIn('name', $criteria['skills']);
            });
        }

        // Filter by minimum index scores
        if (!empty($criteria['min_scores'])) {
            $query->whereHas('latestInnovationIndex', function ($q) use ($criteria) {
                foreach ($criteria['min_scores'] as $index => $minScore) {
                    $column = $index . '_index';
                    if (in_array($column, [
                        'skills_index', 'innovation_index', 'intelligence_index',
                        'creativity_index', 'projects_index', 'leadership_index',
                        'ip_index', 'future_readiness_index',
                    ])) {
                        $q->where($column, '>=', $minScore);
                    }
                }
            });
        }

        // Keyword search in name, bio, institution
        if (!empty($criteria['keywords'])) {
            $query->where(function ($q) use ($criteria) {
                foreach ($criteria['keywords'] as $keyword) {
                    $q->orWhere('name', 'LIKE', "%{$keyword}%")
                      ->orWhere('bio', 'LIKE', "%{$keyword}%")
                      ->orWhere('institution', 'LIKE', "%{$keyword}%");
                }
            });
        }

        return $query->limit($limit)
            ->get()
            ->map(function (User $user) {
                $index = $user->latestInnovationIndex;
                return [
                    'id'             => $user->id,
                    'name'           => $user->name,
                    'role'           => $user->role,
                    'institution'    => $user->institution,
                    'classification' => $user->innovator_classification,
                    'overall_score'  => $index?->overall_score ?? 0,
                    'skills'         => $user->userSkills->pluck('name')->toArray(),
                    'indexes'        => $index?->toIndexArray() ?? [],
                ];
            })
            ->toArray();
    }
}
