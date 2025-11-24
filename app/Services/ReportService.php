<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Teacher;
use Illuminate\Support\Carbon;

class ReportService extends BaseService
{
    public function getTeacherReport(Teacher $teacher, string $month): array
    {
        $cacheKey = "teacher_report_{$teacher->id}_{$month}";
        $cacheTag = "teacher_reports_{$teacher->id}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacher, $month) {
            $start = Carbon::parse($month . '-01')->startOfMonth();
            $end = (clone $start)->endOfMonth();

            $bookings = Booking::with(['student:id,name', 'availability:id,start_time,end_time'])
                ->select('id', 'student_id', 'availability_id', 'status', 'payment_status', 'price', 'created_at')
                ->where('teacher_id', $teacher->user_id)
                ->whereBetween('created_at', [$start, $end])
                ->get();

            $summary = [
                'total' => $bookings->count(),
                'pending' => $bookings->where('status', 'pending')->count(),
                'approved' => $bookings->where('status', 'approved')->count(),
                'rejected' => $bookings->where('status', 'rejected')->count(),
                'cancelled' => $bookings->where('status', 'cancelled')->count(),
                'completed' => $bookings->where('status', 'completed')->count(),
                'revenue' => (float) $bookings->where('payment_status', 'paid')->sum('price'),
            ];

            $byDay = $bookings->groupBy(function ($booking) {
                return $booking->created_at->format('Y-m-d');
            })
            ->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'revenue' => (float) $group->sum('price')
                ];
            })
            ->sortKeys();

            return [
                'summary' => $summary,
                'byDay' => $byDay,
                'bookings' => $bookings->map(function ($booking) {
                    return [
                        'id' => $booking->id,
                        'student_name' => $booking->student->name ?? 'N/A',
                        'status' => $booking->status,
                        'payment_status' => $booking->payment_status,
                        'price' => $booking->price,
                        'created_at' => $booking->created_at->format('Y-m-d H:i'),
                    ];
                }),
            ];
        }, 300); // Cache for 5 minutes
    }
}

