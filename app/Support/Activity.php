<?php

namespace App\Support;

use App\Models\ActivityLog;

class Activity
{
    public static function record(?int $userId, string $action, ?string $subjectType = null, ?int $subjectId = null, array $properties = []): void
    {
        try {
            ActivityLog::create([
                'user_id' => $userId,
                'action' => $action,
                'subject_type' => $subjectType,
                'subject_id' => $subjectId,
                'properties' => $properties ?: null,
            ]);
        } catch (\Throwable $e) {
        }
    }
}
