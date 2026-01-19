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
        Schema::create('payment_gateway_settings', function (Blueprint $table) {
            $table->id();
            $table->string('gateway_name')->unique(); // tamara, ziina, stripe, etc.
            $table->string('display_name'); // الاسم المعروض
            $table->string('display_name_ar'); // الاسم المعروض بالعربي
            $table->boolean('is_enabled')->default(false);
            $table->boolean('is_test_mode')->default(true);
            $table->text('api_key')->nullable();
            $table->text('api_secret')->nullable();
            $table->text('public_key')->nullable();
            $table->text('webhook_secret')->nullable();
            $table->string('base_url')->nullable();
            $table->json('additional_settings')->nullable(); // إعدادات إضافية
            $table->text('description')->nullable();
            $table->text('description_ar')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_gateway_settings');
    }
};
