<?php

namespace App\Jobs;

use App\Models\Publication;
use App\Models\User;
use App\Notifications\NewPublicationNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNewPublicationNotification
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;

    public function __construct(
        private Publication $publication
    ) {}

    public function handle(): void
    {
        try {
            $this->publication->refresh();
            $this->publication->load(['author', 'school']);

            // إرسال إشعار لجميع الطلاب والمعلمين في المدرسة
            if ($this->publication->school_id) {
                $users = User::where('school_id', $this->publication->school_id)
                    ->whereIn('role', ['student', 'teacher'])
                    ->get();

                foreach ($users as $user) {
                    $user->notify(new NewPublicationNotification($this->publication));
                }
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send new publication notification: ' . $e->getMessage());
            throw $e;
        }
    }
}

