<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Stores the AI-generated rubric evaluation suggestion (per-criterion
     * level/score/justification + weighted total) once a teacher triggers it
     * on a submission whose project has a rubric attached.
     */
    public function up(): void
    {
        Schema::table('project_submissions', function (Blueprint $table) {
            $table->json('ai_rubric_evaluation')->nullable()->after('feedback');
        });
    }

    public function down(): void
    {
        Schema::table('project_submissions', function (Blueprint $table) {
            $table->dropColumn('ai_rubric_evaluation');
        });
    }
};
