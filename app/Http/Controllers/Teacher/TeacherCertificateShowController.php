<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeacherCertificateShowController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'teacher') {
            abort(403, 'Unauthorized action.');
        }

        $joinDate = $user->created_at ? $user->created_at->format('Y-m-d') : now()->format('Y-m-d');
        $issueDate = now()->format('Y/m/d');

        return Inertia::render('Teacher/Certificate/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'membership_number' => $user->membership_number ?? 'TCH-' . now()->format('Y') . '-' . str_pad($user->id, 3, '0', STR_PAD_LEFT),
            ],
            'certificate' => [
                'issue_date' => $issueDate,
                'membership_start' => $joinDate,
                'membership_end' => now()->addYear()->format('Y-m-d'),
            ],
        ]);
    }
}

