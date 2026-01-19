<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Models\User;
use App\Notifications\TeacherProjectCreatedNotification;
use Illuminate\Console\Command;

class SendMissingProjectNotifications extends Command
{
    protected $signature = 'notifications:send-missing-project-notifications {--project-id= : Send notification for specific project ID}';
    protected $description = 'Send missing notifications for teacher projects that were created before notification system';

    public function handle()
    {
        $projectId = $this->option('project-id');
        
        if ($projectId) {
            $projects = Project::where('id', $projectId)
                ->where('status', 'pending')
                ->whereNotNull('teacher_id')
                ->whereNotNull('school_id')
                ->get();
        } else {
            $projects = Project::where('status', 'pending')
                ->whereNotNull('teacher_id')
                ->whereNotNull('school_id')
                ->get();
        }

        if ($projects->isEmpty()) {
            $this->info('No projects found to send notifications for.');
            return 0;
        }

        $this->info("Found {$projects->count()} project(s) to process.");

        foreach ($projects as $project) {
            $school = User::find($project->school_id);
            
            if (!$school || $school->role !== 'school') {
                $this->warn("Skipping project {$project->id}: School not found or invalid role");
                continue;
            }
            $existingNotification = $school->notifications()
                ->where('type', 'App\Notifications\TeacherProjectCreatedNotification')
                ->whereJsonContains('data->project_id', $project->id)
                ->first();

            if ($existingNotification) {
                $this->info("Project {$project->id} already has notification. Skipping.");
                continue;
            }

            try {
                $project->load('teacher.user');
                $school->notify(new TeacherProjectCreatedNotification($project));
                $this->info("✓ Notification sent for project {$project->id} to school {$school->name}");
            } catch (\Exception $e) {
                $this->error("✗ Failed to send notification for project {$project->id}: " . $e->getMessage());
                $this->error("Trace: " . $e->getTraceAsString());
            }
        }

        $this->info('Done!');
        return 0;
    }
}
