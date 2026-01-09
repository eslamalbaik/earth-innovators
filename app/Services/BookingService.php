<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Teacher;
use App\Models\TeacherAvailability;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Schema;

class BookingService extends BaseService
{
    public function getAllBookings(
        ?string $status = null,
        ?int $teacherId = null,
        int $perPage = 20
    ): LengthAwarePaginator {
        $cacheKey = "bookings_" . md5(json_encode([$status, $teacherId, $perPage]));
        $cacheTag = 'bookings';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($status, $teacherId, $perPage) {
            $query = Booking::with([
                'teacher:id,user_id,name_ar,name_en',
                'teacher.user:id,name,email,image',
                'student:id,name,email,image',
                'availability:id,date,start_time,end_time,status'
            ])
            ->select('id', 'teacher_id', 'student_id', 'availability_id', 'status', 'subject', 'date', 'start_time', 'end_time', 'price', 'total_price', 'payment_status', 'created_at');

            if ($status) {
                $query->where('status', $status);
            }

            if ($teacherId) {
                $query->where('teacher_id', $teacherId);
            }

            return $query->latest()->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getTeacherBookings(int $teacherId, ?string $status = null, int $perPage = 20): LengthAwarePaginator
    {
        $cacheKey = "teacher_bookings_{$teacherId}_" . md5($status ?? '') . "_{$perPage}";
        $cacheTag = "teacher_bookings_{$teacherId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId, $status, $perPage) {
            $query = Booking::with(['student:id,name,email,image', 'availability:id,date,start_time,end_time'])
                ->select('id', 'student_id', 'availability_id', 'status', 'subject', 'date', 'start_time', 'end_time', 'price', 'total_price', 'payment_status', 'created_at')
                ->where('teacher_id', $teacherId);

            if ($status) {
                $query->where('status', $status);
            }

            return $query->latest()->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getStudentBookings(int $studentId, ?string $status = null, int $perPage = 20): LengthAwarePaginator
    {
        $cacheKey = "student_bookings_{$studentId}_" . md5($status ?? '') . "_{$perPage}";
        $cacheTag = "student_bookings_{$studentId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($studentId, $status, $perPage) {
            $query = Booking::with([
                'teacher:id,user_id,name_ar,name_en',
                'teacher.user:id,name,email,image',
                'availability:id,date,start_time,end_time',
                'payment:id,status,amount'
            ])
            ->select('id', 'teacher_id', 'availability_id', 'status', 'subject', 'date', 'start_time', 'end_time', 'price', 'total_price', 'payment_status', 'created_at');

            if (Schema::hasColumn('bookings', 'student_id')) {
                $query->where('student_id', $studentId);
            } elseif (Schema::hasColumn('bookings', 'student_email')) {
                $user = User::find($studentId);
                if ($user) {
                    $query->where('student_email', $user->email);
                }
            }

            if ($status) {
                $query->where('status', $status);
            }

            return $query->latest()->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    public function getBookingDetails(int $bookingId): ?Booking
    {
        $cacheKey = "booking_details_{$bookingId}";
        $cacheTag = "booking_{$bookingId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($bookingId) {
            return Booking::with([
                'teacher:id,user_id,name_ar,name_en',
                'teacher.user:id,name,email,image,phone',
                'student:id,name,email,image,phone',
                'availability:id,date,start_time,end_time,status'
            ])->find($bookingId);
        }, 600); // Cache for 10 minutes
    }

    public function createBooking(array $data, int $userId): Booking
    {
        try {
            DB::beginTransaction();

            $sessionsInput = collect($data['sessions'] ?? [])
                ->filter(fn($session) => isset($session['availability_id']));

            if ($sessionsInput->isNotEmpty()) {
                $availabilityIds = $sessionsInput->pluck('availability_id')->unique()->values();
                $availabilities = TeacherAvailability::with('teacher')->whereIn('id', $availabilityIds)->get();

                if ($availabilities->count() !== $availabilityIds->count()) {
                    throw new \Exception('بعض المواعيد المحددة لم تعد متاحة.');
                }

                if ($availabilities->pluck('teacher_id')->unique()->count() > 1) {
                    throw new \Exception('يجب أن تكون جميع المواعيد لنفس المعلم.');
                }

                $primaryAvailability = $availabilities->first();
            } else {
                if (!isset($data['availability_id'])) {
                    throw new \Exception('يجب تحديد موعد واحد على الأقل.');
                }
                $primaryAvailability = TeacherAvailability::with('teacher')->findOrFail($data['availability_id']);
                $sessionsInput = collect([[
                    'availability_id' => $primaryAvailability->id,
                    'subject' => $data['subject'] ?? null,
                ]]);
                $availabilities = collect([$primaryAvailability]);
            }

            if ($primaryAvailability->status !== 'available') {
                throw new \Exception('هذا الوقت غير متاح للحجز');
            }

            $user = User::findOrFail($userId);
            $teacher = $primaryAvailability->teacher;

            $createData = [
                'teacher_id' => $teacher->id,
                'status' => 'pending',
            ];

            if (Schema::hasColumn('bookings', 'student_notes') && isset($data['student_notes'])) {
                $createData['student_notes'] = $data['student_notes'];
            }

            $sessionsCount = $sessionsInput->count();
            if (Schema::hasColumn('bookings', 'price')) {
                $createData['price'] = $teacher->price_per_hour ?? 0;
            }
            if (Schema::hasColumn('bookings', 'total_price')) {
                $createData['total_price'] = ($teacher->price_per_hour ?? 0) * $sessionsCount;
            }
            if (Schema::hasColumn('bookings', 'payment_status')) {
                $createData['payment_status'] = 'pending';
            }
            if (Schema::hasColumn('bookings', 'currency')) {
                $createData['currency'] = config('app.currency', 'AED');
            }
            if (Schema::hasColumn('bookings', 'payment_method') && isset($data['payment_method'])) {
                $createData['payment_method'] = $data['payment_method'];
            }
            if (Schema::hasColumn('bookings', 'payment_reference') && isset($data['payment_reference'])) {
                $createData['payment_reference'] = $data['payment_reference'];
            }

            if (Schema::hasColumn('bookings', 'availability_id')) {
                $createData['availability_id'] = $primaryAvailability->id;
            }

            if (Schema::hasColumn('bookings', 'subject')) {
                $subjectsCollection = $sessionsInput->pluck('subject')
                    ->filter()
                    ->unique()
                    ->values();

                if ($subjectsCollection->isEmpty()) {
                    if ($primaryAvailability->subject_id) {
                        $subject = \App\Models\Subject::find($primaryAvailability->subject_id);
                        $subjectsCollection = collect([$subject ? $subject->name_ar : '']);
                    } else {
                        $defaultSubject = $data['subject'] ?? null;
                        if ($defaultSubject) {
                            $subjectsCollection = collect([$defaultSubject]);
                        } else {
                            $teacherSubjects = is_array($teacher->subjects ?? null)
                                ? $teacher->subjects
                                : [];
                            if (!empty($teacherSubjects)) {
                                $subjectsCollection = collect([$teacherSubjects[0]]);
                            }
                        }
                    }
                }

                $createData['subject'] = $subjectsCollection->filter()->implode(' / ');
            }

            if (Schema::hasColumn('bookings', 'subject_id') && $primaryAvailability->subject_id) {
                $createData['subject_id'] = $primaryAvailability->subject_id;
            }

            if (Schema::hasColumn('bookings', 'selected_sessions')) {
                $createData['selected_sessions'] = json_encode($sessionsInput->map(function ($session) {
                    return [
                        'availability_id' => $session['availability_id'],
                        'subject' => $session['subject'] ?? null,
                    ];
                })->toArray());
            }

            if (Schema::hasColumn('bookings', 'date')) {
                $createData['date'] = optional($primaryAvailability->date)->format('Y-m-d') ?: now()->toDateString();
            }
            if (Schema::hasColumn('bookings', 'start_time')) {
                $createData['start_time'] = optional($primaryAvailability->start_time)->format('H:i:s');
            }
            if (Schema::hasColumn('bookings', 'end_time')) {
                $createData['end_time'] = optional($primaryAvailability->end_time)->format('H:i:s');
            }

            if (Schema::hasColumn('bookings', 'student_id')) {
                $createData['student_id'] = $userId;
            } elseif (Schema::hasColumn('bookings', 'student_email')) {
                $createData['student_email'] = $user->email;
            }

            if (Schema::hasColumn('bookings', 'student_name')) {
                $createData['student_name'] = $user->name;
            }
            if (Schema::hasColumn('bookings', 'student_phone')) {
                $createData['student_phone'] = $user->phone ?? '';
            }
            if (Schema::hasColumn('bookings', 'city')) {
                $createData['city'] = $user->city ?? '';
            }
            if (Schema::hasColumn('bookings', 'neighborhood')) {
                $createData['neighborhood'] = $user->neighborhood ?? '';
            }

            $booking = Booking::create($createData);

            // Mark availabilities as booked
            foreach ($availabilities as $availability) {
                $availability->update(['status' => 'booked', 'booking_id' => $booking->id]);
            }

            DB::commit();

            // Send notifications (async)
            \App\Jobs\SendBookingNotification::dispatch($booking);

            // Clear cache
            $this->forgetCacheTags(['bookings', "teacher_bookings_{$teacher->id}", "student_bookings_{$userId}"]);

            return $booking->load(['teacher', 'student', 'availability']);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateBookingStatus(Booking $booking, string $status, ?string $teacherNotes = null, int $teacherId): Booking
    {
        try {
            DB::beginTransaction();

            // Verify teacher owns this booking
            if ($booking->teacher_id !== $teacherId) {
                throw new \Exception('غير مصرح لك بتحديث هذا الحجز');
            }

            $oldStatus = $booking->status;
            $updateData = ['status' => $status];

            if (Schema::hasColumn('bookings', 'notes') && $teacherNotes) {
                $updateData['notes'] = $teacherNotes;
            } elseif (Schema::hasColumn('bookings', 'teacher_notes') && $teacherNotes) {
                $updateData['teacher_notes'] = $teacherNotes;
            }

            switch ($status) {
                case 'confirmed':
                case 'approved':
                    if (Schema::hasColumn('bookings', 'approved_at')) {
                        $updateData['approved_at'] = now();
                    }
                    // Mark availabilities as booked
                    if ($booking->selected_sessions) {
                        $sessions = is_array($booking->selected_sessions) 
                            ? $booking->selected_sessions 
                            : json_decode($booking->selected_sessions, true) ?? [];
                        $availabilityIds = collect($sessions)
                            ->pluck('availability_id')
                            ->filter()
                            ->unique();

                        if ($availabilityIds->isNotEmpty()) {
                            TeacherAvailability::whereIn('id', $availabilityIds)
                                ->where('booking_id', $booking->id)
                                ->update(['status' => 'booked']);
                        }
                    } elseif ($booking->availability) {
                        $booking->availability->update(['status' => 'booked']);
                    }
                    break;
                case 'rejected':
                case 'cancelled':
                    if (Schema::hasColumn('bookings', $status . '_at')) {
                        $updateData[$status . '_at'] = now();
                    }
                    // Release availabilities
                    $this->releaseAvailabilities($booking);
                    break;
                case 'completed':
                    if (Schema::hasColumn('bookings', 'completed_at')) {
                        $updateData['completed_at'] = now();
                    }
                    break;
            }

            $booking->update($updateData);

            DB::commit();

            // Send notifications (async)
            \App\Jobs\SendBookingStatusChangeNotification::dispatch($booking);

            // Clear cache
            $this->forgetCacheTags([
                'bookings',
                "teacher_bookings_{$booking->teacher_id}",
                "student_bookings_{$booking->student_id}",
                "booking_{$booking->id}"
            ]);

            return $booking->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function releaseAvailabilities(Booking $booking): void
    {
        if ($booking->availability) {
            $booking->availability->update(['status' => 'available', 'booking_id' => null]);
        } elseif ($booking->selected_sessions) {
            $sessions = is_array($booking->selected_sessions)
                ? $booking->selected_sessions
                : json_decode($booking->selected_sessions, true) ?? [];

            if (!empty($sessions)) {
                $availabilityIds = collect($sessions)
                    ->pluck('availability_id')
                    ->filter()
                    ->unique()
                    ->values();

                if ($availabilityIds->isNotEmpty()) {
                    TeacherAvailability::whereIn('id', $availabilityIds)
                        ->update(['status' => 'available', 'booking_id' => null]);
                }
            }
        }
    }
}
