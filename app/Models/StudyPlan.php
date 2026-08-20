<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudyPlan extends Model
{
    protected $fillable = [
        'school_id',
        'teacher_id',
        'curriculum_id',
        'subject_id',
        'stage',
        'grade',
        'section',
        'hours',
        'academic_year',
        'semester',
    ];

    public function curriculum()
    {
        return $this->belongsTo(Curriculum::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function school()
    {
        return $this->belongsTo(User::class, 'school_id');
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}
