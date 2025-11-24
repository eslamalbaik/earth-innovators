<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Booking;
use App\Services\ReviewService;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class StudentReviewController extends Controller
{
    public function __construct(
        private ReviewService $reviewService,
        private BookingService $bookingService
    ) {}

    public function index()
    {
        $user = Auth::user();
        
        $reviews = Review::with(['teacher:id,name_ar,image,user_id', 'teacher.user:id,name,image', 'booking:id,subject'])
            ->where('student_id', $user->id)
            ->select('id', 'teacher_id', 'booking_id', 'rating', 'comment', 'teacher_response', 'is_published', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->through(function ($review) {
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
                    'teacher_name' => $review->teacher->name_ar ?? $review->teacher->user->name ?? 'N/A',
                    'teacher_image' => $teacherImage,
                    'booking_id' => $review->booking_id,
                    'subject' => $review->booking->subject ?? null,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'teacher_response' => $review->teacher_response,
                    'is_published' => $review->is_published,
                    'created_at' => $review->created_at->format('Y-m-d'),
                ];
            });

        $reviewableBookings = $this->bookingService->getStudentBookings($user->id, 'completed', 10)
            ->getCollection()
            ->filter(function ($booking) use ($user) {
                return !Review::where('student_id', $user->id)
                    ->where('booking_id', $booking->id)
                    ->exists();
            })
            ->take(10)
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'teacher_id' => $booking->teacher_id,
                    'teacher_name' => $booking->teacher->name_ar ?? $booking->teacher->user->name ?? 'N/A',
                    'subject' => $booking->subject ?? '—',
                    'created_at' => $booking->created_at->format('Y-m-d'),
                ];
            });

        $stats = [
            'total' => Review::where('student_id', $user->id)->count(),
            'published' => Review::where('student_id', $user->id)->where('is_published', true)->count(),
            'pending' => Review::where('student_id', $user->id)->where('is_published', false)->count(),
            'average_rating' => (float) Review::where('student_id', $user->id)->avg('rating') ?: 0,
        ];

        return Inertia::render('Student/Reviews', [
            'reviews' => $reviews,
            'reviewableBookings' => $reviewableBookings,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'booking_id' => 'nullable|exists:bookings,id',
            'rating' => 'required|numeric|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        if ($request->booking_id) {
            $booking = Booking::findOrFail($request->booking_id);

            $isStudentBooking = false;
            if (Schema::hasColumn('bookings', 'student_id')) {
                $isStudentBooking = $booking->student_id == $user->id;
            } elseif (Schema::hasColumn('bookings', 'student_email')) {
                $isStudentBooking = $booking->student_email == $user->email;
            }

            if (!$isStudentBooking) {
                return back()->withErrors(['booking_id' => 'هذا الحجز لا ينتمي إليك']);
            }

            if ($booking->status !== 'completed') {
                return back()->withErrors(['booking_id' => 'يمكن التقييم فقط للحجوزات المكتملة']);
            }

            if (Review::where('student_id', $user->id)
                ->where('booking_id', $request->booking_id)
                ->exists()
            ) {
                return back()->withErrors(['booking_id' => 'تم التقييم على هذا الحجز مسبقاً']);
            }
        }

        $this->reviewService->createReview([
            'teacher_id' => $request->teacher_id,
            'booking_id' => $request->booking_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'reviewer_name' => $user->name,
            'is_published' => false,
        ], $user->id);

        return redirect()->back()->with('success', 'تم إضافة التقييم بنجاح وانتظار الموافقة');
    }

    public function update(Request $request, Review $review)
    {
        $user = Auth::user();

        $isOwner = false;
        if (Schema::hasColumn('reviews', 'student_id')) {
            $isOwner = $review->student_id == $user->id;
        } elseif (Schema::hasColumn('reviews', 'reviewer_name')) {
            $isOwner = $review->reviewer_name == $user->name;
        }

        if (!$isOwner) {
            return back()->withErrors(['error' => 'غير مصرح لك بتعديل هذا التقييم']);
        }

        $request->validate([
            'rating' => 'required|numeric|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        $this->reviewService->updateReview($review, [
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return redirect()->back()->with('success', 'تم تحديث التقييم بنجاح');
    }

    public function destroy(Review $review)
    {
        $user = Auth::user();

        $isOwner = false;
        if (Schema::hasColumn('reviews', 'student_id')) {
            $isOwner = $review->student_id == $user->id;
        } elseif (Schema::hasColumn('reviews', 'reviewer_name')) {
            $isOwner = $review->reviewer_name == $user->name;
        }

        if (!$isOwner) {
            return back()->withErrors(['error' => 'غير مصرح لك بحذف هذا التقييم']);
        }

        $this->reviewService->deleteReview($review);

        return redirect()->back()->with('success', 'تم حذف التقييم بنجاح');
    }
}
