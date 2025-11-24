<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use App\Services\PublicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminPublicationController extends Controller
{
    public function __construct(
        private PublicationService $publicationService
    ) {}

    /**
     * عرض قائمة جميع المقالات
     */
    public function index(Request $request): Response
    {
        $publications = Publication::with(['author:id,name', 'school:id,name', 'approver:id,name'])
            ->select('id', 'title', 'description', 'type', 'status', 'author_id', 'school_id', 'approved_by', 'created_at')
            ->when($request->has('search') && $request->search, function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->has('status') && $request->status, function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->has('type') && $request->type, function ($q) use ($request) {
                $q->where('type', $request->type);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => Publication::count(),
            'pending' => Publication::where('status', 'pending')->count(),
            'approved' => Publication::where('status', 'approved')->count(),
            'rejected' => Publication::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Publications/Index', [
            'publications' => $publications,
            'stats' => $stats,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'type' => $request->type,
            ],
        ]);
    }

    /**
     * حذف مقال
     */
    public function destroy(Publication $publication)
    {
        // حذف الصور والملفات
        if ($publication->cover_image) {
            Storage::disk('public')->delete($publication->cover_image);
        }
        if ($publication->file) {
            Storage::disk('public')->delete($publication->file);
        }

        $publication->delete();

        return redirect()
            ->route('admin.publications.index')
            ->with('success', 'تم حذف المقال بنجاح!');
    }
}
