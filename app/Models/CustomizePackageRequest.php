<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomizePackageRequest extends Model
{
    protected $fillable = [
        'school_name',
        'responsible_name',
        'mobile_number',
        'expected_students',
        'additional_notes',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];
}
