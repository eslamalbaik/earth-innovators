<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use App\Http\Controllers\Student\StudentDashboardController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\JoinTeacherController;
use App\Http\Controllers\TeacherAvailabilityController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Serve storage files directly (MUST be first to catch storage requests before other routes)
Route::get('/storage/{path}', [\App\Http\Controllers\StorageController::class, 'serve'])
    ->where('path', '.*')
    ->name('storage.serve');

// Landing page route
// Landing page logic shared between '/' and '/landing'
$landingLogic = function () {
    $stats = \Illuminate\Support\Facades\Cache::remember('landing_stats', 3600, function () {
        $totalStudents = \App\Models\User::where('role', 'student')->count();
        $totalTeachers = \App\Models\Teacher::where('is_active', true)->where('is_verified', true)->count();
        $totalSessions = \App\Models\Booking::where('status', 'completed')->count();
        $averageRating = \App\Models\Review::where('is_published', true)->avg('rating');
        $averageRating = $averageRating ? round($averageRating, 1) : 0;

        return [
            ['value' => $totalStudents >= 100 ? '+' . number_format($totalStudents, 0) : '+12,000', 'label' => 'طالب'],
            ['value' => $totalTeachers >= 100 ? '+' . number_format($totalTeachers, 0) : '+2,500', 'label' => 'معلم'],
            ['value' => $totalSessions >= 100 ? '+' . number_format($totalSessions, 0) : '+35,000', 'label' => 'جلسة ناجحة'],
            ['value' => $averageRating >= 4 ? (string)$averageRating : '4.8', 'label' => 'التقييم المتوسط']
        ];
    });

    $featuredProjects = \Illuminate\Support\Facades\Cache::remember('landing_featured_projects', 3600, function () {
        return \App\Models\Project::where('status', 'approved')
            ->with(['user', 'school', 'teacher'])
            ->orderBy('rating', 'desc')
            ->take(4)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'title' => $p->title,
                'description' => $p->description,
                'category' => $p->category,
                'views' => $p->views,
                'likes' => $p->likes,
                'rating' => $p->rating,
                'image' => $p->image_url,
                'user' => ['name' => $p->user->name ?? ''],
                'school' => ['name' => $p->school->name ?? ''],
            ]);
    });

    $featuredPublications = \Illuminate\Support\Facades\Cache::remember('landing_publications', 3600, function () {
        return \App\Models\Publication::where('status', 'published')
            ->latest()
            ->take(4)
            ->get()
            ->map(fn($pub) => [
                'id' => $pub->id,
                'title' => $pub->title,
                'description' => $pub->description,
                'type' => $pub->type,
                'cover_image' => $pub->cover_image,
                'publish_date' => $pub->publish_date,
            ]);
    });

    $uaeSchools = \Illuminate\Support\Facades\Cache::remember('landing_uae_schools', 3600, function () {
        return \App\Models\User::where('role', 'school')
            ->whereNotNull('image')
            ->take(6)
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'logo' => $s->image ? asset('storage/' . $s->image) : null,
            ]);
    });

    $testimonials = \Illuminate\Support\Facades\Cache::remember('landing_testimonials', 3600, function () {
        return \App\Models\Review::where('is_published', true)
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'name' => $r->reviewer_name ?? 'مستخدم',
                'content' => $r->comment,
                'rating' => $r->rating,
                'image' => $r->reviewer_image ? asset('storage/' . $r->reviewer_image) : null,
            ]);
    });

    $membershipCertificate = null;
    if (auth()->check()) {
        $user = auth()->user();
        $membershipCertificateService = app(\App\Services\MembershipCertificateService::class);
        $certificate = $membershipCertificateService->getUserMembershipCertificate($user->id, $user->role);
        if ($certificate) {
            $membershipCertificate = [
                'id' => $certificate->id,
                'description' => $certificate->description_ar ?? $certificate->description,
                'download_url' => route('membership-certificates.download', $certificate->id),
            ];
        }
    }

    return Inertia::render('Landing', [
        'stats' => $stats,
        'featuredProjects' => $featuredProjects,
        'featuredPublications' => $featuredPublications,
        'uaeSchools' => $uaeSchools,
        'testimonials' => $testimonials,
        'membershipCertificate' => $membershipCertificate,
    ]);
};

Route::get('/', $landingLogic)->name('home');
Route::get('/landing', $landingLogic)->name('landing');

// Route '/' is now part of the unified logic defined earlier


