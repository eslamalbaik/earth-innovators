<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    protected $fillable = [
        'user_id',
        'notification_type',
        'enabled',
        'channels',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'channels' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Check if user has enabled this notification type
     */
    public static function isEnabled(int $userId, string $notificationType): bool
    {
        $preference = self::where('user_id', $userId)
            ->where('notification_type', $notificationType)
            ->first();

        return $preference ? $preference->enabled : true; // Default to enabled
    }

    /**
     * Get preferred channels for user and notification type
     */
    public static function getChannels(int $userId, string $notificationType): array
    {
        $preference = self::where('user_id', $userId)
            ->where('notification_type', $notificationType)
            ->first();

        return $preference && $preference->channels 
            ? $preference->channels 
            : ['database', 'broadcast']; // Default channels
    }
}
