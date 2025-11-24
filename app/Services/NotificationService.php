<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class NotificationService extends BaseService
{
    public function getUserNotifications(int $userId, int $perPage = 20): LengthAwarePaginator
    {
        try {
            $user = \App\Models\User::findOrFail($userId);
            
            $notifications = $user->notifications()
                ->latest()
                ->paginate($perPage);

            $notifications->getCollection()->transform(function ($notification) {
                $data = is_array($notification->data) ? $notification->data : (is_string($notification->data) ? json_decode($notification->data, true) : []);
                
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $data,
                    'read_at' => $notification->read_at?->format('Y-m-d H:i:s'),
                    'created_at' => $notification->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $notification->created_at->diffForHumans(),
                ];
            });

            return $notifications;
        } catch (\Exception $e) {
            \Log::error('Error fetching user notifications: ' . $e->getMessage(), [
                'user_id' => $userId,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function getUnreadCount(int $userId): int
    {
        $cacheKey = "user_unread_count_{$userId}";
        $cacheTag = "user_notifications_{$userId}";

        // Cache for 1 minute only (notifications change frequently)
        return $this->cacheTags($cacheTag, $cacheKey, function () use ($userId) {
            $user = \App\Models\User::findOrFail($userId);
            return $user->unreadNotifications()->count();
        }, 60); // Cache for 1 minute
    }

    public function markAsRead(int $userId, string $notificationId): bool
    {
        try {
            $user = \App\Models\User::findOrFail($userId);
            $notification = $user->notifications()->find($notificationId);
            
            if ($notification && !$notification->read_at) {
                $notification->markAsRead();
                
                // Clear cache
                $this->forgetCacheTags(["user_notifications_{$userId}"]);
                
                \Log::info('Notification marked as read', [
                    'user_id' => $userId,
                    'notification_id' => $notificationId,
                ]);
                
                return true;
            }
            
            return false;
        } catch (\Exception $e) {
            \Log::error('Error marking notification as read: ' . $e->getMessage(), [
                'user_id' => $userId,
                'notification_id' => $notificationId,
            ]);
            return false;
        }
    }

    public function markAllAsRead(int $userId): bool
    {
        $user = \App\Models\User::findOrFail($userId);
        $user->unreadNotifications->markAsRead();
        
        // Clear cache
        $this->forgetCacheTags(["user_notifications_{$userId}"]);
        
        return true;
    }
}

