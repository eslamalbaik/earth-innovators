<?php

namespace Tests\Unit;

use App\Support\SessionCookieDomain;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SessionCookieDomainTest extends TestCase
{
    #[DataProvider('domainCases')]
    public function test_resolves_session_domain_for_request_host(
        ?string $configured,
        string $requestHost,
        ?string $expected
    ): void {
        $this->assertSame(
            $expected,
            SessionCookieDomain::forRequestHost($configured, $requestHost)
        );
    }

    public static function domainCases(): array
    {
        return [
            'null env on ae host' => [null, 'earth-innovators.ae', null],
            'empty on ae host' => ['', 'earth-innovators.ae', null],
            'string null on ae host' => ['null', 'earth-innovators.ae', null],
            'cloud domain on ae host is rejected' => ['earth-innovators.cloud', 'earth-innovators.ae', null],
            'cloud domain on cloud host is kept' => ['earth-innovators.cloud', 'earth-innovators.cloud', 'earth-innovators.cloud'],
            'leading dot cloud on cloud subdomain' => ['.earth-innovators.cloud', 'app.earth-innovators.cloud', '.earth-innovators.cloud'],
            'ae domain on ae host' => ['earth-innovators.ae', 'earth-innovators.ae', 'earth-innovators.ae'],
        ];
    }
}
