<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\UserPackage;
use App\Services\PackageService;
use App\Http\Requests\Package\StorePackageRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Package Controller
 * 
 * Handles all admin operations for packages management
 * 
 * @package App\Http\Controllers\Admin
 */
class PackageController extends Controller
{
    public function __construct(
        private PackageService $packageService
    ) {}

    /**
     * Display a listing of packages
     * 
     * @param Request $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Get filters from request
        $filters = [
            'status' => $request->get('status'),
            'currency' => $request->get('currency'),
            'duration_type' => $request->get('duration_type'),
            'popular' => $request->boolean('popular'),
        ];

        // Get sort parameters
        $sortBy = $request->get('sort_by', 'price');
        $sortOrder = $request->get('sort_order', 'asc');

        // Get packages
        $packages = $this->packageService->getAllPackages($filters, $sortBy, $sortOrder)
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
                    'is_active' => $package->is_active,
                    'is_popular' => $package->is_popular,
                    'created_at' => $package->created_at->format('Y-m-d H:i'),
                    'subscribers_count' => UserPackage::where('package_id', $package->id)
                        ->where('status', 'active')
                        ->count(),
                ];
            })
            ->values();

        // Apply search filter if provided
        $search = $request->get('search');
        if ($search) {
            $searchLower = strtolower($search);
            $packages = $packages->filter(function ($package) use ($searchLower) {
                return (
                    (isset($package['name_ar']) && str_contains(strtolower($package['name_ar']), $searchLower)) ||
                    (isset($package['name']) && str_contains(strtolower($package['name']), $searchLower)) ||
                    (isset($package['description_ar']) && str_contains(strtolower($package['description_ar']), $searchLower))
                );
            })->values();
        }

        $stats = $this->packageService->getPackageStats();

        return Inertia::render('Admin/Packages/Index', [
            'packages' => $packages,
            'stats' => $stats,
            'filters' => $filters,
            'sortBy' => $sortBy,
            'sortOrder' => $sortOrder,
            'search' => $search,
        ]);
    }

    /**
     * Show the form for creating a new package
     * 
     * @return \Inertia\Response
     */
    public function create()
    {
        return Inertia::render('Admin/Packages/Create');
    }

    /**
     * Store a newly created package
     * 
     * @param StorePackageRequest $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(StorePackageRequest $request)
    {
        $this->packageService->createPackage($request->validated());

        return redirect()->route('admin.packages.index')
            ->with('success', 'تم إنشاء الباقة بنجاح');
    }

    /**
     * Show the form for editing a package
     * 
     * @param Package $package
     * @return \Inertia\Response
     */
    public function edit(Package $package)
    {
        return Inertia::render('Admin/Packages/Edit', [
            'package' => [
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
                'features' => $package->features ?? [],
                'features_ar' => $package->features_ar ?? [],
                'is_active' => $package->is_active,
                'is_popular' => $package->is_popular,
            ],
        ]);
    }

    /**
     * Update a package
     * 
     * @param StorePackageRequest $request
     * @param Package $package
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(StorePackageRequest $request, Package $package)
    {
        $this->packageService->updatePackage($package, $request->validated());

        return redirect()->route('admin.packages.index')
            ->with('success', 'تم تحديث الباقة بنجاح');
    }

    /**
     * Delete a package
     * 
     * @param Package $package
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Package $package)
    {
        try {
            $this->packageService->deletePackage($package);

            return redirect()->route('admin.packages.index')
                ->with('success', 'تم حذف الباقة بنجاح');
        } catch (\Exception $e) {
            return redirect()->route('admin.packages.index')
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Toggle package active status
     * 
     * @param Package $package
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggleStatus(Package $package)
    {
        $this->packageService->togglePackageStatus($package, !$package->is_active);

        return redirect()->back()
            ->with('success', 'تم تحديث حالة الباقة بنجاح');
    }

    /**
     * Get package subscribers
     * 
     * @param Request $request
     * @param Package $package
     * @return \Inertia\Response
     */
    public function subscribers(Request $request, Package $package)
    {
        $filters = [
            'status' => $request->get('status'),
            'search' => $request->get('search'),
        ];

        $subscribers = $this->packageService->getPackageSubscribers(
            $package->id, 
            20, 
            $filters
        )->through(function ($subscriber) {
            return [
                'id' => $subscriber->id,
                'user' => [
                    'id' => $subscriber->user->id ?? null,
                    'name' => $subscriber->user->name ?? 'غير معروف',
                    'email' => $subscriber->user->email ?? '—',
                ],
                'start_date' => $subscriber->start_date ? $subscriber->start_date->format('Y-m-d') : null,
                'end_date' => $subscriber->end_date ? $subscriber->end_date->format('Y-m-d') : null,
                'status' => $subscriber->status,
                'auto_renew' => $subscriber->auto_renew,
                'paid_amount' => $subscriber->paid_amount,
                'payment_method' => $subscriber->payment_method,
                'created_at' => $subscriber->created_at->format('Y-m-d H:i'),
            ];
        });

        return Inertia::render('Admin/Packages/Subscribers', [
            'package' => [
                'id' => $package->id,
                'name' => $package->name,
                'name_ar' => $package->name_ar,
                'price' => $package->price,
                'currency' => $package->currency,
                'duration_type' => $package->duration_type,
            ],
            'subscribers' => $subscribers,
            'filters' => $filters,
        ]);
    }

    /**
     * Update subscriber status
     * 
     * @param Request $request
     * @param UserPackage $userPackage
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateSubscriberStatus(Request $request, UserPackage $userPackage)
    {
        $request->validate([
            'status' => 'required|in:active,expired,cancelled',
        ]);

        try {
            $this->packageService->updateSubscriberStatus($userPackage, $request->status);

            return redirect()->back()
                ->with('success', 'تم تحديث حالة المشترك بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Cancel a subscription
     * 
     * @param UserPackage $userPackage
     * @return \Illuminate\Http\RedirectResponse
     */
    public function cancelSubscription(UserPackage $userPackage)
    {
        try {
            $this->packageService->cancelSubscription($userPackage);

            return redirect()->back()
                ->with('success', 'تم إلغاء الاشتراك بنجاح');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }

    /**
     * Renew a subscription
     * 
     * @param Request $request
     * @param UserPackage $userPackage
     * @return \Illuminate\Http\RedirectResponse
     */
    public function renewSubscription(Request $request, UserPackage $userPackage)
    {
        $request->validate([
            'months' => 'required|integer|min:1|max:12',
        ]);

        try {
            $this->packageService->renewSubscription($userPackage, $request->months);

            return redirect()->back()
                ->with('success', "تم تجديد الاشتراك لمدة {$request->months} شهر بنجاح");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }
}
