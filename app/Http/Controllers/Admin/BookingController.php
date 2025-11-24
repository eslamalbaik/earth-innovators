<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Support\Activity;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService
    ) {}

    public function index(Request $request)
    {
        $bookings = $this->bookingService->getAllBookings(
            $request->filled('status') && $request->status !== 'all' ? $request->status : null,
            $request->get('teacher_id'),
            20
        )->withQueryString();
        
        // Add student info to each booking
        $bookings->getCollection()->transform(function ($booking) {
            $student = null;
            if ($booking->student_id) {
                $student = User::find($booking->student_id);
            } elseif ($booking->student_email) {
                $student = User::where('email', $booking->student_email)->first();
            }
            
            if ($student) {
                $booking->setRelation('student', $student);
            } else {
                $booking->student = (object) [
                    'id' => null,
                    'name' => $booking->student_name ?? 'غير محدد',
                    'email' => $booking->student_email ?? 'غير محدد',
                    'phone' => $booking->student_phone ?? 'غير محدد',
                ];
            }
            
            return $booking;
        });
        
        // Get stats (cached in BookingService if needed)
        $stats = [
            'total' => Booking::count(),
            'pending' => Booking::where('status', 'pending')->count(),
            'approved' => Booking::where('status', 'approved')->count(),
            'rejected' => Booking::where('status', 'rejected')->count(),
            'cancelled' => Booking::where('status', 'cancelled')->count(),
            'completed' => Booking::where('status', 'completed')->count(),
        ];
        
        $teachers = User::whereHas('teacher')
            ->with('teacher:id,user_id,name_ar,name_en')
            ->select('id', 'name', 'email')
            ->get();

        return Inertia::render('Admin/Bookings/Index', [
            'bookings' => $bookings,
            'stats' => $stats,
            'teachers' => $teachers,
            'filters' => $request->only(['status', 'teacher_id', 'student_id', 'search', 'date_from', 'date_to'])
        ]);
    }

    public function show($id)
    {
        $booking = Booking::with(['teacher.user', 'availability.subject'])
            ->findOrFail($id);

        // محاولة جلب الطالب
        $student = null;
        if ($booking->student_id) {
            $student = User::find($booking->student_id);
        } elseif ($booking->student_email) {
            $student = User::where('email', $booking->student_email)->first();
        }

        // إضافة معلومات الطالب إلى الحجز
        if ($student) {
            $booking->setRelation('student', $student);
        } else {
            // إنشاء كائن وهمي بمعلومات من الحقول المباشرة
            $booking->student = (object) [
                'id' => null,
                'name' => $booking->student_name ?? 'غير محدد',
                'email' => $booking->student_email ?? 'غير محدد',
                'phone' => $booking->student_phone ?? 'غير محدد',
            ];
        }

        return Inertia::render('Admin/Bookings/Show', [
            'booking' => $booking,
            'auth' => auth()->user()
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected,cancelled,completed',
            'admin_notes' => 'nullable|string|max:1000',
            'payment_status' => 'nullable|in:pending,paid,refunded',
            'payment_method' => 'nullable|string|max:255',
            'payment_reference' => 'nullable|string|max:255',
        ]);

        $booking = Booking::with(['availability'])->findOrFail($id);

        try {
            DB::beginTransaction();

            $updateData = [
                'status' => $request->status,
            ];
            
            if ($request->filled('admin_notes')) {
                $updateData['admin_notes'] = $request->admin_notes;
            }
            
            if ($request->filled('payment_status')) {
                $updateData['payment_status'] = $request->payment_status;
                if ($request->payment_status === 'paid' && empty($booking->payment_received_at)) {
                    $updateData['payment_received_at'] = now();
                }
            }
            
            if ($request->filled('payment_method')) {
                $updateData['payment_method'] = $request->payment_method;
            }
            
            if ($request->filled('payment_reference')) {
                $updateData['payment_reference'] = $request->payment_reference;
            }
            
            switch ($request->status) {
                case 'approved':
                    $updateData['approved_at'] = now();
                    break;
                case 'rejected':
                    $updateData['rejected_at'] = now();
                    if ($booking->availability) {
                        $booking->availability->update(['status' => 'available']);
                    }
                    break;
                case 'cancelled':
                    $updateData['cancelled_at'] = now();
                    if ($booking->availability) {
                        $booking->availability->update(['status' => 'available']);
                    }
                    break;
                case 'completed':
                    $updateData['completed_at'] = now();
                    break;
            }

            $original = $booking->getOriginal();
            $booking->update($updateData);

            DB::commit();

            Activity::record($request->user()->id ?? null, 'booking.status.updated', Booking::class, $booking->id, [
                'old' => $original,
                'new' => $booking->only(array_keys($updateData)),
            ]);

            if (($request->payment_status ?? null) === 'paid' && ($booking->student?->email || $booking->student_email)) {
                try {
                    $email = $booking->student?->email ?? $booking->student_email;
                    Mail::raw(
                        'تم تأكيد دفعك لطلب الحجز رقم #' . $booking->id . '. شكراً لك.',
                        function ($message) use ($booking, $email) {
                            $message->to($email)
                                ->subject('تأكيد الدفع - طلب #' . $booking->id);
                        }
                    );
                } catch (\Throwable $e) {
                    Log::warning('Failed sending payment email', [
                        'booking_id' => $booking->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'تم تحديث حالة الطلب بنجاح',
                    'data' => $booking->fresh()
                ]);
            }

            return redirect()->back()->with('success', 'تم تحديث حالة الطلب بنجاح');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update booking status', [
                'booking_id' => $id,
                'error' => $e->getMessage(),
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'حدث خطأ أثناء تحديث حالة الطلب',
                    'error' => $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'حدث خطأ أثناء تحديث حالة الطلب');
        }
    }

    public function getStats(Request $request)
    {
        $dateFrom = $request->get('date_from', now()->startOfMonth());
        $dateTo = $request->get('date_to', now()->endOfMonth());

        $stats = [
            'total_bookings' => Booking::whereBetween('created_at', [$dateFrom, $dateTo])->count(),
            'total_revenue' => Booking::where('status', 'approved')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->sum('price'),
            'pending_bookings' => Booking::where('status', 'pending')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count(),
            'approved_bookings' => Booking::where('status', 'approved')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count(),
            'rejected_bookings' => Booking::where('status', 'rejected')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count(),
            'cancelled_bookings' => Booking::where('status', 'cancelled')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count(),
            'completed_bookings' => Booking::where('status', 'completed')
                ->whereBetween('created_at', [$dateFrom, $dateTo])
                ->count(),
        ];

        $monthlyTrends = Booking::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $topTeachers = Booking::with('teacher')
            ->selectRaw('teacher_id, COUNT(*) as booking_count, SUM(price) as total_revenue')
            ->whereBetween('created_at', [$dateFrom, $dateTo])
            ->groupBy('teacher_id')
            ->orderBy('booking_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'monthly_trends' => $monthlyTrends,
                'top_teachers' => $topTeachers
            ]
        ]);
    }

    public function export(Request $request)
    {
        $query = Booking::with(['teacher.user', 'availability']);
        
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhere('student_name', 'like', "%{$search}%")
                    ->orWhere('student_email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('date_from')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('availability', function ($subQ) use ($request) {
                    $subQ->where('date', '>=', $request->date_from);
                })->orWhere('date', '>=', $request->date_from);
            });
        }

        if ($request->filled('date_to')) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('availability', function ($subQ) use ($request) {
                    $subQ->where('date', '<=', $request->date_to);
                })->orWhere('date', '<=', $request->date_to);
            });
        }

        $bookings = $query->latest()->get();

        $csvData = [];
        $csvData[] = [
            'ID',
            'الطالب',
            'البريد الإلكتروني',
            'رقم الجوال',
            'المعلم',
            'التاريخ',
            'الوقت',
            'السعر',
            'الحالة',
            'حالة الدفع',
            'تاريخ الإنشاء'
        ];

        foreach ($bookings as $booking) {
            // جلب معلومات الطالب
            $student = null;
            if ($booking->student_id) {
                $student = User::find($booking->student_id);
            } elseif ($booking->student_email) {
                $student = User::where('email', $booking->student_email)->first();
            }
            
            $studentName = $student ? $student->name : ($booking->student_name ?? 'غير محدد');
            $studentEmail = $student ? $student->email : ($booking->student_email ?? 'غير محدد');
            $studentPhone = $student ? $student->phone : ($booking->student_phone ?? 'غير محدد');
            
            $teacherName = $booking->teacher?->name_ar ?? $booking->teacher?->name_en ?? ($booking->teacher?->user?->name ?? 'غير محدد');
            
            $date = 'غير محدد';
            if ($booking->availability && $booking->availability->date) {
                $date = $booking->availability->date->format('Y-m-d');
            } elseif ($booking->date) {
                $date = is_string($booking->date) ? $booking->date : $booking->date->format('Y-m-d');
            }
            
            $time = 'غير محدد';
            if ($booking->availability && $booking->availability->start_time && $booking->availability->end_time) {
                $startTime = is_string($booking->availability->start_time) 
                    ? $booking->availability->start_time 
                    : $booking->availability->start_time->format('H:i');
                $endTime = is_string($booking->availability->end_time) 
                    ? $booking->availability->end_time 
                    : $booking->availability->end_time->format('H:i');
                $time = $startTime . ' - ' . $endTime;
            } elseif ($booking->start_time && $booking->end_time) {
                $time = $booking->start_time . ' - ' . $booking->end_time;
            }
            
            $csvData[] = [
                $booking->id,
                $studentName,
                $studentEmail,
                $studentPhone,
                $teacherName,
                $date,
                $time,
                $booking->price ?? $booking->total_price ?? '0',
                $this->getStatusText($booking->status),
                $this->getPaymentStatusText($booking->payment_status ?? 'pending'),
                $booking->created_at->format('Y-m-d H:i:s')
            ];
        }

        $filename = 'bookings_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $callback = function () use ($csvData) {
            $file = fopen('php://output', 'w');
            // إضافة BOM للـ UTF-8 لدعم العربية بشكل صحيح
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    private function getPaymentStatusText($status)
    {
        $statuses = [
            'pending' => 'في الانتظار',
            'paid' => 'مدفوع',
            'refunded' => 'مسترد'
        ];

        return $statuses[$status] ?? $status;
    }

    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);

        try {
            DB::beginTransaction();

            // إعادة حالة availability إلى available إذا كانت موجودة
            if ($booking->availability) {
                $booking->availability->update(['status' => 'available']);
            }

            Activity::record(auth()->id(), 'booking.deleted', Booking::class, $booking->id);

            $booking->delete();

            DB::commit();

            return redirect()->route('admin.bookings.index')->with('success', 'تم حذف الحجز بنجاح');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete booking', [
                'booking_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'حدث خطأ أثناء حذف الحجز');
        }
    }

    private function getStatusText($status)
    {
        $statuses = [
            'pending' => 'في الانتظار',
            'approved' => 'موافق عليه',
            'rejected' => 'مرفوض',
            'cancelled' => 'ملغي',
            'completed' => 'مكتمل'
        ];

        return $statuses[$status] ?? $status;
    }
}
