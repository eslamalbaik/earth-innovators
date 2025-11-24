<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Teacher;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class TeacherBookingsController extends Controller
{
    public function __construct(
        private BookingService $bookingService
    ) {}

    public function index(Request $request)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->route('teacher.dashboard')->with('error', 'Teacher profile not found.');
        }

        $bookings = $this->bookingService->getTeacherBookings(
            $teacher->id,
            $request->get('status'),
            15
        );

        // Get stats (can be cached in service if needed)
        $stats = [
            'total' => Booking::where('teacher_id', $teacher->id)->count(),
            'pending' => Booking::where('teacher_id', $teacher->id)->where('status', 'pending')->count(),
            'confirmed' => Booking::where('teacher_id', $teacher->id)->where('status', 'confirmed')->count(),
            'completed' => Booking::where('teacher_id', $teacher->id)->where('status', 'completed')->count(),
            'cancelled' => Booking::where('teacher_id', $teacher->id)->where('status', 'cancelled')->count(),
        ];

        return Inertia::render('Teacher/Bookings', [
            'bookings' => $bookings,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function show($id)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->route('teacher.dashboard')->with('error', 'Teacher profile not found.');
        }

        $booking = Booking::where('teacher_id', $teacher->id)
            ->where('id', $id)
            ->with(['teacher'])
            ->firstOrFail();

        return Inertia::render('Teacher/BookingDetails', [
            'booking' => [
                'id' => $booking->id,
                'student_name' => $booking->student_name,
                'student_phone' => $booking->student_phone,
                'student_email' => $booking->student_email,
                'city' => $booking->city,
                'neighborhood' => $booking->neighborhood,
                'subject' => $booking->subject,
                'selected_sessions' => $booking->selected_sessions,
                'total_price' => $booking->total_price,
                'status' => $booking->status,
                'notes' => $booking->notes,
                'payment_received' => $booking->payment_received,
                'created_at' => $booking->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $booking->updated_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Teacher profile not found.');
        }

        $booking = Booking::where('teacher_id', $teacher->id)
            ->where('id', $id)
            ->firstOrFail();

        $request->validate([
            'status' => 'required|in:pending,confirmed,approved,cancelled,completed',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $this->bookingService->updateBookingStatus(
                $booking,
                $request->status,
                $request->get('notes'),
                $teacher->id
            );

            return redirect()->back()->with('success', 'تم تحديث حالة الطلب بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function markPaymentReceived($id)
    {
        $teacher = Auth::user()->teacher;
        if (!$teacher) {
            return redirect()->back()->with('error', 'Teacher profile not found.');
        }

        $booking = Booking::where('teacher_id', $teacher->id)
            ->where('id', $id)
            ->firstOrFail();

        $booking->update([
            'payment_received' => true,
            'payment_received_at' => now(),
        ]);

        return redirect()->back()->with('success', 'تم تأكيد استلام الدفع');
    }
}
