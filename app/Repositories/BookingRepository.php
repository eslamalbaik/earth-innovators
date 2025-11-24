<?php

namespace App\Repositories;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class BookingRepository extends BaseRepository
{
    protected function model(): string
    {
        return Booking::class;
    }

    public function getRecentBookings(int $limit = 10): Collection
    {
        return $this->model
            ->with(['teacher:id,name_ar,user_id', 'teacher.user:id,name', 'student:id,name'])
            ->select('id', 'teacher_id', 'student_id', 'student_name', 'subject', 'status', 'created_at')
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function getBookingsByStatus(string $status, int $perPage = 20): LengthAwarePaginator
    {
        return $this->model
            ->where('status', $status)
            ->with(['teacher', 'student'])
            ->latest()
            ->paginate($perPage);
    }

    public function getBookingsStats(): array
    {
        return \DB::table('bookings')
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status IN ("approved", "confirmed") THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
            ')
            ->first();
    }
}

