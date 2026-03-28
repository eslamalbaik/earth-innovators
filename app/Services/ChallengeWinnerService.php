<?php

namespace App\Services;

use App\Models\ChallengeParticipation;
use App\Models\ChallengeSubmission;
use Illuminate\Database\Eloquent\Builder;

class ChallengeWinnerService
{
    /**
     * فائزون سابقون (بدون تقييد مدرسة) — نفس سلوك صفحة التحديات العامة.
     */
    public function getPreviousWinnersUnscoped(int $limit = 3): array
    {
        $winners = $this->submissionWinnerRows(
            ChallengeSubmission::query()
                ->where('status', 'approved')
                ->where('rating', '>=', 4),
            $limit
        );

        if (count($winners) < $limit) {
            $participationWinners = $this->participationWinnerRows(
                ChallengeParticipation::query()
                    ->where('status', 'completed')
                    ->where('points_earned', '>', 0),
                $limit - count($winners)
            );
            $winners = array_merge($winners, $participationWinners);
        }

        return array_slice($winners, 0, $limit);
    }

    /**
     * جميع الفائزين (بدون تقييد مدرسة).
     */
    public function getAllWinnersUnscoped(): array
    {
        $winners = $this->submissionWinnerRows(
            ChallengeSubmission::query()
                ->where('status', 'approved')
                ->where('rating', '>=', 4)
        );

        $participationWinners = $this->participationWinnerRows(
            ChallengeParticipation::query()
                ->where('status', 'completed')
                ->where('points_earned', '>', 0)
        );

        $allWinners = array_merge($winners, $participationWinners);

        usort($allWinners, function ($a, $b) {
            if ($b['points'] !== $a['points']) {
                return $b['points'] <=> $a['points'];
            }

            return $b['rating'] <=> $a['rating'];
        });

        return $allWinners;
    }

    /**
     * فائزون سابقون ضمن تحديات عامة أو خاصة بمدرسة الطالب.
     */
    public function getPreviousWinnersForSchool(int $schoolId, int $limit = 3): array
    {
        $winners = $this->submissionWinnerRows(
            $this->scopedSubmissionsQuery($schoolId)
                ->where('status', 'approved')
                ->where('rating', '>=', 4),
            $limit
        );

        if (count($winners) < $limit) {
            $participationWinners = $this->participationWinnerRows(
                $this->scopedParticipationsQuery($schoolId)
                    ->where('status', 'completed')
                    ->where('points_earned', '>', 0),
                $limit - count($winners)
            );
            $winners = array_merge($winners, $participationWinners);
        }

        return array_slice($winners, 0, $limit);
    }

    /**
     * جميع الفائزين ضمن نطاق مدرسة الطالب.
     */
    public function getAllWinnersForSchool(int $schoolId): array
    {
        $winners = $this->submissionWinnerRows(
            $this->scopedSubmissionsQuery($schoolId)
                ->where('status', 'approved')
                ->where('rating', '>=', 4)
        );

        $participationWinners = $this->participationWinnerRows(
            $this->scopedParticipationsQuery($schoolId)
                ->where('status', 'completed')
                ->where('points_earned', '>', 0)
        );

        $allWinners = array_merge($winners, $participationWinners);

        usort($allWinners, function ($a, $b) {
            if ($b['points'] !== $a['points']) {
                return $b['points'] <=> $a['points'];
            }

            return $b['rating'] <=> $a['rating'];
        });

        return $allWinners;
    }

    private function scopedSubmissionsQuery(int $schoolId): Builder
    {
        return ChallengeSubmission::query()->whereHas('challenge', function ($q) use ($schoolId) {
            $q->where(function ($q2) use ($schoolId) {
                $q2->whereNull('school_id')->orWhere('school_id', $schoolId);
            });
        });
    }

    private function scopedParticipationsQuery(int $schoolId): Builder
    {
        return ChallengeParticipation::query()->whereHas('challenge', function ($q) use ($schoolId) {
            $q->where(function ($q2) use ($schoolId) {
                $q2->whereNull('school_id')->orWhere('school_id', $schoolId);
            });
        });
    }

    private function submissionWinnerRows(Builder $query, ?int $limit = null): array
    {
        $query = $query
            ->with(['student:id,name,image', 'challenge:id,title'])
            ->orderBy('rating', 'desc')
            ->orderBy('points_earned', 'desc')
            ->orderBy('reviewed_at', 'desc');

        if ($limit !== null) {
            $query->limit($limit);
        }

        return $query->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'name' => $submission->student->name ?? 'مشارك',
                    'project' => $submission->challenge->title ?? 'تحدي',
                    'date' => $submission->reviewed_at?->format('F Y') ?? $submission->created_at->format('F Y'),
                    'rating' => $submission->rating ?? 0,
                    'points' => $submission->points_earned ?? 0,
                    'avatar' => $submission->student->image ?? null,
                ];
            })
            ->toArray();
    }

    private function participationWinnerRows(Builder $query, ?int $limit = null): array
    {
        $query = $query
            ->with(['user:id,name,image', 'challenge:id,title'])
            ->orderBy('points_earned', 'desc')
            ->orderBy('completed_at', 'desc');

        if ($limit !== null) {
            $query->limit($limit);
        }

        return $query->get()
            ->map(function ($participation) {
                return [
                    'id' => $participation->id,
                    'name' => $participation->user->name ?? 'مشارك',
                    'project' => $participation->challenge->title ?? 'تحدي',
                    'date' => $participation->completed_at?->format('F Y') ?? $participation->created_at->format('F Y'),
                    'rating' => 0,
                    'points' => $participation->points_earned ?? 0,
                    'avatar' => $participation->user->image ?? null,
                ];
            })
            ->toArray();
    }
}
