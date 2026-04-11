<?php

namespace App\Services;

use App\Models\Package;
use App\Models\Payment;
use App\Models\User;
use App\Models\UserPackage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PackagePaymentService extends BaseService
{
    public function __construct(
        private ZiinaService $ziinaService,
        private PackageService $packageService,
        private MembershipAccessService $membershipAccessService
    ) {}

    public function getActiveSubscription(User $user): ?UserPackage
    {
        return UserPackage::where('user_id', $user->id)
            ->currentActive()
            ->with('package')
            ->first();
    }

    public function getLatestPendingSubscription(User $user): ?UserPackage
    {
        return UserPackage::where('user_id', $user->id)
            ->where('status', 'pending')
            ->with('package')
            ->latest()
            ->first();
    }

    public function hasUsedTrialSubscription(User $user): bool
    {
        return UserPackage::query()
            ->where('user_id', $user->id)
            ->whereHas('package', fn ($query) => $query->where('is_trial', true))
            ->exists();
    }

    public function getTrialStatus(User $user): array
    {
        $usedTrial = UserPackage::query()
            ->where('user_id', $user->id)
            ->whereHas('package', fn ($query) => $query->where('is_trial', true))
            ->with('package')
            ->latest()
            ->first();

        return [
            'used' => $usedTrial !== null,
            'available' => $usedTrial === null,
            'used_package_name' => $usedTrial?->package?->name_ar ?? $usedTrial?->package?->name,
            'used_at' => optional($usedTrial?->created_at)?->format('Y-m-d'),
        ];
    }

    public function activateDefaultTrialForNewUser(User $user): ?UserPackage
    {
        $owner = $this->membershipAccessService->getAccessOwner($user);
        if ($owner->id !== $user->id) {
            return $this->getActiveSubscription($owner);
        }

        if ($this->getActiveSubscription($user) || $this->hasUsedTrialSubscription($user)) {
            return $this->getActiveSubscription($user);
        }

        $trialPackage = Package::query()
            ->where('is_active', true)
            ->where('is_trial', true)
            ->orderByDesc('trial_days')
            ->first();

        if (!$trialPackage) {
            return null;
        }

        DB::transaction(function () use ($user, $trialPackage) {
            $this->cancelPendingSubscriptions($user);
            $this->activateInstantSubscription($user, $trialPackage);
        });

        return $this->getActiveSubscription($user);
    }

    public function createSubscriptionCheckout(User $user, Package $package): array
    {
        if ($this->getActiveSubscription($user)) {
            return [
                'success' => false,
                'message' => ['key' => 'toastMessages.activeSubscriptionExists'],
            ];
        }

        if ($package->is_trial && $this->hasUsedTrialSubscription($user)) {
            return [
                'success' => false,
                'message' => ['key' => 'toastMessages.packageTrialAlreadyUsed'],
            ];
        }

        try {
            DB::beginTransaction();

            $this->cancelPendingSubscriptions($user);

            if ($this->shouldActivateInstantly($package)) {
                $result = $this->activateInstantSubscription($user, $package);
                DB::commit();

                return $result;
            }

            $transactionId = 'TXN-' . Str::upper(Str::random(12));

            $userPackage = UserPackage::create([
                'user_id' => $user->id,
                'package_id' => $package->id,
                'start_date' => now(),
                'end_date' => now()->addMonths($package->duration_months ?? 1),
                'status' => 'pending',
                'auto_renew' => false,
                'paid_amount' => $package->price,
                'payment_method' => 'ziina',
                'transaction_id' => $transactionId,
            ]);

            $payment = Payment::create([
                'student_id' => $user->id,
                'package_id' => $package->id,
                'user_package_id' => $userPackage->id,
                'amount' => $package->price,
                'currency' => $package->currency,
                'status' => 'pending',
                'payment_method' => 'ziina',
                'payment_gateway' => 'Ziina',
                'transaction_id' => $transactionId,
                'payment_reference' => 'PKG-' . $package->id . '-' . $user->id . '-' . time(),
            ]);

            $paymentData = [
                'amount' => $package->price,
                'currency' => $package->currency,
                'description' => app()->getLocale() === 'ar'
                    ? "اشتراك في باقة: {$package->name_ar}"
                    : "Subscription to package: {$package->name}",
                'metadata' => [
                    'user_id' => $user->id,
                    'package_id' => $package->id,
                    'user_package_id' => $userPackage->id,
                    'payment_id' => $payment->id,
                ],
                'success_url' => route('packages.payment.success', $payment->id),
                'cancel_url' => route('packages.payment.cancel', $payment->id),
            ];

            $ziinaResponse = $this->ziinaService->createPaymentRequest($paymentData);

            if (($ziinaResponse['error'] ?? false) === true) {
                if ($this->shouldBypassPayment()) {
                    DB::commit();
                    $this->finalizePayment($payment->fresh(), [
                        'status' => 'paid',
                        'bypass' => true,
                        'source' => 'test_mode',
                    ]);

                    return [
                        'success' => true,
                        'bypass' => true,
                        'message' => ['key' => 'toastMessages.packageSubscriptionActivatedSuccess'],
                    ];
                }

                DB::rollBack();

                return [
                    'success' => false,
                    'message' => $this->normalizeErrorMessage(
                        $ziinaResponse['message'] ?? ['key' => 'toastMessages.packagePaymentRequestFailed']
                    ),
                ];
            }

            $payment->update([
                'gateway_payment_id' => $ziinaResponse['id'] ?? null,
                'gateway_response' => $ziinaResponse,
            ]);

            $redirectUrl = $ziinaResponse['redirect_url'] ?? $ziinaResponse['redirectUrl'] ?? null;
            if (!$redirectUrl) {
                if ($this->shouldBypassPayment()) {
                    DB::commit();
                    $this->finalizePayment($payment->fresh(), [
                        'status' => 'paid',
                        'bypass' => true,
                        'source' => 'test_mode',
                    ]);

                    return [
                        'success' => true,
                        'bypass' => true,
                        'message' => ['key' => 'toastMessages.packageSubscriptionActivatedSuccess'],
                    ];
                }

                DB::rollBack();

                return [
                    'success' => false,
                    'message' => ['key' => 'toastMessages.packagePaymentLinkMissing'],
                ];
            }

            DB::commit();

            return [
                'success' => true,
                'payment' => $payment->fresh(),
                'userPackage' => $userPackage->fresh(),
                'redirect_url' => $redirectUrl,
            ];
        } catch (\Throwable $exception) {
            DB::rollBack();

            Log::error('Error creating package subscription checkout', [
                'user_id' => $user->id,
                'package_id' => $package->id,
                'error' => $exception->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $this->normalizeErrorMessage(['key' => 'toastMessages.packageSubscriptionStartError']),
            ];
        }
    }

    private function shouldBypassPayment(): bool
    {
        return app()->environment('local')
            && (bool) config('services.ziina.test_mode', true)
            && (bool) config('services.ziina.test_bypass', false);
    }

    private function shouldActivateInstantly(Package $package): bool
    {
        return (bool) $package->is_trial || (float) $package->price <= 0;
    }

    public function confirmPayment(Payment $payment): array
    {
        try {
            if ($payment->status === 'completed') {
                return [
                    'success' => true,
                    'message' => ['key' => 'toastMessages.packageSubscriptionActivatedSuccess'],
                ];
            }

            if (!$payment->gateway_payment_id) {
                return [
                    'success' => false,
                    'message' => ['key' => 'toastMessages.packagePaymentNotConfirmed'],
                ];
            }

            $paymentRequest = $this->ziinaService->getPaymentRequest($payment->gateway_payment_id);

            if ($paymentRequest && ($paymentRequest['status'] ?? null) === 'paid') {
                $this->finalizePayment($payment, $paymentRequest);

                return [
                    'success' => true,
                    'message' => ['key' => 'toastMessages.packageSubscriptionActivatedSuccess'],
                ];
            }

            return [
                'success' => false,
                'message' => ['key' => 'toastMessages.packagePaymentNotConfirmed'],
            ];
        } catch (\Throwable $exception) {
            Log::error('Error confirming package payment', [
                'payment_id' => $payment->id,
                'error' => $exception->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => ['key' => 'toastMessages.packagePaymentConfirmationError'],
            ];
        }
    }

    public function finalizePayment(Payment $payment, array $gatewayData = []): void
    {
        if ($payment->status === 'completed') {
            return;
        }

        DB::transaction(function () use ($payment, $gatewayData) {
            $payment->update([
                'status' => 'completed',
                'paid_at' => now(),
                'gateway_response' => array_merge($payment->gateway_response ?? [], $gatewayData),
            ]);

            $userPackage = $payment->userPackage;
            if (!$userPackage && $payment->user_package_id) {
                $userPackage = UserPackage::find($payment->user_package_id);
            }

            if (!$userPackage) {
                return;
            }

            $userPackage->update([
                'status' => 'active',
                'start_date' => now(),
            ]);

            $this->membershipAccessService->syncMembershipFromUserPackage($userPackage);

            if (($userPackage->package->points_bonus ?? 0) > 0) {
                app(PointsService::class)->awardPoints(
                    $userPackage->user->id,
                    $userPackage->package->points_bonus,
                    'package_bonus',
                    $userPackage->package_id,
                    "Package subscription bonus: {$userPackage->package->name}",
                    "مكافأة اشتراك الباقة: {$userPackage->package->name_ar}"
                );
            }
        });
    }

    public function markPaymentFailed(Payment $payment, array $gatewayData = []): void
    {
        DB::transaction(function () use ($payment, $gatewayData) {
            $payment->update([
                'status' => 'failed',
                'failed_at' => now(),
                'gateway_response' => array_merge($payment->gateway_response ?? [], $gatewayData),
            ]);

            if ($payment->userPackage && $payment->userPackage->status === 'pending') {
                $payment->userPackage->update(['status' => 'cancelled']);
            }
        });
    }

    public function markPaymentCancelled(Payment $payment, array $gatewayData = []): void
    {
        DB::transaction(function () use ($payment, $gatewayData) {
            $payment->update([
                'status' => 'cancelled',
                'gateway_response' => array_merge($payment->gateway_response ?? [], $gatewayData),
            ]);

            if ($payment->userPackage && $payment->userPackage->status === 'pending') {
                $payment->userPackage->update(['status' => 'cancelled']);
            }
        });
    }

    public function cancelSubscription(UserPackage $userPackage): void
    {
        if ($userPackage->status === 'pending') {
            $userPackage->update(['status' => 'cancelled']);
            return;
        }

        $this->packageService->cancelSubscription($userPackage);
    }

    private function cancelPendingSubscriptions(User $user): void
    {
        $pendingSubscriptionIds = UserPackage::where('user_id', $user->id)
            ->where('status', 'pending')
            ->pluck('id');

        if ($pendingSubscriptionIds->isEmpty()) {
            return;
        }

        UserPackage::whereIn('id', $pendingSubscriptionIds)->update(['status' => 'cancelled']);

        Payment::whereIn('user_package_id', $pendingSubscriptionIds)
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);
    }

    private function activateInstantSubscription(User $user, Package $package): array
    {
        $transactionId = ($package->is_trial ? 'TRIAL-' : 'FREE-') . Str::upper(Str::random(12));
        $startDate = now();
        $endDate = $package->is_trial
            ? now()->addDays((int) ($package->trial_days ?? 14))
            : now()->addMonths($package->duration_months ?? 1);

        $userPackage = UserPackage::create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => 'pending',
            'auto_renew' => false,
            'paid_amount' => 0,
            'payment_method' => $package->is_trial ? 'trial' : 'free',
            'transaction_id' => $transactionId,
        ]);

        $payment = Payment::create([
            'student_id' => $user->id,
            'package_id' => $package->id,
            'user_package_id' => $userPackage->id,
            'amount' => 0,
            'currency' => $package->currency,
            'status' => 'pending',
            'payment_method' => $package->is_trial ? 'trial' : 'free',
            'payment_gateway' => $package->is_trial ? 'TrialActivation' : 'InternalActivation',
            'transaction_id' => $transactionId,
            'payment_reference' => 'PKG-' . $package->id . '-' . $user->id . '-' . time(),
        ]);

        $this->finalizePayment($payment->fresh(), [
            'status' => 'paid',
            'source' => $package->is_trial ? 'trial_package' : 'free_package',
        ]);

        return [
            'success' => true,
            'bypass' => true,
            'message' => ['key' => $package->is_trial
                ? 'toastMessages.packageTrialActivatedSuccess'
                : 'toastMessages.packageSubscriptionActivatedSuccess'],
        ];
    }

    /**
        * Normalize known gateway error messages into translatable keys.
        */
    private function normalizeErrorMessage($message)
    {
        if (is_string($message)) {
            $lower = strtolower($message);
            if (str_contains($lower, 'attempting to transfer') && str_contains($lower, 'inactive')) {
                return ['key' => 'toastMessages.packagePaymentRequestFailed'];
            }
            if (str_contains($lower, 'inactive user')) {
                return ['key' => 'toastMessages.packagePaymentRequestFailed'];
            }
        }

        return $message;
    }
}
