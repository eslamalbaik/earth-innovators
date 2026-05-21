<?php

namespace App\Support;

class AppBuildVersion
{
    public static function current(): ?string
    {
        $path = public_path('build-version.json');

        if (! is_file($path)) {
            return null;
        }

        $payload = json_decode((string) file_get_contents($path), true);

        if (! is_array($payload)) {
            return null;
        }

        $buildId = $payload['buildId'] ?? null;

        return is_string($buildId) && $buildId !== '' ? $buildId : null;
    }
}
