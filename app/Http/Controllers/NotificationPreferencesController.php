<?php

namespace App\Http\Controllers;

use App\Models\NotificationPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationPreferencesController extends Controller
{
    /**
     * Get user notification preferences
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $preferences = NotificationPreference::where('user_id', $user->id)
            ->get()
            ->keyBy('notification_type')
            ->map(function ($pref) {
                return [
                    'enabled' => $pref->enabled,
                    'channels' => $pref->channels ?? [],
                ];
            })
            ->toArray();

        // Default preferences for admin
        $defaultPreferences = [
            'email_notifications' => [
                'enabled' => $preferences['email_notifications']['enabled'] ?? true,
                'channels' => $preferences['email_notifications']['channels'] ?? ['email'],
            ],
            'popup_notifications' => [
                'enabled' => $preferences['popup_notifications']['enabled'] ?? true,
                'channels' => $preferences['popup_notifications']['channels'] ?? ['database', 'broadcast'],
            ],
            'platform_updates' => [
                'enabled' => $preferences['platform_updates']['enabled'] ?? false,
                'channels' => $preferences['platform_updates']['channels'] ?? ['email'],
            ],
        ];

        return response()->json($defaultPreferences);
    }

    /**
     * Update notification preferences
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $validated = $request->validate([
            'email_notifications' => 'nullable|boolean',
            'popup_notifications' => 'nullable|boolean',
            'platform_updates' => 'nullable|boolean',
        ]);

        $preferences = [
            'email_notifications' => [
                'enabled' => $validated['email_notifications'] ?? true,
                'channels' => ['email'],
            ],
            'popup_notifications' => [
                'enabled' => $validated['popup_notifications'] ?? true,
                'channels' => ['database', 'broadcast'],
            ],
            'platform_updates' => [
                'enabled' => $validated['platform_updates'] ?? false,
                'channels' => ['email'],
            ],
        ];

        foreach ($preferences as $type => $pref) {
            NotificationPreference::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'notification_type' => $type,
                ],
                [
                    'enabled' => $pref['enabled'],
                    'channels' => $pref['channels'],
                ]
            );
        }

        return response()->json([
            'message' => 'تم تحديث تفضيلات الإشعارات بنجاح',
            'preferences' => $preferences,
        ]);
    }
}

