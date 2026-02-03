<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\UserPackage;
use App\Models\Payment;
use App\Services\ZiinaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PackageSubscriptionController extends Controller
{
    public function __construct(
        private ZiinaService $ziinaService
    ) {}

    /**
     * Display packages page for users
     */
    public function index()
    {
        $packages = Package::where('is_active', true)
            ->orderBy('price', 'asc')
            ->get()
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
                    'features' => $package->features,
                    'features_ar' => $package->features_ar,
                    'is_popular' => $package->is_popular,
                ];
            });

        $userPackage = null;
        if (Auth::check()) {
            $activeSubscription = UserPackage::where('user_id', Auth::id())
                ->where('status', 'active')
                ->with('package')
                ->first();

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
                ];
            }
        }

        return Inertia::render('Packages/Index', [
            'packages' => $packages,
            'userPackage' => $userPackage,
            'auth' => [
                'user' => Auth::check() ? Auth::user() : null,
                'unreadCount' => Auth::check() ? Auth::user()->unreadNotifications()->count() : 0,
            ],
        ]);
    }

    /**
     * Subscribe to a package
     */
    public function subscribe(Request $request, Package $package)
    {
        $request->validate([
            'payment_method' => 'nullable|string',
        ]);

        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login')->with('error', 'يرجى تسجيل الدخول أولاً');
        }

        $activeSubscription = UserPackage::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if ($activeSubscription) {
            return redirect()->back()->with('error', 'لديك اشتراك نشط بالفعل. يرجى إلغاء الاشتراك الحالي أولاً.');
        }

        try {
            DB::beginTransaction();

            $userPackage = UserPackage::create([
                'user_id' => $user->id,
                'package_id' => $package->id,
                'start_date' => now(),
                'end_date' => now()->addMonths($package->duration_months ?? 1),
                'status' => 'pending',
                'auto_renew' => false,
                'paid_amount' => $package->price,
                'payment_method' => 'ziina',
                'transaction_id' => 'TXN-' . Str::upper(Str::random(12)),
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
                'transaction_id' => $userPackage->transaction_id,
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

            if (isset($ziinaResponse['error']) && $ziinaResponse['error']) {
                DB::rollBack();
                return redirect()->back()->with('error', $ziinaResponse['message'] ?? 'فشل في إنشاء طلب الدفع');
            }

            $payment->update([
                'gateway_payment_id' => $ziinaResponse['id'] ?? null,
                'gateway_response' => $ziinaResponse,
            ]);

            DB::commit();

            // Ziina v2 API returns 'redirect_url' for payment page
            if (isset($ziinaResponse['redirect_url'])) {
                return redirect($ziinaResponse['redirect_url']);
            }

            return redirect()->back()->with('error', 'لم يتم الحصول على رابط الدفع');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error subscribing to package', [
                'user_id' => $user->id,
                'package_id' => $package->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->back()->with('error', 'حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى.');
        }
    }


    public function paymentSuccess(Payment $payment)
    {
        try {
            $paymentRequest = $this->ziinaService->getPaymentRequest($payment->gateway_payment_id);

            if ($paymentRequest && isset($paymentRequest['status']) && $paymentRequest['status'] === 'paid') {
                DB::beginTransaction();

                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'gateway_response' => $paymentRequest,
                ]);

                $metadata = $payment->gateway_response['metadata'] ?? [];
                $userPackageId = $metadata['user_package_id'] ?? null;

                if ($userPackageId) {
                    $userPackage = UserPackage::find($userPackageId);
                    if ($userPackage) {
                        $userPackage->update([
                            'status' => 'active',
                            'start_date' => now(),
                        ]);

                        if ($userPackage->package->points_bonus > 0) {
                            $user = $userPackage->user;
                            // Use PointsService for proper integration
                            $pointsService = app(\App\Services\PointsService::class);
                            $pointsService->awardPoints(
                                $user->id,
                                $userPackage->package->points_bonus,
                                'package_bonus',
                                $userPackage->package_id,
                                "Package subscription bonus: {$userPackage->package->name}",
                                "مكافأة اشتراك الباقة: {$userPackage->package->name_ar}"
                            );
                        }
                    }
                }

                DB::commit();

                return redirect()->route('packages.index')->with('success', 'تم الاشتراك بنجاح! تم تفعيل باقتك.');
            }

            return redirect()->route('packages.index')->with('error', 'لم يتم تأكيد الدفع. يرجى التواصل مع الدعم الفني.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error handling payment success', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('packages.index')->with('error', 'حدث خطأ أثناء تأكيد الدفع.');
        }
    }

    /**
     * Handle cancelled payment
     */
    public function paymentCancel(Payment $payment)
    {
        try {
            $payment->update(['status' => 'cancelled']);

            $metadata = $payment->gateway_response['metadata'] ?? [];
            $userPackageId = $metadata['user_package_id'] ?? null;

            if ($userPackageId) {
                $userPackage = UserPackage::find($userPackageId);
                if ($userPackage) {
                    $userPackage->update(['status' => 'cancelled']);
                }
            }

            return redirect()->route('packages.index')->with('info', 'تم إلغاء عملية الدفع.');

        } catch (\Exception $e) {
            Log::error('Error handling payment cancellation', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->route('packages.index')->with('error', 'حدث خطأ.');
        }
    }

    /**
     * Cancel user subscription
     */
    public function cancelSubscription(UserPackage $userPackage)
    {
        $user = Auth::user();

        if ($userPackage->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        try {
            $userPackage->update([
                'status' => 'cancelled',
                'auto_renew' => false,
            ]);

            return redirect()->route('packages.index')->with('success', 'تم إلغاء الاشتراك بنجاح.');

        } catch (\Exception $e) {
            Log::error('Error cancelling subscription', [
                'user_package_id' => $userPackage->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'حدث خطأ أثناء إلغاء الاشتراك.');
        }
    }

    /**
     * View user subscriptions
     */
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
                    ],
                    'start_date' => $subscription->start_date->format('Y-m-d'),
                    'end_date' => $subscription->end_date->format('Y-m-d'),
                    'status' => $subscription->status,
                    'paid_amount' => $subscription->paid_amount,
                    'payment_method' => $subscription->payment_method,
                    'transaction_id' => $subscription->transaction_id,
                    'created_at' => $subscription->created_at->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('Packages/MySubscriptions', [
            'subscriptions' => $subscriptions,
            'auth' => [
                'user' => $user,
                'unreadCount' => $user->unreadNotifications()->count(),
            ],
        ]);
    }
}