// Keep old home route for dashboard users
Route::get('/home', function () {
    $cities = \Illuminate\Support\Facades\Cache::remember('home_cities', 3600, function () {
        return \App\Models\Teacher::where('is_active', true)
            ->where('is_verified', true)
            ->whereNotNull('city')
            ->distinct()
            ->pluck('city')
            ->filter()
            ->sort()
            ->values()
            ->toArray();
    });

    $subjects = \Illuminate\Support\Facades\Cache::remember('home_subjects', 3600, function () {
        return \App\Models\Subject::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name_ar')
            ->get()
            ->map(function ($subject) {
                $countFromPivot = $subject->teachers()
                    ->where('is_active', true)
                    ->where('is_verified', true)
                    ->count();

                $countFromJson = \App\Models\Teacher::where('is_active', true)
                    ->where('is_verified', true)
                    ->where(function ($query) use ($subject) {
                        $query->whereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subject->name_ar])
                            ->orWhereRaw('JSON_SEARCH(LOWER(JSON_EXTRACT(subjects, "$")), "one", LOWER(?), NULL, "$[*]") IS NOT NULL', [$subject->name_en]);
                    })
                    ->count();

                $teacherCount = max($countFromPivot, $countFromJson);

                $imageUrl = '/images/subjects/default.png';
                if ($subject->image) {
                    if (str_starts_with($subject->image, 'http://') || str_starts_with($subject->image, 'https://')) {
                        $imageUrl = $subject->image;
                    } elseif (str_starts_with($subject->image, '/storage/') || str_starts_with($subject->image, '/images/')) {
                        $imageUrl = $subject->image;
                    } else {
                        $imageUrl = asset('storage/' . $subject->image);
                    }
                }

                return [
                    'id' => $subject->id,
                    'name' => $subject->name_ar,
                    'name_ar' => $subject->name_ar,
                    'name_en' => $subject->name_en,
                    'image' => $imageUrl,
                    'teacher_count' => $teacherCount,
                ];
            })
            ->toArray();
    });

    $featuredTeachers = \Illuminate\Support\Facades\Cache::remember('home_teachers', 3600, function () {
        return \App\Models\Teacher::where('is_active', true)
            ->where('is_verified', true)
            ->orderBy('rating', 'desc')
            ->orderBy('reviews_count', 'desc')
            ->orderBy('students_count', 'desc')
            ->limit(4)
            ->get()
            ->map(function ($teacher) {
                $subjects = is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects, true);
                $stages = is_array($teacher->stages) ? $teacher->stages : json_decode($teacher->stages, true);

                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name_ar,
                    'image' => $teacher->image ? asset('storage/' . $teacher->image) : null,
                    'rating' => round($teacher->rating ?? 0, 1),
                    'location' => $teacher->city . (is_array($stages) && count($stages) > 0 ? ' - ' . implode(' / ', $stages) : ''),
                    'subject' => is_array($subjects) && count($subjects) > 0 ? $subjects[0] : '',
                    'price' => number_format($teacher->price_per_hour, 0),
                ];
            })
            ->toArray();
    });

    $testimonials = \Illuminate\Support\Facades\Cache::remember('home_testimonials', 3600, function () {
        $reviewerInfo = [
            'سارة أحمد' => ['title' => 'منصة رائعة للإبداع والتعلم', 'initials' => 'سأ'],
            'فاطمة محمد' => ['title' => 'تجربة ممتازة للمؤسسات تعليمية', 'initials' => 'فم'],
            'أم خالد' => ['title' => 'أفضل منصة تعليمية', 'initials' => 'أخ'],
            'أحمد علي' => ['title' => 'منصة محترفة ومبتكرة', 'initials' => 'أع'],
            'أبو ناصر' => ['title' => 'تجربة إيجابية جداً', 'initials' => 'أن'],
            'محمد خالد' => ['title' => 'منصة متميزة للطلاب', 'initials' => 'مخ'],
        ];

        return \App\Models\Review::where('is_published', true)
            ->whereNotNull('comment')
            ->where('comment', '!=', '')
            ->orderBy('rating', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($review) use ($reviewerInfo) {
                $reviewerName = $review->reviewer_name ?? ($review->student ? $review->student->name : 'مجهول');
                $info = $reviewerInfo[$reviewerName] ?? ['title' => '', 'initials' => ''];

                return [
                    'id' => $review->id,
                    'title' => $info['title'],
                    'text' => $review->comment,
                    'rating' => round($review->rating, 1),
                    'name' => $reviewerName,
                    'location' => $review->reviewer_location ?? ($review->student && $review->student->city ? $review->student->city : ''),
                    'initials' => $info['initials'],
                ];
            })
            ->toArray();
    });

    $stats = \Illuminate\Support\Facades\Cache::remember('home_stats', 3600, function () {
        $totalStudents = \App\Models\User::where('role', 'student')->count();
        $totalTeachers = \App\Models\Teacher::where('is_active', true)->where('is_verified', true)->count();
        $totalSessions = \App\Models\Booking::where('status', 'completed')->count();
        $averageRating = \App\Models\Review::where('is_published', true)->avg('rating');
        $averageRating = $averageRating ? round($averageRating, 1) : 0;

        $studentValue = $totalStudents >= 100 ? '+' . number_format($totalStudents, 0) : '+12,000';
        $teacherValue = $totalTeachers >= 100 ? '+' . number_format($totalTeachers, 0) : '+2,500';
        $sessionValue = $totalSessions >= 100 ? '+' . number_format($totalSessions, 0) : '+35,000';
        $ratingValue = $averageRating >= 4 ? (string)$averageRating : '4.8';

        return [
            ['value' => $studentValue, 'label' => 'طالب'],
            ['value' => $teacherValue, 'label' => 'معلم'],
            ['value' => $sessionValue, 'label' => 'جلسة ناجحة'],
            ['value' => $ratingValue, 'label' => 'التقييم المتوسط']
        ];
    });

    $featuredPublications = \Illuminate\Support\Facades\Cache::remember('home_publications', 3600, function () {
        return \App\Models\Publication::where('status', 'approved')
            ->with(['school', 'author'])
            ->orderBy('created_at', 'desc')
            ->limit(2)
            ->get()
            ->map(function ($publication) {
                return [
                    'id' => $publication->id,
                    'title' => $publication->title,
                    'description' => $publication->description,
                    'type' => $publication->type,
                    'cover_image' => app(\App\Services\PublicationService::class)->normalizeImagePath($publication->cover_image),
                    'file' => app(\App\Services\PublicationService::class)->normalizeFilePath($publication->file),
                    'content' => $publication->content,
                    'issue_number' => $publication->issue_number,
                    'publish_date' => $publication->publish_date,
                    'publisher_name' => $publication->publisher_name,
                    'likes_count' => $publication->likes_count,
                    'school' => $publication->school ? ['id' => $publication->school->id, 'name' => $publication->school->name] : null,
                ];
            })
            ->toArray();
    });

    $featuredProjects = \Illuminate\Support\Facades\Cache::remember('home_featured_projects', 3600, function () {
        return \App\Models\Project::where('status', 'approved')
            ->with(['teacher:id,name_ar,user_id', 'teacher.user:id,name', 'user:id,name', 'school:id,name'])
            ->orderBy('rating', 'desc')
            ->orderBy('likes', 'desc')
            ->orderBy('views', 'desc')
            ->limit(4)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                    'category' => $project->category,
                    'views' => $project->views,
                    'likes' => $project->likes,
                    'rating' => $project->rating,
                    'teacher' => $project->teacher ? ['id' => $project->teacher->id, 'name_ar' => $project->teacher->name_ar, 'user' => $project->teacher->user ? ['id' => $project->teacher->user->id, 'name' => $project->teacher->user->name] : null] : null,
                    'user' => $project->user ? ['id' => $project->user->id, 'name' => $project->user->name] : null,
                    'school' => $project->school ? ['id' => $project->school->id, 'name' => $project->school->name] : null,
                ];
            })
            ->toArray();
    });

    $uaeSchools = \Illuminate\Support\Facades\Cache::remember('home_uae_schools', 3600, function () {
        $uaeCities = ['دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة', 'أم القيوين',
                      'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

        return \App\Models\User::where('role', 'school')
            ->where(function ($query) use ($uaeCities) {
                foreach ($uaeCities as $city) {
                    $query->orWhere('name', 'like', '%' . $city . '%');
                }
            })
            ->withCount(['students' => function ($query) {
                $query->where('role', 'student');
            }])
            ->limit(8)
            ->get()
            ->map(function ($school) {
                $students = \App\Models\User::where('school_id', $school->id)->where('role', 'student')->pluck('id');
                $totalPoints = \App\Models\User::whereIn('id', $students)->sum('points') ?? 0;
                $projectsCount = \App\Models\Project::whereIn('user_id', $students)->where('status', 'approved')->count();

                return [
                    'id' => $school->id,
                    'name' => $school->name,
                    'total_students' => $school->students_count ?? 0,
                    'projects_count' => $projectsCount,
                    'total_points' => $totalPoints,
                ];
            })
            ->toArray();
    });

    $packages = \Illuminate\Support\Facades\Cache::remember('home_packages', 3600, function () {
        return \App\Models\Package::where('is_active', true)
            ->orderBy('price')
            ->orderBy('created_at')
            ->get()
            ->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'name_ar' => $package->name_ar,
                    'description' => $package->description,
                    'description_ar' => $package->description_ar,
                    'price' => $package->price,
                    'currency' => $package->currency,
                    'duration_type' => $package->duration_type,
                    'duration_months' => $package->duration_months,
                    'points_bonus' => $package->points_bonus,
                    'projects_limit' => $package->projects_limit,
                    'challenges_limit' => $package->challenges_limit,
                    'certificate_access' => $package->certificate_access,
                    'badge_access' => $package->badge_access,
                    'features' => $package->features,
                    'features_ar' => $package->features_ar,
                    'is_active' => $package->is_active,
                    'is_popular' => $package->is_popular,
                ];
            })
            ->toArray();
    });

    return Inertia::render('Home', [
        'cities' => $cities,
        'subjects' => $subjects,
        'featuredTeachers' => $featuredTeachers,
        'testimonials' => $testimonials,
        'stats' => $stats,
        'featuredPublications' => $featuredPublications,
        'featuredProjects' => $featuredProjects,
        'uaeSchools' => $uaeSchools,
        'packages' => $packages,
    ]);
})->name('home.dashboard');

