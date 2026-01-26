<?php

namespace App\Services;

use App\Models\User;
use App\Models\ProjectSubmission;
use App\Models\ChallengeEvaluation;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class StudentEvaluationService extends BaseService
{
    /**
     * Get evaluation category based on score
     * 
     * @param float $score Score from 0-100
     * @return array Category information
     */
    public function getCategoryByScore(float $score): array
    {
        if ($score >= 98 && $score <= 100) {
            return $this->getOutstandingCategory();
        } elseif ($score >= 90 && $score <= 97) {
            return $this->getExcellentCategory();
        } elseif ($score >= 70 && $score <= 89) {
            return $this->getAverageCategory();
        } else {
            return $this->getFollowUpCategory();
        }
    }

    /**
     * Get outstanding category (100-98)
     */
    private function getOutstandingCategory(): array
    {
        return [
            'id' => 'outstanding',
            'name' => 'المتفوقون',
            'name_en' => 'Outstanding',
            'range' => '100-98',
            'min_score' => 98,
            'max_score' => 100,
            'color' => 'green',
            'icon' => '🟢',
            'level' => 'إتقان تام + ابتكار',
            'skill' => 'حل مشكلات معقدة، ربط معرفي شامل',
            'action' => 'تحفيز قيادي (مساعد معلم)',
            'action_en' => 'Leadership motivation (teacher assistant)',
        ];
    }

    /**
     * Get excellent category (97-90)
     */
    private function getExcellentCategory(): array
    {
        return [
            'id' => 'excellent',
            'name' => 'المتميزون',
            'name_en' => 'Excellent',
            'range' => '97-90',
            'min_score' => 90,
            'max_score' => 97,
            'color' => 'blue',
            'icon' => '🔵',
            'level' => 'استيعاب مرتفع',
            'skill' => 'تنفيذ دقيق للمهام، أخطاء هامشية',
            'action' => 'تغذية راجعة لتجويد التفاصيل',
            'action_en' => 'Feedback for quality improvement',
        ];
    }

    /**
     * Get average category (89-70)
     */
    private function getAverageCategory(): array
    {
        return [
            'id' => 'average',
            'name' => 'المتوسطون',
            'name_en' => 'Average',
            'range' => '89-70',
            'min_score' => 70,
            'max_score' => 89,
            'color' => 'yellow',
            'icon' => '🟡',
            'level' => 'تطبيق أساسي',
            'skill' => 'فهم المفاهيم الكبرى، صعوبة في التحليل',
            'action' => 'تدريبات لتعزيز مهارات الاستنتاج',
            'action_en' => 'Exercises to enhance inference skills',
        ];
    }

    /**
     * Get follow-up category (below 70)
     */
    private function getFollowUpCategory(): array
    {
        return [
            'id' => 'follow_up',
            'name' => 'المتابعة',
            'name_en' => 'Follow-up',
            'range' => 'تحت 70',
            'min_score' => 0,
            'max_score' => 69.99,
            'color' => 'red',
            'icon' => '🔴',
            'level' => 'إلمام محدود',
            'skill' => 'ضعف في ربط المعلومات والمهام المركبة',
            'action' => 'خطة علاجية (تبسيط المهارة + إعادة شرح)',
            'action_en' => 'Treatment plan (simplify skill + re-explain)',
        ];
    }

    /**
     * Get all categories
     */
    public function getAllCategories(): array
    {
        return [
            $this->getOutstandingCategory(),
            $this->getExcellentCategory(),
            $this->getAverageCategory(),
            $this->getFollowUpCategory(),
        ];
    }

    /**
     * Get students grouped by evaluation category based on project submissions
     * 
     * @param int|null $schoolId Filter by school
     * @param int|null $projectId Filter by specific project
     * @return array Students grouped by category
     */
    public function getStudentsByCategory(?int $schoolId = null, ?int $projectId = null): array
    {
        $query = ProjectSubmission::query()
            ->where('status', 'approved')
            ->whereNotNull('rating')
            ->with(['student:id,name,email,school_id', 'project:id,title']);

        if ($schoolId) {
            $query->whereHas('student', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            });
        }

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        // Get average score per student
        $studentScores = $query
            ->select('student_id', DB::raw('AVG(rating * 20) as avg_score')) // Convert 5-point rating to 100-point scale
            ->groupBy('student_id')
            ->get()
            ->map(function ($item) {
                return [
                    'student_id' => $item->student_id,
                    'avg_score' => (float) $item->avg_score,
                ];
            });

        // Group students by category
        $grouped = [
            'outstanding' => [],
            'excellent' => [],
            'average' => [],
            'follow_up' => [],
        ];

        foreach ($studentScores as $studentScore) {
            $category = $this->getCategoryByScore($studentScore['avg_score']);
            $student = User::find($studentScore['student_id']);
            
            if ($student) {
                $grouped[$category['id']][] = [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'score' => round($studentScore['avg_score'], 2),
                    'category' => $category,
                ];
            }
        }

        // Sort each category by score (descending)
        foreach ($grouped as $key => $students) {
            usort($grouped[$key], function ($a, $b) {
                return $b['score'] <=> $a['score'];
            });
        }

        return $grouped;
    }

    /**
     * Get students grouped by evaluation category based on challenge evaluations
     * 
     * @param int|null $schoolId Filter by school
     * @param int|null $challengeId Filter by specific challenge
     * @return array Students grouped by category
     */
    public function getStudentsByCategoryFromChallenges(?int $schoolId = null, ?int $challengeId = null): array
    {
        $query = DB::table('challenge_evaluations')
            ->join('challenge_submissions', 'challenge_evaluations.submission_id', '=', 'challenge_submissions.id')
            ->join('users', 'challenge_submissions.student_id', '=', 'users.id')
            ->whereNotNull('challenge_evaluations.score')
            ->select('users.id as student_id', DB::raw('AVG(challenge_evaluations.score) as avg_score'))
            ->groupBy('users.id');

        if ($schoolId) {
            $query->where('users.school_id', $schoolId);
        }

        if ($challengeId) {
            $query->where('challenge_submissions.challenge_id', $challengeId);
        }

        $studentScores = $query->get();

        // Group students by category
        $grouped = [
            'outstanding' => [],
            'excellent' => [],
            'average' => [],
            'follow_up' => [],
        ];

        foreach ($studentScores as $studentScore) {
            $category = $this->getCategoryByScore((float) $studentScore->avg_score);
            $student = User::find($studentScore->student_id);
            
            if ($student) {
                $grouped[$category['id']][] = [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'score' => round((float) $studentScore->avg_score, 2),
                    'category' => $category,
                ];
            }
        }

        // Sort each category by score (descending)
        foreach ($grouped as $key => $students) {
            usort($grouped[$key], function ($a, $b) {
                return $b['score'] <=> $a['score'];
            });
        }

        return $grouped;
    }

    /**
     * Get evaluation report for students
     * 
     * @param int|null $schoolId Filter by school
     * @param string $source 'projects' or 'challenges'
     * @return array Report data
     */
    public function getEvaluationReport(?int $schoolId = null, string $source = 'projects'): array
    {
        if ($source === 'challenges') {
            $grouped = $this->getStudentsByCategoryFromChallenges($schoolId);
        } else {
            $grouped = $this->getStudentsByCategory($schoolId);
        }

        $categories = $this->getAllCategories();
        
        $report = [];
        foreach ($categories as $category) {
            $report[] = [
                'category' => $category,
                'students' => $grouped[$category['id']] ?? [],
                'count' => count($grouped[$category['id']] ?? []),
            ];
        }

        return [
            'categories' => $report,
            'total_students' => array_sum(array_column($report, 'count')),
            'source' => $source,
        ];
    }

    /**
     * Get student evaluation summary
     * 
     * @param int $studentId
     * @param string $source 'projects' or 'challenges'
     * @return array Student evaluation summary
     */
    public function getStudentEvaluationSummary(int $studentId, string $source = 'projects'): array
    {
        if ($source === 'challenges') {
            $avgScore = ChallengeEvaluation::whereHas('submission', function ($q) use ($studentId) {
                $q->where('student_id', $studentId);
            })
            ->whereNotNull('score')
            ->avg('score');
        } else {
            $avgScore = ProjectSubmission::where('student_id', $studentId)
                ->where('status', 'approved')
                ->whereNotNull('rating')
                ->avg(DB::raw('rating * 20')); // Convert 5-point rating to 100-point scale
        }

        if ($avgScore === null) {
            return [
                'score' => null,
                'category' => null,
                'has_evaluations' => false,
            ];
        }

        $category = $this->getCategoryByScore((float) $avgScore);

        return [
            'score' => round((float) $avgScore, 2),
            'category' => $category,
            'has_evaluations' => true,
        ];
    }
}

