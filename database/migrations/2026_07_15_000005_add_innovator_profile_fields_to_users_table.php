<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('official_links')->nullable()->after('bio');
            $table->json('supporting_documents')->nullable()->after('official_links');
            $table->enum('innovator_classification', [
                'diamond', 'platinum', 'gold', 'silver', 'bronze', 'developing',
            ])->nullable()->after('supporting_documents');
            $table->decimal('overall_innovation_score', 5, 2)->nullable()->after('innovator_classification');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'official_links',
                'supporting_documents',
                'innovator_classification',
                'overall_innovation_score',
            ]);
        });
    }
};
