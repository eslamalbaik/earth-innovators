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

    public function test_unauthenticated_admin_dashboard_redirects_to_admin_login(): void
    {
        $this->get('/admin/dashboard')
            ->assertRedirect(route('admin.login'));
    }
}
