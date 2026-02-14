<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('instructional_approach')->nullable()->after('category');
            $table->string('grade')->nullable()->after('instructional_approach');
            $table->string('subject')->nullable()->after('grade');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['instructional_approach', 'grade', 'subject']);
        });
    }
};
