<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * يوجّه الطالب المسجّل من صفحات الاستكشاف العامة (/projects، /challenges) إلى مسارات الطالب.
 */
class RedirectStudentFromPublicExploreRoutes
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user || !$user->isStudent()) {
            return $next($request);
        }

        if (!$request->isMethod('GET')) {
            return $next($request);
        }

        $path = trim($request->path(), '/');
        $suffix = ($qs = $request->getQueryString()) ? '?'.$qs : '';

        if ($path === 'projects') {
            return redirect('/student/projects'.$suffix);
        }

        if (preg_match('#^projects/(.+)$#', $path, $m)) {
            return redirect('/student/projects/'.$m[1].$suffix);
        }

        if ($path === 'challenges/winners') {
            return redirect('/student/challenges/winners'.$suffix);
        }

        if ($path === 'challenges') {
            return redirect('/student/challenges'.$suffix);
        }

        if (preg_match('#^challenges/(.+)$#', $path, $m)) {
            return redirect('/student/challenges/'.$m[1].$suffix);
        }

        return $next($request);
    }
}