Route::get('/teachers', [TeacherController::class, 'index'])->name('teachers.index');
Route::get('/teachers/{id}', [TeacherController::class, 'show'])->name('teachers.show');
Route::get('/teachers/{teacherId}/availabilities', [AvailabilityController::class, 'getTeacherAvailabilities'])->name('teachers.availabilities');

Route::get('/subjects', [SubjectController::class, 'index'])->name('subjects');

// المشاريع المعتمدة (عام - متاح لجميع المستخدمين)
Route::get('/projects', [App\Http\Controllers\ProjectController::class, 'index'])->name('projects.index');
Route::get('/projects/{project}', [App\Http\Controllers\ProjectController::class, 'show'])->name('projects.show');

// التحديات النشطة (عام - متاح لجميع المستخدمين)
Route::get('/challenges', [App\Http\Controllers\ChallengeController::class, 'index'])->name('challenges.index');
Route::get('/challenges/winners', [App\Http\Controllers\ChallengeController::class, 'winners'])->name('challenges.winners');
Route::get('/challenges/{challenge}', [App\Http\Controllers\ChallengeController::class, 'show'])->name('challenges.show');

// API Routes for Challenges
Route::prefix('api')->group(function () {
    // Public challenge endpoints
    Route::get('/challenges', [App\Http\Controllers\Api\ChallengeApiController::class, 'index'])->name('api.challenges.index');
    Route::get('/challenges/{challenge}', [App\Http\Controllers\Api\ChallengeApiController::class, 'show'])->name('api.challenges.show');

    // Leaderboard endpoints (public)
    Route::get('/leaderboard/global', [App\Http\Controllers\Api\LeaderboardApiController::class, 'global'])->name('api.leaderboard.global');
    Route::get('/leaderboard/challenge/{challenge}', [App\Http\Controllers\Api\LeaderboardApiController::class, 'challenge'])->name('api.leaderboard.challenge');
    Route::get('/leaderboard/school/{school}', [App\Http\Controllers\Api\LeaderboardApiController::class, 'school'])->name('api.leaderboard.school');
    Route::get('/leaderboard/top-schools', [App\Http\Controllers\Api\LeaderboardApiController::class, 'topSchools'])->name('api.leaderboard.top-schools');

    // Customize Package Request (public)
    Route::post('/customize-package-request', [App\Http\Controllers\Api\CustomizePackageRequestController::class, 'store'])->name('api.customize-package-request.store');

    // Authenticated endpoints
    Route::middleware(['auth'])->group(function () {
        // Challenge participation
        Route::post('/challenges/{challenge}/join', [App\Http\Controllers\Api\ChallengeParticipationApiController::class, 'join'])->name('api.challenges.join');
        Route::get('/challenges/{challenge}/participation', [App\Http\Controllers\Api\ChallengeParticipationApiController::class, 'show'])->name('api.challenges.participation');
        Route::get('/challenges/participations/active', [App\Http\Controllers\Api\ChallengeParticipationApiController::class, 'active'])->name('api.challenges.participations.active');
        Route::get('/challenges/participations/completed', [App\Http\Controllers\Api\ChallengeParticipationApiController::class, 'completed'])->name('api.challenges.participations.completed');

        // User leaderboard rank
        Route::get('/leaderboard/user-rank', [App\Http\Controllers\Api\LeaderboardApiController::class, 'userRank'])->name('api.leaderboard.user-rank');
    });
});

Route::get('/badges', [App\Http\Controllers\BadgeController::class, 'index'])->name('badges');
Route::get('/badges/{id}', [App\Http\Controllers\BadgeController::class, 'show'])->name('badges.show');
Route::get('/achievements', [App\Http\Controllers\BadgeController::class, 'achievements'])->name('achievements');
Route::get('/store-membership', [App\Http\Controllers\BadgeController::class, 'storeMembership'])->name('store-membership');

// Package subscription routes (public)
Route::get('/packages', [\App\Http\Controllers\PackageSubscriptionController::class, 'index'])->name('packages.index');
Route::get('/my-subscriptions', [\App\Http\Controllers\PackageSubscriptionController::class, 'mySubscriptions'])
    ->middleware('auth')
    ->name('packages.my-subscriptions');
Route::post('/packages/{package}/subscribe', [\App\Http\Controllers\PackageSubscriptionController::class, 'subscribe'])
    ->middleware('auth')
    ->name('packages.subscribe');
Route::post('/packages/subscriptions/{userPackage}/cancel', [\App\Http\Controllers\PackageSubscriptionController::class, 'cancelSubscription'])
    ->middleware('auth')
    ->name('packages.subscription.cancel');
Route::get('/packages/payment/{payment}/success', [\App\Http\Controllers\PackageSubscriptionController::class, 'paymentSuccess'])
    ->name('packages.payment.success');
Route::get('/packages/payment/{payment}/cancel', [\App\Http\Controllers\PackageSubscriptionController::class, 'paymentCancel'])
    ->name('packages.payment.cancel');

// Ziina webhook
Route::post('/webhook/ziina', [\App\Http\Controllers\Api\ZiinaWebhookController::class, 'handle'])
    ->name('webhook.ziina');

Route::get('/search', [App\Http\Controllers\SearchController::class, 'search'])->name('search');
Route::get('/search/suggestions', [App\Http\Controllers\SearchController::class, 'suggestions'])->name('search.suggestions');
Route::get('/teachers/{id}/details', [App\Http\Controllers\SearchController::class, 'teacherDetails'])->name('teachers.details');

Route::get('/join-teacher', [JoinTeacherController::class, 'index'])->name('join-teacher');
Route::post('/join-teacher', [JoinTeacherController::class, 'store'])->name('join-teacher.store');
Route::get('/join-teacher/status', [JoinTeacherController::class, 'getApplicationStatus'])->name('join-teacher.status');

Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', function () {
        $user = auth()->user();

        // إعادة توجيه الأدمن مباشرة إلى لوحة التحكم الخاصة بهم
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        // التحقق من وجود teacher record قبل إعادة التوجيه
        if ($user->isTeacher()) {
            // إذا لم يكن هناك teacher record، قم بإنشائه
            if (!$user->teacher) {
                try {
                    \App\Models\Teacher::create([
                        'user_id' => $user->id,
                        'name_ar' => $user->name,
                        'name_en' => $user->name,
                        'city' => 'غير محدد', // قيمة افتراضية لأن الحقل مطلوب
                        'bio' => null,
                        'qualifications' => null,
                        'subjects' => json_encode([]),
                        'stages' => json_encode([]),
                        'experience_years' => 0,
                        'price_per_hour' => 0,
                        'nationality' => 'سعودي',
                        'gender' => null,
                        'neighborhoods' => json_encode([]),
                        'is_verified' => true, // معتمد تلقائياً
                        'is_active' => true, // نشط تلقائياً
                    ]);
                    $user->refresh();
                } catch (\Exception $e) {
                    // في حالة الخطأ، استمر في إعادة التوجيه
                }
            }
            return redirect()->route('teacher.dashboard');
        }

        if ($user->isSchool()) {
            return redirect()->route('school.dashboard');
        }

        if ($user->isStudent()) {
            return app(StudentDashboardController::class)->index(request());
        }

        return Inertia::render('Dashboard');
    })->name('dashboard');
});

