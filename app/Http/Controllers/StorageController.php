<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StorageController extends Controller
{
    public function serve($path)
    {
        $path = str_replace('..', '', $path);
        $path = ltrim($path, '/');

        $filePath = storage_path('app/public/' . $path);

        if (!file_exists($filePath) || !is_file($filePath)) {
            \Log::warning('StorageController: File not found', [
                'requested_path' => $path,
                'full_path' => $filePath,
            ]);
            abort(404, 'File not found: ' . $path);
        }

        $mimeType = mime_content_type($filePath);
        if (!$mimeType) {
            $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            $mimeTypes = [
                'png' => 'image/png',
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'gif' => 'image/gif',
                'pdf' => 'application/pdf',
            ];
            $mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';
        }

        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }
}

