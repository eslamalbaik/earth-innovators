<?php

namespace App\Http\Controllers;

use App\Models\TeacherAvailability;
use App\Models\Teacher;
use App\Services\AvailabilityService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AvailabilityController extends Controller
{
    public function __construct(
        private AvailabilityService $availabilityService
    ) {}

    public function getTeacherAvailabilities($teacherId, Request $request)
    {
        try {
            $result = $this->availabilityService->getTeacherAvailabilitiesForWeek(
                (int) $teacherId,
                $request->get('date'),
                $request->get('subject')
            );

            return response()->json([
                'success' => true,
                'availabilities' => $result['availabilities'],
                'week_start' => $result['week_start'],
                'week_end' => $result['week_end'],
            ]);
        } catch (\Exception $e) {
            \Log::error('Error in getTeacherAvailabilities', [
                'teacher_id' => $teacherId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب المواعيد',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $teacher = auth()->user()->teacher;

        if (!$teacher) {
            return redirect()->route('dashboard')->with('error', 'تم رفض الوصول');
        }

        $availabilities = $this->availabilityService->getTeacherAvailabilities(
            $teacher->id,
            $request->get('status'),
            $request->get('start_date'),
            $request->get('end_date'),
            $request->get('subject_id')
        );

        $subjects = $this->availabilityService->getTeacherSubjects($teacher->id);

        return Inertia::render('Teacher/Availability', [
            'availabilities' => $availabilities,
            'subjects' => $subjects,
            'filters' => $request->only(['status', 'start_date', 'end_date', 'subject_id']),
        ]);
    }

    public function store(Request $request)
    {
        \Log::info('Store availability request', $request->all());

        try {
            $request->validate([
                'date' => 'required|date|after_or_equal:today',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'subject_id' => 'nullable|exists:subjects,id',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', ['errors' => $e->errors()]);
            $errorMessage = 'البيانات المدخلة غير صحيحة: ' . implode(', ', array_map(function ($errors) {
                return implode(', ', $errors);
            }, $e->errors()));
            return redirect()->route('teacher.availability.index')
                ->with('error', $errorMessage)
                ->withErrors($e->errors())
                ->withInput();
        }

        $teacher = auth()->user()->teacher;
        if (!$teacher) {
            return redirect()->route('teacher.availability.index')->with('error', 'لم يتم العثور على بيانات المعلم');
        }

        $subjectId = null;
        if ($request->has('subject_id') && $request->subject_id !== '' && $request->subject_id !== null && $request->subject_id !== 'null') {
            $subjectId = $request->subject_id;
        }
        \Log::info('Processed subject_id in store', ['original' => $request->subject_id, 'processed' => $subjectId, 'teacher_id' => $teacher->id]);

        if ($subjectId) {
            $subjectModel = \App\Models\Subject::find($subjectId);
            if (!$subjectModel) {
                return redirect()->route('teacher.availability.index')->with('error', 'المادة المحددة غير موجودة');
            }

            $teachesSubject = $teacher->subjectsRelation()->where('subjects.id', $subjectId)->exists();
            if (!$teachesSubject) {
                $subjectName = $subjectModel->name_ar;
                $teacherSubjects = is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true);
                $teacherSubjectsEn = is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true);

                $hasSubject = in_array($subjectName, $teacherSubjects) ||
                    in_array($subjectModel->name_en, $teacherSubjectsEn);

                if (!$hasSubject) {
                    return redirect()->route('teacher.availability.index')->with('error', 'هذا المعلم لا يدرس هذه المادة');
                }
            }
        }

        $overlappingQuery = TeacherAvailability::where('teacher_id', $teacher->id)
            ->where('date', $request->date)
            ->where(function ($query) use ($subjectId) {
                if ($subjectId) {
                    $query->where('subject_id', $subjectId);
                } else {
                    $query->whereNull('subject_id');
                }
            })
            ->where(function ($query) use ($request) {
                $query->where(function ($q) use ($request) {
                    $q->where('start_time', '<', $request->end_time)
                        ->where('end_time', '>', $request->start_time);
                });
            });

        $overlappingAvailabilities = $overlappingQuery->get(['id', 'subject_id', 'start_time', 'end_time', 'status']);
        $overlapping = $overlappingAvailabilities->isNotEmpty();

        \Log::info('Overlapping check', [
            'overlapping' => $overlapping,
            'date' => $request->date,
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'subject_id' => $subjectId,
            'existing_availabilities' => $overlappingAvailabilities->toArray()
        ]);

        if ($overlapping) {
            \Log::warning('Overlapping availability detected');
            $overlappingInfo = $overlappingAvailabilities->first();
            $overlappingTime = $overlappingInfo->start_time . ' - ' . $overlappingInfo->end_time;
            $overlappingSubject = $overlappingInfo->subject_id ? \App\Models\Subject::find($overlappingInfo->subject_id)?->name_ar ?? 'مادة معينة' : 'عام';

            return redirect()->route('teacher.availability.index')
                ->with('error', 'هذا الوقت متداخل مع موعد آخر موجود (' . $overlappingTime . ' - ' . $overlappingSubject . ')');
        }

        try {
            \Log::info('Creating availability', [
                'teacher_id' => $teacher->id,
                'subject_id' => $subjectId,
                'date' => $request->date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
            ]);

            $availability = TeacherAvailability::create([
                'teacher_id' => $teacher->id,
                'subject_id' => $subjectId,
                'date' => $request->date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'status' => 'available',
            ]);

            \Log::info('Availability created successfully', ['id' => $availability->id]);
            return redirect()->route('teacher.availability.index')->with('success', 'تم إضافة الموعد بنجاح');
        } catch (\Exception $e) {
            \Log::error('Error creating availability', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);
            return redirect()->route('teacher.availability.index')->with('error', 'حدث خطأ أثناء إضافة الموعد: ' . $e->getMessage());
        }
    }

    public function update(\App\Http\Requests\Availability\UpdateAvailabilityRequest $request, $id)
    {
        $availability = TeacherAvailability::findOrFail($id);
        $userTeacher = auth()->user()->teacher;

        if (!auth()->user()->isAdmin() && (!$userTeacher || $userTeacher->id !== $availability->teacher_id)) {
            return redirect()->route('teacher.availability.index')->with('error', 'غير مصرح لك بتعديل هذا الموعد');
        }

        try {
            $this->availabilityService->updateAvailability(
                $availability,
                $request->validated(),
                $availability->teacher_id
            );
            return redirect()->route('teacher.availability.index')->with('success', 'تم تحديث الموعد بنجاح');
        } catch (\Exception $e) {
            return redirect()->route('teacher.availability.index')
                ->with('error', $e->getMessage())
                ->withInput();
        }
    }

    public function destroy($id)
    {
        $availability = TeacherAvailability::findOrFail($id);
        $userTeacher = auth()->user()->teacher;

        if (!auth()->user()->isAdmin() && (!$userTeacher || $userTeacher->id !== $availability->teacher_id)) {
            return redirect()->route('teacher.availability.index')->with('error', 'غير مصرح لك بحذف هذا الموعد');
        }

        try {
            $this->availabilityService->deleteAvailability($availability, $availability->teacher_id);
            return redirect()->route('teacher.availability.index')->with('success', 'تم حذف الموعد بنجاح');
        } catch (\Exception $e) {
            return redirect()->route('teacher.availability.index')->with('error', $e->getMessage());
        }
    }


    public function book(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'availability_ids' => 'required|array|min:1',
            'availability_ids.*' => 'required|exists:teacher_availabilities,id',
            'student_name' => 'required|string|max:255',
            'student_phone' => ['required', 'string', 'regex:/^(\+966|0)?[5-9][0-9]{8}$/'],
            'student_email' => 'nullable|email|max:255',
            'city' => 'required|string|max:100',
            'neighborhood' => 'required|string|max:100',
            'subject' => 'required|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        $teacher = Teacher::findOrFail($request->teacher_id);

        $availabilities = TeacherAvailability::whereIn('id', $request->availability_ids)
            ->where('teacher_id', $teacher->id)
            ->where('status', 'available')
            ->get();

        if ($availabilities->count() !== count($request->availability_ids)) {
            return response()->json([
                'success' => false,
                'message' => 'بعض المواعيد المحددة غير متاحة أو محجوزة',
            ], 422);
        }

        $sessionCount = count($request->availability_ids);
        $totalPrice = $sessionCount * $teacher->price_per_hour;

        $selectedSessions = $availabilities->map(function ($availability) {
            return [
                'date' => Carbon::parse($availability->date)->format('Y-m-d'),
                'time' => Carbon::parse($availability->start_time)->format('g:i A'),
            ];
        })->toArray();

        $booking = Booking::create([
            'teacher_id' => $teacher->id,
            'student_name' => $request->student_name,
            'student_phone' => $request->student_phone,
            'student_email' => $request->student_email,
            'city' => $request->city,
            'neighborhood' => $request->neighborhood,
            'subject' => $request->subject,
            'selected_sessions' => $selectedSessions,
            'total_price' => $totalPrice,
            'notes' => $request->notes,
            'status' => 'pending',
            'payment_received' => false,
        ]);

        foreach ($availabilities as $availability) {
            $availability->update([
                'status' => 'booked',
                'booking_id' => $booking->id,
            ]);
        }

        try {
            if ($teacher->user && $teacher->user->email) {
                \Mail::to($teacher->user->email)->send(new \App\Mail\NewBookingNotification($booking));
            }

            $admin = \App\Models\User::where('role', 'admin')->first();
            if ($admin) {
                \Mail::to($admin->email)->send(new \App\Mail\NewBookingNotification($booking));
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send booking notification emails: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'تم إرسال طلب الحجز بنجاح',
            'booking' => $booking,
        ]);
    }
}
