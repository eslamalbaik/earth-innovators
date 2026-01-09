<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Package;

class PackagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $packages = [
            [
                'name' => 'Student Package',
                'name_ar' => 'باقة الطالب',
                'description' => 'Perfect package for students to access learning materials, submit projects, and participate in challenges.',
                'description_ar' => 'باقة مثالية للطلاب للوصول إلى المواد التعليمية وتقديم المشاريع والمشاركة في التحديات.',
                'price' => 29.00,
                'currency' => 'AED',
                'duration_type' => 'monthly',
                'duration_months' => 1,
                'points_bonus' => 100,
                'projects_limit' => 10,
                'challenges_limit' => 5,
                'certificate_access' => true,
                'badge_access' => true,
                'features' => [
                    'Access to all learning materials',
                    'Submit up to 10 projects per month',
                    'Participate in 5 challenges',
                    'Get certificates upon completion',
                    'Earn badges and rewards',
                    'Basic support',
                ],
                'features_ar' => [
                    'الوصول إلى جميع المواد التعليمية',
                    'تقديم ما يصل إلى 10 مشاريع شهرياً',
                    'المشاركة في 5 تحديات',
                    'الحصول على شهادات عند الإنجاز',
                    'كسب الشارات والمكافآت',
                    'دعم أساسي',
                ],
                'is_active' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Teacher Package',
                'name_ar' => 'باقة المدرس',
                'description' => 'Comprehensive package for teachers to create courses, manage students, and track progress.',
                'description_ar' => 'باقة شاملة للمدرسين لإنشاء الدورات وإدارة الطلاب وتتبع التقدم.',
                'price' => 99.00,
                'currency' => 'AED',
                'duration_type' => 'monthly',
                'duration_months' => 1,
                'points_bonus' => 500,
                'projects_limit' => null, // Unlimited
                'challenges_limit' => null, // Unlimited
                'certificate_access' => true,
                'badge_access' => true,
                'features' => [
                    'Create unlimited courses',
                    'Manage unlimited students',
                    'Create and grade projects',
                    'Design custom challenges',
                    'Issue certificates',
                    'Advanced analytics and reports',
                    'Priority support',
                    'Schedule live sessions',
                ],
                'features_ar' => [
                    'إنشاء دورات غير محدودة',
                    'إدارة طلاب غير محدودين',
                    'إنشاء وتقييم المشاريع',
                    'تصميم تحديات مخصصة',
                    'إصدار شهادات',
                    'تحليلات وتقارير متقدمة',
                    'دعم ذو أولوية',
                    'جدولة جلسات مباشرة',
                ],
                'is_active' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'School Package',
                'name_ar' => 'باقة المدرسة',
                'description' => 'Enterprise package for schools with multiple teachers and students.',
                'description_ar' => 'باقة مؤسسية للمدارس مع معلمين وطلاب متعددين.',
                'price' => 499.00,
                'currency' => 'AED',
                'duration_type' => 'monthly',
                'duration_months' => 1,
                'points_bonus' => 2000,
                'projects_limit' => null, // Unlimited
                'challenges_limit' => null, // Unlimited
                'certificate_access' => true,
                'badge_access' => true,
                'features' => [
                    'Up to 50 teachers',
                    'Up to 500 students',
                    'Unlimited courses and projects',
                    'Custom branding',
                    'Advanced reporting and analytics',
                    'Integration with school systems',
                    'Dedicated account manager',
                    '24/7 support',
                    'Teacher training sessions',
                    'Custom certificates',
                ],
                'features_ar' => [
                    'ما يصل إلى 50 معلماً',
                    'ما يصل إلى 500 طالب',
                    'دورات ومشاريع غير محدودة',
                    'علامة تجارية مخصصة',
                    'تقارير وتحليلات متقدمة',
                    'التكامل مع أنظمة المدرسة',
                    'مدير حساب مخصص',
                    'دعم على مدار الساعة',
                    'جلسات تدريب المعلمين',
                    'شهادات مخصصة',
                ],
                'is_active' => true,
                'is_popular' => false,
            ],
            [
                'name' => 'Educational Institution Package',
                'name_ar' => 'باقة المؤسسة التعليمية',
                'description' => 'Premium enterprise solution for large educational institutions and organizations.',
                'description_ar' => 'حل مؤسسي متميز للمؤسسات والمنظمات التعليمية الكبيرة.',
                'price' => 1499.00,
                'currency' => 'AED',
                'duration_type' => 'monthly',
                'duration_months' => 1,
                'points_bonus' => 10000,
                'projects_limit' => null, // Unlimited
                'challenges_limit' => null, // Unlimited
                'certificate_access' => true,
                'badge_access' => true,
                'features' => [
                    'Unlimited teachers',
                    'Unlimited students',
                    'Multi-branch support',
                    'White-label solution',
                    'API access',
                    'Custom integrations',
                    'Advanced security features',
                    'Dedicated infrastructure',
                    'On-site training',
                    'Quarterly business reviews',
                    'Priority feature requests',
                    '24/7 premium support',
                ],
                'features_ar' => [
                    'معلمون غير محدودين',
                    'طلاب غير محدودين',
                    'دعم متعدد الفروع',
                    'حل بعلامة بيضاء',
                    'وصول API',
                    'تكاملات مخصصة',
                    'ميزات أمان متقدمة',
                    'بنية تحتية مخصصة',
                    'تدريب في الموقع',
                    'مراجعات أعمال ربع سنوية',
                    'طلبات ميزات ذات أولوية',
                    'دعم مميز على مدار الساعة',
                ],
                'is_active' => true,
                'is_popular' => false,
            ],
        ];

        foreach ($packages as $packageData) {
            Package::updateOrCreate(
                ['name' => $packageData['name']],
                $packageData
            );
        }

        $this->command->info('✅ تم إنشاء 4 باقات بنجاح!');
    }
}
