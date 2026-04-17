<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Package;
use App\Models\PaymentGatewaySetting;
use App\Models\StoreReward;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class CoreCatalogSeeder extends Seeder
{
    public function run(): void
    {
        // Categories
        $categories = [
            ['name' => 'Science', 'slug' => 'science', 'type' => 'challenge', 'description' => 'Science related content'],
            ['name' => 'Technology', 'slug' => 'technology', 'type' => 'challenge', 'description' => 'Technology related content'],
            ['name' => 'Engineering', 'slug' => 'engineering', 'type' => 'challenge', 'description' => 'Engineering related content'],
            ['name' => 'Mathematics', 'slug' => 'mathematics', 'type' => 'challenge', 'description' => 'Math related content'],
            ['name' => 'Arts', 'slug' => 'arts', 'type' => 'challenge', 'description' => 'Arts related content'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => $cat['slug']],
                [
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                    'type' => $cat['type'],
                    'is_active' => true,
                ]
            );
        }

        // Subjects (used in bookings/teacher profiles)
        $subjects = [
            ['name_ar' => 'الرياضيات', 'name_en' => 'Mathematics'],
            ['name_ar' => 'العلوم', 'name_en' => 'Science'],
            ['name_ar' => 'اللغة العربية', 'name_en' => 'Arabic'],
            ['name_ar' => 'اللغة الإنجليزية', 'name_en' => 'English'],
        ];

        foreach ($subjects as $i => $subject) {
            Subject::updateOrCreate(
                ['name_en' => $subject['name_en']],
                [
                    'name_ar' => $subject['name_ar'],
                    'name_en' => $subject['name_en'],
                    'description_ar' => null,
                    'description_en' => null,
                    'sort_order' => $i + 1,
                    'is_active' => true,
                ]
            );
        }

        // Payment gateways
        $gateways = [
            [
                'gateway_name' => 'ziina',
                'display_name' => 'Ziina',
                'display_name_ar' => 'زيـنـا',
                'is_enabled' => false,
                'is_test_mode' => true,
                'base_url' => null,
                'sort_order' => 1,
                'description' => 'Ziina payment gateway',
                'description_ar' => 'بوابة دفع زيـنـا',
            ],
            [
                'gateway_name' => 'tamara',
                'display_name' => 'Tamara',
                'display_name_ar' => 'تمارا',
                'is_enabled' => false,
                'is_test_mode' => true,
                'base_url' => null,
                'sort_order' => 2,
                'description' => 'Tamara payment gateway',
                'description_ar' => 'بوابة دفع تمارا',
            ],
        ];

        foreach ($gateways as $gateway) {
            PaymentGatewaySetting::updateOrCreate(
                ['gateway_name' => $gateway['gateway_name']],
                $gateway
            );
        }

        // Packages (simple, deterministic demo set)
        Package::updateOrCreate(
            ['name' => 'Free Trial'],
            [
                'name_ar' => 'تجربة مجانية',
                'description' => 'Try premium features for a limited time.',
                'description_ar' => 'جرّب مزايا الباقات لمدة محدودة.',
                'price' => 0,
                'currency' => 'AED',
                'duration_type' => 'monthly',
                'duration_months' => 1,
                'points_bonus' => 50,
                'projects_limit' => null,
                'challenges_limit' => null,
                'certificate_access' => true,
                'badge_access' => true,
                'is_trial' => true,
                'trial_days' => 14,
                'features' => ['Trial access'],
                'features_ar' => ['صلاحيات تجريبية'],
                'is_active' => true,
                'is_popular' => false,
            ]
        );

        $packages = [
            [
                'name' => 'Student Premium',
                'name_ar' => 'باقة الطالب',
                'price' => 49,
                'duration_type' => 'monthly',
                'duration_months' => 1,
                'certificate_access' => true,
                'badge_access' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Teacher Premium',
                'name_ar' => 'باقة المعلم',
                'price' => 99,
                'duration_type' => 'monthly',
                'duration_months' => 1,
                'certificate_access' => true,
                'badge_access' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'School Premium',
                'name_ar' => 'باقة المدرسة',
                'price' => 199,
                'duration_type' => 'monthly',
                'duration_months' => 1,
                'certificate_access' => true,
                'badge_access' => true,
                'is_popular' => true,
            ],
            [
                'name' => 'Educational Institution Premium',
                'name_ar' => 'باقة المؤسسة التعليمية',
                'price' => 299,
                'duration_type' => 'monthly',
                'duration_months' => 1,
                'certificate_access' => true,
                'badge_access' => true,
                'is_popular' => false,
            ],
        ];

        foreach ($packages as $p) {
            Package::updateOrCreate(
                ['name' => $p['name']],
                [
                    'name_ar' => $p['name_ar'],
                    'description' => 'Demo package',
                    'description_ar' => 'باقة تجريبية',
                    'price' => $p['price'],
                    'currency' => 'AED',
                    'duration_type' => $p['duration_type'],
                    'duration_months' => $p['duration_months'],
                    'points_bonus' => 100,
                    'projects_limit' => null,
                    'challenges_limit' => null,
                    'certificate_access' => $p['certificate_access'],
                    'badge_access' => $p['badge_access'],
                    'is_trial' => false,
                    'trial_days' => null,
                    'features' => ['Full access'],
                    'features_ar' => ['وصول كامل'],
                    'is_active' => true,
                    'is_popular' => $p['is_popular'],
                ]
            );
        }

        // Store rewards
        $rewards = [
            [
                'name_en' => 'Digital badge',
                'name_ar' => 'شارة رقمية',
                'slug' => 'digital_badge',
                'icon' => '🏷️',
                'points_cost' => 25,
                'is_active' => true,
                'sort_order' => 1,
                'requires_manual_approval' => false,
            ],
            [
                'name_en' => 'Certificate print',
                'name_ar' => 'طباعة شهادة',
                'slug' => 'certificate_print',
                'icon' => '📄',
                'points_cost' => 50,
                'is_active' => true,
                'sort_order' => 2,
                'requires_manual_approval' => true,
            ],
        ];

        foreach ($rewards as $reward) {
            StoreReward::updateOrCreate(['slug' => $reward['slug']], $reward);
        }
    }
}
