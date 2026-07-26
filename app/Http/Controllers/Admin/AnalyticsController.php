<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    /**
     * Display analytics dashboard
     */
    public function dashboard(): Response
    {
        return Inertia::render('Admin/Analytics/Dashboard', [
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);
    }
}
