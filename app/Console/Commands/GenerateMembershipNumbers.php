<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\MembershipService;
use Illuminate\Console\Command;

class GenerateMembershipNumbers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'membership:generate {--role= : Generate for specific role (student/teacher)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate membership numbers for existing users without membership numbers';

    /**
     * Execute the console command.
     */
    public function handle(MembershipService $membershipService)
    {
        $role = $this->option('role');
        
        $query = User::whereNull('membership_number');
        
        if ($role) {
            if (!in_array($role, ['student', 'teacher'])) {
                $this->error('Role must be either "student" or "teacher"');
                return 1;
            }
            $query->where('role', $role);
        } else {
            $query->whereIn('role', ['student', 'teacher']);
        }
        
        $users = $query->get();
        
        if ($users->isEmpty()) {
            $this->info('No users found without membership numbers.');
            return 0;
        }
        
        $this->info("Found {$users->count()} users without membership numbers.");
        
        $bar = $this->output->createProgressBar($users->count());
        $bar->start();
        
        foreach ($users as $user) {
            try {
                $membershipNumber = $membershipService->generateMembershipNumber($user->role);
                
                // Ensure uniqueness
                $attempts = 0;
                while (User::where('membership_number', $membershipNumber)->where('id', '!=', $user->id)->exists() && $attempts < 10) {
                    $membershipNumber = $membershipService->generateMembershipNumber($user->role);
                    $attempts++;
                }
                
                $user->update(['membership_number' => $membershipNumber]);
            } catch (\Exception $e) {
                $this->newLine();
                $this->error("Failed to generate membership number for user {$user->id}: {$e->getMessage()}");
            }
            
            $bar->advance();
        }
        
        $bar->finish();
        $this->newLine();
        $this->info('Membership numbers generated successfully!');
        
        return 0;
    }
}
