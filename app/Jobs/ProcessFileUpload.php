<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ProcessFileUpload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 2;
    public $timeout = 300; // 5 minutes for file processing

    public function __construct(
        private string $modelType, // 'project', 'publication', etc.
        private int $modelId,
        private array $files,
        private string $disk = 'public'
    ) {}

    public function handle(): void
    {
        try {
            $processedFiles = [];

            foreach ($this->files as $file) {
                $mimeType = $file->getMimeType();
                $path = null;

                // Determine storage path based on file type
                if (str_starts_with($mimeType, 'image/')) {
                    $path = $file->store("{$this->modelType}s/images", $this->disk);
                } elseif (str_starts_with($mimeType, 'video/')) {
                    $path = $file->store("{$this->modelType}s/videos", $this->disk);
                } else {
                    $path = $file->store("{$this->modelType}s/files", $this->disk);
                }

                if ($path) {
                    $processedFiles[] = $path;
                }
            }

            // Update the model with processed files
            $this->updateModelFiles($processedFiles);

        } catch (\Exception $e) {
            Log::error('Failed to process file upload', [
                'model_type' => $this->modelType,
                'model_id' => $this->modelId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function updateModelFiles(array $files): void
    {
        $modelClass = match ($this->modelType) {
            'project' => \App\Models\Project::class,
            'publication' => \App\Models\Publication::class,
            default => null,
        };

        if ($modelClass) {
            $model = $modelClass::find($this->modelId);
            if ($model) {
                $existingFiles = $model->files ?? [];
                $allFiles = array_merge($existingFiles, $files);
                $model->update(['files' => $allFiles]);
            }
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('File upload processing job failed', [
            'model_type' => $this->modelType,
            'model_id' => $this->modelId,
            'error' => $exception->getMessage(),
        ]);
    }
}

