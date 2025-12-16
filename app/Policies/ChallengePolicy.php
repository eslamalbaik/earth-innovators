<?php

namespace App\Policies;

use App\Models\Challenge;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ChallengePolicy
{
    /**
     * Determine whether the user can view any models.
     * Everyone can view active challenges
     */
    public function viewAny(?User $user): bool
    {
        return true; // Public access to view challenges
    }

    /**
     * Determine whether the user can view the model.
     * Everyone can view active challenges
     */
    public function view(?User $user, Challenge $challenge): bool
    {
        // Active challenges are public
        if ($challenge->isActive()) {
            return true;
        }

        // For non-active challenges, check permissions
        if (!$user) {
        return false;
        }

        // Creator, school admin, or platform admin can view
        return $user->id === $challenge->created_by
            || ($user->isSchool() && $user->id === $challenge->school_id)
            || $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     * Teachers and school admins can create challenges
     */
    public function create(User $user): bool
    {
        return $user->isTeacher() || $user->isSchool() || $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Challenge $challenge): bool
    {
        // Creator can update
        if ($user->id === $challenge->created_by) {
            return true;
        }

        // School admin can update challenges from their school
        if ($user->isSchool() && $user->id === $challenge->school_id) {
            return true;
        }

        // Platform admin can update any challenge
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Challenge $challenge): bool
    {
        // Same rules as update
        return $this->update($user, $challenge);
    }

    /**
     * Determine whether the user can join the challenge.
     */
    public function join(User $user, Challenge $challenge): bool
    {
        // Only students can join
        return $user->isStudent() && $challenge->isActive();
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Challenge $challenge): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Challenge $challenge): bool
    {
        return false;
    }
}
