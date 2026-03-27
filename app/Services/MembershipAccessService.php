<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserPackage;

class MembershipAccessService
{
    public function getActiveSubscription(User $user): ?UserPackage
    {
        return UserPackage::with('package')
            ->where('user_id', $user->id)
            ->currentActive()
            ->latest('end_date')
            ->first();
    }

    public function getAccessOwner(User $user): User
    {
        if ($user->isTeacher() && $user->school_id) {
            $school = User::find($user->school_id);
            if ($school && $school->isSchool()) {
                return $school;
            }
        }

        return $user;
    }

    public function hasCertificateAccess(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        $owner = $this->getAccessOwner($user);
        $subscription = $this->getActiveSubscription($owner);

        if ($subscription) {
            return (bool) $subscription->package?->certificate_access;
        }

        if ($owner->role === 'teacher' && $owner->teacher) {
            return $owner->teacher->contract_status === 'active' && $owner->isTeacherContractValid();
        }

        return $owner->membership_type === 'subscription' && $owner->contract_status === 'active' && $owner->isContractValid();
    }

    public function getMembershipSummary(User $user): array
    {
        $owner = $this->getAccessOwner($user);
        $subscription = $this->getActiveSubscription($owner);

        return [
            'owner_id' => $owner->id,
            'owner_name' => $owner->name,
            'is_school_owned' => $owner->id !== $user->id,
            'membership_type' => $owner->membership_type ?? ($subscription ? 'subscription' : 'basic'),
            'contract_status' => $owner->role === 'teacher' && $owner->teacher
                ? ($owner->teacher->contract_status ?? null)
                : ($owner->contract_status ?? null),
            'contract_start_date' => $owner->role === 'teacher' && $owner->teacher
                ? optional($owner->teacher->contract_start_date)?->format('Y-m-d')
                : optional($owner->contract_start_date)?->format('Y-m-d'),
            'contract_end_date' => $owner->role === 'teacher' && $owner->teacher
                ? optional($owner->teacher->contract_end_date)?->format('Y-m-d')
                : optional($owner->contract_end_date)?->format('Y-m-d'),
            'has_active_subscription' => $subscription !== null,
            'certificate_access' => $this->hasCertificateAccess($user),
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'package_name' => $subscription->package->name_ar ?? $subscription->package->name,
                'status' => $subscription->status,
                'start_date' => optional($subscription->start_date)?->format('Y-m-d'),
                'end_date' => optional($subscription->end_date)?->format('Y-m-d'),
                'paid_amount' => $subscription->paid_amount,
                'payment_method' => $subscription->payment_method,
            ] : null,
        ];
    }

    public function syncMembershipFromUserPackage(UserPackage $userPackage): void
    {
        $userPackage->loadMissing('user.teacher', 'package');

        $user = $userPackage->user;
        if (!$user) {
            return;
        }

        $startDate = $userPackage->start_date ?? now();
        $endDate = $userPackage->end_date ?? now();

        $user->update([
            'membership_type' => 'subscription',
            'contract_start_date' => $startDate,
            'contract_end_date' => $endDate,
            'contract_status' => 'active',
        ]);

        if ($user->teacher) {
            $user->teacher->update([
                'membership_type' => 'subscription',
                'contract_start_date' => $startDate,
                'contract_end_date' => $endDate,
                'contract_status' => 'active',
            ]);
        }
    }

    public function syncMembershipFromSubscriptions(User $user): void
    {
        $user->loadMissing('teacher');

        $activeSubscription = $this->getActiveSubscription($user);
        if ($activeSubscription) {
            $this->syncMembershipFromUserPackage($activeSubscription);
            return;
        }

        $shouldDowngradeUser = $user->membership_type === 'subscription';
        $shouldDowngradeTeacher = $user->teacher && $user->teacher->membership_type === 'subscription';

        if (!$shouldDowngradeUser && !$shouldDowngradeTeacher) {
            return;
        }

        if ($shouldDowngradeUser) {
            $user->update([
                'membership_type' => 'basic',
                'contract_start_date' => null,
                'contract_end_date' => null,
                'contract_status' => 'inactive',
            ]);
        }

        if ($shouldDowngradeTeacher) {
            $user->teacher->update([
                'membership_type' => 'basic',
                'contract_start_date' => null,
                'contract_end_date' => null,
                'contract_status' => 'inactive',
            ]);
        }
    }
}
