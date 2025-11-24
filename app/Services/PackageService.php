<?php

namespace App\Services;

use App\Models\Package;
use App\Models\UserPackage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PackageService extends BaseService
{
    public function getAllPackages(): Collection
    {
        $cacheKey = 'all_packages';
        $cacheTag = 'packages';

        return $this->cacheTags($cacheTag, $cacheKey, function () {
            return Package::orderBy('price')
                ->select('id', 'name', 'name_ar', 'description', 'description_ar', 'price', 'currency', 'duration_type', 'duration_months', 'points_bonus', 'projects_limit', 'challenges_limit', 'certificate_access', 'badge_access', 'features', 'features_ar', 'is_active', 'is_popular', 'created_at')
                ->get();
        }, 3600); // Cache for 1 hour
    }

    public function getPackageStats(): array
    {
        $cacheKey = 'package_stats';
        $cacheTag = 'packages';

        return $this->cacheTags($cacheTag, $cacheKey, function () {
            return [
                'total' => Package::count(),
                'active' => Package::where('is_active', true)->count(),
                'popular' => Package::where('is_popular', true)->count(),
                'totalSubscribers' => UserPackage::where('status', 'active')->count(),
            ];
        }, 300); // Cache for 5 minutes
    }

    public function createPackage(array $data): Package
    {
        $package = Package::create($data);

        // Clear cache
        $this->forgetCacheTags(['packages']);

        return $package;
    }

    public function updatePackage(Package $package, array $data): Package
    {
        $package->update($data);

        // Clear cache
        $this->forgetCacheTags(['packages']);

        return $package->fresh();
    }

    public function deletePackage(Package $package): bool
    {
        $deleted = $package->delete();

        // Clear cache
        $this->forgetCacheTags(['packages']);

        return $deleted;
    }

    public function getPackageSubscribers(int $packageId, int $perPage = 20): LengthAwarePaginator
    {
        $cacheKey = "package_subscribers_{$packageId}_{$perPage}";
        $cacheTag = "package_{$packageId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($packageId, $perPage) {
            return UserPackage::where('package_id', $packageId)
                ->with('user:id,name,email')
                ->select('id', 'user_id', 'package_id', 'start_date', 'end_date', 'status', 'created_at')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }
}

