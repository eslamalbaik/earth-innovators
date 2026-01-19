<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\EnsureUserIsTeacher;
use App\Http\Middleware\EnsureUserIsSystemSupervisor;
use App\Http\Middleware\EnsureUserIsSchoolSupportCoordinator;

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
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'teacher' => EnsureUserIsTeacher::class,
            'school' => \App\Http\Middleware\EnsureUserIsSchool::class,
            'system_supervisor' => EnsureUserIsSystemSupervisor::class,
            'school_support_coordinator' => EnsureUserIsSchoolSupportCoordinator::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, \Illuminate\Http\Request $request) {
            return redirect('/');
        });
    })->create();
