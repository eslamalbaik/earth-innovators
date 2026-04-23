<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPagesSmokeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @dataProvider publicPageProvider
     */
    public function test_public_pages_render_successfully(string $uri): void
    {
        $this->get($uri)->assertSuccessful();
    }

    public static function publicPageProvider(): array
    {
        return [
            'home' => ['/'],
            'about' => ['/about'],
            'achievements' => ['/achievements'],
            'teachers' => ['/teachers'],
            'subjects' => ['/subjects'],
            'projects' => ['/projects'],
            'challenges' => ['/challenges'],
            'publications' => ['/publications'],
            'store membership' => ['/store-membership'],
            'login' => ['/login'],
            'register' => ['/register'],
            'forgot password' => ['/forgot-password'],
        ];
    }
}
