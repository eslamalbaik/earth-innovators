<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class EarthDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CoreCatalogSeeder::class);

        $context = (new DemoUsersSeeder())->run();

        (new DemoContentSeeder())->run($context);
        (new DemoBookingsSeeder())->run($context);
    }
}

