<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Session\TokenMismatchException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsTeacher;
use App\Http\Middleware\EnsureUserIsSystemSupervisor;
use App\Http\Middleware\EnsureUserIsSchoolSupportCoordinator;
use App\Http\Middleware\EnsureMembershipActive;

return Application::configure(basePath: dirname(__DIR__))
    ->withProviders([
        ...(env('APP_ENV') === 'testing' && env('CACHE_STORE') === 'array' 
            ? [\Tests\Providers\TestServiceProvider::class] 
            : [])
    ])
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['locale']);

        // Exempt external webhook endpoints from CSRF verification
        $middleware->validateCsrfTokens(except: [
            'webhook/ziina',
            'api/webhooks/payment/*',
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\SetLocale::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'teacher' => EnsureUserIsTeacher::class,
            'school' => \App\Http\Middleware\EnsureUserIsSchool::class,
            'system_supervisor' => EnsureUserIsSystemSupervisor::class,
            'school_support_coordinator' => EnsureUserIsSchoolSupportCoordinator::class,
            'redirect_student_explore' => \App\Http\Middleware\RedirectStudentFromPublicExploreRoutes::class,
            'membership_active' => EnsureMembershipActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $handleExpiredRequest = function (Request $request) {
            if ($request->hasSession()) {
                $request->session()->regenerateToken();
            }

            // Inertia requests (XHR) should force a full page reload so the new CSRF token is picked up
            // and the SPA doesn't get stuck in a repeated 419 loop.
            if ($request->header('X-Inertia')) {
                return response('', 409)->header('X-Inertia-Location', $request->fullUrl());
            }

            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Session expired. Please refresh and try again.',
                    'message_key' => 'toastMessages.sessionExpired',
                ], 419);
            }

            $redirect = redirect()->back(303);

            if (in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
                $redirect = $redirect->withInput(
                    $request->except(['password', 'password_confirmation', 'current_password'])
                );
            }

            return $redirect->with('error', [
                'key' => 'toastMessages.sessionExpired',
            ]);
        };

        $exceptions->render(function (TokenMismatchException $e, Request $request) use ($handleExpiredRequest) {
            return $handleExpiredRequest($request);
        });

        $exceptions->render(function (HttpException $e, Request $request) use ($handleExpiredRequest) {
            if ($e->getStatusCode() === 419) {
                return $handleExpiredRequest($request);
            }
        });

        $exceptions->render(function (PostTooLargeException $e, Request $request) {
            $message = 'حجم الملفات المرفوعة أكبر من الحد المسموح. يرجى تقليل حجم الملفات أو رفعها على دفعات.';

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => $message,
                    'errors' => [
                        'files' => [$message],
                    ],
                ], 413);
            }

            return redirect()->back(303)
                ->withErrors(['files' => $message])
                ->with('error', $message);
        });

        $exceptions->render(function (MethodNotAllowedHttpException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'message' => 'Method not allowed for this route.',
                ], 405);
            }

            $fallbackUrl = url('/');
            $referer = $request->headers->get('referer');

            if ($referer && $referer !== $request->fullUrl()) {
                $fallbackUrl = $referer;
            }

            return redirect()->to($fallbackUrl)
                ->with('error', 'هذا الرابط مخصص لتنفيذ إجراء وليس صفحة مباشرة.');
        });

        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, \Illuminate\Http\Request $request) {
            return redirect('/');
        });
    })->create();
