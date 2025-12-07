<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class ReviewsSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = Teacher::where('is_active', true)->where('is_verified', true)->get();

        if ($teachers->isEmpty()) {
            $this->command->warn('No active teachers found. Please run TeachersSeeder first.');
            return;
        }

        $testimonials = [
            [
                'reviewer_name' => 'سارة أحمد',
                'reviewer_location' => 'الرياض',
                'rating' => 5.0,
                'comment' => 'منصة إرث المبتكرين ساعدتني كثيراً في عرض مشاريعي الإبداعية والحصول على تقييمات من المعلمين. التحديات والمسابقات شجعتني على الابتكار أكثر. أنصح جميع الطلاب بتجربة هذه المنصة المميزة.',
            ],
            [
                'reviewer_name' => 'فاطمة محمد',
                'reviewer_location' => 'جدة',
                'rating' => 5.0,
                'comment' => 'كمديرة مدرسة، منصة إرث المبتكرين ساعدتنا في تنظيم مشاريع الطلاب وتشجيعهم على الإبداع. النظام سهل الاستخدام والنتائج واضحة. الطلاب أصبحوا أكثر حماساً للمشاركة في التحديات والمسابقات.',
            ],
            [
                'reviewer_name' => 'أم خالد',
                'reviewer_location' => 'الدمام',
                'rating' => 4.9,
                'comment' => 'منصة إرث المبتكرين منصة رائعة لطلابنا. ابنتي شاركت في عدة تحديات وحصلت على شارات ونقاط. النظام واضح وسهل الاستخدام. شكراً لكم على هذه المبادرة الرائعة.',
            ],
            [
                'reviewer_name' => 'أحمد علي',
                'reviewer_location' => 'الرياض',
                'rating' => 4.8,
                'comment' => 'كمعلم، استخدمت منصة إرث المبتكرين لتقييم مشاريع الطلاب وتشجيعهم. النظام سهل الاستخدام والواجهة جميلة. الطلاب يستمتعون بالمشاركة في التحديات والحصول على الشارات.',
            ],
            [
                'reviewer_name' => 'أبو ناصر',
                'reviewer_location' => 'مكة المكرمة',
                'rating' => 4.7,
                'comment' => 'ابني شارك في عدة مشاريع على منصة إرث المبتكرين وحصل على تقييمات إيجابية. التحديات شجعته على الابتكار والإبداع. المنصة سهلة الاستخدام والنتائج واضحة.',
            ],
            [
                'reviewer_name' => 'محمد خالد',
                'reviewer_location' => 'الرياض',
                'rating' => 5.0,
                'comment' => 'منصة إرث المبتكرين ساعدتني في تطوير مهاراتي الإبداعية. التحديات متنوعة والشارات تشجعني على المشاركة أكثر. أنصح جميع الطلاب بتجربة هذه المنصة الرائعة.',
            ]
        ];

        $reviewCount = 0;

        foreach ($teachers as $teacher) {
            $reviewsForTeacher = rand(3, 8);

            for ($i = 0; $i < $reviewsForTeacher && $reviewCount < count($testimonials); $i++) {
                $testimonial = $testimonials[$reviewCount % count($testimonials)];

                $student = User::where('role', 'student')->inRandomOrder()->first();
                $booking = Booking::where('teacher_id', $teacher->id)->inRandomOrder()->first();

                $reviewData = [
                    'teacher_id' => $teacher->id,
                    'booking_id' => $booking ? $booking->id : null,
                    'reviewer_name' => $testimonial['reviewer_name'],
                    'reviewer_location' => $testimonial['reviewer_location'],
                    'rating' => $testimonial['rating'],
                    'comment' => $testimonial['comment'],
                    'is_published' => true,
                    'created_at' => now()->subDays(rand(1, 90)),
                    'updated_at' => now()->subDays(rand(1, 90)),
                ];

                if ($student && Schema::hasColumn('reviews', 'student_id')) {
                    $reviewData['student_id'] = $student->id;
                }

                Review::create($reviewData);

                $reviewCount++;
            }
        }
    }
}
