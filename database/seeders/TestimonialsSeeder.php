<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Teacher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class TestimonialsSeeder extends Seeder
{
    /**
     * Seed curated 5-star testimonials with Gulf reviewer names and UAE cities.
     * Only 3 photos exist (ts1/ts2 = boys, ts3 = girl); they are reused across
     * same-gender reviewers and ordered so no duplicate photo lands in the same
     * two-card viewport. Idempotent: keyed on reviewer_name (updateOrCreate).
     * created_at is staggered so the first five stay newest (landing takes 5).
     */
    public function run(): void
    {
        // reviews.teacher_id is a required FK, so attach to an existing teacher.
        $teacherId = Teacher::query()->value('id');

        if (! $teacherId) {
            $this->command?->warn('TestimonialsSeeder skipped: no teacher exists to attach reviews to.');

            return;
        }

        $testimonials = [
            [
                'name' => 'عبدالله القحطاني',
                'location' => 'طالب · دبي',
                'image' => '/images/ts1.jpg',
                'comment' => 'منصة رهيبة وممتازة! ساعدتني أطوّر مشروعي وأوصله لمعلمين خبراء. تجربة ما تننسى وأنصح فيها كل طالب طموح.',
            ],
            [
                'name' => 'محمد الغامدي',
                'location' => 'طالب · أبوظبي',
                'image' => '/images/ts2.jfif',
                'comment' => 'منصة احترافية بكل معنى الكلمة. الدعم سريع والفكرة مبتكرة، وحمّستني أطوّر مهاراتي أكثر. تجربة تحفة!',
            ],
            [
                'name' => 'سارة الشهري',
                'location' => 'طالبة · الشارقة',
                'image' => '/images/ts3.jpg',
                'comment' => 'خدمة ممتازة وواجهة سهلة وأنيقة. حصلت على شهادات وشارات أفتخر فيها. شكراً إرث المبتكرين!',
            ],
            [
                'name' => 'فيصل الدوسري',
                'location' => 'ولي أمر · عجمان',
                'image' => '/images/ts2.jfif',
                'comment' => 'شفت تطوّر ابني واضح بعد ما انضم. المنصة تستحق كل ثقة، والفكرة عبقرية. أنصح فيها بشدّة.',
            ],
            [
                'name' => 'نورة العتيبي',
                'location' => 'معلمة · العين',
                'image' => '/images/ts3.jpg',
                'comment' => 'أفضل منصة تعليمية جربتها. المحتوى ثري والتحديات تشعل حماس الطلاب للإبداع. صارت أداة أساسية في صفّي.',
            ],
            [
                'name' => 'ريم المطيري',
                'location' => 'معلمة · رأس الخيمة',
                'image' => '/images/ts3.jpg',
                'comment' => 'تجربة رائعة من البداية للنهاية. طلابي صاروا أكثر إبداعاً وثقة بأنفسهم. منصة تستحق كل تقدير.',
            ],
        ];

        foreach ($testimonials as $index => $item) {
            $timestamp = Carbon::now()->subMinutes($index);

            Review::updateOrCreate(
                ['reviewer_name' => $item['name']],
                [
                    'teacher_id' => $teacherId,
                    'reviewer_location' => $item['location'],
                    'reviewer_image' => $item['image'],
                    'comment' => $item['comment'],
                    'rating' => 5.00,
                    'is_published' => true,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]
            );
        }

        $this->command?->info('Seeded ' . count($testimonials) . ' testimonials (UAE cities, gender-matched photos).');
    }
}
