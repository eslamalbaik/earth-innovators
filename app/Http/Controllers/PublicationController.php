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
    /**
     * عرض جميع الإصدارات للطلاب
     */
    public function index(Request $request): Response
    {
        $publications = $this->publicationService->getApprovedPublications(
            $request->get('search'),
            $request->get('type'),
            12
        )->withQueryString();

        // Normalize image and file paths
        $publications->getCollection()->transform(function ($publication) {
            $publication->is_liked = Auth::check() ? $publication->isLikedBy(Auth::id()) : false;
            $publication->cover_image = $this->publicationService->normalizeImagePath($publication->cover_image);
            $publication->file = $this->publicationService->normalizeFilePath($publication->file);
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

    /**
     * عرض تفاصيل إصدار معين
     */
    public function show(int $id): Response
    {
        $publication = $this->publicationService->getPublicationDetails($id, Auth::id());

        if (!$publication || $publication->status !== 'approved') {
            abort(404);
        }

        // Normalize paths
        $publication->cover_image = $this->publicationService->normalizeImagePath($publication->cover_image);
        $publication->file = $this->publicationService->normalizeFilePath($publication->file);

        return Inertia::render('Publications/Show', [
            'publication' => $publication,
            'isLiked' => $publication->is_liked ?? false,
        ]);
    }

    /**
     * إضافة/إزالة إعجاب
     */
    public function toggleLike(Publication $publication)
    {
        $user = Auth::user();

        if (!$user) {
            return redirect()->route('login');
        }

        $isLiked = $publication->isLikedBy($user->id);

        if ($isLiked) {
            // إزالة الإعجاب
            $publication->likedBy()->detach($user->id);
            $publication->decrement('likes_count');
            $liked = false;
        } else {
            // إضافة الإعجاب
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
