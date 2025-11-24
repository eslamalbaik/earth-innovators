<?php

namespace App\Http\Controllers;

use App\Models\TeacherAvailability;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TeacherAvailabilityController extends Controller
{
    private function resolveTeacher(): ?Teacher
    {
        $actingId = session('acting_teacher_id');
        if ($actingId) {
            return Teacher::find($actingId);
        }
        return Teacher::where('user_id', Auth::id())->first();
    }

    public function index()
    {
        $teacher = $this->resolveTeacher();

        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }

        $availabilities = TeacherAvailability::where('teacher_id', $teacher->id)
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $availabilities
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'subject_id' => 'nullable|exists:subjects,id',
            'notes' => 'nullable|string|max:500'
        ]);

        $teacher = $this->resolveTeacher();

        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }

        if ($request->subject_id) {
            $teachesSubject = $teacher->subjectsRelation()->where('subjects.id', $request->subject_id)->exists();
            if (!$teachesSubject) {
                return response()->json([
                    'success' => false,
                    'message' => 'هذا المعلم لا يدرس هذه المادة'
                ], 422);
            }
        }

        try {
            DB::beginTransaction();
            $overlapping = TeacherAvailability::where('teacher_id', $teacher->id)
                ->where('date', $request->date)
                ->where(function ($query) use ($request) {
                    if ($request->subject_id) {
                        $query->where(function ($q) use ($request) {
                            $q->where('subject_id', $request->subject_id)
                                ->orWhereNull('subject_id');
                        });
                    } else {
                        $query->whereNull('subject_id');
                    }
                })
                ->where(function ($query) use ($request) {
                    $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                        ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                        ->orWhere(function ($subQ) use ($request) {
                            $subQ->where('start_time', '<=', $request->start_time)
                                ->where('end_time', '>=', $request->end_time);
                        });
                })
                ->exists();

            if ($overlapping) {
                return response()->json([
                    'success' => false,
                    'message' => 'هذا الوقت يتداخل مع وقت آخر محجوز'
                ], 422);
            }

            $availability = TeacherAvailability::create([
                'teacher_id' => $teacher->id,
                'subject_id' => $request->subject_id,
                'date' => $request->date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'status' => 'available',
                'notes' => $request->notes
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم إضافة الوقت بنجاح',
                'data' => $availability
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إضافة الوقت',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'subject_id' => 'nullable|exists:subjects,id',
            'notes' => 'nullable|string|max:500'
        ]);

        $teacher = $this->resolveTeacher();

        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }

        $availability = TeacherAvailability::where('teacher_id', $teacher->id)
            ->where('id', $id)
            ->first();

        if (!$availability) {
            return response()->json(['error' => 'Availability not found'], 404);
        }

        if ($availability->status === 'booked') {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن تعديل وقت محجوز'
            ], 422);
        }

        if ($request->subject_id) {
            $teachesSubject = $teacher->subjectsRelation()->where('subjects.id', $request->subject_id)->exists();
            if (!$teachesSubject) {
                return response()->json([
                    'success' => false,
                    'message' => 'هذا المعلم لا يدرس هذه المادة'
                ], 422);
            }
        }

        try {
            DB::beginTransaction();
            $overlapping = TeacherAvailability::where('teacher_id', $teacher->id)
                ->where('id', '!=', $id)
                ->where('date', $request->date)
                ->where(function ($query) use ($request) {
                    if ($request->subject_id) {
                        $query->where(function ($q) use ($request) {
                            $q->where('subject_id', $request->subject_id)
                                ->orWhereNull('subject_id');
                        });
                    } else {
                        $query->whereNull('subject_id');
                    }
                })
                ->where(function ($query) use ($request) {
                    $query->whereBetween('start_time', [$request->start_time, $request->end_time])
                        ->orWhereBetween('end_time', [$request->start_time, $request->end_time])
                        ->orWhere(function ($subQ) use ($request) {
                            $subQ->where('start_time', '<=', $request->start_time)
                                ->where('end_time', '>=', $request->end_time);
                        });
                })
                ->exists();

            if ($overlapping) {
                return response()->json([
                    'success' => false,
                    'message' => 'هذا الوقت يتداخل مع وقت آخر محجوز'
                ], 422);
            }

            $availability->update([
                'date' => $request->date,
                'subject_id' => $request->subject_id,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'notes' => $request->notes
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث الوقت بنجاح',
                'data' => $availability
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تحديث الوقت',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $teacher = $this->resolveTeacher();

        if (!$teacher) {
            return response()->json(['error' => 'Teacher not found'], 404);
        }

        $availability = TeacherAvailability::where('teacher_id', $teacher->id)
            ->where('id', $id)
            ->first();

        if (!$availability) {
            return response()->json(['error' => 'Availability not found'], 404);
        }

        if ($availability->status === 'booked') {
            return response()->json([
                'success' => false,
                'message' => 'لا يمكن حذف وقت محجوز'
            ], 422);
        }

        try {
            $availability->delete();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الوقت بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء حذف الوقت',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'teacher_id' => 'required|exists:teachers,id',
            'date' => 'required|date',
            'subject_id' => 'nullable|exists:subjects,id'
        ]);

        $teacher = Teacher::findOrFail($request->teacher_id);

        if ($request->subject_id) {
            $teachesSubject = $teacher->subjectsRelation()->where('subjects.id', $request->subject_id)->exists();
            if (!$teachesSubject) {
                return response()->json([
                    'success' => false,
                    'message' => 'هذا المعلم لا يدرس هذه المادة'
                ], 422);
            }
        }

        $query = TeacherAvailability::where('teacher_id', $request->teacher_id)
            ->where('date', $request->date)
            ->where('status', 'available');

        if ($request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }

        $availabilities = $query->orderBy('start_time')->get();

        return response()->json([
            'success' => true,
            'data' => $availabilities,
            'teacher' => [
                'id' => $teacher->id,
                'name' => $teacher->name_ar,
                'price_per_hour' => $teacher->price_per_hour
            ]
        ]);
    }
}
