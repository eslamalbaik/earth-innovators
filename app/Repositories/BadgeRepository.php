<?php

namespace App\Repositories;

use App\Models\Badge;
use Illuminate\Database\Eloquent\Collection;

class BadgeRepository extends BaseRepository
{
    protected function model(): string
    {
        return Badge::class;
    }

    public function getAvailableBadgesForSchool(?int $schoolId = null): Collection
    {
        $query = $this->model->where('is_active', true);

        if ($schoolId) {
            $query->where(function ($q) use ($schoolId) {
                $q->whereNull('school_id')
                  ->orWhere('school_id', $schoolId);
            });
        } else {
            $query->whereNull('school_id');
        }

        return $query->orderBy('name_ar')->get(['id', 'name', 'name_ar', 'description_ar', 'icon', 'image']);
    }
}

