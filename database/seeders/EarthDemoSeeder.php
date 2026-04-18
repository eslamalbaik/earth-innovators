<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Faker\Factory as FakerFactory;

class EarthDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CoreCatalogSeeder::class);

        $faker = FakerFactory::create();
        $context = (new DemoUsersSeeder())->run($faker);

        (new DemoContentSeeder())->run($context);
        (new DemoBookingsSeeder())->run($context);
    }
}