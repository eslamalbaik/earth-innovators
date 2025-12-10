<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminProjectController extends Controller
{
    /**
     * عرض جميع المشاريع
     */
    public function index(Request $request)
    {
        $projects = Project::with(['user:id,name,email', 'school:id,name', 'teacher:id,name_ar'])
            ->select('id', 'title', 'description', 'user_id', 'school_id', 'teacher_id', 'status', 'category', 'views', 'likes', 'created_at', 'approved_at')
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->filled('category'), function ($q) use ($request) {
                $q->where('category', $request->category);
            })
            ->latest('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'description' => $project->description,
                    'student_name' => $project->user->name ?? 'غير معروف',
                    'student_email' => $project->user->email ?? '—',
                    'school_name' => $project->school->name ?? 'غير محدد',
                    'teacher_name' => $project->teacher->name_ar ?? 'غير محدد',
                    'user_id' => $project->user_id,
                    'school_id' => $project->school_id,
                    'teacher_id' => $project->teacher_id,
                    'status' => $project->status,
                    'category' => $project->category,
                    'views' => $project->views ?? 0,
                    'likes' => $project->likes ?? 0,
                    'created_at' => $project->created_at->format('Y-m-d H:i'),
                    'approved_at' => $project->approved_at?->format('Y-m-d H:i'),
                ];
            });

        $stats = [
            'total' => Project::count(),
            'approved' => Project::where('status', 'approved')->count(),
            'pending' => Project::where('status', 'pending')->count(),
            'rejected' => Project::where('status', 'rejected')->count(),
        ];

        // Get users, schools, and teachers for create/edit forms
        $users = \App\Models\User::where('role', 'student')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $schools = \App\Models\User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $teachers = \App\Models\Teacher::with('user:id,name')
            ->select('id', 'user_id', 'name_ar')
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name_ar ?? $teacher->user->name ?? 'غير معروف',
                ];
            });

        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects,
            'stats' => $stats,
            'users' => $users,
            'schools' => $schools,
            'teachers' => $teachers,
            'filters' => $request->only(['search', 'status', 'category']),
        ]);
    }

    /**
     * عرض نموذج إنشاء مشروع جديد
     */
    public function create()
    {
        $users = \App\Models\User::where('role', 'student')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $schools = \App\Models\User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $teachers = \App\Models\Teacher::with('user:id,name')
            ->select('id', 'user_id', 'name_ar')
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name_ar ?? $teacher->user->name ?? 'غير معروف',
                ];
            });

        return Inertia::render('Admin/Projects/Create', [
            'users' => $users,
            'schools' => $schools,
            'teachers' => $teachers,
        ]);
    }

    /**
     * حفظ مشروع جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|string|max:255',
            'user_id' => 'required|exists:users,id',
            'school_id' => 'nullable|exists:users,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'status' => 'required|in:pending,approved,rejected',
            'files' => 'nullable|array',
            'images' => 'nullable|array',
        ]);

        $project = Project::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'] ?? null,
            'user_id' => $validated['user_id'],
            'school_id' => $validated['school_id'] ?? null,
            'teacher_id' => $validated['teacher_id'] ?? null,
            'status' => $validated['status'],
            'files' => $validated['files'] ?? [],
            'images' => $validated['images'] ?? [],
            'approved_by' => $validated['status'] === 'approved' ? auth()->id() : null,
            'approved_at' => $validated['status'] === 'approved' ? now() : null,
        ]);

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'تم إنشاء المشروع بنجاح');
    }

    /**
     * عرض نموذج تعديل مشروع
     */
    public function edit(Project $project)
    {
        $project->load(['user', 'school', 'teacher']);

        $users = \App\Models\User::where('role', 'student')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        $schools = \App\Models\User::where('role', 'school')
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        $teachers = \App\Models\Teacher::with('user:id,name')
            ->select('id', 'user_id', 'name_ar')
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name_ar ?? $teacher->user->name ?? 'غير معروف',
                ];
            });

        // Format files and images URLs
        $files = [];
        $images = [];
        
        if ($project->files && is_array($project->files)) {
            $files = array_map(function ($file) {
                if (str_starts_with($file, 'http')) {
                    return $file;
                }
                return asset('storage/' . ltrim($file, '/'));
            }, $project->files);
        }
        
        if ($project->images && is_array($project->images)) {
            $images = array_map(function ($image) {
                if (str_starts_with($image, 'http')) {
                    return $image;
                }
                return asset('storage/' . ltrim($image, '/'));
            }, $project->images);
        }

        return response()->json([
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'category' => $project->category,
                'user_id' => $project->user_id,
                'school_id' => $project->school_id,
                'teacher_id' => $project->teacher_id,
                'status' => $project->status,
                'files' => $files,
                'images' => $images,
                'views' => $project->views ?? 0,
                'likes' => $project->likes ?? 0,
                'rating' => $project->rating,
                'points_earned' => $project->points_earned ?? 0,
            ],
            'users' => $users,
            'schools' => $schools,
            'teachers' => $teachers,
        ]);
    }

    /**
     * تحديث مشروع
     */
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|string|max:255',
            'user_id' => 'required|exists:users,id',
            'school_id' => 'nullable|exists:users,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'status' => 'required|in:pending,approved,rejected',
            'files' => 'nullable|array',
            'images' => 'nullable|array',
        ]);

        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'] ?? null,
            'user_id' => $validated['user_id'],
            'school_id' => $validated['school_id'] ?? null,
            'teacher_id' => $validated['teacher_id'] ?? null,
            'status' => $validated['status'],
            'files' => $validated['files'] ?? [],
            'images' => $validated['images'] ?? [],
        ];

        // Update approval info if status changed to approved
        if ($validated['status'] === 'approved' && $project->status !== 'approved') {
            $updateData['approved_by'] = auth()->id();
            $updateData['approved_at'] = now();
        }

        $project->update($updateData);

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'تم تحديث المشروع بنجاح');
    }

    /**
     * عرض تفاصيل مشروع
     */
    public function show(Project $project)
    {
        $project->load(['user', 'school', 'teacher', 'approver']);

        // Format files and images URLs
        $files = [];
        $images = [];
        
        if ($project->files && is_array($project->files)) {
            $files = array_map(function ($file) {
                if (str_starts_with($file, 'http')) {
                    return $file;
                }
                return asset('storage/' . ltrim($file, '/'));
            }, $project->files);
        }
        
        if ($project->images && is_array($project->images)) {
            $images = array_map(function ($image) {
                if (str_starts_with($image, 'http')) {
                    return $image;
                }
                return asset('storage/' . ltrim($image, '/'));
            }, $project->images);
        }

        return Inertia::render('Admin/Projects/Show', [
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
                'description' => $project->description,
                'category' => $project->category,
                'status' => $project->status,
                'files' => $files,
                'images' => $images,
                'views' => $project->views ?? 0,
                'likes' => $project->likes ?? 0,
                'rating' => $project->rating,
                'points_earned' => $project->points_earned ?? 0,
                'student' => [
                    'id' => $project->user->id ?? null,
                    'name' => $project->user->name ?? 'غير معروف',
                    'email' => $project->user->email ?? '—',
                ],
                'school' => $project->school ? [
                    'id' => $project->school->id ?? null,
                    'name' => $project->school->name ?? 'غير محدد',
                ] : null,
                'teacher' => $project->teacher ? [
                    'id' => $project->teacher->id ?? null,
                    'name' => $project->teacher->name_ar ?? 'غير محدد',
                ] : null,
                'approver' => $project->approver ? [
                    'id' => $project->approver->id ?? null,
                    'name' => $project->approver->name ?? '—',
                ] : null,
                'created_at' => $project->created_at->format('Y-m-d H:i'),
                'approved_at' => $project->approved_at?->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * الموافقة على مشروع
     */
    public function approve(Request $request, Project $project)
    {
        $project->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        return back()->with('success', 'تم الموافقة على المشروع بنجاح');
    }

    /**
     * رفض مشروع
     */
    public function reject(Request $request, Project $project)
    {
        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $project->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
        ]);

        return back()->with('success', 'تم رفض المشروع');
    }

    /**
     * حذف مشروع
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'تم حذف المشروع بنجاح');
    }
}

