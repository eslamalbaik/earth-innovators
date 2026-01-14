<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Point;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentPointsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();

        if (!$user || !$user->isStudent()) {
            abort(403, 'Unauthorized action.');
        }

        $type = $request->get('type'); // earned|redeemed|bonus|penalty

        $pointsQuery = Point::query()
            ->where('user_id', $user->id)
            ->when($type, fn ($q) => $q->where('type', $type))
            ->select('id', 'points', 'type', 'source', 'source_id', 'description_ar', 'description', 'created_at')
            ->latest();

        $points = $pointsQuery
            ->paginate(20)
            ->withQueryString()
            ->through(function ($p) {
                return [
                    'id' => $p->id,
                    'points' => (int) $p->points,
                    'type' => $p->type,
                    'source' => $p->source,
                    'source_id' => $p->source_id,
                    'description' => $p->description_ar ?: $p->description,
                    'created_at' => $p->created_at?->format('Y-m-d'),
                ];
            });

        $summary = DB::table('points')
            ->where('user_id', $user->id)
            ->selectRaw('
                COALESCE(SUM(points), 0) as total,
                COALESCE(SUM(CASE WHEN type = "earned" THEN points ELSE 0 END), 0) as earned,
                COALESCE(SUM(CASE WHEN type = "bonus" THEN points ELSE 0 END), 0) as bonus,
                COALESCE(SUM(CASE WHEN type = "redeemed" THEN points ELSE 0 END), 0) as redeemed,
                COALESCE(SUM(CASE WHEN type = "penalty" THEN points ELSE 0 END), 0) as penalty
            ')
            ->first();

        return Inertia::render('Student/Points', [
            'summary' => [
                'current' => (int) ($user->points ?? 0),
                'earned' => (int) ($summary->earned ?? 0),
                'bonus' => (int) ($summary->bonus ?? 0),
                'redeemed' => (int) ($summary->redeemed ?? 0),
                'penalty' => (int) ($summary->penalty ?? 0),
            ],
            'points' => $points,
            'filters' => [
                'type' => $type,
            ],
        ]);
    }
}


