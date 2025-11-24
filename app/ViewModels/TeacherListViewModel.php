<?php

namespace App\ViewModels;

use Illuminate\Pagination\LengthAwarePaginator;

class TeacherListViewModel
{
    public function __construct(
        public LengthAwarePaginator $teachers,
        public array $filters,
        public array $stats = [],
    ) {}

    public function toArray(): array
    {
        return [
            'teachers' => $this->teachers->through(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name_ar' => $teacher->name_ar,
                    'city' => $teacher->city,
                    'price_per_hour' => $teacher->price_per_hour,
                    'rating' => $teacher->rating ?? 0,
                    'reviews_count' => $teacher->reviews_count ?? 0,
                    'image' => $teacher->image,
                    'is_verified' => (bool) $teacher->is_verified,
                ];
            }),
            'filters' => $this->filters,
            'stats' => $this->stats,
        ];
    }
}

