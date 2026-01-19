<?php

namespace App\Providers;

use App\Models\ChatRoom;
use App\Models\Booking;
use App\Models\Payment;
use App\Observers\PaymentObserver;
use App\Observers\BookingObserver;
use App\Events\TeacherProjectCreated;
use App\Events\ProjectApproved;
use App\Events\ProjectRejected;
use App\Events\StudentSubmissionUpdated;
use App\Events\SubmissionCreated;
use App\Events\SubmissionUpdated;
use App\Events\EvaluationCreated;
use App\Events\EvaluationUpdated;
use App\Events\EvaluationDeleted;
use App\Events\CommentAdded;
use App\Events\StatusChanged;
use App\Events\ChallengeSubmissionReviewed;
use App\Events\ChallengeCreated;
use App\Events\CertificateIssued;
use App\Events\ProjectEvaluated;
use App\Events\BadgeGranted;
use App\Events\ArticleApproved;
use App\Listeners\SendTeacherProjectCreatedNotification;
use App\Listeners\SendProjectApprovedNotification;
use App\Listeners\SendProjectRejectedNotification;
use App\Listeners\SendStudentSubmissionUpdatedNotification;
use App\Listeners\HandleSubmissionCreated;
use App\Listeners\HandleEvaluationCreated;
use App\Listeners\HandleEvaluationUpdated;
use App\Listeners\HandleCommentAdded;
use App\Listeners\HandleStatusChanged;
use App\Listeners\SendSubmissionReviewNotification;
use App\Listeners\SendChallengeCreatedNotification;
use App\Listeners\SendCertificateIssuedNotification;
use App\Listeners\SendProjectEvaluatedNotification;
use App\Listeners\SendBadgeGrantedNotification;
use App\Listeners\SendArticleApprovedNotification;
use App\Listeners\CheckMembershipCertificateEligibility;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Event;
use App\Policies\ChatRoomPolicy;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Register Repositories
        $this->app->bind(
            \App\Repositories\UserRepository::class,
            \App\Repositories\UserRepository::class
        );
        
        $this->app->bind(
            \App\Repositories\ProjectRepository::class,
            \App\Repositories\ProjectRepository::class
        );
        
        $this->app->bind(
            \App\Repositories\BadgeRepository::class,
            \App\Repositories\BadgeRepository::class
        );

        // Register Services
        $this->app->bind(
            \App\Services\MembershipService::class,
            \App\Services\MembershipService::class
        );

        $this->app->bind(
            \App\Services\StudentService::class,
            function ($app) {
                return new \App\Services\StudentService(
                    $app->make(\App\Repositories\UserRepository::class),
                    $app->make(\App\Repositories\ProjectRepository::class),
                    $app->make(\App\Repositories\BadgeRepository::class),
                    $app->make(\App\Services\MembershipService::class)
                );
            }
        );

        $this->app->bind(
            \App\Services\DashboardService::class,
            function ($app) {
                return new \App\Services\DashboardService(
                    $app->make(\App\Repositories\ProjectRepository::class)
                );
            }
        );

        $this->app->bind(
            \App\Services\ActivityService::class,
            \App\Services\ActivityService::class
        );

        $this->app->bind(
            \App\Repositories\BookingRepository::class,
            \App\Repositories\BookingRepository::class
        );

        $this->app->bind(
            \App\Services\ProjectService::class,
            function ($app) {
                return new \App\Services\ProjectService(
                    $app->make(\App\Repositories\ProjectRepository::class)
                );
            }
        );

        $this->app->bind(
            \App\Services\PaymentService::class,
            function ($app) {
                return new \App\Services\PaymentService(
                    $app->make(\App\Repositories\BookingRepository::class)
                );
            }
        );

        $this->app->bind(
            \App\Services\BadgeService::class,
            function ($app) {
                return new \App\Services\BadgeService(
                    $app->make(\App\Repositories\BadgeRepository::class)
                );
            }
        );

        $this->app->bind(
            \App\Services\SubjectService::class,
            \App\Services\SubjectService::class
        );

        $this->app->bind(
            \App\Services\PackageService::class,
            \App\Services\PackageService::class
        );

        $this->app->bind(
            \App\Services\PublicationService::class,
            \App\Services\PublicationService::class
        );

        $this->app->bind(
            \App\Services\ReviewService::class,
            \App\Services\ReviewService::class
        );

        $this->app->bind(
            \App\Services\BookingService::class,
            \App\Services\BookingService::class
        );

        $this->app->bind(
            \App\Services\AvailabilityService::class,
            \App\Services\AvailabilityService::class
        );

        $this->app->bind(
            \App\Services\NotificationService::class,
            \App\Services\NotificationService::class
        );

        $this->app->bind(
            \App\Services\SearchService::class,
            \App\Services\SearchService::class
        );

        $this->app->bind(
            \App\Services\SubmissionService::class,
            \App\Services\SubmissionService::class
        );

        $this->app->bind(
            \App\Services\CommentService::class,
            \App\Services\CommentService::class
        );

        $this->app->bind(
            \App\Services\ProfileService::class,
            \App\Services\ProfileService::class
        );

        $this->app->bind(
            \App\Services\TeacherService::class,
            \App\Services\TeacherService::class
        );

        $this->app->bind(
            \App\Services\PaymentService::class,
            function ($app) {
                return new \App\Services\PaymentService(
                    $app->make(\App\Services\TamaraService::class),
                    $app->make(\App\Services\BookingService::class),
                    $app->make(\App\Services\ChatService::class)
                );
            }
        );

        $this->app->bind(
            \App\Services\StatisticsService::class,
            \App\Services\StatisticsService::class
        );

        $this->app->bind(
            \App\Services\RankingService::class,
            \App\Services\RankingService::class
        );

        $this->app->bind(
            \App\Services\TeacherApplicationService::class,
            \App\Services\TeacherApplicationService::class
        );

        $this->app->bind(
            \App\Services\ImportService::class,
            \App\Services\ImportService::class
        );

        $this->app->bind(
            \App\Services\ReportService::class,
            \App\Services\ReportService::class
        );

        $this->app->bind(
            \App\Services\ChatService::class,
            \App\Services\ChatService::class
        );

        $this->app->bind(
            \App\Services\EvaluationService::class,
            \App\Services\EvaluationService::class
        );

        $this->app->bind(
            \App\Services\ChallengeNotificationRouterService::class,
            \App\Services\ChallengeNotificationRouterService::class
        );

        $this->app->bind(
            \App\Services\EmailService::class,
            \App\Services\EmailService::class
        );

        $this->app->bind(
            \App\Services\OtpService::class,
            \App\Services\OtpService::class
        );

        $this->app->bind(
            \App\Services\PasswordResetService::class,
            \App\Services\PasswordResetService::class
        );
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Payment::observe(PaymentObserver::class);
        Booking::observe(BookingObserver::class);
        Gate::policy(ChatRoom::class, ChatRoomPolicy::class);

        // تسجيل أحداث الإشعارات
        Event::listen(
            TeacherProjectCreated::class,
            SendTeacherProjectCreatedNotification::class
        );

        Event::listen(
            ProjectApproved::class,
            SendProjectApprovedNotification::class
        );

        Event::listen(
            ProjectRejected::class,
            SendProjectRejectedNotification::class
        );

        Event::listen(
            StudentSubmissionUpdated::class,
            SendStudentSubmissionUpdatedNotification::class
        );

        // Challenge submission and evaluation events
        Event::listen(
            SubmissionCreated::class,
            HandleSubmissionCreated::class
        );

        Event::listen(
            SubmissionUpdated::class,
            HandleSubmissionCreated::class // Reuse same handler for updates
        );

        Event::listen(
            EvaluationCreated::class,
            HandleEvaluationCreated::class
        );

        Event::listen(
            EvaluationUpdated::class,
            HandleEvaluationUpdated::class
        );

        Event::listen(
            CommentAdded::class,
            HandleCommentAdded::class
        );

        Event::listen(
            StatusChanged::class,
            HandleStatusChanged::class
        );

        Event::listen(
            ChallengeSubmissionReviewed::class,
            SendSubmissionReviewNotification::class
        );

        Event::listen(
            ChallengeCreated::class,
            SendChallengeCreatedNotification::class
        );

        // Email notification events
        Event::listen(
            CertificateIssued::class,
            SendCertificateIssuedNotification::class
        );

        Event::listen(
            ProjectEvaluated::class,
            SendProjectEvaluatedNotification::class
        );

        Event::listen(
            BadgeGranted::class,
            SendBadgeGrantedNotification::class
        );

        Event::listen(
            ArticleApproved::class,
            SendArticleApprovedNotification::class
        );

        Event::listen(
            ArticleApproved::class,
            CheckMembershipCertificateEligibility::class
        );

        // Check membership certificate eligibility when points are awarded or projects are approved
        Event::listen(
            ProjectApproved::class,
            CheckMembershipCertificateEligibility::class
        );

        Event::listen(
            ProjectEvaluated::class,
            CheckMembershipCertificateEligibility::class
        );

        Event::listen(
            BadgeGranted::class,
            CheckMembershipCertificateEligibility::class
        );

        Event::listen(
            ChallengeSubmissionReviewed::class,
            CheckMembershipCertificateEligibility::class
        );

        // Points awarded event - check for membership certificate eligibility
        Event::listen(
            \App\Events\PointsAwarded::class,
            CheckMembershipCertificateEligibility::class
        );
    }
}
