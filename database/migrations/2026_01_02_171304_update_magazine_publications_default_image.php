<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * تحديث جميع إصدارات المجلة الحالية لاستخدام blog1.jpg كصورة افتراضية
     */
    public function up(): void
    {
        // تحديث جميع إصدارات المجلة الحالية فقط (وليس الجديدة)
        DB::table('publications')
            ->where('type', 'magazine')
            ->update([
                'cover_image' => '/images/blog1.jpg',
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     * لا يمكننا استعادة الصور القديمة، لذا نتركها فارغة
     */
    public function down(): void
    {
        // إعادة تعيين الصور إلى null (لا يمكننا استعادة الصور القديمة)
        DB::table('publications')
            ->where('type', 'magazine')
            ->where('cover_image', '/images/blog1.jpg')
            ->update([
                'cover_image' => null,
                'updated_at' => now(),
            ]);
    }
};
