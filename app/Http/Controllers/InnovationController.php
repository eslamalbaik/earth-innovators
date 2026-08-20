<?php

namespace App\Http\Controllers;

use App\Models\InnovationIndex;
use App\Services\ScoringEngine\ScoringEngineService;
use App\Services\AIEngine\RecommendationEngine;
use App\Services\AIEngine\ReportGenerator;
use App\Services\AIEngine\SmartContentGenerator;
use App\Services\AIEngine\SmartSearchService;
use App\Services\BenchmarkingService;
use App\Jobs\RecalculateIndexesJob;
use App\Jobs\GenerateAIReportJob;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InnovationController extends Controller
{
    public function __construct(
        private ScoringEngineService $scoringEngine,
    ) {}

    /**
     * Show all indexes detail
     */
    public function indexes(Request $request): Response
    {
        $user = $request->user();
        $index = $user->latestInnovationIndex;

        if ($index) {
            $index->setAttribute('classification_details', $index->getClassificationDetails());
        }

        return Inertia::render('Innovator/Indexes', [
            'index'      => $index,
            'indexNames' => InnovationIndex::INDEX_NAMES,
            'metadata'   => $index?->calculation_metadata ?? [],
        ]);
    }

    /**
     * Recalculate indexes
     */
    public function recalculate(Request $request)
    {
        RecalculateIndexesJob::dispatch($request->user());

        return back()->with('success', __('messages.msg_095'));
    }

    /**
     * FR-007: Index history for timeline
     */
    public function history(Request $request): Response
    {
        $user = $request->user();
        $indexName = $request->get('index');
        $history = $this->scoringEngine->getHistory($user, $indexName, 100);

        return Inertia::render('Innovator/History', [
            'history'    => $history,
            'indexNames' => InnovationIndex::INDEX_NAMES,
            'filter'     => $indexName,
        ]);
    }

    /**
     * AI-015: Recommendations
     */
    public function recommendations(Request $request, RecommendationEngine $engine): Response
    {
        $recommendations = $engine->generateRecommendations($request->user());

        return Inertia::render('Innovator/Recommendations', [
            'recommendations' => $recommendations,
        ]);
    }

    /**
     * AI-024: Benchmarking
     */
    public function benchmarking(Request $request, BenchmarkingService $service): Response
    {
        $user = $request->user();
        $comparison = $service->compareWithCohort($user);

        return Inertia::render('Innovator/Benchmarking', [
            'comparison' => $comparison,
            'indexNames' => InnovationIndex::INDEX_NAMES,
        ]);
    }

    /**
     * AI-021: Generate report
     */
    public function generateReport(Request $request)
    {
        $type = $request->get('type', 'student');
        GenerateAIReportJob::dispatch($request->user(), $type);

        return back()->with('success', __('messages.msg_096'));
    }

    /**
     * AI-023: Smart Search
     */
    public function smartSearch(Request $request, SmartSearchService $searchService)
    {
        $request->validate(['query' => 'nullable|string|max:500']);

        $query = trim((string) $request->get('query', ''));
        $results = $query !== '' ? $searchService->search($query) : null;

        if ($request->wantsJson()) {
            return response()->json($results ?? ['results' => []]);
        }

        return Inertia::render('Innovator/SmartSearch', [
            'searchResults' => $results,
            'query'         => $query,
        ]);
    }

    /**
     * Smart Content Generation
     */
    public function generateContent(Request $request, SmartContentGenerator $generator)
    {
        $request->validate([
            'type'  => 'required|in:article,project_description,portfolio,cv,recommendation_letter',
            'topic' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $type = $request->get('type');
        $topic = $request->get('topic', '');

        $content = match ($type) {
            'article'               => $generator->generateArticle($topic, $user),
            'project_description'   => $generator->generateProjectDescription($topic, '', $user),
            'portfolio'             => $generator->generatePortfolio($user),
            'cv'                    => $generator->generateCV($user),
            'recommendation_letter' => $generator->generateRecommendationLetter($user, $topic),
        };

        return response()->json(['content' => $content]);
    }
}
