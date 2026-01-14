<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SchoolCertificateShowController extends Controller
{
    public function show()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'school') {
            abort(403, 'Unauthorized action.');
        }

        $joinDate = $user->created_at ? $user->created_at->format('Y-m-d') : now()->format('Y-m-d');
        $issueDate = now()->format('Y/m/d');

        return Inertia::render('School/Certificate/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name ?? $user->institution ?? 'مدرسة غير محددة',
                'membership_number' => $user->membership_number ?? 'SCH-' . now()->format('Y') . '-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
            ],
            'certificate' => [
                'issue_date' => $issueDate,
                'year' => now()->format('Y'),
            ],
        ]);
    }
}

