<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Teacher;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService
    ) {}

    public function index(Request $request)
    {
        $bookings = $this->bookingService->getAllBookings(
            $request->get('status'),
            $request->get('teacher_id'),
            20
        );

        return Inertia::render('Admin/Bookings', [
            'bookings' => $bookings,
        ]);
    }

    public function store(Request $request)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'يجب تسجيل الدخول أولاً'
            ], 401);
        }

        $request->validate([
            'student_notes' => 'nullable|string|max:1000',
            'sessions' => 'nullable|array|min:1',
            'sessions.*.availability_id' => 'required_with:sessions|exists:teacher_availabilities,id',
            'sessions.*.subject' => 'nullable|string|max:255',
            'availability_id' => 'required_without:sessions|exists:teacher_availabilities,id',
            'subject' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string',
            'payment_reference' => 'nullable|string',
        ]);

        try {
            $data = $request->only(['sessions', 'availability_id', 'subject', 'student_notes', 'payment_method', 'payment_reference']);
            $booking = $this->bookingService->createBooking($data, Auth::id());

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال طلب الحجز بنجاح. سيتم مراجعة طلبك من قبل المعلم.',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function show(string $id)
    {
        $booking = $this->bookingService->getBookingDetails((int) $id);

        if (!$booking) {
            abort(404);
        }

        return Inertia::render('Booking/Show', [
            'booking' => $booking,
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:approved,rejected,cancelled,completed',
            'teacher_notes' => 'nullable|string|max:1000'
        ]);

        $teacher = Teacher::where('user_id', Auth::id())->firstOrFail();
        $booking = Booking::where('teacher_id', $teacher->id)->findOrFail($id);

        try {
            $booking = $this->bookingService->updateBookingStatus(
                $booking,
                $request->status,
                $request->get('teacher_notes'),
                $teacher->id
            );

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث حالة الطلب بنجاح',
                'data' => $booking
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function getTeacherBookings(Request $request)
    {
        $teacher = Teacher::where('user_id', Auth::id())->first();

        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }

        $bookings = $this->bookingService->getTeacherBookings(
            $teacher->id,
            $request->get('status'),
            20
        );

        return Inertia::render('Teacher/Bookings', [
            'bookings' => $bookings,
        ]);
    }

    public function getStudentBookings(Request $request)
    {
        $bookings = $this->bookingService->getStudentBookings(
            Auth::id(),
            $request->get('status'),
            20
        );

        return Inertia::render('Student/Bookings', [
            'bookings' => $bookings,
        ]);
    }
}