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
                    'created_at' => $project->created_at->format('Y-m-d'),
                    'approved_at' => $project->approved_at?->format('Y-m-d'),
                ];
            });

        $stats = [
            'total' => Project::count(),
            'approved' => Project::where('status', 'approved')->count(),
            'pending' => Project::where('status', 'pending')->count(),
            'rejected' => Project::where('status', 'rejected')->count(),
        ];

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
        // إنشاء المشروع يتم عبر النافذة المنبثقة في صفحة القائمة (Index)،
        // لذا نوجّه هذا المسار إلى القائمة بدلاً من عرض صفحة منفصلة.
        return redirect()->route('admin.projects.index');
    }

    /**
     * توليد تفاصيل المشروع بالذكاء الاصطناعي
     */
    public function generate(Request $request, \App\Services\AIEngine\DeepSeekClient $deepSeekClient)
    {
        $request->validate([
            'idea' => 'required|string|max:500',
        ]);

        $idea = $request->input('idea');

        try {
            $aiResponse = $deepSeekClient->chatWithJson([
                \App\Services\AIEngine\DeepSeekClient::systemMessage(
                    'أنت مستشار تخطيط مشاريع تعليمية وابتكارية. '
                    . 'بناءً على الفكرة أو الوصف القصير الذي يقدمه المستخدم، قم بإنشاء تفاصيل مشروع كاملة وجاهزة للنشر. '
                    . 'اختر واحدة من الفئات التالية حصراً: science, technology, engineering, mathematics, arts, other. '
                    . 'اقترح أيضاً كلمة مفتاحية واحدة باللغة الإنجليزية للبحث عن صورة غلاف من Unsplash تمثل المشروع. '
                    . 'أجب بصيغة JSON فقط مع الحقول التالية: '
                    . 'title (عنوان احترافي وجذاب للمشروع بالعربية), '
                    . 'description (وصف مفصل وشامل للمشروع يشمل الأهداف والخطوات، لا يقل عن 150 كلمة), '
                    . 'category (إحدى الفئات المسموحة فقط باللغة الإنجليزية), '
                    . 'image_keyword (كلمة مفتاحية واحدة بالإنجليزية).'
                ),
                \App\Services\AIEngine\DeepSeekClient::userMessage("فكرة المشروع: " . $idea),
            ]);

            if (!$aiResponse) {
                return response()->json(['error' => 'فشل في توليد محتوى المشروع من الذكاء الاصطناعي.'], 500);
            }

            // Fallbacks for structure
            $title = $aiResponse['title'] ?? 'مشروع مبتكر';
            $description = $aiResponse['description'] ?? $idea;
            $category = $aiResponse['category'] ?? 'other';
            $keyword = $aiResponse['image_keyword'] ?? 'innovation education';

            // Validate category
            $allowedCategories = ['science', 'technology', 'engineering', 'mathematics', 'arts', 'other'];
            if (!in_array(strtolower($category), $allowedCategories)) {
                $category = 'other';
            }

            // Fetch image from Unsplash
            $imageUrl = null;
            $unsplashAccessKey = config('services.unsplash.access_key');
            if ($unsplashAccessKey) {
                $unsplashResponse = \Illuminate\Support\Facades\Http::get('https://api.unsplash.com/search/photos', [
                    'query' => $keyword,
                    'client_id' => $unsplashAccessKey,
                    'per_page' => 1,
                    'orientation' => 'landscape'
                ]);

                if ($unsplashResponse->successful()) {
                    $results = $unsplashResponse->json('results');
                    if (!empty($results)) {
                        $imageUrl = $results[0]['urls']['regular'] ?? null;
                    }
                }
            }

            return response()->json([
                'title' => $title,
                'description' => $description,
                'category' => strtolower($category),
                'image_url' => $imageUrl
            ]);

        } catch (\Exception $e) {
            \Log::error('Error generating AI project (admin): ' . $e->getMessage());
            return response()->json(['error' => 'حدث خطأ غير متوقع أثناء توليد تفاصيل المشروع.'], 500);
        }
    }

    /**
     * تقييم المشروع بالذكاء الاصطناعي (عند المراجعة)
     */
    public function evaluate(Project $project, \App\Services\AIEngine\DeepSeekClient $deepSeekClient)
    {
        try {
            $aiResponse = $deepSeekClient->chatWithJson([
                \App\Services\AIEngine\DeepSeekClient::systemMessage(
                    'أنت محكّم خبير في تقييم المشاريع التعليمية والابتكارية للطلاب. '
                    . 'قيّم المشروع بناءً على عنوانه ووصفه من حيث: الأصالة والابتكار، الوضوح والتنظيم، القيمة التعليمية، وقابلية التطبيق. '
                    . 'كن موضوعياً وبنّاءً. '
                    . 'أجب بصيغة JSON فقط مع الحقول التالية: '
                    . 'score (رقم صحيح من 0 إلى 100 يمثل الدرجة الإجمالية للمشروع), '
                    . 'summary (ملخص تقييمي موجز بالعربية في 2-3 جمل), '
                    . 'strengths (مصفوفة نصية من 2 إلى 4 نقاط قوة بالعربية), '
                    . 'weaknesses (مصفوفة نصية من 1 إلى 4 نقاط تحتاج تحسيناً بالعربية), '
                    . 'recommendation (واحدة فقط من: approve أو reject أو needs_revision), '
                    . 'recommendation_text (جملة قصيرة بالعربية تشرح سبب التوصية).'
                ),
                \App\Services\AIEngine\DeepSeekClient::userMessage(
                    "عنوان المشروع: " . $project->title . "\n\n"
                    . "فئة المشروع: " . ($project->category ?? 'غير محددة') . "\n\n"
                    . "وصف المشروع: " . ($project->description ?? '')
                ),
            ]);

            if (!$aiResponse) {
                return response()->json(['error' => 'فشل في تقييم المشروع من الذكاء الاصطناعي.'], 500);
            }

            // Normalize/guard the structure
            $score = (int) ($aiResponse['score'] ?? 0);
            $score = max(0, min(100, $score));

            $recommendation = $aiResponse['recommendation'] ?? 'needs_revision';
            $allowedRecommendations = ['approve', 'reject', 'needs_revision'];
            if (!in_array($recommendation, $allowedRecommendations, true)) {
                $recommendation = 'needs_revision';
            }

            return response()->json([
                'score'               => $score,
                'summary'             => $aiResponse['summary'] ?? '',
                'strengths'           => array_values((array) ($aiResponse['strengths'] ?? [])),
                'weaknesses'          => array_values((array) ($aiResponse['weaknesses'] ?? [])),
                'recommendation'      => $recommendation,
                'recommendation_text' => $aiResponse['recommendation_text'] ?? '',
            ]);

        } catch (\Exception $e) {
            \Log::error('Error evaluating AI project (admin): ' . $e->getMessage());
            return response()->json(['error' => 'حدث خطأ غير متوقع أثناء تقييم المشروع.'], 500);
        }
    }

    /**
     * حفظ مشروع جديد
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'nullable|in:science,technology,engineering,mathematics,arts,other',
            'school_id' => 'nullable|exists:users,id',
            'for_all_schools' => 'nullable|boolean',
            'status' => 'required|in:pending,approved,rejected',
            'files' => 'nullable|array',
            'images' => 'nullable|array',
        ], [
            'title.required' => 'عنوان المشروع مطلوب',
            'description.required' => 'وصف المشروع مطلوب',
            'category.in' => 'الفئة يجب أن تكون واحدة من: science, technology, engineering, mathematics, arts, other',
            'school_id.exists' => 'المدرسة المحددة غير موجودة',
        ]);

        $schoolId = null;
        if ($validated['for_all_schools'] ?? false) {
            $schoolId = null;
        } else {
            $schoolId = $validated['school_id'] ?? null;
        }

        $project = Project::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'] ?? 'other',
            'user_id' => auth()->id(), 
            'school_id' => $schoolId,
            'teacher_id' => null,
            'status' => $validated['status'],
            'files' => $validated['files'] ?? [],
            'images' => $validated['images'] ?? [],
            'approved_by' => $validated['status'] === 'approved' ? auth()->id() : null,
            'approved_at' => $validated['status'] === 'approved' ? now() : null,
        ]);

        if ($validated['status'] === 'approved') {
            \App\Jobs\SendNewProjectNotification::dispatch($project);
        }

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'تم إنشاء المشروع بنجاح');
    }

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
            'category' => 'nullable|in:science,technology,engineering,mathematics,arts,other',
            'school_id' => 'nullable|exists:users,id',
            'for_all_schools' => 'nullable|boolean',
            'status' => 'required|in:pending,approved,rejected',
            'files' => 'nullable|array',
            'images' => 'nullable|array',
        ], [
            'title.required' => 'عنوان المشروع مطلوب',
            'description.required' => 'وصف المشروع مطلوب',
            'category.in' => 'الفئة يجب أن تكون واحدة من: science, technology, engineering, mathematics, arts, other',
            'school_id.exists' => 'المدرسة المحددة غير موجودة',
        ]);

        $schoolId = null;
        if ($validated['for_all_schools'] ?? false) {
            $schoolId = null;
        } else {
            $schoolId = $validated['school_id'] ?? null;
        }

        $updateData = [
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'] ?? null,
            'school_id' => $schoolId,
            'teacher_id' => null,
            'status' => $validated['status'],
            'files' => $validated['files'] ?? [],
            'images' => $validated['images'] ?? [],
        ];

        $wasApproved = $project->status === 'approved';
        if ($validated['status'] === 'approved' && !$wasApproved) {
            $updateData['approved_by'] = auth()->id();
            $updateData['approved_at'] = now();
        }

        $project->update($updateData);

        if ($validated['status'] === 'approved' && !$wasApproved) {
            \App\Jobs\SendNewProjectNotification::dispatch($project);
        }

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'تم تحديث المشروع بنجاح');
    }

    public function show(Project $project)
    {
        $project->load(['user', 'school', 'teacher', 'approver', 'submissions.student', 'submissions.reviewer']);

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

        $submissions = $project->submissions->map(function ($submission) {
            $submissionFiles = [];
            if ($submission->files && is_array($submission->files)) {
                $submissionFiles = array_map(function ($file) {
                    if (str_starts_with($file, 'http')) {
                        return $file;
                    }
                    return asset('storage/' . ltrim($file, '/'));
                }, $submission->files);
            }
            
            return [
                'id' => $submission->id,
                'student' => [
                    'id' => $submission->student->id ?? null,
                    'name' => $submission->student->name ?? 'غير معروف',
                    'email' => $submission->student->email ?? '—',
                ],
                'comment' => $submission->comment,
                'files' => $submissionFiles,
                'status' => $submission->status,
                'rating' => $submission->rating,
                'feedback' => $submission->feedback,
                'reviewer' => $submission->reviewer ? [
                    'id' => $submission->reviewer->id,
                    'name' => $submission->reviewer->name,
                ] : null,
                'submitted_at' => $submission->submitted_at ? $submission->submitted_at->format('Y-m-d H:i') : null,
                'reviewed_at' => $submission->reviewed_at ? $submission->reviewed_at->format('Y-m-d H:i') : null,
                'badges' => $submission->badges ?? [],
            ];
        });

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
                    'role' => $project->user->role ?? null,
                ],
                'user' => $project->user ? [
                    'id' => $project->user->id ?? null,
                    'name' => $project->user->name ?? 'غير معروف',
                    'role' => $project->user->role ?? null,
                ] : null,
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
                'created_at' => $project->created_at->format('Y-m-d'),
                'approved_at' => $project->approved_at?->format('Y-m-d'),
                'submissions' => $submissions,
            ],
        ]);
    }

    /**
     * الموافقة على مشروع
     */
    public function approve(Request $request, Project $project)
    {
        $wasApproved = $project->status === 'approved';
        
        $project->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        if (!$wasApproved) {
            \App\Jobs\SendNewProjectNotification::dispatch($project);
        }

        return back()->with('success', 'تم الموافقة على المشروع بنجاح');
    }

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
        // حذف الملفات المرتبطة
        if ($project->files && is_array($project->files)) {
            foreach ($project->files as $file) {
                if ($file) {
                    \Storage::disk('public')->delete($file);
                }
            }
        }
        
        if ($project->images && is_array($project->images)) {
            foreach ($project->images as $image) {
                if ($image) {
                    \Storage::disk('public')->delete($image);
                }
            }
        }

        $projectId = $project->id;
        $userId = $project->user_id;
        $teacherId = $project->teacher_id;
        $schoolId = $project->school_id;

        $project->delete();

        // مسح الكاش بشكل شامل
        if (isset($this->projectService)) {
            $this->projectService->clearProjectCache($projectId, $userId, $teacherId, $schoolId);
        }

        return redirect()
            ->route('admin.projects.index')
            ->with('success', 'تم حذف المشروع بنجاح');
    }
}

