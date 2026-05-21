<?php

namespace App\Support;

class CertificateLayout
{
    public const DESIGN_WIDTH = 1920;

    public const DESIGN_HEIGHT = 1080;

    /**
     * Extract display membership segment from CERT-2026-0082-002 → 82
     */
    public static function membershipFromCertificateNumber(string $certificateNumber): ?string
    {
        if (!preg_match('/^CERT-\d{4}-(\d+)(?:-\d+)?$/i', $certificateNumber, $matches)) {
            return null;
        }

        $segment = ltrim($matches[1], '0');

        return $segment !== '' ? $segment : $matches[1];
    }

    public static function resolveMembershipDisplay(string $certificateNumber, ?string $storedMembership = null): string
    {
        $fromCert = self::membershipFromCertificateNumber($certificateNumber);
        if ($fromCert !== null) {
            return $fromCert;
        }

        if ($storedMembership !== null && trim($storedMembership) !== '') {
            return trim($storedMembership);
        }

        return '';
    }

    public static function scaleX(float $value, float $pageWidth): float
    {
        return $value * ($pageWidth / self::DESIGN_WIDTH);
    }

    public static function scaleY(float $value, float $pageHeight): float
    {
        return $value * ($pageHeight / self::DESIGN_HEIGHT);
    }

    public static function scaleFontSize(float $fontSize, float $pageWidth, float $pageHeight): float
    {
        $scale = min($pageWidth / self::DESIGN_WIDTH, $pageHeight / self::DESIGN_HEIGHT);

        return max(8, round($fontSize * $scale, 1));
    }
}
