<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('publication_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // المستخدم الذي أعجب به
            $table->foreignId('publication_id')->constrained()->onDelete('cascade'); // الإصدار المعجب به
            $table->timestamps();
            
            // منع الإعجاب المتكرر من نفس المستخدم
            $table->unique(['user_id', 'publication_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publication_likes');
    }
};
