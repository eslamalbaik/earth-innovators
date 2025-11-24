<?php

namespace App\Listeners;

use App\Events\TeacherProjectCreated;
use App\Notifications\TeacherProjectCreatedNotification;
use Illuminate\Support\Facades\Log;

class SendTeacherProjectCreatedNotification
{

    public function handle(TeacherProjectCreated $event): void
    {
        try {
            $project = $event->project;
            
            // تحديث المشروع من قاعدة البيانات لضمان الحصول على أحدث البيانات
            $project->refresh();
            
            Log::info('TeacherProjectCreated event received', [
                'project_id' => $project->id,
                'school_id' => $project->school_id,
                'teacher_id' => $project->teacher_id,
            ]);
            
            // إرسال إشعار للمدرسة إذا كان المشروع مرتبط بمدرسة
            if ($project->school_id) {
                $school = \App\Models\User::find($project->school_id);
                
                if ($school && $school->role === 'school') {
                    Log::info('Sending notification to school', [
                        'school_id' => $school->id,
                        'school_name' => $school->name,
                    ]);
                    
                    $school->notify(new TeacherProjectCreatedNotification($project));
                    
                    Log::info('Notification sent successfully');
                } else {
                    Log::warning('School not found or invalid role', [
                        'school_id' => $project->school_id,
                        'school' => $school ? $school->role : 'not found',
                    ]);
                }
            } else {
                Log::warning('Project has no school_id', [
                    'project_id' => $project->id,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error in SendTeacherProjectCreatedNotification: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
