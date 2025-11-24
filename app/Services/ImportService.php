<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Teacher;
use App\Models\TeacherAvailability;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ImportService extends BaseService
{
    public function parseCsvFile(string $path, array $requiredHeaders): array
    {
        $rows = [];
        $errors = [];
        
        if (($handle = fopen($path, 'r')) === false) {
            return [[], ['فشل فتح الملف']];
        }
        
        $header = fgetcsv($handle, 0, ',');
        if (!$header) {
            fclose($handle);
            return [[], ['لا يوجد صف رؤوس']];
        }
        
        $missing = array_values(array_diff($requiredHeaders, $header));
        if (!empty($missing)) {
            fclose($handle);
            return [[], ['أعمدة مفقودة: ' . implode(', ', $missing)]];
        }
        
        $line = 1;
        while (($row = fgetcsv($handle, 0, ',')) !== false) {
            $line++;
            if (count($row) !== count($header)) {
                $errors[] = "سطر {$line}: عدد الأعمدة غير متطابق";
                continue;
            }
            $rows[] = array_combine($header, $row);
        }
        
        fclose($handle);
        return [$rows, $errors];
    }

    public function importStudents(array $rows): array
    {
        $inserted = 0;
        $skipped = 0;
        $errors = [];

        foreach ($rows as $index => $data) {
            try {
                if (User::where('email', $data['email'])->exists()) {
                    $skipped++;
                    continue;
                }

                User::create([
                    'name' => $data['name'] ?? 'Student',
                    'email' => $data['email'],
                    'password' => Hash::make($data['password'] ?? 'password123'),
                    'role' => 'student',
                ]);
                $inserted++;
            } catch (\Exception $e) {
                $errors[] = "سطر " . ($index + 2) . ": " . $e->getMessage();
            }
        }

        return [
            'inserted' => $inserted,
            'skipped' => $skipped,
            'errors' => $errors,
        ];
    }

    public function importTeachers(array $rows): array
    {
        $inserted = 0;
        $skipped = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($rows as $index => $data) {
                try {
                    if (empty($data['email']) || empty($data['name_ar'])) {
                        $skipped++;
                        continue;
                    }

                    if (User::where('email', $data['email'])->exists()) {
                        $skipped++;
                        continue;
                    }

                    $user = User::create([
                        'name' => $data['name_ar'],
                        'email' => $data['email'],
                        'password' => Hash::make($data['password'] ?? 'password123'),
                        'role' => 'teacher',
                        'email_verified_at' => now(),
                    ]);

                    Teacher::create([
                        'user_id' => $user->id,
                        'name_ar' => $data['name_ar'],
                        'name_en' => $data['name_en'] ?? null,
                        'city' => $data['city'] ?? null,
                        'nationality' => $data['nationality'] ?? null,
                        'price_per_hour' => (float) ($data['price_per_hour'] ?? 0),
                        'subjects' => isset($data['subjects']) ? explode('|', $data['subjects']) : [],
                        'stages' => isset($data['stages']) ? explode('|', $data['stages']) : [],
                        'neighborhoods' => [],
                        'experience_years' => (int) ($data['experience_years'] ?? 0),
                        'is_active' => true,
                    ]);

                    $inserted++;
                } catch (\Exception $e) {
                    $errors[] = "سطر " . ($index + 2) . ": " . $e->getMessage();
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return [
                'inserted' => 0,
                'skipped' => 0,
                'errors' => ['فشل الاستيراد: ' . $e->getMessage()],
            ];
        }

        return [
            'inserted' => $inserted,
            'skipped' => $skipped,
            'errors' => $errors,
        ];
    }

    public function importBookings(array $rows): array
    {
        $inserted = 0;
        $skipped = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($rows as $index => $data) {
                try {
                    $student = User::where('email', $data['student_email'] ?? null)->first();
                    $teacher = User::where('email', $data['teacher_email'] ?? null)->first();
                    $availability = isset($data['availability_id']) 
                        ? TeacherAvailability::find($data['availability_id']) 
                        : null;

                    if (!$student || !$teacher || !$availability) {
                        $skipped++;
                        continue;
                    }

                    Booking::create([
                        'student_id' => $student->id,
                        'teacher_id' => $teacher->id,
                        'availability_id' => $availability->id,
                        'status' => $data['status'] ?? 'pending',
                        'price' => (float) ($data['price'] ?? 0),
                        'payment_status' => $data['payment_status'] ?? 'pending',
                        'payment_method' => $data['payment_method'] ?? null,
                        'payment_reference' => $data['payment_reference'] ?? null,
                    ]);

                    $inserted++;
                } catch (\Exception $e) {
                    $errors[] = "سطر " . ($index + 2) . ": " . $e->getMessage();
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return [
                'inserted' => 0,
                'skipped' => 0,
                'errors' => ['فشل استيراد الحجوزات: ' . $e->getMessage()],
            ];
        }

        return [
            'inserted' => $inserted,
            'skipped' => $skipped,
            'errors' => $errors,
        ];
    }
}

