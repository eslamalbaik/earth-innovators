<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->boolean('is_trial')->default(false)->after('badge_access');
            $table->unsignedInteger('trial_days')->nullable()->after('is_trial');
        });

        DB::table('packages')->updateOrInsert(
            ['name' => 'Starter Trial'],
            [
                'name_ar' => 'الباقة التجريبية',
                'description' => 'Free trial access to explore the platform before subscribing to a paid package.',
                'description_ar' => 'وصول تجريبي مجاني لاستكشاف المنصة قبل الاشتراك في باقة مدفوعة.',
                'price' => 0,
                'currency' => 'AED',
                'duration_type' => 'monthly',
                'duration_months' => 1,
                'points_bonus' => 25,
                'projects_limit' => 2,
                'challenges_limit' => 2,
                'certificate_access' => false,
                'badge_access' => true,
                'is_trial' => true,
                'trial_days' => 14,
                'features' => json_encode([
                    '2 project submissions',
                    '2 challenge participations',
                    'Starter points bonus',
                    'Explore the platform before upgrading',
                ], JSON_UNESCAPED_UNICODE),
                'features_ar' => json_encode([
                    'رفع مشروعين تجريبيين',
                    'المشاركة في تحديين',
                    'نقاط ترحيبية للبداية',
                    'استكشاف المنصة قبل الترقية',
                ], JSON_UNESCAPED_UNICODE),
                'is_active' => true,
                'is_popular' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        DB::table('packages')
            ->where('name', 'Starter Trial')
            ->where('is_trial', true)
            ->delete();

        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn(['is_trial', 'trial_days']);
        });
    }
};
