<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Teacher;
use App\Models\Review;
use App\Models\Booking;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class TeachersSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [
            [
                'name_ar' => 'محمد العتيبي',
                'name_en' => 'Mohammed Al-Otaibi',
                'email' => 'mohammed.alotaibi@example.com',
                'password' => 'password123',
                'nationality' => 'سعودي',
                'gender' => 'male',
                'bio' => 'مرحباً! أنا محمد العتيبي، معلم رياضيات بخبرة تزيد عن 8 سنوات في تدريس المراحل الابتدائية والمتوسطة. أحرص على تبسيط المفاهيم الرياضية وجعل التعلم ممتع وسهل الفهم للطلاب.',
                'qualifications' => "معلم رياضيات - مدرسة النخبة الأهلية\nمن 2018 - حتى الآن (7 سنوات)\nدبلوم تربوي في طرق التدريس الحديثة\nكلية التربية - جامعة الإمام محمد بن سعود الإسلامية\n2016\nبكالوريوس في الرياضيات\nجامعة الملك سعود\n2015",
                'subjects' => ['الرياضيات'],
                'stages' => ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس'],
                'experience_years' => 8,
                'city' => 'الرياض',
                'neighborhoods' => ['العليا', 'الوادي', 'النخيل'],
                'price_per_hour' => 20,
                'is_verified' => true,
                'is_active' => true,
            ],
            [
                'name_ar' => 'فاطمة الزهراني',
                'name_en' => 'Fatima Al-Zahrani',
                'email' => 'fatima.alzahrani@example.com',
                'password' => 'password123',
                'nationality' => 'سعودي',
                'gender' => 'female',
                'bio' => 'معلمة لغة إنجليزية محترفة بخبرة 6 سنوات. أهتم بتطوير مهارات الطلاب في اللغة الإنجليزية من خلال أنشطة تفاعلية وحديثة.',
                'qualifications' => "معلمة لغة إنجليزية - مدرسة الإبداع الخاصة\nمن 2019 - حتى الآن (5 سنوات)\nشهادة تدريب معتمد في تدريس اللغة الإنجليزية\nجامعة الملك سعود\n2020\nبكالوريوس في اللغة الإنجليزية\nجامعة الملك عبدالعزيز\n2018",
                'subjects' => ['اللغة الإنجليزية'],
                'stages' => ['الصف الأول', 'الصف الثاني', 'الصف الثالث', 'الصف الرابع', 'الصف الخامس', 'الصف السادس'],
                'experience_years' => 6,
                'city' => 'جدة',
                'neighborhoods' => ['الحمراء', 'الرويس', 'كورنيش'],
                'price_per_hour' => 10,
                'is_verified' => true,
                'is_active' => true,
            ],
            [
                'name_ar' => 'خالد الدوسري',
                'name_en' => 'Khalid Al-Dosari',
                'email' => 'khalid.aldosari@example.com',
                'password' => 'password123',
                'nationality' => 'سعودي',
                'gender' => 'male',
                'bio' => 'معلم علوم ورياضيات بخبرة 10 سنوات. أستخدم التجارب العملية والأنشطة التفاعلية لتعليم العلوم بشكل ممتع ومفهوم.',
                'qualifications' => "معلم علوم - المدرسة الدولية\nمن 2015 - حتى الآن (9 سنوات)\nمدرب دورات تقوية في العلوم والرياضيات\nمركز النجاح التعليمي\n2015 - 2017\nماجستير في العلوم التربوية\nجامعة الملك سعود\n2015\nبكالوريوس في العلوم\nجامعة الملك فهد للبترول والمعادن\n2012",
                'subjects' => ['العلوم', 'الرياضيات'],
                'stages' => ['الصف الرابع', 'الصف الخامس', 'الصف السادس'],
                'experience_years' => 10,
                'city' => 'الدمام',
                'neighborhoods' => ['الكورنيش', 'الدمام الجديدة', 'الحسينية'],
                'price_per_hour' => 12,
                'is_verified' => true,
                'is_active' => true,
            ],
        ];

        foreach ($teachers as $teacherData) {
            $existingUser = User::where('email', $teacherData['email'])->first();

            if ($existingUser) {
                $this->command->info("Teacher {$teacherData['name_ar']} already exists, skipping...");
                continue;
            }

            $user = User::create([
                'name' => $teacherData['name_ar'],
                'email' => $teacherData['email'],
                'password' => Hash::make($teacherData['password']),
                'role' => 'teacher',
                'email_verified_at' => now(),
            ]);

            $teacher = Teacher::create([
                'user_id' => $user->id,
                'name_ar' => $teacherData['name_ar'],
                'name_en' => $teacherData['name_en'],
                'nationality' => $teacherData['nationality'],
                'gender' => $teacherData['gender'],
                'bio' => $teacherData['bio'],
                'qualifications' => $teacherData['qualifications'],
                'subjects' => $teacherData['subjects'],
                'stages' => $teacherData['stages'],
                'experience_years' => $teacherData['experience_years'],
                'city' => $teacherData['city'],
                'neighborhoods' => $teacherData['neighborhoods'],
                'price_per_hour' => $teacherData['price_per_hour'],
                'is_verified' => $teacherData['is_verified'],
                'is_active' => $teacherData['is_active'],
            ]);
        }
    }
}