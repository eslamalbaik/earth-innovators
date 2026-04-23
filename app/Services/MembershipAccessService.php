<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserPackage;

class MembershipAccessService
{
    public function getActiveSubscription(User $user): ?UserPackage
    {
        return $this->subscriptionQueryForUser($user)
            ->currentActive()
            ->latest('end_date')
            ->first();
    }

    public function getLatestSubscription(User $user): ?UserPackage
    {
        return $this->subscriptionQueryForUser($user)
            ->latest('end_date')
            ->latest('created_at')
            ->first();
    }

    public function getPendingSubscription(User $user): ?UserPackage
    {
        return $this->subscriptionQueryForUser($user)
            ->where('status', 'pending')
            ->latest()
            ->first();
    }

    public function getAccessOwner(User $user): User
    {
        if ($this->userOwnsMembershipContext($user)) {
            return $user;
        }

        if (($user->isTeacher() || $user->isStudent()) && $user->school_id) {
            $school = User::find($user->school_id);
            if ($school && $school->isSchool() && $this->schoolOwnsMemberAccess($school)) {
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
        if (!$this->hasAvailablePackagesFor($owner)) {
            return true;
        }

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
        $packagesAvailable = $this->hasAvailablePackagesFor($owner);
        $subscription = $this->getActiveSubscription($owner);
        $pendingSubscription = $subscription ? null : $this->getPendingSubscription($owner);
        $latestSubscription = $subscription ?? $pendingSubscription ?? $this->getLatestSubscription($owner);
        $daysRemaining = null;

        if ($subscription?->end_date) {
            $today = now()->startOfDay();
            $endDate = $subscription->end_date->copy()->startOfDay();
            $daysRemaining = $endDate->greaterThanOrEqualTo($today)
                ? $today->diffInDays($endDate)
                : 0;
        }

        $effectiveLatestStatus = $latestSubscription?->effective_status;
        $isExpiringSoon = $subscription !== null
            && $daysRemaining !== null
            && $daysRemaining <= 7;
        $needsRenewal = $packagesAvailable
            && $subscription === null
            && $pendingSubscription === null
            && $effectiveLatestStatus === 'expired';

        return [
            'owner_id' => $owner->id,
            'owner_name' => $owner->name,
            'is_school_owned' => $owner->id !== $user->id,
            'packages_available' => $packagesAvailable,
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
            'has_pending_subscription' => $pendingSubscription !== null,
            'certificate_access' => $this->hasCertificateAccess($user),
            'is_expiring_soon' => $isExpiringSoon,
            'needs_renewal' => $needsRenewal,
            'trial_available' => $packagesAvailable && !$this->hasUsedTrialSubscription($owner),
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'package_name' => $subscription->package->name_ar ?? $subscription->package->name,
                'status' => $subscription->status,
                'start_date' => optional($subscription->start_date)?->format('Y-m-d'),
                'end_date' => optional($subscription->end_date)?->format('Y-m-d'),
                'days_remaining' => $daysRemaining,
                'paid_amount' => $subscription->paid_amount,
                'payment_method' => $subscription->payment_method,
                'is_trial' => (bool) ($subscription->package?->is_trial ?? false),
                'trial_days' => $subscription->package?->trial_days,
                'currency' => $subscription->package?->currency,
            ] : null,
            'pending_subscription' => $pendingSubscription ? [
                'id' => $pendingSubscription->id,
                'package_name' => $pendingSubscription->package->name_ar ?? $pendingSubscription->package->name,
                'status' => $pendingSubscription->status,
                'created_at' => optional($pendingSubscription->created_at)?->format('Y-m-d H:i'),
                'is_trial' => (bool) ($pendingSubscription->package?->is_trial ?? false),
            ] : null,
            'latest_subscription' => $latestSubscription ? [
                'id' => $latestSubscription->id,
                'package_name' => $latestSubscription->package->name_ar ?? $latestSubscription->package->name,
                'status' => $effectiveLatestStatus,
                'start_date' => optional($latestSubscription->start_date)?->format('Y-m-d'),
                'end_date' => optional($latestSubscription->end_date)?->format('Y-m-d'),
                'is_trial' => (bool) ($latestSubscription->package?->is_trial ?? false),
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

    private function schoolOwnsMemberAccess(User $school): bool
    {
        if ($this->getActiveSubscription($school)) {
            return true;
        }

        return $school->membership_type === 'subscription'
            && $school->contract_status === 'active'
            && $school->isContractValid();
    }

    private function hasUsedTrialSubscription(User $user): bool
    {
        return UserPackage::query()
            ->where('user_id', $user->id)
            ->whereHas('package', fn ($query) => $query->where('is_trial', true)->where('is_active', true))
            ->exists();
    }

    public function hasAvailablePackagesFor(User $user): bool
    {
        return \App\Models\Package::query()
            ->where('is_active', true)
            ->get()
            ->contains(fn (\App\Models\Package $package) => $package->supportsRole($user->role));
    }

    private function userOwnsMembershipContext(User $user): bool
    {
        if ($this->getActiveSubscription($user) || $this->getPendingSubscription($user)) {
            return true;
        }

        if ($user->isTeacher() && $user->teacher) {
            return $user->teacher->membership_type === 'subscription'
                && $user->teacher->contract_status === 'active'
                && $user->isTeacherContractValid();
        }

        return $user->membership_type === 'subscription'
            && $user->contract_status === 'active'
            && $user->isContractValid();
    }

    private function subscriptionQueryForUser(User $user)
    {
        return UserPackage::with('package')
            ->where('user_id', $user->id)
            ->whereHas('package', fn ($query) => $query->where('is_active', true));
    }
}
