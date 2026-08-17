<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Teacher;
use App\Models\Publication;
use Carbon\Carbon;
use Illuminate\Support\Str;

class MagazineDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Starting Magazine Demo Seed (School + Students + Teachers + Publications)...');

        $school = User::create([
            'name' => 'مدرسة الابتكار العملي',
            'email' => 'school.demo@example.com',
            'password' => bcrypt('password'),
            'role' => 'school',
            'phone' => '0501234567',
            'institution' => 'مدرسة ثانوية',
            'bio' => 'مدرسة مختصة في تطوير المواهب والابتكار في المملكة العربية السعودية',
            'email_verified_at' => now(),
        ]);
        $this->command->line("✓ Created school: {$school->name}");

        // Create 2 Teachers
        $teachersData = [
            [
                'name' => 'أ.د أحمد محمد الحربي',
                'name_ar' => 'أ.د أحمد محمد الحربي',
                'name_en' => 'Dr. Ahmad Al-Harbi',
                'subjects' => ['STEM', 'Robotics', 'Programming'],
                'stages' => ['Middle', 'High'],
                'bio' => 'متخصص في تدريس العلوم والتكنولوجيا والابتكار',
                'email' => 'ahmad.teacher@example.com',
            ],
            [
                'name' => 'أ. فاطمة علي الشهري',
                'name_ar' => 'أ. فاطمة علي الشهري',
                'name_en' => 'Fatima Al-Shehri',
                'subjects' => ['Arts', 'Literature', 'Design'],
                'stages' => ['Elementary', 'Middle'],
                'bio' => 'معلمة فنون وأدب مع خبرة في التصميم التعليمي',
                'email' => 'fatima.teacher@example.com',
            ],
        ];

        $teachers = [];
        foreach ($teachersData as $data) {
            $teacher = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => bcrypt('password'),
                'role' => 'teacher',
                'school_id' => $school->id,
                'phone' => '05' . rand(10000000, 99999999),
                'bio' => $data['bio'],
                'email_verified_at' => now(),
            ]);

            Teacher::create([
                'user_id' => $teacher->id,
                'name_ar' => $data['name_ar'],
                'name_en' => $data['name_en'],
                'nationality' => 'Saudi Arabia',
                'gender' => 'male',
                'qualifications' => 'Demo qualifications',
                'subjects' => json_encode($data['subjects']),
                'stages' => json_encode($data['stages']),
                'experience_years' => rand(5, 20),
                'city' => 'Riyadh',
                'neighborhoods' => json_encode(['Al Olaya']),
                'price_per_hour' => 150,
                'is_verified' => true,
                'is_active' => true,
                'bio' => $data['bio'],
            ]);

            $teachers[] = $teacher;
            $this->command->line("✓ Created teacher: {$teacher->name}");
        }

        // Create 30 Students with various skills
        $skills = ['robotics', 'coding', 'design', 'writing', 'math', 'science', 'art', 'music'];
        $grades = ['6', '7', '8', '9', '10', '11', '12'];

        $students = [];
        for ($i = 1; $i <= 30; $i++) {
            $student = User::create([
                'name' => 'طالب رقم ' . $i,
                'email' => 'student' . $i . '@example.com',
                'password' => bcrypt('password'),
                'role' => 'student',
                'school_id' => $school->id,
                'phone' => '05' . rand(10000000, 99999999),
                'year' => $grades[array_rand($grades)],
                'email_verified_at' => now(),
            ]);

            // Assign random 2-3 skills
            $studentSkills = array_slice($skills, 0, rand(2, 3));
            foreach ($studentSkills as $skillName) {
                \App\Models\UserSkill::create([
                    'user_id' => $student->id,
                    'name' => $skillName,
                    'category' => 'technical',
                    'source' => 'manual',
                    'proficiency_level' => 'beginner',
                ]);
            }

            $students[] = $student;
        }
        $this->command->line("✓ Created 30 students");

        // Create 20 Publications across different authors
        $publicationTopics = [
            [
                'title_ar' => 'المستقبل الرقمي والابتكار التعليمي',
                'title_en' => 'Digital Future and Educational Innovation',
                'description_ar' => 'دراسة شاملة عن دور التكنولوجيا في تحويل التعليم',
                'description_en' => 'A comprehensive study on the role of technology in transforming education',
                'type' => 'magazine',
            ],
            [
                'title_ar' => 'الروبوتات في الفصل الدراسي',
                'title_en' => 'Robots in the Classroom',
                'description_ar' => 'كيف يمكن للروبوتات تحسين التعلم العملي',
                'description_en' => 'How robots can improve hands-on learning',
                'type' => 'magazine',
            ],
            [
                'title_ar' => 'الإبداع والتصميم: رحلة من الفكرة إلى الواقع',
                'title_en' => 'Creativity and Design: From Idea to Reality',
                'description_ar' => 'مشاريع تصميمية ناجحة من طلابنا',
                'description_en' => 'Successful design projects from our students',
                'type' => 'booklet',
            ],
            [
                'title_ar' => 'البرمجة للمبتدئين: دليل عملي',
                'title_en' => 'Programming for Beginners: A Practical Guide',
                'description_ar' => 'أساسيات البرمجة بطريقة سهلة وممتعة',
                'description_en' => 'Programming basics in an easy and fun way',
                'type' => 'booklet',
            ],
            [
                'title_ar' => 'قصص النجاح من داخل المدرسة',
                'title_en' => 'Success Stories from Inside the School',
                'description_ar' => 'تجارب ملهمة من طلابنا والمعلمين',
                'description_en' => 'Inspiring experiences from our students and teachers',
                'type' => 'report',
            ],
            [
                'title_ar' => 'الذكاء الاصطناعي في التعليم',
                'title_en' => 'Artificial Intelligence in Education',
                'description_ar' => 'كيف يغير الذكاء الاصطناعي طرق التدريس',
                'description_en' => 'How AI is changing teaching methods',
                'type' => 'magazine',
            ],
            [
                'title_ar' => 'المشاريع البيئية والاستدامة',
                'title_en' => 'Environmental Projects and Sustainability',
                'description_ar' => 'مبادرات الطلاب نحو بيئة أخضر',
                'description_en' => 'Student initiatives towards a greener environment',
                'type' => 'magazine',
            ],
            [
                'title_ar' => 'فنون التواصل الفعال',
                'title_en' => 'The Art of Effective Communication',
                'description_ar' => 'مهارات التواصل الأساسية للقادة الشباب',
                'description_en' => 'Essential communication skills for young leaders',
                'type' => 'magazine',
            ],
            [
                'title_ar' => 'تحديات الابتكار والحلول الإبداعية',
                'title_en' => 'Innovation Challenges and Creative Solutions',
                'description_ar' => 'كيف تحول الطلاب التحديات إلى فرص',
                'description_en' => 'How students turn challenges into opportunities',
                'type' => 'booklet',
            ],
            [
                'title_ar' => 'الرياضيات في الحياة اليومية',
                'title_en' => 'Mathematics in Daily Life',
                'description_ar' => 'تطبيقات عملية للمفاهيم الرياضية',
                'description_en' => 'Practical applications of mathematical concepts',
                'type' => 'magazine',
            ],
            [
                'title_ar' => 'أثر التعلم التعاوني على الإنجاز',
                'title_en' => 'The Impact of Collaborative Learning on Achievement',
                'description_ar' => 'دراسة تحليلية لفعالية التعلم الجماعي',
                'description_en' => 'An analytical study on the effectiveness of group learning',
                'type' => 'report',
            ],
            [
                'title_ar' => 'المستكشفون الصغار: رحلات استكشافية',
                'title_en' => 'Young Explorers: Exploratory Journeys',
                'description_ar' => 'تجارب استكشافية لطلاب المرحلة الابتدائية',
                'description_en' => 'Exploratory experiences for elementary students',
                'type' => 'magazine',
            ],
            [
                'title_ar' => 'الموسيقى والعلوم: تفاعل إبداعي',
                'title_en' => 'Music and Science: A Creative Interaction',
                'description_ar' => 'كيف تتقاطع الموسيقى والعلوم في الابتكار',
                'description_en' => 'How music and science intersect in innovation',
                'type' => 'magazine',
            ],
            [
                'title_ar' => 'القيادة الشابة والمسؤولية الاجتماعية',
                'title_en' => 'Youth Leadership and Social Responsibility',
                'description_ar' => 'تطوير قادة مسؤولين اجتماعياً',
                'description_en' => 'Developing socially responsible leaders',
                'type' => 'booklet',
            ],
            [
                'title_ar' => 'الكتابة الإبداعية والخيال',
                'title_en' => 'Creative Writing and Imagination',
                'description_ar' => 'استكشاف قوة الكلمات والخيال الإبداعي',
                'description_en' => 'Exploring the power of words and creative imagination',
                'type' => 'magazine',
            ],
            [
                'title_ar' => 'التاريخ الحي: من الماضي إلى الحاضر',
                'title_en' => 'Living History: From Past to Present',
                'description_ar' => 'دروس من التاريخ لفهم حاضرنا',
                'description_en' => 'Lessons from history to understand our present',
                'type' => 'magazine',
            ],
            [
                'title_ar' => 'الرياضة والصحة العقلية',
                'title_en' => 'Sports and Mental Health',
                'description_ar' => 'العلاقة بين النشاط البدني والسعادة',
                'description_en' => 'The relationship between physical activity and happiness',
                'type' => 'report',
            ],
            [
                'title_ar' => 'تقنيات حل المشاكل الإبداعية',
                'title_en' => 'Techniques for Creative Problem Solving',
                'description_ar' => 'أساليب عملية لحل التحديات بإبداع',
                'description_en' => 'Practical methods for solving challenges creatively',
                'type' => 'booklet',
            ],
            [
                'title_ar' => 'الذاكرة والتعلم الفعال',
                'title_en' => 'Memory and Effective Learning',
                'description_ar' => 'استراتيجيات لتحسين الذاكرة والفهم',
                'description_en' => 'Strategies to improve memory and understanding',
                'type' => 'magazine',
            ],
            [
                'title_ar' => 'مستقبل المهن: الاتجاهات الناشئة',
                'title_en' => 'Future of Professions: Emerging Trends',
                'description_ar' => 'المهن المستقبلية والمهارات المطلوبة',
                'description_en' => 'Future professions and required skills',
                'type' => 'report',
            ],
        ];

        foreach ($publicationTopics as $index => $topic) {
            $author = $students[array_rand($students)];

            Publication::create([
                'author_id' => $author->id,
                'school_id' => $school->id,
                'type' => $topic['type'],
                'title' => $topic['title_ar'],
                'title_ar' => $topic['title_ar'],
                'description' => $topic['description_ar'],
                'description_ar' => $topic['description_ar'],
                'content' => '<p>' . $topic['description_ar'] . '</p><p>هذا نص توضيحي يمثل محتوى المنشور الفعلي...</p>',
                'content_ar' => '<p>' . $topic['description_ar'] . '</p><p>هذا نص توضيحي يمثل محتوى المنشور الفعلي...</p>',
                'status' => 'approved',
                'approved_by' => $teachers[array_rand($teachers)]->id,
                'approved_at' => Carbon::now()->subDays(rand(1, 60)),
                'publish_date' => Carbon::now()->subDays(rand(1, 60)),
                'issue_number' => 1,
                'publisher_name' => $school->name,
                'views' => rand(10, 500),
                'likes_count' => rand(0, 100),
            ]);
        }
        $this->command->line("✓ Created 20 publications");

        $this->command->info('✅ Magazine Demo Seed completed successfully!');
        $this->command->line("Summary:");
        $this->command->line("  - 1 School: {$school->name}");
        $this->command->line("  - 2 Teachers");
        $this->command->line("  - 30 Students with diverse skills");
        $this->command->line("  - 20 Publications (articles, magazines, booklets, reports)");
    }
}
