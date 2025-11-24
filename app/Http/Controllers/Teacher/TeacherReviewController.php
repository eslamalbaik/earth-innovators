<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Teacher;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeacherReviewController extends Controller
{
    public function __construct(
        private ReviewService $reviewService
    ) {}

    public function index()
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard')->with('error', 'لم يتم العثور على بيانات المعلم');
        }

        $reviews = Review::with(['student:id,name,image', 'booking:id,subject'])
            ->where('teacher_id', $teacher->id)
            ->select('id', 'teacher_id', 'student_id', 'booking_id', 'reviewer_name', 'rating', 'comment', 'teacher_response', 'is_published', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($review) {
                $studentImage = null;
                if ($review->student && $review->student->image) {
                    $studentImage = str_starts_with($review->student->image, 'http')
                        ? $review->student->image
                        : '/storage/' . $review->student->image;
                }

                return [
                    'id' => $review->id,
                    'student_name' => $review->student->name ?? $review->reviewer_name ?? 'مجهول',
                    'student_image' => $studentImage,
                    'booking_id' => $review->booking_id,
                    'subject' => $review->booking->subject ?? null,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'teacher_response' => $review->teacher_response,
                    'is_published' => $review->is_published,
                    'created_at' => $review->created_at->format('Y-m-d'),
                ];
            });

        $stats = $this->reviewService->getTeacherReviewStats($teacher->id);

        return Inertia::render('Teacher/Reviews', [
            'reviews' => $reviews,
            'stats' => $stats,
            'teacher' => [
                'name' => $teacher->name_ar,
            ],
        ]);
    }

    public function reply(Request $request, Review $review)
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        if (!$teacher || $review->teacher_id !== $teacher->id) {
            return back()->with('error', 'غير مصرح لك بالوصول إلى هذا التقييم');
        }

        $request->validate([
            'teacher_response' => 'required|string|max:1000',
        ]);

        $this->reviewService->updateReview($review, [
            'teacher_response' => $request->teacher_response
        ]);

        return redirect()->back()->with('success', 'تم إرسال الرد بنجاح');
    }
}
