<?php

namespace App\Services;

use App\Models\TeacherAvailability;
use App\Models\Teacher;
use App\Models\Subject;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class AvailabilityService extends BaseService
{
    public function getTeacherAvailabilitiesForWeek(
        int $teacherId,
        ?string $date = null,
        ?string $subjectName = null
    ): array {
        $cacheKey = "teacher_availabilities_{$teacherId}_" . md5(json_encode([$date, $subjectName]));
        $cacheTag = "teacher_availabilities_{$teacherId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId, $date, $subjectName) {
            $startDate = $date ? Carbon::parse($date)->startOfWeek() : Carbon::now()->startOfWeek();
            $endDate = $startDate->copy()->addDays(6);

            $query = TeacherAvailability::where('teacher_id', $teacherId)
                ->where('date', '>=', $startDate->format('Y-m-d'))
                ->where('date', '<=', $endDate->format('Y-m-d'))
                ->whereIn('status', ['available', 'booked'])
                ->select('id', 'date', 'start_time', 'end_time', 'status', 'booking_id', 'subject_id')
                ->orderBy('date')
                ->orderBy('start_time');

            if ($subjectName) {
                $subjectModel = Subject::where(function ($q) use ($subjectName) {
                    $q->where('name_ar', $subjectName)
                        ->orWhere('name_en', $subjectName);
                })->first();

                if ($subjectModel) {
                    $query->where(function ($q) use ($subjectModel) {
                        $q->where('subject_id', $subjectModel->id)
                            ->orWhereNull('subject_id');
                    });
                } else {
                    $query->whereNull('subject_id');
                }
            }

            $availabilities = $query->get()
                ->groupBy(function ($availability) {
                    return $availability->date instanceof Carbon
                        ? $availability->date->format('Y-m-d')
                        : Carbon::parse($availability->date)->format('Y-m-d');
                });

            $formattedAvailabilities = [];
            foreach ($availabilities as $dateKey => $slots) {
                $formattedSlots = [];
                foreach ($slots as $slot) {
                    $timeString = '';
                    if ($slot->start_time) {
                        try {
                            if (is_string($slot->start_time)) {
                                $timeString = Carbon::createFromTimeString($slot->start_time)->format('g:i A');
                            } elseif ($slot->start_time instanceof Carbon) {
                                $timeString = $slot->start_time->format('g:i A');
                            } else {
                                $timeString = Carbon::createFromTimeString($slot->start_time)->format('g:i A');
                            }
                        } catch (\Exception $e) {
                            $timeString = is_string($slot->start_time) ? $slot->start_time : '';
                        }
                    }

                    $formattedSlots[] = [
                        'id' => $slot->id,
                        'time' => $timeString,
                        'status' => $slot->status,
                        'booking_id' => $slot->booking_id,
                        'subject_id' => $slot->subject_id,
                    ];
                }
                $formattedAvailabilities[$dateKey] = $formattedSlots;
            }

            return [
                'availabilities' => $formattedAvailabilities,
                'week_start' => $startDate->format('Y-m-d'),
                'week_end' => $endDate->format('Y-m-d'),
            ];
        }, 300); // Cache for 5 minutes
    }

    public function getTeacherAvailabilities(
        int $teacherId,
        ?string $status = null,
        ?string $startDate = null,
        ?string $endDate = null,
        ?int $subjectId = null
    ): Collection {
        $cacheKey = "teacher_availabilities_list_{$teacherId}_" . md5(json_encode([$status, $startDate, $endDate, $subjectId]));
        $cacheTag = "teacher_availabilities_{$teacherId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId, $status, $startDate, $endDate, $subjectId) {
            $query = TeacherAvailability::where('teacher_id', $teacherId)
                ->select('id', 'date', 'start_time', 'end_time', 'status', 'booking_id', 'subject_id');

            if ($status) {
                $query->where('status', $status);
            }

            if ($startDate) {
                $query->where('date', '>=', $startDate);
            }

            if ($endDate) {
                $query->where('date', '<=', $endDate);
            }

            if ($subjectId) {
                $query->where('subject_id', $subjectId);
            }

            return $query->orderBy('date', 'desc')
                ->orderBy('start_time')
                ->get()
                ->map(function ($availability) {
                    $dateFormatted = '';
                    if ($availability->date) {
                        if ($availability->date instanceof Carbon) {
                            $dateFormatted = $availability->date->format('Y-m-d');
                        } else {
                            $dateFormatted = Carbon::parse($availability->date)->format('Y-m-d');
                        }
                    }

                    $startTimeFormatted = '';
                    if ($availability->start_time) {
                        try {
                            if (is_string($availability->start_time)) {
                                $startTimeFormatted = Carbon::createFromTimeString($availability->start_time)->format('H:i');
                            } elseif ($availability->start_time instanceof Carbon) {
                                $startTimeFormatted = $availability->start_time->format('H:i');
                            }
                        } catch (\Exception $e) {
                            $startTimeFormatted = is_string($availability->start_time) ? substr($availability->start_time, 0, 5) : '';
                        }
                    }

                    $endTimeFormatted = '';
                    if ($availability->end_time) {
                        try {
                            if (is_string($availability->end_time)) {
                                $endTimeFormatted = Carbon::createFromTimeString($availability->end_time)->format('H:i');
                            } elseif ($availability->end_time instanceof Carbon) {
                                $endTimeFormatted = $availability->end_time->format('H:i');
                            }
                        } catch (\Exception $e) {
                            $endTimeFormatted = is_string($availability->end_time) ? substr($availability->end_time, 0, 5) : '';
                        }
                    }

                    $subjectName = '';
                    if ($availability->subject_id) {
                        $subject = Subject::find($availability->subject_id);
                        $subjectName = $subject ? $subject->name_ar : '';
                    }

                    return [
                        'id' => $availability->id,
                        'date' => $dateFormatted,
                        'start_time' => $startTimeFormatted,
                        'end_time' => $endTimeFormatted,
                        'status' => $availability->status,
                        'booking_id' => $availability->booking_id,
                        'subject_id' => $availability->subject_id,
                        'subject_name' => $subjectName,
                    ];
                });
        }, 300); // Cache for 5 minutes
    }

    public function getTeacherSubjects(int $teacherId): Collection
    {
        $cacheKey = "teacher_subjects_{$teacherId}";
        $cacheTag = "teacher_{$teacherId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($teacherId) {
            $teacher = Teacher::with('subjectsRelation')->findOrFail($teacherId);
            $subjects = collect();

            if ($teacher->subjectsRelation && $teacher->subjectsRelation->isNotEmpty()) {
                $subjects = $teacher->subjectsRelation->map(function ($subject) {
                    return [
                        'id' => $subject->id,
                        'name_ar' => $subject->name_ar,
                        'name_en' => $subject->name_en,
                    ];
                });
            }

            $subjectsFromJson = is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true);
            if (!empty($subjectsFromJson) && is_array($subjectsFromJson)) {
                foreach ($subjectsFromJson as $subjectName) {
                    if (empty($subjectName)) continue;

                    $subjectModel = Subject::where(function ($q) use ($subjectName) {
                        $q->where('name_ar', $subjectName)
                            ->orWhere('name_en', $subjectName);
                    })->first();

                    if ($subjectModel) {
                        $exists = $subjects->contains(function ($item) use ($subjectModel) {
                            return isset($item['id']) && $item['id'] === $subjectModel->id;
                        });

                        if (!$exists) {
                            $subjects->push([
                                'id' => $subjectModel->id,
                                'name_ar' => $subjectModel->name_ar,
                                'name_en' => $subjectModel->name_en,
                            ]);
                        }
                    }
                }
            }

            return $subjects->unique('id')->values();
        }, 600); // Cache for 10 minutes
    }

    public function createAvailability(array $data, int $teacherId): TeacherAvailability
    {
        $teacher = Teacher::findOrFail($teacherId);

        // Validate subject if provided
        $subjectId = null;
        if (isset($data['subject_id']) && $data['subject_id'] !== '' && $data['subject_id'] !== null && $data['subject_id'] !== 'null') {
            $subjectId = $data['subject_id'];
            $subjectModel = Subject::find($subjectId);
            if (!$subjectModel) {
                throw new \Exception('المادة المحددة غير موجودة');
            }

            $teachesSubject = $teacher->subjectsRelation()->where('subjects.id', $subjectId)->exists();
            if (!$teachesSubject) {
                $subjectName = $subjectModel->name_ar;
                $teacherSubjects = is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true);
                $teacherSubjectsEn = is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true);

                $hasSubject = in_array($subjectName, $teacherSubjects) ||
                    in_array($subjectModel->name_en, $teacherSubjectsEn);

                if (!$hasSubject) {
                    throw new \Exception('هذا المعلم لا يدرس هذه المادة');
                }
            }
        }

        // Check for overlapping availabilities
        $overlappingQuery = TeacherAvailability::where('teacher_id', $teacherId)
            ->where('date', $data['date'])
            ->where(function ($query) use ($subjectId) {
                if ($subjectId) {
                    $query->where('subject_id', $subjectId);
                } else {
                    $query->whereNull('subject_id');
                }
            })
            ->where(function ($query) use ($data) {
                $query->where(function ($q) use ($data) {
                    $q->where('start_time', '<', $data['end_time'])
                        ->where('end_time', '>', $data['start_time']);
                });
            });

        if ($overlappingQuery->exists()) {
            throw new \Exception('هذا الوقت متداخل مع موعد آخر موجود');
        }

        $availability = TeacherAvailability::create([
            'teacher_id' => $teacherId,
            'subject_id' => $subjectId,
            'date' => $data['date'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'status' => 'available',
        ]);

        // Clear cache
        $this->forgetCacheTags(["teacher_availabilities_{$teacherId}", "teacher_{$teacherId}"]);

        return $availability;
    }

    public function updateAvailability(TeacherAvailability $availability, array $data, int $teacherId): TeacherAvailability
    {
        // Verify ownership
        if ($availability->teacher_id !== $teacherId) {
            throw new \Exception('غير مصرح لك بتعديل هذا الموعد');
        }

        if ($availability->status === 'booked') {
            throw new \Exception('لا يمكن تعديل موعد محجوز');
        }

        $teacher = $availability->teacher;

        // Validate subject if provided
        $subjectId = null;
        if (isset($data['subject_id']) && $data['subject_id'] !== '' && $data['subject_id'] !== null && $data['subject_id'] !== 'null') {
            $subjectId = $data['subject_id'];
            $subjectModel = Subject::find($subjectId);
            if (!$subjectModel) {
                throw new \Exception('المادة المحددة غير موجودة');
            }

            $teachesSubject = $teacher->subjectsRelation()->where('subjects.id', $subjectId)->exists();
            if (!$teachesSubject) {
                $subjectName = $subjectModel->name_ar;
                $teacherSubjects = is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true);
                $teacherSubjectsEn = is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true);

                $hasSubject = in_array($subjectName, $teacherSubjects) ||
                    in_array($subjectModel->name_en, $teacherSubjectsEn);

                if (!$hasSubject) {
                    throw new \Exception('هذا المعلم لا يدرس هذه المادة');
                }
            }
        }

        // Check for overlapping availabilities (excluding current)
        $overlapping = TeacherAvailability::where('teacher_id', $teacherId)
            ->where('id', '!=', $availability->id)
            ->where('date', $data['date'])
            ->where(function ($query) use ($subjectId) {
                if ($subjectId) {
                    $query->where('subject_id', $subjectId);
                } else {
                    $query->whereNull('subject_id');
                }
            })
            ->where(function ($query) use ($data) {
                $query->where(function ($q) use ($data) {
                    $q->where('start_time', '<', $data['end_time'])
                        ->where('end_time', '>', $data['start_time']);
                });
            })
            ->exists();

        if ($overlapping) {
            throw new \Exception('هذا الوقت متداخل مع وقت آخر');
        }

        $availability->update([
            'date' => $data['date'],
            'subject_id' => $subjectId,
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
        ]);

        // Clear cache
        $this->forgetCacheTags(["teacher_availabilities_{$teacherId}", "teacher_{$teacherId}"]);

        return $availability->fresh();
    }

    public function deleteAvailability(TeacherAvailability $availability, int $teacherId): bool
    {
        // Verify ownership
        if ($availability->teacher_id !== $teacherId) {
            throw new \Exception('غير مصرح لك بحذف هذا الموعد');
        }

        if ($availability->status === 'booked') {
            throw new \Exception('لا يمكن حذف موعد محجوز');
        }

        $deleted = $availability->delete();

        // Clear cache
        $this->forgetCacheTags(["teacher_availabilities_{$teacherId}", "teacher_{$teacherId}"]);

        return $deleted;
    }
}

