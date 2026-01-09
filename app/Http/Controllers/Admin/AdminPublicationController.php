<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Publication\StorePublicationRequest;
use App\Models\Publication;
use App\Models\User;
use App\Services\PublicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            ->select('id', 'title', 'description', 'type', 'status', 'author_id', 'school_id', 'approved_by', 'created_at', 'cover_image')
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
     * عرض نموذج إنشاء مقال جديد
     */
    public function create(): Response
    {
        $schools = User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Publications/Create', [
            'schools' => $schools,
        ]);
    }

    /**
     * حفظ مقال جديد
     */
    public function store(StorePublicationRequest $request)
    {
        $user = Auth::user();

        $data = $request->validated();
        $data['author_id'] = $user->id;
        // للأدمن، يمكن ربط المقال بمدرسة أو تركه فارغاً
        // إذا لم يتم تحديد school_id، سيكون null (مقال عام من الأدمن)
        if (!empty($data['school_id'])) {
            $data['school_id'] = $data['school_id'];
        } else {
            $data['school_id'] = null;
        }
        $data['status'] = 'approved';
        $data['approved_by'] = $user->id;
        $data['approved_at'] = now();
        // تعيين اسم الناشر
        $data['publisher_name'] = $user->name;
        // تعيين تاريخ النشر تلقائياً
        $data['publish_date'] = now()->toDateString();

        // Handle file uploads
        if ($request->hasFile('cover_image')) {
            $data['cover_image'] = $request->file('cover_image');
        }

        if ($request->hasFile('file')) {
            $data['file'] = $request->file('file');
        }

        try {
            $publication = $this->publicationService->createPublication($data);

            // إرسال إشعار لجميع المستخدمين إذا كان المقال مرتبط بمدرسة
            if ($publication->status === 'approved' && $publication->school_id) {
                try {
                    $publication->refresh();
                    $publication->load(['author', 'school']);
                    
                    $users = User::where('school_id', $publication->school_id)
                        ->whereIn('role', ['student', 'teacher'])
                        ->get();
                    
                    foreach ($users as $user) {
                        try {
                            $user->notify(new \App\Notifications\NewPublicationNotification($publication));
                        } catch (\Exception $e) {
                            \Log::error('Failed to send publication notification to user', [
                                'user_id' => $user->id,
                                'publication_id' => $publication->id,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }
                } catch (\Exception $e) {
                    \Log::error('Failed to send publication notifications', [
                        'publication_id' => $publication->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }

            return redirect()
                ->route('admin.publications.index')
                ->with('success', 'تم نشر المقال بنجاح!');
        } catch (\Exception $e) {
            \Log::error('Error creating publication: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء إنشاء المقال: ' . $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * عرض تفاصيل مقال
     */
    public function show(Publication $publication): Response
    {
        $publication->load(['author:id,name,email', 'school:id,name', 'approver:id,name']);

        return Inertia::render('Admin/Publications/Show', [
            'publication' => $publication,
        ]);
    }

    /**
     * الموافقة على مقال
     */
    public function approve(Publication $publication)
    {
        $user = auth()->user();

        $this->publicationService->approvePublication($publication, $user->id);

        return redirect()
            ->back()
            ->with('success', 'تم الموافقة على المقال بنجاح!');
    }

    /**
     * رفض مقال
     */
    public function reject(Request $request, Publication $publication)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'reason' => 'nullable|string|max:1000',
        ]);

        $this->publicationService->rejectPublication($publication, $user->id, $validated['reason'] ?? null);

        return redirect()
            ->back()
            ->with('success', 'تم رفض المقال.');
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