Route::middleware(['auth'])->group(function () {
    // Certificate API routes
    Route::post('/api/certificates/generate', [\App\Http\Controllers\CertificateController::class, 'generate'])->name('api.certificates.generate');
    Route::get('/certificates/{id}/download', [\App\Http\Controllers\CertificateController::class, 'download'])->name('certificates.download');

    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::post('/availabilities/book', [AvailabilityController::class, 'book'])->name('availabilities.book');
    Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');

    Route::post('/reviews', [ReviewController::class, 'store'])->name('reviews.store');

    // الإصدارات - تفاعل (إعجاب)
    Route::post('/publications/{publication}/like', [\App\Http\Controllers\PublicationController::class, 'toggleLike'])->name('publications.like');

    Route::get('/chats', [ChatController::class, 'index'])->name('chats.index');
    Route::get('/chats/{chat}', [ChatController::class, 'show'])->name('chats.show');
    Route::post('/chats/{chat}/messages', [ChatController::class, 'storeMessage'])->name('chats.messages.store');

    Route::get('/student/reviews', [\App\Http\Controllers\Student\StudentReviewController::class, 'index'])->name('student.reviews');
    Route::post('/student/reviews', [\App\Http\Controllers\Student\StudentReviewController::class, 'store'])->name('student.reviews.store');
    Route::put('/student/reviews/{review}', [\App\Http\Controllers\Student\StudentReviewController::class, 'update'])->name('student.reviews.update');
    Route::delete('/student/reviews/{review}', [\App\Http\Controllers\Student\StudentReviewController::class, 'destroy'])->name('student.reviews.destroy');

    Route::get('/student/payments', [\App\Http\Controllers\Student\StudentPaymentController::class, 'index'])->name('student.payments');

    Route::get('/payment/{booking}', [\App\Http\Controllers\PaymentController::class, 'show'])->name('payment.show');
    Route::post('/payment/{booking}/initiate', [\App\Http\Controllers\PaymentController::class, 'initiate'])->name('payment.initiate');
    Route::get('/payment/{payment}/success', [\App\Http\Controllers\PaymentController::class, 'success'])->name('payment.success');
    Route::get('/payment/{payment}/failure', [\App\Http\Controllers\PaymentController::class, 'failure'])->name('payment.failure');
    Route::post('/payment/{payment}/cancel', [\App\Http\Controllers\PaymentController::class, 'cancel'])->name('payment.cancel');
    Route::post('/payment/{payment}/capture', [\App\Http\Controllers\PaymentController::class, 'capture'])->name('payment.capture');
    Route::post('/payment/{payment}/refund', [\App\Http\Controllers\PaymentController::class, 'refund'])->name('payment.refund');

    Route::get('/student/subjects', [\App\Http\Controllers\Student\StudentSubjectController::class, 'index'])->name('student.subjects');
    Route::post('/student/subjects', [\App\Http\Controllers\Student\StudentSubjectController::class, 'store'])->name('student.subjects.store');
    Route::delete('/student/subjects/{id}', [\App\Http\Controllers\Student\StudentSubjectController::class, 'destroy'])->name('student.subjects.destroy');

    // Student Points
    Route::get('/student/points', [\App\Http\Controllers\Student\StudentPointsController::class, 'index'])->name('student.points');

    // مشاريع الطلاب
    Route::get('/student/projects', [\App\Http\Controllers\Student\StudentProjectController::class, 'index'])->name('student.projects.index');
    Route::get('/student/projects/create', [\App\Http\Controllers\Student\StudentProjectController::class, 'create'])->name('student.projects.create');
    Route::get('/student/projects/{project}', [\App\Http\Controllers\Student\StudentProjectController::class, 'show'])->name('student.projects.show');

    // Student Challenges
    Route::get('/student/challenges', [\App\Http\Controllers\Student\StudentChallengeController::class, 'index'])->name('student.challenges.index');
    Route::get('/student/challenges/{challenge}', [\App\Http\Controllers\Student\StudentChallengeController::class, 'show'])->name('student.challenges.show');
    Route::post('/student/challenges/{challenge}/join', [\App\Http\Controllers\Student\StudentChallengeController::class, 'join'])->name('student.challenges.join');
    Route::post('/student/challenges/{challenge}/submit', [\App\Http\Controllers\Student\StudentChallengeController::class, 'submit'])->name('student.challenges.submit');
    Route::get('/student/challenges/{challenge}/submissions/{submission}', [\App\Http\Controllers\Student\StudentChallengeController::class, 'showSubmission'])->name('student.challenges.submissions.show');
    Route::put('/student/challenges/{challenge}/submissions/{submission}', [\App\Http\Controllers\Student\StudentChallengeController::class, 'updateSubmission'])->name('student.challenges.submissions.update');

    // تسليمات المشاريع
    Route::post('/projects/{project}/submissions', [\App\Http\Controllers\ProjectSubmissionController::class, 'store'])->name('project.submissions.store');
    Route::put('/project-submissions/{submission}', [\App\Http\Controllers\ProjectSubmissionController::class, 'update'])->name('project.submissions.update');

    // شهادة عضوية الطالب
    Route::get('/student/certificate', [\App\Http\Controllers\Student\StudentCertificateController::class, 'show'])->name('student.certificate.show');

    // شهادة عضوية المعلم
    Route::get('/teacher/certificate', [\App\Http\Controllers\Teacher\TeacherCertificateController::class, 'show'])->name('teacher.certificate.show');

    // شهادة عضوية المدرسة
    Route::get('/school/certificate', [\App\Http\Controllers\School\SchoolCertificateController::class, 'show'])->name('school.certificate.show');

    // شهادات العضوية
    Route::get('/membership-certificate', [\App\Http\Controllers\MembershipCertificateController::class, 'show'])->name('membership-certificates.show');
    Route::get('/membership-certificates/{id}/download', [\App\Http\Controllers\MembershipCertificateController::class, 'download'])->name('membership-certificates.download');
    Route::post('/membership-certificates/check-eligibility', [\App\Http\Controllers\MembershipCertificateController::class, 'checkEligibility'])->name('membership-certificates.check-eligibility');

    // تسليمات التحديات
    Route::post('/challenges/{challenge}/submissions', [\App\Http\Controllers\ChallengeSubmissionController::class, 'store'])->name('challenge.submissions.store');
    Route::put('/challenges/{challenge}/submissions/{submission}', [\App\Http\Controllers\ChallengeSubmissionController::class, 'update'])->name('challenge.submissions.update');

    // تعليقات المشاريع
    Route::post('/projects/{project}/comments', [\App\Http\Controllers\ProjectCommentController::class, 'store'])->name('project.comments.store');
    Route::put('/project-comments/{comment}', [\App\Http\Controllers\ProjectCommentController::class, 'update'])->name('project.comments.update');
    Route::delete('/project-comments/{comment}', [\App\Http\Controllers\ProjectCommentController::class, 'destroy'])->name('project.comments.destroy');

    // الإشعارات
    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread-count', [\App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::post('/notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
});

