<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\DashboardService;
use App\Services\ActivityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Check if user is a student
        if (!$user || $user->role !== 'student') {
            abort(403, 'Unauthorized action.');
        }

        try {
            // Get optimized dashboard stats from service
            $dashboardService = app(DashboardService::class);
            $stats = $dashboardService->getStudentDashboardStats($user->id);

            // Get recent activities
            $activityService = app(ActivityService::class);
            $activities = $activityService->getStudentActivities($user->id, 5);

            // Get recent badges
            $recentBadges = $activityService->getRecentBadges($user->id, 3);
        } catch (\Exception $e) {
            // Fallback if services fail
            $stats = [
                'total_projects' => 0,
                'approved_projects' => 0,
                'pending_projects' => 0,
                'winning_projects' => 0,
                'total_points' => $user->points ?? 0,
                'total_badges' => 0,
                'recent_projects' => [],
            ];
            $activities = collect([]);
            $recentBadges = collect([]);
        }

        // Get school info
        $school = $user->school;

        // Get unread notifications
        $unreadNotifications = $user->unreadNotifications()
            ->where('type', 'App\Notifications\ProjectEvaluatedNotification')
            ->select('id', 'data', 'created_at', 'read_at')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'message' => $notification->data['message_ar'] ?? $notification->data['message'] ?? 'تم تقييم مشروعك',
                    'project_title' => $notification->data['project_title'] ?? '',
                    'rating' => $notification->data['rating'] ?? null,
                    'created_at' => $notification->created_at->diffForHumans(),
                    'read_at' => $notification->read_at,
                ];
            });

        $stats['activities'] = $activities;
        $stats['recentBadges'] = $recentBadges;
        $stats['notifications'] = $unreadNotifications;
        $stats['unreadCount'] = $user->unreadNotifications()->count();
        $stats['school'] = $school ? [
            'id' => $school->id,
            'name' => $school->name,
        ] : null;

        return Inertia::render('Student/Dashboard', [
            'stats' => $stats,
        ]);
    }
}
