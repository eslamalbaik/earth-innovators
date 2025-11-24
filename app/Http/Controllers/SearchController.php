<?php

namespace App\Http\Controllers;

use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SearchController extends Controller
{
    public function __construct(
        private SearchService $searchService
    ) {}

    public function search(Request $request)
    {
        $filters = $request->only([
            'search', 'city', 'subject', 'stage', 'min_price', 'max_price',
            'min_rating', 'min_experience', 'gender', 'neighborhood',
            'sort_by', 'sort_order'
        ]);

        $teachers = $this->searchService->searchTeachers($filters, 12);
        $searchFilters = $this->searchService->getSearchFilters();

        return response()->json([
            'success' => true,
            'teachers' => $teachers,
            'filters' => $searchFilters,
            'search_params' => $filters,
        ]);
    }

    public function suggestions(Request $request)
    {
        $query = trim($request->get('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json(['suggestions' => []]);
        }

        $suggestions = $this->searchService->getSearchSuggestions($query);

        return response()->json([
            'suggestions' => $suggestions,
        ]);
    }

    public function teacherDetails($id)
    {
        try {
            $teacher = $this->searchService->getTeacherDetails((int) $id);

            if (!$teacher) {
                return response()->json([
                    'success' => false,
                    'error' => 'المعلم غير موجود'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'teacher' => $teacher,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching teacher details: ' . $e->getMessage(), [
                'teacher_id' => $id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'error' => 'حدث خطأ أثناء جلب بيانات المعلم'
            ], 500);
        }
    }
}
