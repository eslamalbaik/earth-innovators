<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrimaryDomainTest extends TestCase
{
    use RefreshDatabase;

    public function test_secondary_host_redirects_to_primary_when_enabled(): void
    {
        config([
            'site.primary_url' => 'https://earth-innovators.ae',
            'site.secondary_hosts' => ['earth-innovators.cloud'],
            'site.redirect_secondary_to_primary' => true,
        ]);

        $response = $this->get('http://earth-innovators.cloud/about', [
            'HOST' => 'earth-innovators.cloud',
        ]);

        $response->assertRedirect('https://earth-innovators.ae/about');
    }

    public function test_admin_paths_are_not_redirected_from_secondary(): void
    {
        config([
            'site.primary_url' => 'https://earth-innovators.ae',
            'site.secondary_hosts' => ['earth-innovators.cloud'],
            'site.redirect_secondary_to_primary' => true,
        ]);

        $response = $this->get('http://earth-innovators.cloud/admin/login', [
            'HOST' => 'earth-innovators.cloud',
        ]);

        $response->assertOk();
    }
}
