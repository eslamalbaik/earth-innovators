<?php

namespace App\Jobs;

use App\Models\Project;
use App\Models\User;
use App\Notifications\NewProjectNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNewProjectNotification
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;

    public function __construct(
        private Project $project
    ) {}

    public function handle(): void
    {
        try {
            $this->project->refresh();
            $this->project->load(['school']);

            // إذا كان المشروع متاحاً لجميع المؤسسات تعليمية (school_id = null)
            if (!$this->project->school_id) {
                // إرسال إشعار لجميع المؤسسات تعليمية
                $schools = User::where('role', 'school')->get();
                
                foreach ($schools as $school) {
                    $school->notify(new NewProjectNotification($this->project));
                }

                // إرسال إشعار لجميع الطلاب والمعلمين في جميع المؤسسات تعليمية
                $users = User::whereIn('role', ['student', 'teacher'])
                    ->whereNotNull('school_id')
                    ->get();

                foreach ($users as $user) {
                    $user->notify(new NewProjectNotification($this->project));
                }

                \Log::info('Sent new project notifications to all schools and their students/teachers', [
                    'project_id' => $this->project->id,
                    'schools_count' => $schools->count(),
                    'users_count' => $users->count(),
                ]);
            } else {
                // إرسال إشعار للمدرسة المحددة
                $school = User::find($this->project->school_id);
                if ($school && $school->role === 'school') {
                    $school->notify(new NewProjectNotification($this->project));
                }

                // إرسال إشعار لجميع الطلاب والمعلمين في المدرسة المحددة
                $users = User::where('school_id', $this->project->school_id)
                    ->whereIn('role', ['student', 'teacher'])
                    ->get();

                foreach ($users as $user) {
                    $user->notify(new NewProjectNotification($this->project));
                }

                \Log::info('Sent new project notifications to specific school and its students/teachers', [
                    'project_id' => $this->project->id,
                    'school_id' => $this->project->school_id,
                    'users_count' => $users->count(),
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send new project notification: ' . $e->getMessage(), [
                'project_id' => $this->project->id,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}

