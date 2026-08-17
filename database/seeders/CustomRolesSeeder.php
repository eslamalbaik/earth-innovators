<?php

namespace Database\Seeders;

use App\Models\CustomRole;
use Illuminate\Database\Seeder;

class CustomRolesSeeder extends Seeder
{
    public function run(): void
    {
        CustomRole::updateOrCreate(
            ['slug' => 'trainer'],
            [
                'name_ar' => 'المدرب',
                'name_en' => 'Trainer',
                'base_role' => 'teacher',
                'is_active' => true,
            ]
        );

        CustomRole::updateOrCreate(
            ['slug' => 'talent-advisor'],
            [
                'name_ar' => 'مستشار الموهبة',
                'name_en' => 'Talent Advisor',
                'base_role' => 'teacher',
                'is_active' => true,
            ]
        );
    }
}
