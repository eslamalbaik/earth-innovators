<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_login_and_reach_dashboard(): void
    {
        $admin = User::factory()->create([
            'email' => 'panel-admin@test.com',
            'password' => Hash::make('SecretPass1'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $response = $this->post('/admin/login', [
            'email' => 'panel-admin@test.com',
            'password' => 'SecretPass1',
            'role' => 'admin',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($admin);

        $this->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Dashboard'));
    }

    public function test_teacher_cannot_use_admin_login(): void
    {
        User::factory()->create([
            'email' => 'teacher-panel@test.com',
            'password' => Hash::make('SecretPass1'),
            'role' => 'teacher',
        ]);

        $response = $this->post('/admin/login', [
            'email' => 'teacher-panel@test.com',
            'password' => 'SecretPass1',
            'role' => 'admin',
        ]);

        $response->assertSessionHasErrors('role');
        $this->assertGuest();
    }

    public function test_system_supervisor_can_access_admin_dashboard(): void
    {
        $supervisor = User::factory()->create([
            'email' => 'supervisor-panel@test.com',
            'password' => Hash::make('SecretPass1'),
            'role' => 'system_supervisor',
        ]);

        $this->post('/admin/login', [
            'email' => 'supervisor-panel@test.com',
            'password' => 'SecretPass1',
            'role' => 'admin',
        ])->assertRedirect(route('admin.dashboard'));

        $this->assertAuthenticatedAs($supervisor);

        $this->get('/admin/dashboard')->assertOk();
    }

    public function test_demo_admin_credentials_can_login(): void
    {
        $this->seed(\Database\Seeders\DemoUsersSeeder::class);

        $response = $this->post('/admin/login', [
            'email' => 'admin@demo.com',
            'password' => 'password',
            'role' => 'admin',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticated();
    }

    public function test_existing_teacher_session_is_cleared_on_admin_login_page(): void
    {
        User::factory()->create([
            'email' => 'teacher-on-ae@test.com',
            'password' => Hash::make('password'),
            'role' => 'teacher',
        ]);

        $this->actingAs(User::where('email', 'teacher-on-ae@test.com')->first())
            ->get('/admin/login')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Auth/Login'));

        $this->assertGuest();
    }

    public function test_teacher_can_be_replaced_by_admin_login(): void
    {
        $teacher = User::factory()->create([
            'email' => 'teacher-switch@test.com',
            'password' => Hash::make('password'),
            'role' => 'teacher',
        ]);

        User::factory()->create([
            'email' => 'admin-switch@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($teacher)
            ->get('/admin/login')
            ->assertOk();

        $response = $this->post('/admin/login', [
            'email' => 'admin-switch@test.com',
            'password' => 'password',
            'role' => 'admin',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs(User::where('email', 'admin-switch@test.com')->first());
    }

    public function test_unauthenticated_admin_dashboard_redirects_to_admin_login(): void
    {
        $this->get('/admin/dashboard')
            ->assertRedirect(route('admin.login'));
    }
}
