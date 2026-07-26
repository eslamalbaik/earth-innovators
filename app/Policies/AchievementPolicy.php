<?php

namespace App\Policies;

use App\Models\Achievement;
use App\Models\User;

class AchievementPolicy
{
    /**
     * Determine if the user can view the achievement.
     */
    public function view(User $user, Achievement $achievement): bool
    {
        // Owner can always view
        if ($user->id === $achievement->user_id) {
            return true;
        }

        // Admin, teacher (of the student), or school (of the student) can view
        if ($user->isAdmin() || $user->isSystemSupervisor()) {
            return true;
        }

        // Teacher can view their students' achievements
        if ($user->isTeacher()) {
            return $achievement->user->teacher_id === $user->id;
        }

        // School can view their students' achievements
        if ($user->isSchool()) {
            return $achievement->user->school_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if the user can create achievements.
     */
    public function create(User $user): bool
    {
        return true; // Any authenticated user can create achievements
    }

    /**
     * Determine if the user can update the achievement.
     */
    public function update(User $user, Achievement $achievement): bool
    {
        return $user->id === $achievement->user_id || $user->isAdmin();
    }

    /**
     * Determine if the user can delete the achievement.
     */
    public function delete(User $user, Achievement $achievement): bool
    {
        return $user->id === $achievement->user_id || $user->isAdmin();
    }
}
