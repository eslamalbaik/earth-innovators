<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Curriculum extends Model
{
    protected $fillable = ['name_ar', 'name_en', 'is_active'];

    public function studyPlans()
    {
        return $this->hasMany(StudyPlan::class);
    }
}
