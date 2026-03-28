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

    public function createSubscriptionCheckout(User $user, Package $package): array
    {
        if ($this->getActiveSubscription($user)) {
            return [
                'success' => false,
                'message' => ['key' => 'toastMessages.activeSubscriptionExists'],
            ];
        }

        try {
            DB::beginTransaction();

            $pendingSubscriptionIds = UserPackage::where('user_id', $user->id)
                ->where('status', 'pending')
                ->pluck('id');

            if ($pendingSubscriptionIds->isNotEmpty()) {
                UserPackage::whereIn('id', $pendingSubscriptionIds)->update(['status' => 'cancelled']);

                Payment::whereIn('user_package_id', $pendingSubscriptionIds)
                    ->where('status', 'pending')
                    ->update(['status' => 'cancelled']);
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
                DB::rollBack();

                return [
                    'success' => false,
                    'message' => $ziinaResponse['message'] ?? ['key' => 'toastMessages.packagePaymentRequestFailed'],
                ];
            }

            $payment->update([
                'gateway_payment_id' => $ziinaResponse['id'] ?? null,
                'gateway_response' => $ziinaResponse,
            ]);

            $redirectUrl = $ziinaResponse['redirect_url'] ?? $ziinaResponse['redirectUrl'] ?? null;
            if (!$redirectUrl) {
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
                'message' => ['key' => 'toastMessages.packageSubscriptionStartError'],
            ];
        }
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
}
