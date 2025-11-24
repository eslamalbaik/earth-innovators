<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\UserPackage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index()
    {
        $packages = $this->packageService->getAllPackages();
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
            'package' => $package,
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
        $subscribers = $this->packageService->getPackageSubscribers($package->id, 20);

        return Inertia::render('Admin/Packages/Subscribers', [
            'package' => $package,
            'subscribers' => $subscribers,
        ]);
    }
}
