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
                'reviewer_name' => 'أم خالد',
                'reviewer_location' => 'الرياض',
                'rating' => 5.0,
                'comment' => 'قبل ما أتعرف على معلمك كنت أعاني في البحث عن معلم موثوق لابني... لكن الآن صار عندنا معلم ثابت ساعده يرفع درجته في الرياضيات بشكل كبير. المعلم محترف جداً وطريقة شرحه واضحة وممتازة.',
            ],
            [
                'reviewer_name' => 'أبو سعد',
                'reviewer_location' => 'جدة',
                'rating' => 4.8,
                'comment' => 'معلم ممتاز جداً، ابني استفاد كثيراً من الدروس. المعلم صبور ومتفهم ويشرح بطريقة سهلة ومفهومة. أنصح به بشدة.',
            ],
            [
                'reviewer_name' => 'أم فهد',
                'reviewer_location' => 'الدمام',
                'rating' => 4.9,
                'comment' => 'أفضل معلم تعاملت معه. ابنتي كانت تعاني في مادة العلوم، لكن بعد الدروس مع هذا المعلم تحسنت درجاتها بشكل ملحوظ. شكراً لمعلمك.',
            ],
            [
                'reviewer_name' => 'أبو ناصر',
                'reviewer_location' => 'الرياض',
                'rating' => 5.0,
                'comment' => 'معلم محترف ومتمكن من المادة. يشرح بطريقة تفاعلية ويستخدم أمثلة عملية. ابني أصبح يحب الرياضيات بفضله.',
            ],
            [
                'reviewer_name' => 'أم عبدالله',
                'reviewer_location' => 'مكة المكرمة',
                'rating' => 4.7,
                'comment' => 'معلم جيد جداً، لكن أتمنى لو كان متاح في أوقات أكثر. طريقة الشرح ممتازة والنتائج واضحة.',
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

                if ($student && \Schema::hasColumn('reviews', 'student_id')) {
                    $reviewData['student_id'] = $student->id;
                }

                Review::create($reviewData);

                $reviewCount++;
            }
        }
    }
}
