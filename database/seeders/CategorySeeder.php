<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'علمي', 'slug' => 'science', 'description' => 'التحديات العلمية'],
            ['name' => 'فني', 'slug' => 'arts', 'description' => 'التحديات الفنية'],
            ['name' => 'تقني', 'slug' => 'technology', 'description' => 'التحديات التقنية'],
            ['name' => 'تراثي', 'slug' => 'heritage', 'description' => 'التحديات التراثية'],
            ['name' => 'بيئي', 'slug' => 'environmental', 'description' => 'التحديات البيئية'],
            ['name' => 'رياضيات', 'slug' => 'mathematics', 'description' => 'التحديات الرياضية'],
            ['name' => 'هندسة', 'slug' => 'engineering', 'description' => 'التحديات الهندسية'],
            ['name' => 'أخرى', 'slug' => 'other', 'description' => 'تحديات أخرى'],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
