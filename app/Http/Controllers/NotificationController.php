<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {}

    /**
     * جلب جميع الإشعارات للمستخدم
     */
    public function index(Request $request)
    {
        $userId = Auth::id();
        
        if (!$userId) {
            if ($request->expectsJson()) {
                return response()->json([
                    'notifications' => [],
                    'unread_count' => 0,
                ]);
            }
            return redirect()->route('login');
        }

        $notifications = $this->notificationService->getUserNotifications($userId, 20);
        $unreadCount = $this->notificationService->getUnreadCount($userId);

        if ($request->expectsJson()) {
            return response()->json([
                'notifications' => $notifications->items(),
                'unread_count' => $unreadCount,
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                ],
            ]);
        }

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * وضع علامة مقروء على إشعار
     */
    public function markAsRead(Request $request, $id)
    {
        $userId = Auth::id();
        
        if (!$userId) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح',
            ], 401);
        }

        $success = $this->notificationService->markAsRead($userId, $id);
        $unreadCount = $this->notificationService->getUnreadCount($userId);

        if ($request->expectsJson() || $request->wantsJson()) {
            return response()->json([
                'success' => $success,
                'unread_count' => $unreadCount,
            ]);
        }

        return back()->with('success', 'تم تحديد الإشعار كمقروء');
    }

    /**
     * وضع علامة مقروء على جميع الإشعارات
     */
    public function markAllAsRead(Request $request)
    {
        $this->notificationService->markAllAsRead(Auth::id());

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'unread_count' => 0,
            ]);
        }

        return back()->with('success', 'تم تحديد جميع الإشعارات كمقروءة');
    }

    /**
     * جلب عدد الإشعارات غير المقروءة
     */
    public function unreadCount()
    {
        $userId = Auth::id();
        
        if (!$userId) {
            return response()->json([
                'unread_count' => 0,
            ]);
        }
        
        $unreadCount = $this->notificationService->getUnreadCount($userId);
        
        return response()->json([
            'unread_count' => $unreadCount,
        ]);
    }
}
