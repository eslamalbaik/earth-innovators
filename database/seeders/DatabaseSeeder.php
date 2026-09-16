<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(EarthDemoSeeder::class);
        $this->call(InnovationDemoSeeder::class);
        $this->call(MagazineDemoSeeder::class);
        $this->call(RubricLibrarySeeder::class);
        $this->call(NationalLevelSettingsSeeder::class);
        $this->call(ReferenceStandardsSeeder::class);
    }
}
