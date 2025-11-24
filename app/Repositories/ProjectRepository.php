<?php

namespace App\Repositories;

use App\Models\Project;
use Illuminate\Support\Facades\DB;

class ProjectRepository extends BaseRepository
{
    protected function model(): string
    {
        return Project::class;
    }

    public function getProjectCountsByUserId(int $userId): array
    {
        return DB::table('projects')
            ->where('user_id', $userId)
            ->selectRaw('
                COUNT(*) as total,
                SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending
            ')
            ->first();
    }

    public function getProjectCountsByUserIds(array $userIds): array
    {
        if (empty($userIds)) {
            return [];
        }

        $results = DB::table('projects')
            ->whereIn('user_id', $userIds)
            ->selectRaw('
                user_id,
                COUNT(*) as total,
                SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending
            ')
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id')
            ->map(function ($item) {
                return (object) [
                    'total' => (int) $item->total,
                    'approved' => (int) $item->approved,
                    'pending' => (int) $item->pending,
                ];
            })
            ->toArray();

        return $results;
    }
}

