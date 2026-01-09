<?php

namespace App\Services;

use App\Models\Package;
use App\Models\UserPackage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Package Service
 *
 * Handles all business logic related to packages management
 * Includes caching, statistics, and subscriber management
 *
 * @package App\Services
 */
class PackageService extends BaseService
{
    /**
     * Get all packages with optional filtering and sorting
     *
     * @param array $filters Optional filters (status, currency, duration_type)
     * @param string $sortBy Sort field (default: 'price')
     * @param string $sortOrder Sort order (asc/desc)
     * @return Collection
     */
    public function getAllPackages(array $filters = [], string $sortBy = 'price', string $sortOrder = 'asc'): Collection
    {
        // Include cache version in key to allow cache invalidation for non-tagging drivers
        $cacheVersion = Cache::get('packages_cache_version', 1);
        $cacheKey = 'all_packages_' . $cacheVersion . '_' . md5(json_encode($filters) . $sortBy . $sortOrder);
        $cacheTag = 'packages';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($filters, $sortBy, $sortOrder) {
            $query = Package::query();

            // Apply filters
            if (isset($filters['status'])) {
                if ($filters['status'] === 'active') {
                    $query->where('is_active', true);
                } elseif ($filters['status'] === 'inactive') {
                    $query->where('is_active', false);
                }
            }

            if (isset($filters['currency'])) {
                $query->where('currency', $filters['currency']);
            }

            if (isset($filters['duration_type'])) {
                $query->where('duration_type', $filters['duration_type']);
            }

            if (isset($filters['popular']) && $filters['popular']) {
                $query->where('is_popular', true);
            }

            // Apply sorting
            $allowedSortFields = ['price', 'name', 'name_ar', 'created_at', 'points_bonus'];
            $sortField = in_array($sortBy, $allowedSortFields) ? $sortBy : 'price';
            $sortDirection = strtolower($sortOrder) === 'desc' ? 'desc' : 'asc';

            $query->orderBy($sortField, $sortDirection);

            return $query->select(
                'id', 'name', 'name_ar', 'description', 'description_ar',
                'price', 'currency', 'duration_type', 'duration_months',
                'points_bonus', 'projects_limit', 'challenges_limit',
                'certificate_access', 'badge_access', 'features', 'features_ar',
                'is_active', 'is_popular', 'created_at'
            )->get();
        }, 3600); // Cache for 1 hour
    }

    /**
     * Get package statistics
     *
     * @return array
     */
    public function getPackageStats(): array
    {
        // Include cache version in key to allow cache invalidation for non-tagging drivers
        $cacheVersion = Cache::get('packages_cache_version', 1);
        $cacheKey = 'package_stats_' . $cacheVersion;
        $cacheTag = 'packages';

        return $this->cacheTags($cacheTag, $cacheKey, function () {
            $totalPackages = Package::count();
            $activePackages = Package::where('is_active', true)->count();
            $popularPackages = Package::where('is_popular', true)->count();
            $totalSubscribers = UserPackage::where('status', 'active')->count();

            // Revenue statistics
            $totalRevenue = UserPackage::where('status', 'active')
                ->sum('paid_amount');

            // Monthly revenue
            $monthlyRevenue = UserPackage::where('status', 'active')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('paid_amount');

            // Most popular package
            $mostPopularPackage = Package::select('packages.*')
                ->selectSub(
                    UserPackage::selectRaw('COUNT(*)')
                        ->whereColumn('user_packages.package_id', 'packages.id'),
                    'subscribers_count'
                )
                ->orderBy('subscribers_count', 'desc')
                ->first();

            return [
                'total' => $totalPackages,
                'active' => $activePackages,
                'popular' => $popularPackages,
                'totalSubscribers' => $totalSubscribers,
                'totalRevenue' => $totalRevenue,
                'monthlyRevenue' => $monthlyRevenue,
                'mostPopularPackage' => $mostPopularPackage ? [
                    'id' => $mostPopularPackage->id,
                    'name' => $mostPopularPackage->name_ar ?? $mostPopularPackage->name,
                    'subscribers_count' => $mostPopularPackage->subscribers_count ?? 0,
                ] : null,
            ];
        }, 300); // Cache for 5 minutes
    }

    /**
     * Create a new package
     *
     * @param array $data Package data
     * @return Package
     */
    public function createPackage(array $data): Package
    {
        // Clean features arrays (remove empty values)
        if (isset($data['features']) && is_array($data['features'])) {
            $data['features'] = array_values(array_filter($data['features'], fn($f) => !empty(trim($f))));
        }

        if (isset($data['features_ar']) && is_array($data['features_ar'])) {
            $data['features_ar'] = array_values(array_filter($data['features_ar'], fn($f) => !empty(trim($f))));
        }

        $package = Package::create($data);

        // Clear cache - clear both tags and specific keys
        $this->forgetCacheTags(['packages']);
        $this->clearPackageCache();

        $this->logInfo('Package created', [
            'package_id' => $package->id,
            'name' => $package->name,
        ]);

        return $package;
    }

    /**
     * Update an existing package
     *
     * @param Package $package
     * @param array $data Updated data
     * @return Package
     */
    public function updatePackage(Package $package, array $data): Package
    {
        // Clean features arrays (remove empty values)
        if (isset($data['features']) && is_array($data['features'])) {
            $data['features'] = array_values(array_filter($data['features'], fn($f) => !empty(trim($f))));
        }

        if (isset($data['features_ar']) && is_array($data['features_ar'])) {
            $data['features_ar'] = array_values(array_filter($data['features_ar'], fn($f) => !empty(trim($f))));
        }

        $package->update($data);

        // Clear cache - clear both tags and specific keys
        $this->forgetCacheTags(['packages']);
        $this->clearPackageCache();

        $this->logInfo('Package updated', [
            'package_id' => $package->id,
            'name' => $package->name,
        ]);

        return $package->fresh();
    }

    /**
     * Delete a package
     *
     * @param Package $package
     * @return bool
     * @throws \Exception If package has active subscribers
     */
    public function deletePackage(Package $package): bool
    {
        // Check if package has active subscribers
        $activeSubscribers = UserPackage::where('package_id', $package->id)
            ->where('status', 'active')
            ->count();

        if ($activeSubscribers > 0) {
            throw new \Exception("لا يمكن حذف الباقة لأنها تحتوي على {$activeSubscribers} مشترك نشط");
        }

        $deleted = $package->delete();

        // Clear cache - clear both tags and specific keys
        $this->forgetCacheTags(['packages']);
        $this->clearPackageCache();

        $this->logInfo('Package deleted', [
            'package_id' => $package->id,
            'name' => $package->name,
        ]);

        return $deleted;
    }

    /**
     * Get package subscribers with pagination
     *
     * @param int $packageId
     * @param int $perPage
     * @param array $filters Optional filters (status, search)
     * @return LengthAwarePaginator
     */
    public function getPackageSubscribers(int $packageId, int $perPage = 20, array $filters = []): LengthAwarePaginator
    {
        $cacheKey = "package_subscribers_{$packageId}_{$perPage}_" . md5(json_encode($filters));
        $cacheTag = "package_{$packageId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($packageId, $perPage, $filters) {
            $query = UserPackage::where('package_id', $packageId)
                ->with(['user:id,name,email']);

            // Apply filters
            if (isset($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            if (isset($filters['search']) && !empty($filters['search'])) {
                $search = $filters['search'];
                $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            return $query->select('id', 'user_id', 'package_id', 'start_date', 'end_date', 'status', 'auto_renew', 'paid_amount', 'payment_method', 'created_at')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }, 300); // Cache for 5 minutes
    }

    /**
     * Get package by ID
     *
     * @param int $packageId
     * @return Package|null
     */
    public function getPackageById(int $packageId): ?Package
    {
        $cacheKey = "package_{$packageId}";
        $cacheTag = 'packages';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($packageId) {
            return Package::find($packageId);
        }, 3600);
    }

    /**
     * Activate/Deactivate a package
     *
     * @param Package $package
     * @param bool $isActive
     * @return Package
     */
    public function togglePackageStatus(Package $package, bool $isActive): Package
    {
        $package->update(['is_active' => $isActive]);

        // Clear cache
        $this->forgetCacheTags(['packages']);

        $this->logInfo('Package status toggled', [
            'package_id' => $package->id,
            'is_active' => $isActive,
        ]);

        return $package->fresh();
    }

    /**
     * Update subscriber status
     *
     * @param UserPackage $userPackage
     * @param string $status (active, expired, cancelled)
     * @return UserPackage
     */
    public function updateSubscriberStatus(UserPackage $userPackage, string $status): UserPackage
    {
        $allowedStatuses = ['active', 'expired', 'cancelled'];

        if (!in_array($status, $allowedStatuses)) {
            throw new \InvalidArgumentException("Invalid status: {$status}");
        }

        $userPackage->update(['status' => $status]);

        // Clear cache
        $this->forgetCacheTags(["package_{$userPackage->package_id}"]);

        $this->logInfo('Subscriber status updated', [
            'user_package_id' => $userPackage->id,
            'status' => $status,
        ]);

        return $userPackage->fresh();
    }

    /**
     * Cancel a subscription
     *
     * @param UserPackage $userPackage
     * @return UserPackage
     */
    public function cancelSubscription(UserPackage $userPackage): UserPackage
    {
        return $this->updateSubscriberStatus($userPackage, 'cancelled');
    }

    /**
     * Renew a subscription
     *
     * @param UserPackage $userPackage
     * @param int $months Number of months to extend
     * @return UserPackage
     */
    public function renewSubscription(UserPackage $userPackage, int $months = 1): UserPackage
    {
        $newEndDate = $userPackage->end_date->addMonths($months);

        $userPackage->update([
            'end_date' => $newEndDate,
            'status' => 'active',
        ]);

        // Clear cache
        $this->forgetCacheTags(["package_{$userPackage->package_id}"]);

        $this->logInfo('Subscription renewed', [
            'user_package_id' => $userPackage->id,
            'months' => $months,
            'new_end_date' => $newEndDate->format('Y-m-d'),
        ]);

        return $userPackage->fresh();
    }

    /**
     * Clear all package-related cache
     *
     * @return void
     */
    protected function clearPackageCache(): void
    {
        // Clear cache tags (works with Redis/Memcached)
        $this->forgetCacheTags(['packages', 'package_stats']);

        // Update cache version to invalidate all cached package data
        // This works for all cache drivers (including file cache)
        Cache::forever('packages_cache_version', time());
    }
}
