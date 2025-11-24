<?php

namespace App\ViewModels;

class DashboardViewModel
{
    public function __construct(
        public array $stats,
        public array $recentActivities,
        public array $recentBadges,
        public ?array $upcomingBookings = null,
        public ?array $pendingProjects = null,
    ) {}

    public function toArray(): array
    {
        return [
            'stats' => $this->stats,
            'recent_activities' => $this->recentActivities,
            'recent_badges' => $this->recentBadges,
            'upcoming_bookings' => $this->upcomingBookings,
            'pending_projects' => $this->pendingProjects,
        ];
    }
}

