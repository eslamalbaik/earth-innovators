<?php

namespace App\Services;

use App\Models\Review;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ReviewService extends BaseService
{
    public function getAllReviews(
        ?int $teacherId = null,
        ?bool $published = null,
        int $perPage = 20
    ): LengthAwarePaginator {
        $cacheKey = "reviews_" . md5(json_encode([$teacherId, $published, $perPage]));
        $cacheTag = 'reviews';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId, $published, $perPage) {
            $query = Review::with([
                'teacher:id,name_ar,image,user_id',
                'teacher.user:id,name,image',
                'student:id,name,image',
                'booking:id,subject'
            ])
            ->select('id', 'teacher_id', 'student_id', 'booking_id', 'reviewer_name', 'reviewer_location', 'rating', 'comment', 'teacher_response', 'is_published', 'created_at');

            if ($teacherId) {
                $query->where('teacher_id', $teacherId);
            }

            if ($published !== null) {
                $query->where('is_published', $published);
            }

            return $query->orderBy('created_at', 'desc')
                ->paginate($perPage)
                ->through(function ($review) {
                    $studentImage = null;
                    if ($review->student && $review->student->image) {
                        $studentImage = str_starts_with($review->student->image, 'http')
                            ? $review->student->image
                            : '/storage/' . $review->student->image;
                    }

                    $teacherImage = null;
                    if ($review->teacher) {
                        if ($review->teacher->image) {
                            $teacherImage = str_starts_with($review->teacher->image, 'http')
                                ? $review->teacher->image
                                : '/storage/' . $review->teacher->image;
                        } elseif ($review->teacher->user && $review->teacher->user->image) {
                            $teacherImage = str_starts_with($review->teacher->user->image, 'http')
                                ? $review->teacher->user->image
                                : '/storage/' . $review->teacher->user->image;
                        }
                    }

                    return [
                        'id' => $review->id,
                        'teacher' => [
                            'id' => $review->teacher->id ?? null,
                            'name_ar' => $review->teacher->name_ar ?? $review->teacher->user->name ?? 'N/A',
                            'image' => $teacherImage,
                        ],
                        'student' => $review->student ? [
                            'id' => $review->student->id,
                            'name' => $review->student->name,
                            'image' => $studentImage,
                        ] : null,
                        'booking' => $review->booking ? [
                            'id' => $review->booking->id,
                            'subject' => $review->booking->subject,
                        ] : null,
                        'reviewer_name' => $review->reviewer_name,
                        'reviewer_location' => $review->reviewer_location,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'teacher_response' => $review->teacher_response,
                        'is_published' => $review->is_published,
                        'created_at' => $review->created_at->format('Y-m-d H:i:s'),
                    ];
                });
        }, 300); // Cache for 5 minutes
    }

    public function getTeacherReviews(int $teacherId, bool $publishedOnly = true, int $limit = 5): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = "teacher_reviews_{$teacherId}_{$publishedOnly}_{$limit}";
        $cacheTag = "teacher_reviews_{$teacherId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId, $publishedOnly, $limit) {
            $query = Review::where('teacher_id', $teacherId)
                ->with('student:id,name,image,city')
                ->select('id', 'student_id', 'rating', 'comment', 'reviewer_name', 'reviewer_location', 'created_at');

            if ($publishedOnly) {
                $query->where('is_published', true);
            }

            return $query->latest()
                ->limit($limit)
                ->get()
                ->map(function ($review) {
                    $reviewerName = $review->student->name ?? $review->reviewer_name ?? 'مجهول';
                    $reviewerLocation = $review->student->city ?? $review->reviewer_location ?? '';

                    $reviewerImage = null;
                    if ($review->student && $review->student->image) {
                        $reviewerImage = str_starts_with($review->student->image, 'http')
                            ? $review->student->image
                            : asset('storage/' . $review->student->image);
                    }

                    return [
                        'id' => $review->id,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'reviewerName' => $reviewerName,
                        'reviewerLocation' => $reviewerLocation,
                        'reviewerImage' => $reviewerImage,
                    ];
                });
        }, 300); // Cache for 5 minutes
    }

    public function createReview(array $data, ?int $userId = null): Review
    {
        if ($userId) {
            $data['student_id'] = $userId;
            if (empty($data['reviewer_name'])) {
                $user = \App\Models\User::find($userId);
                $data['reviewer_name'] = $user->name ?? 'مجهول';
            }
        }

        // Handle image upload
        if (isset($data['reviewer_image']) && is_file($data['reviewer_image'])) {
            $data['reviewer_image'] = $data['reviewer_image']->store('reviews', 'public');
        }

        $review = Review::create($data);

        // Update teacher rating (async)
        $this->updateTeacherRating($review->teacher_id);

        // Clear cache
        $this->forgetCacheTags(['reviews', "teacher_reviews_{$review->teacher_id}"]);

        return $review;
    }

    public function updateReview(Review $review, array $data): Review
    {
        // Handle image upload
        if (isset($data['reviewer_image']) && is_file($data['reviewer_image'])) {
            // Delete old image
            if ($review->reviewer_image) {
                \Storage::disk('public')->delete($review->reviewer_image);
            }
            $data['reviewer_image'] = $data['reviewer_image']->store('reviews', 'public');
        }

        // Check if teacher_response is being added or updated
        $isNewResponse = isset($data['teacher_response']) && 
                        !empty($data['teacher_response']) && 
                        (empty($review->teacher_response) || $review->teacher_response !== $data['teacher_response']);

        $review->update($data);
        $review->refresh();

        // Send notification to student if teacher responded
        if ($isNewResponse && $review->student_id) {
            // Load teacher with user relationship
            $review->load('teacher.user');
            $teacher = $review->teacher;
            
            if ($teacher) {
                $student = \App\Models\User::find($review->student_id);
                if ($student) {
                    $student->notify(new \App\Notifications\TeacherReviewResponseNotification($review, $teacher));
                }
            }
        }

        // Update teacher rating (async)
        $this->updateTeacherRating($review->teacher_id);

        // Clear cache
        $this->forgetCacheTags(['reviews', "teacher_reviews_{$review->teacher_id}"]);

        return $review->fresh();
    }

    public function togglePublish(Review $review): Review
    {
        $review->update([
            'is_published' => !$review->is_published,
        ]);

        // Update teacher rating (async)
        $this->updateTeacherRating($review->teacher_id);

        // Clear cache
        $this->forgetCacheTags(['reviews', "teacher_reviews_{$review->teacher_id}"]);

        return $review->fresh();
    }

    public function deleteReview(Review $review): bool
    {
        $teacherId = $review->teacher_id;

        // Delete image if exists
        if ($review->reviewer_image) {
            \Storage::disk('public')->delete($review->reviewer_image);
        }

        $deleted = $review->delete();

        // Update teacher rating (async)
        $this->updateTeacherRating($teacherId);

        // Clear cache
        $this->forgetCacheTags(['reviews', "teacher_reviews_{$teacherId}"]);

        return $deleted;
    }

    public function getTeacherReviewStats(int $teacherId): array
    {
        $cacheKey = "teacher_review_stats_{$teacherId}";
        $cacheTag = "teacher_reviews_{$teacherId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId) {
            $teacher = \App\Models\Teacher::find($teacherId);
            
            return [
                'total' => Review::where('teacher_id', $teacherId)->count(),
                'published' => Review::where('teacher_id', $teacherId)->where('is_published', true)->count(),
                'pending' => Review::where('teacher_id', $teacherId)->where('is_published', false)->count(),
                'average_rating' => (float) Review::where('teacher_id', $teacherId)->avg('rating') ?: 0,
                'teacher_rating' => (float) ($teacher->rating ?? 0),
                'reviews_count' => $teacher->reviews_count ?? 0,
            ];
        }, 300); // Cache for 5 minutes
    }

    private function updateTeacherRating(int $teacherId): void
    {
        // Queue this operation for async processing
        \App\Jobs\UpdateTeacherRating::dispatch($teacherId);
    }
}

