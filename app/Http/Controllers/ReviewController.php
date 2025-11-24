<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function __construct(
        private ReviewService $reviewService
    ) {}

    public function index(Request $request)
    {
        $reviews = $this->reviewService->getAllReviews(
            $request->get('teacher_id'),
            $request->has('published') ? (bool) $request->get('published') : null,
            20
        );

        return Inertia::render('Admin/Reviews', [
            'reviews' => $reviews,
        ]);
    }

    public function store(\App\Http\Requests\Review\StoreReviewRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('reviewer_image')) {
            $data['reviewer_image'] = $request->file('reviewer_image');
        }

        $this->reviewService->createReview($data, Auth::id());

        return redirect()->back()
            ->with('success', 'تم إضافة التقييم بنجاح');
    }

    public function publish(Review $review)
    {
        $this->reviewService->togglePublish($review);

        return redirect()->back()->with('success', 'تم تحديث حالة التقييم بنجاح');
    }

    public function reply(Request $request, Review $review)
    {
        $validated = $request->validate([
            'teacher_response' => 'required|string|max:1000',
        ]);

        $this->reviewService->updateReview($review, ['teacher_response' => $validated['teacher_response']]);

        return redirect()->back()->with('success', 'تم إرسال الرد بنجاح');
    }

    public function destroy(Review $review)
    {
        $this->reviewService->deleteReview($review);

        return redirect()->back()->with('success', 'تم حذف التقييم بنجاح');
    }
}
