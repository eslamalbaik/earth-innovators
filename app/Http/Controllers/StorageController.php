<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StorageController extends Controller
{
    /**
     * Serve files from storage/app/public
     * This is a fallback when symlink doesn't work (especially on Windows)
     */
    public function serve($path)
    {
        // Security: prevent directory traversal
        $path = str_replace('..', '', $path);
        $path = ltrim($path, '/');

        $filePath = storage_path('app/public/' . $path);

        \Log::info('StorageController: Serving file', [
            'requested_path' => $path,
            'full_path' => $filePath,
            'exists' => file_exists($filePath),
        ]);

        if (!file_exists($filePath) || !is_file($filePath)) {
            \Log::warning('StorageController: File not found', [
                'requested_path' => $path,
                'full_path' => $filePath,
            ]);
            abort(404, 'File not found: ' . $path);
        }

        // Get MIME type
        $mimeType = mime_content_type($filePath);
        if (!$mimeType) {
            // Fallback MIME types based on extension
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

        // Set proper headers
        return response()->file($filePath, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000',
        ]);
    }
}

