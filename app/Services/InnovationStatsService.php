<?php

namespace App\Services;

use App\Models\InnovationIndex;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * إحصائيات الابتكار للمشرفين (المعلم/المدرسة/الأدمن) —
 * منطق مشترك بين لوحة المعلم الأصلية وصفحة متابعة الابتكار
 */
class InnovationStatsService
{
    /**
     * نطاق الطلاب المسموح للمشرف برؤيتهم
     */
    public function studentsScopeFor(User $coach)
    {
        if ($coach->isTeacher()) {
            return $coach->assignedStudents();
        }

        if ($coach->isSchool()) {
            return $coach->students();
        }

        return User::where('role', 'student');
    }

    /**
     * طلاب المشرف مع أحدث مؤشراتهم (مرتبين تنازلياً حسب الدرجة)
     */
    public function studentsWithIndexes(User $coach): Collection
    {
        return $this->studentsScopeFor($coach)
            ->with('latestInnovationIndex')
            ->get()
            ->map(function (User $student) {
                $index = $student->latestInnovationIndex;

                return [
                    'id'             => $student->id,
                    'name'           => $student->name,
                    'email'          => $student->email,
                    'image'          => $student->image,
                    'institution'    => $student->institution,
                    'classification' => $index?->classification ?? 'developing',
                    'classification_details' => $index?->getClassificationDetails()
                        ?? InnovationIndex::CLASSIFICATIONS['developing'],
                    'overall_score'  => (float) ($index?->overall_score ?? 0),
                    'indexes'        => $index?->toIndexArray() ?? [],
                    'strongest'      => $index?->getStrongestIndex(),
                    'weakest'        => $index?->getWeakestIndex(),
                ];
            })
            ->sortByDesc('overall_score')
            ->values();
    }

    /**
     * إحصائيات مجمعة (متوسط، توزيع التصنيفات، المتميزون، المحتاجون للاهتمام)
     */
    public function statistics(Collection $students): array
    {
        if ($students->isEmpty()) {
            return [
                'avg_score'        => 0,
                'classifications'  => [],
                'top_students'     => [],
                'needs_attention'  => [],
            ];
        }

        return [
            'avg_score' => round($students->avg('overall_score'), 2),
            'classifications' => $students->groupBy('classification')
                ->map->count()
                ->toArray(),
            'top_students' => $students->take(5)->values()->toArray(),
            'needs_attention' => $students->filter(fn($s) => $s['overall_score'] < 40)
                ->values()
                ->take(5)
                ->toArray(),
        ];
    }
}
