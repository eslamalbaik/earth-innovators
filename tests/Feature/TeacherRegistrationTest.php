<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Teacher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherRegistrationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test teacher registration creates user and teacher records
     */
    public function test_teacher_registration_creates_user_and_teacher(): void
    {
        // إنشاء مدرسة أولاً (مطلوبة للتسجيل)
        $school = User::factory()->create([
            'role' => 'school',
            'name' => 'مدرسة تجريبية',
        ]);

        $response = $this->post('/register', [
            'name' => 'معلم تجريبي',
            'email' => 'teacher@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '+966501234567',
            'role' => 'teacher',
            'school_id' => $school->id,
        ]);

        // التحقق من إعادة التوجيه
        $response->assertRedirect('/dashboard');

        // التحقق من إنشاء User
        $this->assertDatabaseHas('users', [
            'email' => 'teacher@test.com',
            'role' => 'teacher',
            'school_id' => $school->id,
        ]);

        $user = User::where('email', 'teacher@test.com')->first();

        // التحقق من إنشاء Teacher record
        $this->assertDatabaseHas('teachers', [
            'user_id' => $user->id,
            'name_ar' => 'معلم تجريبي',
            'is_verified' => false,
            'is_active' => false,
        ]);

        // التحقق من العلاقة
        $this->assertNotNull($user->teacher);
        $this->assertEquals('معلم تجريبي', $user->teacher->name_ar);
    }

    /**
     * Test teacher can login after registration
     */
    public function test_teacher_can_login_after_registration(): void
    {
        // إنشاء مدرسة
        $school = User::factory()->create([
            'role' => 'school',
            'name' => 'مدرسة تجريبية',
        ]);

        // إنشاء معلم
        $user = User::factory()->create([
            'email' => 'teacher@test.com',
            'password' => bcrypt('password123'),
            'role' => 'teacher',
            'school_id' => $school->id,
        ]);

        Teacher::create([
            'user_id' => $user->id,
            'name_ar' => 'معلم تجريبي',
            'name_en' => 'Test Teacher',
            'city' => 'الرياض',
            'subjects' => json_encode([]),
            'stages' => json_encode([]),
            'experience_years' => 0,
            'price_per_hour' => 0,
            'nationality' => 'سعودي',
            'neighborhoods' => json_encode([]),
            'is_verified' => false,
            'is_active' => false,
        ]);

        // محاولة تسجيل الدخول
        $response = $this->post('/login', [
            'email' => 'teacher@test.com',
            'password' => 'password123',
            'role' => 'teacher', // role مطلوب في LoginRequest
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
    }

    /**
     * Test teacher dashboard is accessible after login
     */
    public function test_teacher_dashboard_is_accessible(): void
    {
        // إنشاء مدرسة
        $school = User::factory()->create([
            'role' => 'school',
            'name' => 'مدرسة تجريبية',
        ]);

        // إنشاء معلم
        $user = User::factory()->create([
            'email' => 'teacher@test.com',
            'password' => bcrypt('password123'),
            'role' => 'teacher',
            'school_id' => $school->id,
        ]);

        Teacher::create([
            'user_id' => $user->id,
            'name_ar' => 'معلم تجريبي',
            'name_en' => 'Test Teacher',
            'city' => 'الرياض',
            'subjects' => json_encode([]),
            'stages' => json_encode([]),
            'experience_years' => 0,
            'price_per_hour' => 0,
            'nationality' => 'سعودي',
            'neighborhoods' => json_encode([]),
            'is_verified' => false,
            'is_active' => false,
        ]);

        // تسجيل الدخول
        $this->actingAs($user);

        // الوصول إلى لوحة التحكم
        $response = $this->get('/teacher/dashboard');
        $response->assertStatus(200);
    }

    /**
     * Test teacher dashboard creates teacher record if missing
     */
    public function test_teacher_dashboard_creates_teacher_if_missing(): void
    {
        // إنشاء مدرسة
        $school = User::factory()->create([
            'role' => 'school',
            'name' => 'مدرسة تجريبية',
        ]);

        // إنشاء معلم بدون teacher record
        $user = User::factory()->create([
            'email' => 'teacher@test.com',
            'password' => bcrypt('password123'),
            'role' => 'teacher',
            'school_id' => $school->id,
        ]);

        // التحقق من عدم وجود teacher record
        $this->assertNull($user->teacher);

        // تسجيل الدخول
        $this->actingAs($user);

        // الوصول إلى لوحة التحكم (يجب أن ينشئ teacher تلقائياً)
        $response = $this->get('/teacher/dashboard');
        $response->assertStatus(200);

        // التحقق من إنشاء teacher record
        $user->refresh();
        $this->assertNotNull($user->teacher);
        $this->assertEquals('غير محدد', $user->teacher->city);
    }

    /**
     * Test teacher registration requires school_id
     */
    public function test_teacher_registration_requires_school_id(): void
    {
        $response = $this->post('/register', [
            'name' => 'معلم تجريبي',
            'email' => 'teacher@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '+966501234567',
            'role' => 'teacher',
            // school_id مفقود
        ]);

        $response->assertSessionHasErrors('school_id');
        $this->assertDatabaseMissing('users', [
            'email' => 'teacher@test.com',
        ]);
    }
}

