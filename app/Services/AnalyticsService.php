<?php

namespace App\Services;

use App\Models\Publication;
use App\Models\User;
use Illuminate\Pagination\Paginator;

class AnalyticsService
{
    /**
     * Get top schools by publication likes and views
     */
    public function topSchools(int $limit = 5)
    {
        return Publication::where('status', 'approved')
            ->selectRaw('school_id, COUNT(id) as publication_count, SUM(likes_count) as total_likes, SUM(views) as total_views')
            ->groupBy('school_id')
            ->orderByDesc('total_likes')
            ->limit($limit)
            ->with('school:id,name')
            ->get()
            ->map(fn($pub) => [
                'school_id' => $pub->school_id,
                'school_name' => $pub->school?->name ?? 'Unknown',
                'publication_count' => $pub->publication_count,
                'total_likes' => $pub->total_likes ?? 0,
                'total_views' => $pub->total_views ?? 0,
            ]);
    }

    /**
     * Get top students by publication likes and views
     */
    public function topStudents(int $limit = 5)
    {
        return Publication::where('status', 'approved')
            ->selectRaw('author_id, COUNT(id) as publication_count, SUM(likes_count) as total_likes, SUM(views) as total_views')
            ->groupBy('author_id')
            ->orderByDesc('total_likes')
            ->limit($limit)
            ->with('author:id,name')
            ->get()
            ->map(fn($pub) => [
                'author_id' => $pub->author_id,
                'author_name' => $pub->author?->name ?? 'Unknown',
                'publication_count' => $pub->publication_count,
                'total_likes' => $pub->total_likes ?? 0,
                'total_views' => $pub->total_views ?? 0,
            ]);
    }

    /**
     * Get dashboard stats for analytics
     */
    public function getDashboardStats()
    {
        return [
            'total_publications' => Publication::count(),
            'approved_publications' => Publication::where('status', 'approved')->count(),
            'pending_publications' => Publication::where('status', 'pending')->count(),
            'total_likes' => Publication::sum('likes_count') ?? 0,
            'total_views' => Publication::sum('views') ?? 0,
            'total_schools' => User::where('role', 'school')->count(),
            'total_students' => User::where('role', 'student')->count(),
            'total_teachers' => User::where('role', 'teacher')->count(),
        ];
    }
}
