<?php

namespace App\Http\Controllers;

use App\Models\Publication;
use App\Services\PublicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PublicationController extends Controller
{
    public function __construct(
        private PublicationService $publicationService
    ) {}

    public function index(Request $request): Response
    {
        $publications = $this->publicationService->getApprovedPublications(
            $request->get('search'),
            $request->get('type'),
            12
        )->withQueryString();

        $publications->getCollection()->transform(function ($publication) {
            $publication->is_liked = Auth::check() ? $publication->isLikedBy(Auth::id()) : false;
            return $publication;
        });

        return Inertia::render('Publications/Index', [
            'publications' => $publications,
            'filters' => [
                'search' => $request->search,
                'type' => $request->type,
            ],
        ]);
    }

    public function show(int $id): Response
    {
        $publication = $this->publicationService->getPublicationDetails($id, Auth::id());

        if (!$publication || $publication->status !== 'approved') {
            abort(404);
        }

        return Inertia::render('Publications/Show', [
            'publication' => $publication,
            'isLiked' => $publication->is_liked ?? false,
        ]);
    }


    public function toggleLike(Publication $publication)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $isLiked = $publication->isLikedBy($user->id);

        if ($isLiked) {
            $publication->likedBy()->detach($user->id);
            $publication->decrement('likes_count');
            $liked = false;
        } else {
            $publication->likedBy()->attach($user->id);
            $publication->increment('likes_count');
            $liked = true;
        }

        return response()->json([
            'success' => true,
            'liked' => $liked,
            'likes_count' => $publication->fresh()->likes_count,
        ]);
    }
}
