<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class MembershipService
{
    /**
     * Generate a unique membership number for a user
     * Format: STU-2025-045 for students, TCH-2025-045 for teachers
     */
    public function generateMembershipNumber(string $role): string
    {
        $prefix = $this->getPrefixForRole($role);
        $year = date('Y');
        
        // Get the last membership number for this role and year
        $lastNumber = User::where('role', $role)
            ->where('membership_number', 'like', "{$prefix}-{$year}-%")
            ->orderBy('membership_number', 'desc')
            ->value('membership_number');
        
        // Extract the sequence number
        $sequence = 1;
        if ($lastNumber) {
            $parts = explode('-', $lastNumber);
            if (count($parts) === 3 && $parts[0] === $prefix && $parts[1] === $year) {
                $sequence = (int) $parts[2] + 1;
            }
        }
        
        // Format with leading zeros (3 digits)
        $formattedSequence = str_pad($sequence, 3, '0', STR_PAD_LEFT);
        
        return "{$prefix}-{$year}-{$formattedSequence}";
    }

    /**
     * Get prefix for role
     */
    private function getPrefixForRole(string $role): string
    {
        return match($role) {
            'student' => 'STU',
            'teacher' => 'TCH',
            default => 'USR',
        };
    }

    /**
     * Ensure user has a membership number (generate if missing)
     */
    public function ensureMembershipNumber(User $user): string
    {
        if ($user->membership_number) {
            return $user->membership_number;
        }

        $membershipNumber = $this->generateMembershipNumber($user->role);
        
        // Ensure uniqueness (handle race conditions)
        $attempts = 0;
        while (User::where('membership_number', $membershipNumber)->exists() && $attempts < 10) {
            $membershipNumber = $this->generateMembershipNumber($user->role);
            $attempts++;
        }

        $user->update(['membership_number' => $membershipNumber]);

        return $membershipNumber;
    }
}

