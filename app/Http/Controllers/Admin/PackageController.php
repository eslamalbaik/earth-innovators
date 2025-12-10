<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\UserPackage;
use App\Services\PackageService;
use App\Http\Requests\Package\StorePackageRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function __construct(
        private PackageService $packageService
    ) {}

    public function index()
    {
        $packages = $this->packageService->getAllPackages()
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
                ];
            })
            ->values();

        $stats = $this->packageService->getPackageStats();

        return Inertia::render('Admin/Packages/Index', [
            'packages' => $packages,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Packages/Create');
    }

    public function store(StorePackageRequest $request)
    {
        $this->packageService->createPackage($request->validated());

        return redirect()->route('admin.packages.index')
            ->with('success', 'تم إنشاء الباقة بنجاح');
    }

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
                'features' => $package->features,
                'features_ar' => $package->features_ar,
                'is_active' => $package->is_active,
                'is_popular' => $package->is_popular,
            ],
        ]);
    }

    public function update(StorePackageRequest $request, Package $package)
    {
        $this->packageService->updatePackage($package, $request->validated());

        return redirect()->route('admin.packages.index')
            ->with('success', 'تم تحديث الباقة بنجاح');
    }

    public function destroy(Package $package)
    {
        $this->packageService->deletePackage($package);

        return redirect()->route('admin.packages.index')
            ->with('success', 'تم حذف الباقة بنجاح');
    }

    public function subscribers(Package $package)
    {
        $subscribers = $this->packageService->getPackageSubscribers($package->id, 20)
            ->through(function ($subscriber) {
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
        ]);
    }
}
