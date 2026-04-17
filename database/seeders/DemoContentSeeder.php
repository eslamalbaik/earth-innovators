<?php

namespace Database\Seeders;

use App\Models\Badge;
use App\Models\Certificate;
use App\Models\Challenge;
use App\Models\ChallengeParticipation;
use App\Models\ChallengeSubmission;
use App\Models\Package;
use App\Models\Point;
use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\Publication;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DemoContentSeeder extends Seeder
{
    /**
     * @param array{
     *  admin: User,
     *  school: User,
     *  teacherUsers: array<int,User>,
     *  teachers: array<int,\App\Models\Teacher>,
     *  students: array<int,User>
     * } $context
     */
    public function run(array $context): void
    {
        $admin = $context['admin'];
        $school = $context['school'];
        $teacherUsers = $context['teacherUsers'];
        $teachers = $context['teachers'];
        $students = $context['students'];

        $imagePool = [
            'https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        ];

        // Give the school and one teacher an active package (so dashboards behave realistically)
        $schoolPackage = Package::where('name', 'School Premium')->first();
        $teacherPackage = Package::where('name', 'Teacher Premium')->first();
        $studentPackage = Package::where('name', 'Student Premium')->first();

        if ($schoolPackage) {
            $school->packages()->syncWithoutDetaching([
                $schoolPackage->id => [
                    'start_date' => now()->subDays(3),
                    'end_date' => now()->addMonth(),
                    'status' => 'active',
                    'auto_renew' => false,
                    'paid_amount' => (float) $schoolPackage->price,
                    'payment_method' => 'demo',
                    'transaction_id' => 'DEMO-SCHOOL-1',
                ],
            ]);
        }

        if ($teacherPackage && isset($teacherUsers[0])) {
            $teacherUsers[0]->packages()->syncWithoutDetaching([
                $teacherPackage->id => [
                    'start_date' => now()->subDays(2),
                    'end_date' => now()->addMonth(),
                    'status' => 'active',
                    'auto_renew' => false,
                    'paid_amount' => (float) $teacherPackage->price,
                    'payment_method' => 'demo',
                    'transaction_id' => 'DEMO-TEACHER-1',
                ],
            ]);
        }

        if ($studentPackage && isset($students[0])) {
            $students[0]->packages()->syncWithoutDetaching([
                $studentPackage->id => [
                    'start_date' => now()->subDays(1),
                    'end_date' => now()->addMonth(),
                    'status' => 'active',
                    'auto_renew' => false,
                    'paid_amount' => (float) $studentPackage->price,
                    'payment_method' => 'demo',
                    'transaction_id' => 'DEMO-STUDENT-1',
                ],
            ]);
        }

        // Badges
        $badgeApproved = Badge::updateOrCreate(
            ['name' => 'Outstanding Innovator'],
            [
                'name_ar' => 'مبتكر متميز',
                'description' => 'Demo badge',
                'points_required' => 50,
                'type' => 'custom',
                'icon' => '🏅',
                'image' => null,
                'status' => 'approved',
                'approved_by' => $admin->id,
                'approved_at' => now(),
            ]
        );

        // Projects (school-owned + general)
        $projects = [];
        for ($i = 1; $i <= 6; $i++) {
            $teacherUser = $teacherUsers[($i - 1) % count($teacherUsers)];
            $teacher = $teachers[($i - 1) % count($teachers)];
            $img = $imagePool[($i - 1) % count($imagePool)];
            $projects[] = Project::create([
                'user_id' => $teacherUser->id,
                'school_id' => $school->id,
                'teacher_id' => $teacher->id,
                'title' => "Demo Project {$i}",
                'description' => 'Demo project description.',
                'category' => ['science', 'technology', 'engineering', 'mathematics', 'arts', 'other'][($i - 1) % 6],
                'status' => $i <= 4 ? 'approved' : 'pending',
                'images' => [$img],
                'thumbnail' => $img,
                'points_earned' => 0,
            ]);
        }

        // Student submissions
        foreach (array_slice($students, 0, 8) as $idx => $student) {
            $project = $projects[$idx % count($projects)];

            ProjectSubmission::updateOrCreate(
                ['project_id' => $project->id, 'student_id' => $student->id],
                [
                    'files' => [],
                    'comment' => 'Demo submission',
                    'status' => $idx % 3 === 0 ? 'approved' : 'submitted',
                    'feedback' => $idx % 3 === 0 ? 'Great work!' : null,
                    'reviewed_by' => $school->id,
                    'submitted_at' => now()->subDays(10 - $idx),
                    'reviewed_at' => $idx % 3 === 0 ? now()->subDays(5 - $idx) : null,
                ]
            );

            // Points history
            Point::create([
                'user_id' => $student->id,
                'points' => 5 + $idx,
                'type' => 'earned',
                'source' => 'project',
                'source_id' => $project->id,
                'description' => 'Demo activity points',
                'description_ar' => 'نقاط تجريبية',
                'created_at' => now()->subDays(10 - $idx),
                'updated_at' => now()->subDays(10 - $idx),
            ]);

            // Award a badge to a couple of students
            if ($idx % 4 === 0) {
                DB::table('user_badges')->updateOrInsert(
                    [
                        'user_id' => $student->id,
                        'badge_id' => $badgeApproved->id,
                    ],
                    [
                        'project_id' => $project->id,
                        'awarded_by' => $school->id,
                        'challenge_id' => null,
                        'reason' => 'Demo award',
                        'earned_at' => now()->subDays(3),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        // Challenges + participations + submissions
        $challenges = [];
        for ($i = 1; $i <= 3; $i++) {
            $creator = $teacherUsers[($i - 1) % count($teacherUsers)];
            $img = $imagePool[($i - 1) % count($imagePool)];
            $challenges[] = Challenge::create([
                'created_by' => $creator->id,
                'school_id' => $school->id,
                'title' => "Demo Challenge {$i}",
                'objective' => 'Demo objective',
                'description' => 'Demo description',
                'instructions' => 'Demo instructions',
                'challenge_type' => 'custom',
                'category' => 'science',
                'age_group' => '10-13',
                'start_date' => now()->subDays(2),
                'deadline' => now()->addDays(15),
                'status' => 'active',
                'points_reward' => 20,
                'max_participants' => 50,
                'current_participants' => 0,
                'image' => $img,
            ]);
        }

        foreach (array_slice($students, 0, 6) as $idx => $student) {
            $challenge = $challenges[$idx % count($challenges)];

            ChallengeParticipation::updateOrCreate(
                ['challenge_id' => $challenge->id, 'user_id' => $student->id],
                [
                    'status' => 'joined',
                    'participation_type' => 'optional',
                    'joined_at' => now()->subDays(1),
                ]
            );

            ChallengeSubmission::updateOrCreate(
                ['challenge_id' => $challenge->id, 'student_id' => $student->id],
                [
                    'files' => [],
                    'answer' => 'Demo answer',
                    'comment' => 'Demo comment',
                    'status' => $idx % 2 === 0 ? 'approved' : 'submitted',
                    'feedback' => $idx % 2 === 0 ? 'Approved (demo)' : null,
                    'reviewed_by' => $school->id,
                    'rating' => $idx % 2 === 0 ? 9.5 : null,
                    'badges' => null,
                    'points_earned' => $idx % 2 === 0 ? 20 : 0,
                    'submitted_at' => now()->subDays(1),
                    'reviewed_at' => $idx % 2 === 0 ? now() : null,
                ]
            );
        }

        // Publications
        for ($i = 1; $i <= 4; $i++) {
            $author = $teacherUsers[($i - 1) % count($teacherUsers)];
            $img = $imagePool[($i - 1) % count($imagePool)];
            Publication::create([
                'author_id' => $author->id,
                'school_id' => $school->id,
                'title' => "Demo Publication {$i}",
                'description' => 'Demo publication description.',
                'type' => $i % 2 === 0 ? 'report' : 'magazine',
                'cover_image' => $img,
                'status' => 'approved',
                'approved_by' => $school->id,
                'approved_at' => now()->subDays(2),
                'publish_date' => now()->subDays(1),
                'publisher_name' => $school->name,
                'likes_count' => 0,
            ]);
        }

        // Certificates (mix of school-issued and teacher-requested)
        foreach (array_slice($students, 0, 4) as $idx => $student) {
            $status = $idx % 2 === 0 ? 'approved' : 'pending_school_approval';
            $certificateNumber = sprintf('CERT-DEMO-%04d', $student->id);

            Certificate::updateOrCreate([
                'certificate_number' => $certificateNumber,
            ], [
                'user_id' => $student->id,
                'school_id' => (string) $school->id,
                'type' => 'student',
                'status' => $status,
                'source' => $status === 'approved' ? 'school_direct' : 'teacher_request',
                'title' => "Demo Certificate {$idx}",
                'title_ar' => "شهادة تجريبية {$idx}",
                'description' => 'Demo certificate',
                'description_ar' => 'شهادة تجريبية',
                'issue_date' => now()->toDateString(),
                'expiry_date' => null,
                'template' => null,
                'file_path' => null,
                'issued_by' => $school->id,
                'requested_by' => $teacherUsers[0]->id,
                'reviewed_by' => $status === 'approved' ? $school->id : null,
                'approved_at' => $status === 'approved' ? now()->subDay() : null,
                'rejected_at' => null,
                'rejection_reason' => null,
                'is_active' => true,
                'therapeutic_plan' => null,
            ]);
        }
    }
}
