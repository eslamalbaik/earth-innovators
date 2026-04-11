<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\Payment;
use App\Models\UserPackage;
use App\Services\MembershipAccessService;
use App\Services\PackagePaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PackageSubscriptionController extends Controller
{
    public function __construct(
        private PackagePaymentService $packagePaymentService
    ) {}

    public function index()
    {
        $user = Auth::user();

        $packages = Package::where('is_active', true)
            ->orderByDesc('is_trial')
            ->orderBy('price', 'asc')
            ->get()
            ->filter(fn (Package $package) => $package->supportsRole($user?->role))
            ->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'name_ar' => $package->name_ar,
                    'description' => $package->description,
                    'description_ar' => $package->description_ar,
                    'price' => $package->price,
                    'currency' => $package->currency,
                    'duration_type' => $package->duration_type,
                    'duration_months' => $package->duration_months,
                    'points_bonus' => $package->points_bonus,
                    'projects_limit' => $package->projects_limit,
                    'challenges_limit' => $package->challenges_limit,
                    'certificate_access' => $package->certificate_access,
                    'badge_access' => $package->badge_access,
                    'is_trial' => $package->is_trial,
                    'trial_days' => $package->trial_days,
                    'features' => $package->features,
                    'features_ar' => $package->features_ar,
                    'is_popular' => $package->is_popular,
                    'audience' => $package->resolveAudience(),
                ];
            });

        $userPackage = null;
        $trialStatus = null;
        $membershipSummary = null;
        if ($user) {
            $trialStatus = $this->packagePaymentService->getTrialStatus($user);
            $activeSubscription = $this->packagePaymentService->getActiveSubscription($user);
            $membershipSummary = app(MembershipAccessService::class)->getMembershipSummary($user);

            if ($activeSubscription) {
                $userPackage = [
                    'id' => $activeSubscription->id,
                    'package_id' => $activeSubscription->package->id,
                    'package' => [
                        'id' => $activeSubscription->package->id,
                        'name' => $activeSubscription->package->name,
                        'name_ar' => $activeSubscription->package->name_ar,
                    ],
                    'start_date' => $activeSubscription->start_date->format('Y-m-d'),
                    'end_date' => $activeSubscription->end_date->format('Y-m-d'),
                    'status' => $activeSubscription->status,
                    'is_trial' => (bool) ($activeSubscription->package?->is_trial ?? false),
                ];
            } else {
                // Show the latest pending subscription to avoid "processing..." without feedback
                $pending = $this->packagePaymentService->getLatestPendingSubscription(Auth::user());

                if ($pending) {
                    $userPackage = [
                        'id' => $pending->id,
                        'package_id' => $pending->package->id,
                        'package' => [
                            'id' => $pending->package->id,
                            'name' => $pending->package->name,
                            'name_ar' => $pending->package->name_ar,
                        ],
                        'start_date' => $pending->start_date?->format('Y-m-d'),
                        'end_date' => $pending->end_date?->format('Y-m-d'),
                        'status' => $pending->status,
                        'is_trial' => (bool) ($pending->package?->is_trial ?? false),
                    ];
                }
            }
        }

        return Inertia::render('Packages/Index', [
            'packages' => $packages,
            'userPackage' => $userPackage,
            'trialStatus' => $trialStatus,
            'membershipSummary' => $membershipSummary,
            'auth' => [
                'user' => $user,
                'unreadCount' => $user ? $user->unreadNotifications()->count() : 0,
            ],
        ]);
    }

    public function subscribe(Request $request, Package $package)
    {
        $request->validate([
            'payment_method' => 'nullable|string',
        ]);

        $user = Auth::user();
        if (!$user) {
            return redirect()->route('login')->with('error', [
                'key' => 'toastMessages.authLoginFirst',
            ]);
        }

        $result = $this->packagePaymentService->createSubscriptionCheckout($user, $package);

        if (!$result['success']) {
            return redirect()->back()->with('error', $result['message']);
        }

        if (!empty($result['redirect_url'])) {
            return redirect($result['redirect_url']);
        }

        if (!empty($result['bypass'])) {
            return redirect()->route('packages.index')->with('success', $result['message'] ?? [
                'key' => 'toastMessages.packageSubscriptionActivatedSuccess',
            ]);
        }

        return redirect()->back()->with('error', [
            'key' => 'toastMessages.packagePaymentLinkMissing',
        ]);
    }

    public function paymentSuccess(Payment $payment)
    {
        $result = $this->packagePaymentService->confirmPayment($payment);

        if ($result['success']) {
            return redirect()->route('packages.index')->with('success', $result['message']);
        }

        return redirect()->route('packages.index')->with('error', $result['message']);
    }

    public function paymentCancel(Payment $payment)
    {
        $this->packagePaymentService->markPaymentCancelled($payment, $payment->gateway_response ?? []);

        return redirect()->route('packages.index')->with('info', [
            'key' => 'toastMessages.packagePaymentCancelled',
        ]);
    }

    public function cancelSubscription(UserPackage $userPackage)
    {
        $user = Auth::user();

        if ($userPackage->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        try {
            $this->packagePaymentService->cancelSubscription($userPackage);
            $userPackage->update(['auto_renew' => false]);

            return redirect()->route('packages.index')->with('success', [
                'key' => 'toastMessages.packageSubscriptionCancelledSuccess',
            ]);
        } catch (\Throwable $exception) {
            return redirect()->route('packages.index')->with('error', [
                'key' => 'toastMessages.packageSubscriptionCancelError',
            ]);
        }
    }

    public function mySubscriptions()
    {
        $user = Auth::user();

        $subscriptions = UserPackage::where('user_id', $user->id)
            ->with('package')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'package' => [
                        'id' => $subscription->package->id,
                        'name' => $subscription->package->name,
                        'name_ar' => $subscription->package->name_ar,
                        'price' => $subscription->package->price,
                        'currency' => $subscription->package->currency,
                        'is_trial' => (bool) ($subscription->package->is_trial ?? false),
                        'trial_days' => $subscription->package->trial_days,
                    ],
                    'start_date' => $subscription->start_date->format('Y-m-d'),
                    'end_date' => $subscription->end_date->format('Y-m-d'),
                    'status' => $subscription->effective_status,
                    'raw_status' => $subscription->status,
                    'paid_amount' => $subscription->paid_amount,
                    'payment_method' => $subscription->payment_method,
                    'transaction_id' => $subscription->transaction_id,
                    'created_at' => $subscription->created_at->format('Y-m-d H:i'),
                    'is_trial' => (bool) ($subscription->package->is_trial ?? false),
                ];
            });

        return Inertia::render('Packages/MySubscriptions', [
            'subscriptions' => $subscriptions,
            'membershipSummary' => app(MembershipAccessService::class)->getMembershipSummary($user),
            'auth' => [
                'user' => $user,
                'unreadCount' => $user->unreadNotifications()->count(),
            ],
        ]);
    }
}
