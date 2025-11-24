<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();

        // Get optimized dashboard stats from service
        $stats = $this->dashboardService->getAdminDashboardStats();

        // Get recent bookings with optimized query
        $recentBookings = Booking::with(['teacher:id,name_ar,user_id', 'teacher.user:id,name', 'student:id,name'])
            ->select('id', 'teacher_id', 'student_id', 'student_name', 'subject', 'status', 'created_at')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'student' => $booking->student->name ?? $booking->student_name ?? 'N/A',
                    'teacher' => $booking->teacher->name_ar ?? $booking->teacher->user->name ?? 'N/A',
                    'subject' => $booking->subject ?? 'N/A',
                    'date' => $booking->created_at->format('Y-m-d'),
                    'status' => $booking->status,
                ];
            });

        return Inertia::render('Dashboard', [
            'user' => $user,
            'stats' => $stats,
            'recentBookings' => $recentBookings,
            'upcomingSessions' => [],
        ]);
    }
}

