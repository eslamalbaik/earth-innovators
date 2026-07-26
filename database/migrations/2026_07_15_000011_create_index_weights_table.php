<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('index_weights', function (Blueprint $table) {
            $table->id();
            $table->string('index_name')->unique();
            $table->decimal('weight', 5, 4)->comment('Weight as decimal, e.g. 0.15 for 15%');
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed default weights
        DB::table('index_weights')->insert([
            ['index_name' => 'skills',           'weight' => 0.15, 'description' => 'مؤشر المهارات',           'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['index_name' => 'innovation',       'weight' => 0.15, 'description' => 'مؤشر الابتكار',           'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['index_name' => 'intelligence',     'weight' => 0.12, 'description' => 'مؤشر الذكاء',            'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['index_name' => 'creativity',       'weight' => 0.13, 'description' => 'مؤشر الإبداع',           'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['index_name' => 'projects',         'weight' => 0.15, 'description' => 'مؤشر المشاريع',          'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['index_name' => 'leadership',       'weight' => 0.12, 'description' => 'مؤشر القيادة',           'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['index_name' => 'ip',               'weight' => 0.08, 'description' => 'مؤشر الملكية الفكرية',    'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['index_name' => 'future_readiness',  'weight' => 0.10, 'description' => 'مؤشر الجاهزية المستقبلية', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('index_weights');
    }
};
