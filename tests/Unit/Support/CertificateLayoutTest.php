<?php

namespace Tests\Unit\Support;

use App\Support\CertificateLayout;
use PHPUnit\Framework\TestCase;

class CertificateLayoutTest extends TestCase
{
    public function test_extracts_membership_segment_from_certificate_number(): void
    {
        $this->assertSame('82', CertificateLayout::membershipFromCertificateNumber('CERT-2026-0082-002'));
        $this->assertSame('82', CertificateLayout::membershipFromCertificateNumber('CERT-2026-0082-004'));
        $this->assertSame('11', CertificateLayout::membershipFromCertificateNumber('CERT-2026-0011'));
    }

    public function test_resolve_membership_display_prefers_certificate_segment(): void
    {
        $this->assertSame(
            '82',
            CertificateLayout::resolveMembershipDisplay('CERT-2026-0082-002', 'S00099')
        );
    }
}
