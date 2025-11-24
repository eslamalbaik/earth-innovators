<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Subject extends Model
{
    protected $fillable = [
        'name_ar',
        'name_en',
        'image',
        'description_ar',
        'description_en',
        'teacher_count',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'teacher_count' => 'integer',
        'sort_order' => 'integer',
    ];

    public static function getActive($limit = null)
    {
        $query = static::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name_ar');

        return $limit ? $query->limit($limit)->get() : $query->get();
    }

    public function updateTeacherCount()
    {
        $countFromPivot = $this->teachers()
            ->where('is_active', true)
            ->where('is_verified', true)
            ->count();
        
        $countFromJson = \App\Models\Teacher::where('is_active', true)
            ->where('is_verified', true)
            ->where(function ($query) {
                $query->whereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$this->name_ar])
                    ->orWhereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$this->name_en ?? '']);
            })
            ->count();

        $count = max($countFromPivot, $countFromJson);
        $this->update(['teacher_count' => $count]);
    }

    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(Teacher::class, 'teacher_subjects');
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'student_subjects');
    }
}
