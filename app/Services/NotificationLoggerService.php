<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class NotificationLoggerService
{
    /**
     * Log notification creation
     */
    public static function logNotificationCreated(string $notificationType, int $userId, array $data = []): void
    {
        Log::channel('notifications')->info('Notification created', [
            'type' => $notificationType,
            'user_id' => $userId,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ]);
        
        // Also log to default channel for debugging
        Log::info('📬 Notification Created', [
            'type' => $notificationType,
            'user_id' => $userId,
            'user_email' => \App\Models\User::find($userId)?->email ?? 'unknown',
            'data_keys' => array_keys($data),
        ]);
    }

    /**
     * Log notification broadcast
     */
    public static function logNotificationBroadcast(string $notificationType, int $userId, string $channel): void
    {
        Log::channel('notifications')->info('Notification broadcast', [
            'type' => $notificationType,
            'user_id' => $userId,
            'channel' => $channel,
            'timestamp' => now()->toIso8601String(),
        ]);
        
        Log::info('📡 Notification Broadcast', [
            'type' => $notificationType,
            'user_id' => $userId,
            'channel' => $channel,
        ]);
    }

    /**
     * Log event fired
     */
    public static function logEventFired(string $eventName, array $eventData = []): void
    {
        Log::channel('notifications')->info('Event fired', [
            'event' => $eventName,
            'data' => $eventData,
            'timestamp' => now()->toIso8601String(),
        ]);
        
        Log::info('🎯 Event Fired', [
            'event' => $eventName,
            'data_keys' => array_keys($eventData),
        ]);
    }

    /**
     * Log listener execution
     */
    public static function logListenerExecuted(string $listenerName, string $eventName, bool $success = true): void
    {
        Log::channel('notifications')->info('Listener executed', [
            'listener' => $listenerName,
            'event' => $eventName,
            'success' => $success,
            'timestamp' => now()->toIso8601String(),
        ]);
        
        if ($success) {
            Log::info('✅ Listener Executed', [
                'listener' => $listenerName,
                'event' => $eventName,
            ]);
        } else {
            Log::error('❌ Listener Failed', [
                'listener' => $listenerName,
                'event' => $eventName,
            ]);
        }
    }

    /**
     * Log notification error
     */
    public static function logNotificationError(string $error, array $context = []): void
    {
        Log::channel('notifications')->error('Notification error', [
            'error' => $error,
            'context' => $context,
            'timestamp' => now()->toIso8601String(),
        ]);
        
        Log::error('❌ Notification Error', [
            'error' => $error,
            'context' => $context,
        ]);
    }
}

