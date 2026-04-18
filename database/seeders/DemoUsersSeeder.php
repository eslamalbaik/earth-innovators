<?php

namespace Database\Seeders;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class DemoUsersSeeder extends Seeder
{
    public function run(): array
    {
        $faker = Faker::create();
        // Deterministic demo accounts
        $systemSupervisor = User::updateOrCreate(
            ['email' => 'supervisor@demo.com'],
            [
                'name' => 'System Supervisor',
                'password' => Hash::make('password'),
                'role' => 'system_supervisor',
                'membership_type' => 'subscription',
                'points' => 0,
            ]
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'membership_type' => 'subscription',
                'points' => 0,
            ]
        );

        $schoolCoordinator = User::updateOrCreate(
            ['email' => 'coordinator@demo.com'],
            [
                'name' => 'School Support Coordinator',
                'password' => Hash::make('password'),
                'role' => 'school_support_coordinator',
                'membership_type' => 'subscription',
                'points' => 0,
            ]
        );

        $school = User::updateOrCreate(
            ['email' => 'school@demo.com'],
            [
                'name' => 'Demo School',
                'password' => Hash::make('password'),
                'role' => 'school',
                'membership_type' => 'subscription',
                'institution' => 'Demo School',
                'points' => 0,
            ]
        );

        $institution = User::updateOrCreate(
            ['email' => 'institution@demo.com'],
            [
                'name' => 'Demo Educational Institution',
                'password' => Hash::make('password'),
                'role' => 'educational_institution',
                'membership_type' => 'subscription',
                'institution' => 'Demo Educational Institution',
                'points' => 0,
            ]
        );

        // Teachers linked to the school
        $teacherUsers = [];
        for ($i = 1; $i <= 2; $i++) {
            $teacherUsers[] = User::updateOrCreate(
                ['email' => "teacher{$i}@demo.com"],
                [
                    'name' => "Demo Teacher {$i}",
                    'password' => Hash::make('password'),
                    'role' => 'teacher',
                    'school_id' => $school->id,
                    'membership_type' => 'subscription',
                    'points' => 0,
                ]
            );
        }

        $teachers = [];
        foreach ($teacherUsers as $tu) {
            $teachers[] = Teacher::updateOrCreate(
                ['user_id' => $tu->id],
                [
                    'name_ar' => $tu->name,
                    'name_en' => $tu->name,
                    'nationality' => 'UAE',
                    'gender' => 'male',
                    'bio' => 'Demo teacher profile.',
                    'qualifications' => 'Demo qualifications',
                    'subjects' => ['Mathematics', 'Science'],
                    'stages' => ['primary', 'middle'],
                    'experience_years' => 5,
                    'city' => 'Dubai',
                    'neighborhoods' => ['Business Bay'],
                    'price_per_hour' => 150,
                    'is_verified' => true,
                    'is_active' => true,
                ]
            );
        }

        // Students linked to the school and assigned to a primary teacher (users.teacher_id)
        $students = [];
        for ($i = 1; $i <= 12; $i++) {
            $assignedTeacherUser = $teacherUsers[($i - 1) % count($teacherUsers)];

            $students[] = User::updateOrCreate(
                ['email' => "student{$i}@demo.com"],
                [
                    'name' => "Demo Student {$i}",
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'school_id' => $school->id,
                    'teacher_id' => $assignedTeacherUser->id,
                    'membership_type' => 'basic',
                    'membership_number' => sprintf('S%05d', $i),
                    'year' => (string) fake()->numberBetween(1, 12),
                    'points' => fake()->numberBetween(0, 120),
                ]
            );
        }

        return [
            'systemSupervisor' => $systemSupervisor,
            'admin' => $admin,
            'schoolCoordinator' => $schoolCoordinator,
            'school' => $school,
            'institution' => $institution,
            'teacherUsers' => $teacherUsers,
            'teachers' => $teachers,
            'students' => $students,
        ];
    }
}

