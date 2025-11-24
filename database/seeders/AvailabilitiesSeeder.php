<?php

namespace Database\Seeders;

use App\Models\Teacher;
use App\Models\TeacherAvailability;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class AvailabilitiesSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = Teacher::all();

        foreach ($teachers as $teacher) {
            $startDate = Carbon::now()->startOfWeek();

            for ($week = 0; $week < 2; $week++) {
                $currentWeekStart = $startDate->copy()->addWeeks($week);
                for ($day = 0; $day < 5; $day++) {
                    $date = $currentWeekStart->copy()->addDays($day);
                    if ($date->isWeekend()) {
                        continue;
                    }
                    $numSlots = rand(2, 3);

                    for ($slot = 0; $slot < $numSlots; $slot++) {
                        $startHour = rand(9, 16);
                        $startMinute = rand(0, 1) * 30;

                        $startTime = Carbon::parse($date->format('Y-m-d') . ' ' . sprintf('%02d:%02d', $startHour, $startMinute));
                        $endTime = $startTime->copy()->addHour();

                        $overlapping = TeacherAvailability::where('teacher_id', $teacher->id)
                            ->where('date', $date->format('Y-m-d'))
                            ->where(function ($query) use ($startTime, $endTime) {
                                $query->whereBetween('start_time', [$startTime, $endTime])
                                    ->orWhereBetween('end_time', [$startTime, $endTime])
                                    ->orWhere(function ($q) use ($startTime, $endTime) {
                                        $q->where('start_time', '<=', $startTime)
                                            ->where('end_time', '>=', $endTime);
                                    });
                            })
                            ->exists();

                        if (!$overlapping) {
                            TeacherAvailability::create([
                                'teacher_id' => $teacher->id,
                                'date' => $date->format('Y-m-d'),
                                'start_time' => $startTime,
                                'end_time' => $endTime,
                                'status' => 'available',
                            ]);
                        }
                    }
                }
            }
        }
    }
}
