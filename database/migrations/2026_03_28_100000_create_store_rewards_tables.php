<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('store_rewards', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 64)->unique();
            $table->string('name_en');
            $table->string('name_ar');
            $table->string('icon', 32)->nullable();
            $table->unsignedInteger('points_cost');
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('requires_manual_approval')->default(false);
            $table->timestamps();
        });

        Schema::create('store_reward_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('store_reward_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->unsignedInteger('points_cost');
            $table->timestamp('processed_at')->nullable();
            $table->foreignId('processed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_note')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        $items = config('store_rewards.items', []);
        foreach ($items as $row) {
            $slug = (string) ($row['id'] ?? '');
            if ($slug === '') {
                continue;
            }
            $nameKey = $row['name_key'] ?? '';
            $nameEn = $nameKey ? trans($nameKey, [], 'en') : $slug;
            $nameAr = $nameKey ? trans($nameKey, [], 'ar') : $slug;

            DB::table('store_rewards')->insert([
                'slug' => $slug,
                'name_en' => $nameEn,
                'name_ar' => $nameAr,
                'icon' => $row['icon'] ?? '🎁',
                'points_cost' => (int) ($row['points'] ?? 0),
                'is_active' => ($row['active'] ?? true) ? 1 : 0,
                'sort_order' => (int) ($row['sort'] ?? 0),
                'requires_manual_approval' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('store_reward_requests');
        Schema::dropIfExists('store_rewards');
    }
};