Route::middleware(['auth', 'school'])->prefix('school')->name('school.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\School\SchoolDashboardController::class, 'index'])->name('dashboard');

    // إدارة المشاريع
    Route::get('/projects/pending', [\App\Http\Controllers\School\SchoolProjectController::class, 'pending'])->name('projects.pending');
    Route::post('/projects/{project}/approve', [\App\Http\Controllers\School\SchoolProjectController::class, 'approve'])->name('projects.approve');
    Route::post('/projects/{project}/reject', [\App\Http\Controllers\School\SchoolProjectController::class, 'reject'])->name('projects.reject');
    Route::resource('projects', \App\Http\Controllers\School\SchoolProjectController::class);

    // إدارة الطلاب
    Route::get('/students', [\App\Http\Controllers\School\SchoolStudentController::class, 'index'])->name('students.index');
    Route::post('/students', [\App\Http\Controllers\School\SchoolStudentController::class, 'store'])->name('students.store');
    Route::put('/students/{id}', [\App\Http\Controllers\School\SchoolStudentController::class, 'update'])->name('students.update');
    Route::delete('/students/{id}', [\App\Http\Controllers\School\SchoolStudentController::class, 'destroy'])->name('students.destroy');
    Route::post('/students/{id}/award-badge', [\App\Http\Controllers\School\SchoolStudentController::class, 'awardBadge'])->name('students.award-badge');
    Route::delete('/students/{studentId}/badges/{badgeId}', [\App\Http\Controllers\School\SchoolStudentController::class, 'removeBadge'])->name('students.remove-badge');
    
    // تقارير تقييم الطلاب
    Route::get('/students/evaluation-report', [\App\Http\Controllers\School\StudentEvaluationController::class, 'index'])->name('students.evaluation-report');
    Route::get('/students/{studentId}/evaluation', [\App\Http\Controllers\School\StudentEvaluationController::class, 'show'])->name('students.evaluation');

    // الترتيب والشارات
    Route::get('/ranking', [\App\Http\Controllers\School\SchoolRankingController::class, 'index'])->name('ranking');

    // إدارة الإصدارات
    Route::get('/publications/pending', [\App\Http\Controllers\School\SchoolPublicationController::class, 'pending'])->name('publications.pending');
    Route::post('/publications/{publication}/approve', [\App\Http\Controllers\School\SchoolPublicationController::class, 'approve'])->name('publications.approve');
    Route::post('/publications/{publication}/reject', [\App\Http\Controllers\School\SchoolPublicationController::class, 'reject'])->name('publications.reject');
    Route::resource('publications', \App\Http\Controllers\School\SchoolPublicationController::class);

    // إدارة التحديات
    Route::resource('challenges', \App\Http\Controllers\School\SchoolChallengeController::class);

    // إدارة تقديمات التحديات
    Route::get('/challenge-submissions', [\App\Http\Controllers\School\SchoolChallengeSubmissionController::class, 'index'])->name('challenge-submissions.index');
    Route::get('/challenge-submissions/{submission}', [\App\Http\Controllers\School\SchoolChallengeSubmissionController::class, 'show'])->name('challenge-submissions.show');
    Route::post('/challenge-submissions/{submission}/evaluate', [\App\Http\Controllers\School\SchoolChallengeSubmissionController::class, 'evaluate'])->name('challenge-submissions.evaluate');

    // إدارة الشارات من المعلمين
    Route::get('/badges/pending', [\App\Http\Controllers\School\SchoolBadgeController::class, 'pending'])->name('badges.pending');
    Route::post('/badges/{badge}/approve', [\App\Http\Controllers\School\SchoolBadgeController::class, 'approve'])->name('badges.approve');
    Route::post('/badges/{badge}/reject', [\App\Http\Controllers\School\SchoolBadgeController::class, 'reject'])->name('badges.reject');
    Route::get('/badges', [\App\Http\Controllers\School\SchoolBadgeController::class, 'index'])->name('badges.index');
    Route::get('/badges/{badge}', [\App\Http\Controllers\School\SchoolBadgeController::class, 'show'])->name('badges.show');

    // إدارة تسليمات المشاريع للمدرسة
    Route::get('/submissions', [\App\Http\Controllers\School\SchoolSubmissionController::class, 'index'])->name('submissions.index');
    Route::get('/submissions/{submission}', [\App\Http\Controllers\School\SchoolSubmissionController::class, 'show'])->name('submissions.show');
    Route::post('/submissions/{submission}/evaluate', [\App\Http\Controllers\School\SchoolSubmissionController::class, 'evaluate'])->name('submissions.evaluate');

    // إدارة الشهادات
    Route::get('/certificates', [\App\Http\Controllers\School\SchoolCertificateController::class, 'index'])->name('certificates.index');

    // التقارير
    Route::get('/reports', [\App\Http\Controllers\School\SchoolReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/create', [\App\Http\Controllers\School\SchoolReportController::class, 'create'])->name('reports.create');
    Route::post('/reports', [\App\Http\Controllers\School\SchoolReportController::class, 'store'])->name('reports.store');
});

Route::middleware(['auth', 'teacher'])->group(function () {
    Route::get('/teacher/dashboard', [TeacherDashboardController::class, 'index'])->name('teacher.dashboard');

    Route::get('/teacher/students', [\App\Http\Controllers\Teacher\TeacherStudentController::class, 'index'])->name('teacher.students.index');
    
    // تقارير تقييم الطلاب
    Route::get('/teacher/students/evaluation-report', [\App\Http\Controllers\Teacher\StudentEvaluationController::class, 'index'])->name('teacher.students.evaluation-report');
    Route::get('/teacher/students/{studentId}/evaluation', [\App\Http\Controllers\Teacher\StudentEvaluationController::class, 'show'])->name('teacher.students.evaluation');

    Route::get('/teacher/profile', [App\Http\Controllers\Teacher\TeacherProfileController::class, 'index'])->name('teacher.profile');
    Route::put('/teacher/profile', [App\Http\Controllers\Teacher\TeacherProfileController::class, 'update'])->name('teacher.profile.update');

    Route::get('/teacher/subjects', [App\Http\Controllers\Teacher\TeacherProfileController::class, 'subjects'])->name('teacher.subjects');
    Route::post('/teacher/subjects', [App\Http\Controllers\Teacher\TeacherProfileController::class, 'addSubject'])->name('teacher.subjects.store');
    Route::put('/teacher/subjects/{id}', [App\Http\Controllers\Teacher\TeacherProfileController::class, 'updateSubject'])->name('teacher.subjects.update');
    Route::delete('/teacher/subjects/{id}', [App\Http\Controllers\Teacher\TeacherProfileController::class, 'deleteSubject'])->name('teacher.subjects.destroy');

    Route::get('/teacher/bookings', [BookingController::class, 'getTeacherBookings'])->name('teacher.bookings');

    Route::get('/teacher/reviews', [\App\Http\Controllers\Teacher\TeacherReviewController::class, 'index'])->name('teacher.reviews');
    Route::post('/teacher/reviews/{review}/reply', [\App\Http\Controllers\Teacher\TeacherReviewController::class, 'reply'])->name('teacher.reviews.reply');

    Route::get('/teacher/payments', [\App\Http\Controllers\Teacher\TeacherPaymentController::class, 'index'])->name('teacher.payments');
    Route::post('/teacher/payments/{id}/cancel', [\App\Http\Controllers\Teacher\TeacherPaymentController::class, 'cancel'])->name('teacher.payments.cancel');
    Route::post('/teacher/payments/{id}/refund', [\App\Http\Controllers\Teacher\TeacherPaymentController::class, 'refund'])->name('teacher.payments.refund');
    Route::get('/teacher/availability', [AvailabilityController::class, 'index'])->name('teacher.availability.index');
    Route::post('/teacher/availability', [AvailabilityController::class, 'store'])->name('teacher.availability.store');
    Route::put('/teacher/availability/{availability}', [AvailabilityController::class, 'update'])->name('teacher.availability.update');
    Route::delete('/teacher/availability/{availability}', [AvailabilityController::class, 'destroy'])->name('teacher.availability.destroy');

    // إدارة مقالات المعلمين
    Route::get('/teacher/publications', [\App\Http\Controllers\Teacher\TeacherPublicationController::class, 'index'])->name('teacher.publications.index');
    Route::get('/teacher/publications/create', [\App\Http\Controllers\Teacher\TeacherPublicationController::class, 'create'])->name('teacher.publications.create');
    Route::post('/teacher/publications', [\App\Http\Controllers\Teacher\TeacherPublicationController::class, 'store'])->name('teacher.publications.store');
    Route::get('/teacher/publications/{publication}', [\App\Http\Controllers\Teacher\TeacherPublicationController::class, 'show'])->name('teacher.publications.show');
    Route::get('/teacher/publications/{publication}/edit', [\App\Http\Controllers\Teacher\TeacherPublicationController::class, 'edit'])->name('teacher.publications.edit');
    Route::put('/teacher/publications/{publication}', [\App\Http\Controllers\Teacher\TeacherPublicationController::class, 'update'])->name('teacher.publications.update');
    Route::delete('/teacher/publications/{publication}', [\App\Http\Controllers\Teacher\TeacherPublicationController::class, 'destroy'])->name('teacher.publications.destroy');

    // إدارة التحديات
    Route::get('/teacher/challenges', [\App\Http\Controllers\Teacher\TeacherChallengeController::class, 'index'])->name('teacher.challenges.index');
    Route::get('/teacher/challenges/create', [\App\Http\Controllers\Teacher\TeacherChallengeController::class, 'create'])->name('teacher.challenges.create');
    Route::post('/teacher/challenges', [\App\Http\Controllers\Teacher\TeacherChallengeController::class, 'store'])->name('teacher.challenges.store');
    Route::get('/teacher/challenges/{challenge}', [\App\Http\Controllers\Teacher\TeacherChallengeController::class, 'show'])->name('teacher.challenges.show');
    Route::get('/teacher/challenges/{challenge}/edit', [\App\Http\Controllers\Teacher\TeacherChallengeController::class, 'edit'])->name('teacher.challenges.edit');
    Route::put('/teacher/challenges/{challenge}', [\App\Http\Controllers\Teacher\TeacherChallengeController::class, 'update'])->name('teacher.challenges.update');
    Route::delete('/teacher/challenges/{challenge}', [\App\Http\Controllers\Teacher\TeacherChallengeController::class, 'destroy'])->name('teacher.challenges.destroy');

    // إدارة تقديمات التحديات
    Route::get('/teacher/challenge-submissions', [\App\Http\Controllers\Teacher\TeacherChallengeSubmissionController::class, 'index'])->name('teacher.challenge-submissions.index');
    Route::get('/teacher/challenge-submissions/{submission}', [\App\Http\Controllers\Teacher\TeacherChallengeSubmissionController::class, 'show'])->name('teacher.challenge-submissions.show');
    Route::post('/teacher/challenge-submissions/{submission}/evaluate', [\App\Http\Controllers\Teacher\TeacherChallengeSubmissionController::class, 'evaluate'])->name('teacher.challenge-submissions.evaluate');

    // إدارة الشارات من المعلمين
    Route::prefix('teacher')->group(function () {
        Route::resource('badges', \App\Http\Controllers\Teacher\TeacherBadgeController::class)->names([
            'index' => 'teacher.badges.index',
            'create' => 'teacher.badges.create',
            'store' => 'teacher.badges.store',
            'show' => 'teacher.badges.show',
        ]);
    });

    // إدارة المشاريع من المعلمين
    Route::get('/teacher/projects', [\App\Http\Controllers\Teacher\TeacherProjectController::class, 'index'])->name('teacher.projects.index');
    Route::get('/teacher/projects/create', [\App\Http\Controllers\Teacher\TeacherProjectController::class, 'create'])->name('teacher.projects.create');
    Route::post('/teacher/projects', [\App\Http\Controllers\Teacher\TeacherProjectController::class, 'store'])->name('teacher.projects.store');
    Route::get('/teacher/projects/{project}', [\App\Http\Controllers\Teacher\TeacherProjectController::class, 'show'])->name('teacher.projects.show');
    Route::get('/teacher/projects/{project}/edit', [\App\Http\Controllers\Teacher\TeacherProjectController::class, 'edit'])->name('teacher.projects.edit');
    Route::put('/teacher/projects/{project}', [\App\Http\Controllers\Teacher\TeacherProjectController::class, 'update'])->name('teacher.projects.update');
    Route::delete('/teacher/projects/{id}', [\App\Http\Controllers\Teacher\TeacherProjectController::class, 'destroy'])->name('teacher.projects.destroy');

    // إدارة تسليمات المشاريع للمعلمين
    Route::get('/teacher/submissions', [\App\Http\Controllers\Teacher\TeacherSubmissionController::class, 'index'])->name('teacher.submissions.index');
    Route::get('/teacher/submissions/{submission}', [\App\Http\Controllers\Teacher\TeacherSubmissionController::class, 'show'])->name('teacher.submissions.show');
    Route::post('/teacher/submissions/{submission}/evaluate', [\App\Http\Controllers\Teacher\TeacherSubmissionController::class, 'evaluate'])->name('teacher.submissions.evaluate');

    // إدارة الشهادات
    Route::get('/teacher/certificates', [\App\Http\Controllers\Teacher\TeacherCertificateController::class, 'index'])->name('teacher.certificates.index');
});

Route::prefix('api/webhooks/payment')->group(function () {
    Route::post('/{gateway}', [\App\Http\Controllers\Api\PaymentWebhookController::class, 'handle'])->name('webhook.payment');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/chart-data', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'getChartDataApi'])->name('dashboard.chart-data');

    Route::get('/subjects', [SubjectController::class, 'adminIndex'])->name('subjects.index');
    Route::post('/subjects', [SubjectController::class, 'store'])->name('subjects.store');
    Route::put('/subjects/{subject}', [SubjectController::class, 'update'])->name('subjects.update');
    Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy'])->name('subjects.destroy');

    Route::resource('teachers', TeacherController::class)->except(['show']);
    Route::post('teachers/{teacher}/verify', [TeacherController::class, 'verify'])->name('teachers.verify');
    Route::post('teachers/{teacher}/activate', [TeacherController::class, 'activate'])->name('teachers.activate');
    Route::get('teachers/{teacher}/availabilities', [TeacherController::class, 'availabilities'])->name('teachers.availabilities');
    Route::post('teachers/{teacher}/availabilities', [TeacherController::class, 'storeAvailability'])->name('teachers.availabilities.store');
    Route::put('teachers/{teacher}/availabilities/{id}', [TeacherController::class, 'updateAvailability'])->name('teachers.availabilities.update');
    Route::delete('teachers/{teacher}/availabilities/{id}', [TeacherController::class, 'destroyAvailability'])->name('teachers.availabilities.destroy');
    Route::get('teachers/export', [TeacherController::class, 'export'])->name('teachers.export');
    Route::post('teachers/import', [TeacherController::class, 'import'])->name('teachers.import');

    Route::post('availability', [AvailabilityController::class, 'store'])->name('availability.store');

    Route::get('/reviews', [ReviewController::class, 'index'])->name('reviews.index');
    Route::patch('/reviews/{review}/publish', [ReviewController::class, 'publish'])->name('reviews.publish');
    Route::post('/reviews/{review}/reply', [ReviewController::class, 'reply'])->name('reviews.reply');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->name('reviews.destroy');

    Route::get('/students', [\App\Http\Controllers\Admin\StudentController::class, 'index'])->name('students.index');
    Route::get('/students/{id}/edit', [\App\Http\Controllers\Admin\StudentController::class, 'edit'])->name('students.edit');
    Route::put('/students/{id}', [\App\Http\Controllers\Admin\StudentController::class, 'update'])->name('students.update');
    Route::delete('/students/{id}', [\App\Http\Controllers\Admin\StudentController::class, 'destroy'])->name('students.destroy');
    Route::get('/students-export', [\App\Http\Controllers\Admin\StudentController::class, 'export'])->name('students.export');

    Route::get('/teacher-applications', [App\Http\Controllers\Admin\TeacherApplicationController::class, 'index'])->name('teacher-applications.index');
    Route::get('/teacher-applications/{application}', [App\Http\Controllers\Admin\TeacherApplicationController::class, 'show'])->name('teacher-applications.show');
    Route::post('/teacher-applications/{application}/approve', [App\Http\Controllers\Admin\TeacherApplicationController::class, 'approve'])->name('teacher-applications.approve');
    Route::post('/teacher-applications/{application}/reject', [App\Http\Controllers\Admin\TeacherApplicationController::class, 'reject'])->name('teacher-applications.reject');
    Route::post('/teacher-applications/{application}/review', [App\Http\Controllers\Admin\TeacherApplicationController::class, 'markUnderReview'])->name('teacher-applications.review');

    Route::get('/import', [\App\Http\Controllers\Admin\ImportController::class, 'index'])->name('import.index');
    Route::post('/import/students', [\App\Http\Controllers\Admin\ImportController::class, 'importStudents'])->name('import.students');
    Route::post('/import/teachers', [\App\Http\Controllers\Admin\ImportController::class, 'importTeachers'])->name('import.teachers');
    Route::post('/import/bookings', [\App\Http\Controllers\Admin\ImportController::class, 'importBookings'])->name('import.bookings');

    // إدارة المستخدمين - CRUD كامل
    Route::resource('users', \App\Http\Controllers\Admin\UserManagementController::class);
    Route::put('/users/{user}/role', [\App\Http\Controllers\Admin\UserManagementController::class, 'updateRole'])->name('users.update-role');
    Route::post('/users/bulk-delete', [\App\Http\Controllers\Admin\UserManagementController::class, 'bulkDelete'])->name('users.bulk-delete');
    Route::get('/users/export/excel', [\App\Http\Controllers\Admin\UserManagementController::class, 'export'])->name('users.export');

    // إدارة الصلاحيات - CRUD كامل للمستخدمين الإداريين
    Route::resource('permissions', \App\Http\Controllers\Admin\AdminPermissionsController::class)->except(['show']);

    Route::get('/teachers/{teacher}/report', [\App\Http\Controllers\Admin\TeacherReportController::class, 'show'])->name('teachers.report');

    // Badges Management
    Route::resource('badges', \App\Http\Controllers\Admin\BadgeController::class);
    Route::post('/badges/{badge}/award', [\App\Http\Controllers\Admin\BadgeController::class, 'award'])->name('badges.award');

    // Certificates Management
    Route::resource('certificates', \App\Http\Controllers\Admin\CertificateController::class);
    Route::get('/certificates/{certificate}/download', [\App\Http\Controllers\Admin\CertificateController::class, 'download'])->name('certificates.download');
    Route::post('/certificates/{certificate}/toggle-status', [\App\Http\Controllers\Admin\CertificateController::class, 'toggleStatus'])->name('certificates.toggle-status');

    // Payment Gateways Management
    Route::get('/payment-gateways', [\App\Http\Controllers\Admin\PaymentGatewayController::class, 'index'])->name('payment-gateways.index');
    Route::put('/payment-gateways/{paymentGateway}', [\App\Http\Controllers\Admin\PaymentGatewayController::class, 'update'])->name('payment-gateways.update');
    Route::post('/payment-gateways/{paymentGateway}/toggle-status', [\App\Http\Controllers\Admin\PaymentGatewayController::class, 'toggleStatus'])->name('payment-gateways.toggle-status');
    Route::post('/payment-gateways/{paymentGateway}/test-connection', [\App\Http\Controllers\Admin\PaymentGatewayController::class, 'testConnection'])->name('payment-gateways.test-connection');

    // Packages Management
    Route::resource('packages', \App\Http\Controllers\Admin\PackageController::class);
    Route::post('/packages/{package}/toggle-status', [\App\Http\Controllers\Admin\PackageController::class, 'toggleStatus'])->name('packages.toggle-status');
    Route::get('/packages/{package}/subscribers', [\App\Http\Controllers\Admin\PackageController::class, 'subscribers'])->name('packages.subscribers');
    Route::post('/packages/subscribers/{userPackage}/update-status', [\App\Http\Controllers\Admin\PackageController::class, 'updateSubscriberStatus'])->name('packages.subscribers.update-status');
    Route::post('/packages/subscribers/{userPackage}/cancel', [\App\Http\Controllers\Admin\PackageController::class, 'cancelSubscription'])->name('packages.subscribers.cancel');
    Route::post('/packages/subscribers/{userPackage}/renew', [\App\Http\Controllers\Admin\PackageController::class, 'renewSubscription'])->name('packages.subscribers.renew');

    // إدارة الاشتراكات والمدفوعات
    Route::get('/subscriptions', [\App\Http\Controllers\Admin\AdminSubscriptionController::class, 'index'])->name('subscriptions.index');
    Route::get('/subscriptions/subscription/{subscription}', [\App\Http\Controllers\Admin\AdminSubscriptionController::class, 'showSubscription'])->name('subscriptions.show-subscription');

    // إدارة الإصدارات
    Route::resource('publications', \App\Http\Controllers\Admin\AdminPublicationController::class)->only(['index', 'create', 'store', 'show', 'destroy']);
    Route::post('/publications/{publication}/approve', [\App\Http\Controllers\Admin\AdminPublicationController::class, 'approve'])->name('publications.approve');
    Route::post('/publications/{publication}/reject', [\App\Http\Controllers\Admin\AdminPublicationController::class, 'reject'])->name('publications.reject');

    // إدارة التحديات - CRUD كامل
    Route::resource('challenges', \App\Http\Controllers\Admin\AdminChallengeController::class);
    Route::get('/challenges/{challenge}/assign-students', [\App\Http\Controllers\Admin\ChallengeStudentController::class, 'show'])->name('challenges.assign-students');
    Route::post('/challenges/{challenge}/assign-students', [\App\Http\Controllers\Admin\ChallengeStudentController::class, 'assign'])->name('challenges.assign-students.store');

    // إدارة تقديمات التحديات
    Route::get('/challenges/{challenge}/submissions', [\App\Http\Controllers\Admin\AdminChallengeSubmissionController::class, 'index'])->name('challenge-submissions.index');
    Route::get('/challenge-submissions/{submission}', [\App\Http\Controllers\Admin\AdminChallengeSubmissionController::class, 'show'])->name('challenge-submissions.show');
    Route::post('/challenge-submissions/{submission}/evaluate', [\App\Http\Controllers\Admin\AdminChallengeSubmissionController::class, 'evaluate'])->name('challenge-submissions.evaluate');

    // إدارة المشاريع - CRUD كامل
    Route::get('/projects', [\App\Http\Controllers\Admin\AdminProjectController::class, 'index'])->name('projects.index');
    Route::get('/projects/create', [\App\Http\Controllers\Admin\AdminProjectController::class, 'create'])->name('projects.create');
    Route::post('/projects', [\App\Http\Controllers\Admin\AdminProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{project}/edit', [\App\Http\Controllers\Admin\AdminProjectController::class, 'edit'])->name('projects.edit');
    Route::put('/projects/{project}', [\App\Http\Controllers\Admin\AdminProjectController::class, 'update'])->name('projects.update');
    Route::get('/projects/{project}', [\App\Http\Controllers\Admin\AdminProjectController::class, 'show'])->name('projects.show');
    Route::post('/projects/{project}/approve', [\App\Http\Controllers\Admin\AdminProjectController::class, 'approve'])->name('projects.approve');
    Route::post('/projects/{project}/reject', [\App\Http\Controllers\Admin\AdminProjectController::class, 'reject'])->name('projects.reject');
    Route::delete('/projects/{project}', [\App\Http\Controllers\Admin\AdminProjectController::class, 'destroy'])->name('projects.destroy');
    
    // إدارة تسليمات المشاريع
    Route::get('/submissions/{submission}', [\App\Http\Controllers\Admin\AdminSubmissionController::class, 'show'])->name('submissions.show');
    Route::post('/submissions/{submission}/evaluate', [\App\Http\Controllers\Admin\AdminSubmissionController::class, 'evaluate'])->name('submissions.evaluate');

    // إدارة معايير القبول
    Route::get('/acceptance-criteria', [\App\Http\Controllers\Admin\AcceptanceCriteriaController::class, 'index'])->name('acceptance-criteria.index');
    Route::post('/acceptance-criteria', [\App\Http\Controllers\Admin\AcceptanceCriteriaController::class, 'store'])->name('acceptance-criteria.store');
    Route::put('/acceptance-criteria/{acceptanceCriterion}', [\App\Http\Controllers\Admin\AcceptanceCriteriaController::class, 'update'])->name('acceptance-criteria.update');
    Route::delete('/acceptance-criteria/{acceptanceCriterion}', [\App\Http\Controllers\Admin\AcceptanceCriteriaController::class, 'destroy'])->name('acceptance-criteria.destroy');
    Route::post('/acceptance-criteria/update-order', [\App\Http\Controllers\Admin\AcceptanceCriteriaController::class, 'updateOrder'])->name('acceptance-criteria.update-order');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Student Profile
    Route::get('/student/profile', [\App\Http\Controllers\Student\StudentProfileController::class, 'index'])->name('student.profile');
    Route::post('/student/profile/update-school', [\App\Http\Controllers\Student\StudentProfileController::class, 'updateSchool'])->name('student.profile.update-school');
    
    // Notification Preferences
    Route::get('/notification-preferences', [\App\Http\Controllers\NotificationPreferencesController::class, 'index'])->name('notification-preferences.index');
    Route::put('/notification-preferences', [\App\Http\Controllers\NotificationPreferencesController::class, 'update'])->name('notification-preferences.update');
});

Route::middleware('auth')->prefix('teacher')->group(function () {
    Route::get('/availabilities', [TeacherAvailabilityController::class, 'index'])->name('teacher.availabilities');
    Route::post('/availabilities', [TeacherAvailabilityController::class, 'store'])->name('teacher.availabilities.store');
    Route::put('/availabilities/{id}', [TeacherAvailabilityController::class, 'update'])->name('teacher.availabilities.update');
    Route::delete('/availabilities/{id}', [TeacherAvailabilityController::class, 'destroy'])->name('teacher.availabilities.destroy');
    Route::get('/availabilities/available', [TeacherAvailabilityController::class, 'getAvailableSlots'])->name('teacher.availabilities.available');
});

Route::middleware('auth')->group(function () {
    Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus'])->name('bookings.update-status');
    Route::get('/my-bookings', [BookingController::class, 'getStudentBookings'])->name('bookings.student');
    Route::get('/teacher-bookings', [BookingController::class, 'getTeacherBookings'])->name('bookings.teacher');
});

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/bookings', [\App\Http\Controllers\Admin\BookingController::class, 'index'])->name('admin.bookings.index');
    Route::get('/bookings/{id}', [\App\Http\Controllers\Admin\BookingController::class, 'show'])->name('admin.bookings.show');
    Route::put('/bookings/{id}/status', [\App\Http\Controllers\Admin\BookingController::class, 'updateStatus'])->name('admin.bookings.update-status');
    Route::delete('/bookings/{id}', [\App\Http\Controllers\Admin\BookingController::class, 'destroy'])->name('admin.bookings.destroy');
    Route::get('/bookings-stats', [\App\Http\Controllers\Admin\BookingController::class, 'getStats'])->name('admin.bookings.stats');
    Route::get('/bookings-export', [\App\Http\Controllers\Admin\BookingController::class, 'export'])->name('admin.bookings.export');

    Route::get('/payments', [\App\Http\Controllers\Admin\PaymentController::class, 'index'])->name('payments.index');
    Route::get('/payments/{id}', [\App\Http\Controllers\Admin\PaymentController::class, 'show'])->name('payments.show');
    Route::post('/payments/{id}/cancel', [\App\Http\Controllers\Admin\PaymentController::class, 'cancel'])->name('admin.payments.cancel');
    Route::post('/payments/{id}/refund', [\App\Http\Controllers\Admin\PaymentController::class, 'refund'])->name('admin.payments.refund');

});

// الإصدارات - عام (للطلاب والمستخدمين غير المسجلين)
Route::get('/publications', [\App\Http\Controllers\PublicationController::class, 'index'])->name('publications.index');
Route::get('/publications/{publication}', [\App\Http\Controllers\PublicationController::class, 'show'])->name('publications.show');

require __DIR__ . '/auth.php';
