<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository extends BaseRepository
{
    protected function model(): string
    {
        return User::class;
    }

    public function findBySchoolId(int $schoolId, string $role = 'student'): Collection
    {
        return $this->model
            ->where('school_id', $schoolId)
            ->where('role', $role)
            ->get();
    }

    public function paginateBySchoolId(int $schoolId, string $role = 'student', int $perPage = 20): LengthAwarePaginator
    {
        return $this->model
            ->where('school_id', $schoolId)
            ->where('role', $role)
            ->paginate($perPage);
    }

    public function searchBySchoolId(int $schoolId, string $role, ?string $search, int $perPage = 20): LengthAwarePaginator
    {
        $query = $this->model
            ->where('school_id', $schoolId)
            ->where('role', $role);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('membership_number', 'like', "%{$search}%");
            });
        }

        return $query->latest()->paginate($perPage);
    }

    public function findByIdAndSchoolId(int $id, int $schoolId, string $role = 'student'): ?User
    {
        return $this->model
            ->where('id', $id)
            ->where('school_id', $schoolId)
            ->where('role', $role)
            ->first();
    }
}

