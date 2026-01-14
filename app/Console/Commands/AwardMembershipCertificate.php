<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\MembershipCertificateService;

class AwardMembershipCertificate extends Command
{
    protected $signature = 'certificate:award {email} {--force : Force award even if not eligible}';
    protected $description = 'Award membership certificate to a user by email';

    protected $membershipCertificateService;

    public function __construct(MembershipCertificateService $membershipCertificateService)
    {
        parent::__construct();
        $this->membershipCertificateService = $membershipCertificateService;
    }

    public function handle()
    {
        $email = $this->argument('email');
        $force = $this->option('force');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }

        $this->info("Found user: {$user->name} (ID: {$user->id}, Role: {$user->role})");

        // Check eligibility
        $eligibility = $this->membershipCertificateService->getEligibilityStatus(
            $user->id,
            $user->role
        );

        $this->info("\nCurrent Eligibility Status:");
        $this->table(
            ['Criterion', 'Current', 'Required', 'Status'],
            $this->formatEligibilityTable($eligibility, $user->role)
        );

        if (!$eligibility['eligible'] && !$force) {
            $this->warn("\nUser is not eligible for membership certificate.");
            $this->info("Use --force flag to award certificate anyway, or update user data to meet requirements.");
            return 1;
        }

        // Award certificate
        $this->info("\nAwarding membership certificate...");
        
        try {
            if ($user->role === 'student') {
                $certificate = $this->membershipCertificateService->checkAndAwardStudentMembership($user->id, $force);
            } elseif ($user->role === 'teacher') {
                $certificate = $this->membershipCertificateService->checkAndAwardTeacherMembership($user->id, $force);
            } elseif ($user->role === 'school') {
                $certificate = $this->membershipCertificateService->checkAndAwardSchoolMembership($user->id, $force);
            } else {
                $this->error("Invalid role: {$user->role}. Only student, teacher, or school roles are supported.");
                return 1;
            }

            if ($certificate) {
                $this->info("✓ Certificate awarded successfully!");
                $this->info("Certificate ID: {$certificate->id}");
                $this->info("Certificate Number: {$certificate->certificate_number}");
                $this->info("Issue Date: {$certificate->issue_date->format('Y-m-d')}");
                return 0;
            } else {
                $this->error("Failed to award certificate. User may already have one or service error occurred.");
                return 1;
            }
        } catch (\Exception $e) {
            $this->error("Error awarding certificate: " . $e->getMessage());
            return 1;
        }
    }

    protected function formatEligibilityTable(array $eligibility, string $role): array
    {
        $rows = [];

        if ($role === 'student') {
            $rows[] = ['Points', $eligibility['points'], $eligibility['points_required'], $eligibility['points_eligible'] ? '✓' : '✗'];
            $rows[] = ['Approved Projects', $eligibility['approved_projects'], $eligibility['projects_required'], $eligibility['projects_eligible'] ? '✓' : '✗'];
            $rows[] = ['Challenges Participated', $eligibility['challenges_participated'], $eligibility['challenges_required'], $eligibility['challenges_eligible'] ? '✓' : '✗'];
            $rows[] = ['Account Age (days)', $eligibility['account_age_days'], $eligibility['account_age_required'], $eligibility['account_age_eligible'] ? '✓' : '✗'];
        } elseif ($role === 'teacher') {
            $rows[] = ['Points', $eligibility['points'], $eligibility['points_required'], $eligibility['points_eligible'] ? '✓' : '✗'];
            $rows[] = ['Approved Projects', $eligibility['approved_projects'], $eligibility['projects_required'], $eligibility['projects_eligible'] ? '✓' : '✗'];
            $rows[] = ['Rating', $eligibility['rating'], $eligibility['rating_required'], $eligibility['rating_eligible'] ? '✓' : '✗'];
            $rows[] = ['Account Age (days)', $eligibility['account_age_days'], $eligibility['account_age_required'], $eligibility['account_age_eligible'] ? '✓' : '✗'];
        } elseif ($role === 'school') {
            $rows[] = ['Students Count', $eligibility['students_count'], $eligibility['students_required'], $eligibility['students_eligible'] ? '✓' : '✗'];
            $rows[] = ['Approved Projects', $eligibility['approved_projects'], $eligibility['projects_required'], $eligibility['projects_eligible'] ? '✓' : '✗'];
            $rows[] = ['Rank', $eligibility['rank'], "Top 50%", $eligibility['ranking_eligible'] ? '✓' : '✗'];
            $rows[] = ['Account Age (days)', $eligibility['account_age_days'], $eligibility['account_age_required'], $eligibility['account_age_eligible'] ? '✓' : '✗'];
        }

        return $rows;
    }
}

