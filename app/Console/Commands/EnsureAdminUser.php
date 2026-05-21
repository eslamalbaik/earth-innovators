<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class EnsureAdminUser extends Command
{
    protected $signature = 'admin:ensure
                            {--email=admin@demo.com : Admin login email}
                            {--password=password : Admin login password}
                            {--name=Admin : Display name}';

    protected $description = 'Create or reset a panel admin user (for production setup on .ae / .cloud)';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->option('email')));
        $password = (string) $this->option('password');
        $name = (string) $this->option('name');

        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email.');

            return self::FAILURE;
        }

        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');

            return self::FAILURE;
        }

        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make($password),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        $this->info('Panel admin ready.');
        $this->line('  Email: '.$user->email);
        $this->line('  Role: '.$user->role);
        $this->line('  Login: '.config('app.url').'/admin/login');
        $this->warn('Change the password after first login on production.');

        return self::SUCCESS;
    }
}
