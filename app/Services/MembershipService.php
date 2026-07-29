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

        // Get the highest existing sequence for this prefix/year
        // DB-agnostic ordering (MySQL + SQLite): prefix-year width is fixed for this
        // query, so a longer number has a larger sequence, and equal-length numbers
        // sort numerically by their string value.
        $lastNumber = User::where('membership_number', 'like', "{$prefix}-{$year}-%")
            ->orderByRaw('LENGTH(membership_number) DESC')
            ->orderBy('membership_number', 'desc')
            ->value('membership_number');

        $sequence = 1;
        if ($lastNumber) {
            $parts = explode('-', $lastNumber);
            if (count($parts) === 3) {
                $sequence = (int) $parts[2] + 1;
            }
        }

        $candidate = "{$prefix}-{$year}-" . str_pad($sequence, 3, '0', STR_PAD_LEFT);

        // Skip any already-taken numbers (handles gaps from deleted users)
        while (User::where('membership_number', $candidate)->exists()) {
            $sequence++;
            $candidate = "{$prefix}-{$year}-" . str_pad($sequence, 3, '0', STR_PAD_LEFT);
        }

        return $candidate;
    }

    /**
     * Get prefix for role
     */
    private function getPrefixForRole(string $role): string
    {
        return match($role) {
            'student' => 'STU',
            'teacher' => 'TCH',
            'school', 'educational_institution' => 'SCH',
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

        $user->update(['membership_number' => $membershipNumber]);

        return $membershipNumber;
    }
}
