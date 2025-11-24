<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Teacher;
use App\Models\Subject;
use App\Services\ProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TeacherProfileController extends Controller
{
    public function __construct(
        private ProfileService $profileService
    ) {}
    public function index()
    {
        $user = Auth::user();
        $teacher = $user->teacher;

        if (!$teacher) {
            return redirect()->route('login');
        }

        $teacherData = $this->profileService->getTeacherProfile($teacher->id);

        $subjects = Subject::where('is_active', true)
            ->select('id', 'name_ar', 'name_en')
            ->get();
        
        $cities = [
            'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام',
            'الخبر', 'الظهران', 'الطائف', 'بريدة', 'تبوك',
            'خميس مشيط', 'الهفوف', 'حائل', 'نجران', 'الجبيل'
        ];

        return Inertia::render('Teacher/Profile', [
            'teacher' => $teacherData,
            'subjects' => $subjects,
            'cities' => $cities,
        ]);
    }

    public function update(Request $request)
    {
        $teacher = Auth::user()->teacher;

        if (!$teacher) {
            return redirect()->route('login');
        }

        \Log::info('Teacher profile update request', [
            'has_image' => $request->hasFile('image'),
            'image_size' => $request->hasFile('image') ? $request->file('image')->getSize() : null,
            'all_files' => $request->allFiles(),
            'all_input' => $request->all(),
            'request_method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
        ]);

        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'name_en' => 'required|string|max:255',
            'nationality' => 'required|string|max:255',
            'gender' => 'required|in:ذكر,أنثى',
            'bio' => 'required|string|max:1000',
            'qualifications' => 'required|string|max:1000',
            'subjects' => 'required|array|min:1',
            'stages' => 'required|array|min:1',
            'experience_years' => 'required|integer|min:0',
            'city' => 'required|string|max:255',
            'neighborhoods' => 'nullable|array',
            'price_per_hour' => 'required|numeric|min:0',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore(Auth::id()),
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                Rule::unique('users', 'phone')->ignore(Auth::id()),
            ],
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($request->hasFile('image')) {
            \Log::info('Image file received', [
                'filename' => $request->file('image')->getClientOriginalName(),
                'size' => $request->file('image')->getSize(),
                'mime' => $request->file('image')->getMimeType(),
            ]);
            if ($teacher->image) {
                $oldImagePath = str_replace('/storage/', '', $teacher->image);
                if (str_starts_with($oldImagePath, 'http')) {
                    $parsed = parse_url($oldImagePath);
                    $oldImagePath = str_replace('/storage/', '', $parsed['path'] ?? '');
                }
                if ($oldImagePath && Storage::disk('public')->exists($oldImagePath)) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }

            $imagePath = $request->file('image')->store('teacher-profiles', 'public');
            $validated['image'] = $imagePath;

            \Log::info('Image stored', ['path' => $imagePath]);

            $user = Auth::user();
            if ($user->image) {
                $oldUserImagePath = str_replace('/storage/', '', $user->image);
                if (str_starts_with($oldUserImagePath, 'http')) {
                    $parsed = parse_url($oldUserImagePath);
                    $oldUserImagePath = str_replace('/storage/', '', $parsed['path'] ?? '');
                }
                if ($oldUserImagePath && Storage::disk('public')->exists($oldUserImagePath)) {
                    Storage::disk('public')->delete($oldUserImagePath);
                    \Log::info('Old user image deleted', ['path' => $oldUserImagePath]);
                }
            }

            $user->update(['image' => $imagePath]);
            \Log::info('User image updated', ['path' => $imagePath]);
        } else {
            unset($validated['image']);
            \Log::info('No image file in request');
        }

        $user = Auth::user();
        $user->update([
            'name' => $validated['name_ar'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
        ]);

        unset($validated['email'], $validated['phone']);

        $teacher->update($validated);
        $teacher->refresh();

        \Log::info('Teacher updated', ['teacher_id' => $teacher->id, 'image' => $teacher->image]);

        $user->refresh();

        return redirect()->route('teacher.profile')->with('success', 'تم تحديث الملف الشخصي بنجاح');
    }

    public function subjects()
    {
        $teacher = Auth::user()->teacher;

        if (!$teacher) {
            return redirect()->route('login');
        }

        $stages = ['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية'];

        $availableSubjects = \App\Models\Subject::where('is_active', true)
            ->orderBy('name_ar')
            ->get()
            ->map(function ($subject) {
                return [
                    'id' => $subject->id,
                    'name_ar' => $subject->name_ar,
                    'name_en' => $subject->name_en,
                ];
            });

        $teacher->load('subjectsRelation');
        $teacherSubjects = $teacher->subjectsRelation->map(function ($subject) {
            return [
                'id' => $subject->id,
                'name_ar' => $subject->name_ar,
                'name_en' => $subject->name_en,
            ];
        });

        $subjectsFromJson = is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects ?? '[]', true);
        if (!empty($subjectsFromJson) && is_array($subjectsFromJson)) {
            foreach ($subjectsFromJson as $subjectName) {
                if (empty($subjectName)) continue;

                $subjectModel = \App\Models\Subject::where(function ($q) use ($subjectName) {
                    $q->where('name_ar', $subjectName)
                        ->orWhere('name_en', $subjectName);
                })->first();

                if ($subjectModel) {
                    $exists = $teacherSubjects->contains(function ($item) use ($subjectModel) {
                        return isset($item['id']) && $item['id'] === $subjectModel->id;
                    });

                    if (!$exists) {
                        $teacherSubjects->push([
                            'id' => $subjectModel->id,
                            'name_ar' => $subjectModel->name_ar,
                            'name_en' => $subjectModel->name_en,
                        ]);
                    }
                }
            }
        }

        $teacherData = [
            'id' => $teacher->id,
            'name_ar' => $teacher->name_ar,
            'name_en' => $teacher->name_en,
            'stages' => $this->normalizeStages($teacher->stages),
            'subjects' => $teacher->subjects,
            'city' => $teacher->city,
            'price_per_hour' => $teacher->price_per_hour,
            'rating' => $teacher->rating,
        ];

        return Inertia::render('Teacher/Subjects', [
            'teacher' => $teacherData,
            'teacherSubjects' => $teacherSubjects->unique('id')->values(),
            'availableSubjects' => $availableSubjects,
            'stages' => $stages,
        ]);
    }

    public function addSubject(Request $request)
    {
        $teacher = Auth::user()->teacher;

        if (!$teacher) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'stages' => 'required|array|min:1',
        ]);

        $subject = \App\Models\Subject::findOrFail($validated['subject_id']);

        if (!$teacher->subjectsRelation()->where('subjects.id', $subject->id)->exists()) {
            $teacher->subjectsRelation()->attach($subject->id);
        }

        $currentSubjects = $teacher->subjects ?? [];
        if (!in_array($subject->name_ar, $currentSubjects)) {
            $currentSubjects[] = $subject->name_ar;
        }

        $currentStages = $teacher->stages ?? [];
        foreach ($validated['stages'] as $stage) {
            if (!in_array($stage, $currentStages)) {
                $currentStages[] = $stage;
            }
        }

        $teacher->update([
            'subjects' => $currentSubjects,
            'stages' => $currentStages,
        ]);

        return redirect()->back()->with('success', 'تم إضافة المادة بنجاح');
    }

    public function updateSubject(Request $request, $id)
    {
        $teacher = Auth::user()->teacher;

        if (!$teacher) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'stages' => 'required|array|min:1',
        ]);

        $subject = \App\Models\Subject::findOrFail($validated['subject_id']);

        $teacherSubjects = $teacher->subjectsRelation;
        $oldSubject = $teacherSubjects->where('id', $id)->first();

        if ($oldSubject && $oldSubject->id != $subject->id) {
            $teacher->subjectsRelation()->detach($oldSubject->id);
        }

        if (!$teacher->subjectsRelation()->where('subjects.id', $subject->id)->exists()) {
            $teacher->subjectsRelation()->attach($subject->id);
        }

        $currentSubjects = $teacher->subjects ?? [];
        $subjectIndex = array_search($oldSubject?->name_ar, $currentSubjects);
        if ($subjectIndex !== false) {
            $currentSubjects[$subjectIndex] = $subject->name_ar;
        } else {
            $currentSubjects[] = $subject->name_ar;
        }

        $teacher->update([
            'subjects' => $currentSubjects,
            'stages' => $validated['stages'],
        ]);

        return redirect()->back()->with('success', 'تم تحديث المادة بنجاح');
    }

    public function deleteSubject($id)
    {
        $teacher = Auth::user()->teacher;

        if (!$teacher) {
            return redirect()->route('login');
        }

        $subject = \App\Models\Subject::find($id);
        if ($subject) {
            $teacher->subjectsRelation()->detach($subject->id);
        }

        $currentSubjects = $teacher->subjects ?? [];
        $subjectName = $subject?->name_ar;
        if ($subjectName && in_array($subjectName, $currentSubjects)) {
            $currentSubjects = array_values(array_filter($currentSubjects, function ($s) use ($subjectName) {
                return $s !== $subjectName;
            }));
        } else {
            if (isset($currentSubjects[$id])) {
                unset($currentSubjects[$id]);
                $currentSubjects = array_values($currentSubjects);
            }
        }

        $teacher->update([
            'subjects' => $currentSubjects,
        ]);

        return redirect()->back()->with('success', 'تم حذف المادة بنجاح');
    }

    private function normalizeStages($stages)
    {
        if (empty($stages)) {
            return [];
        }

        if (is_array($stages)) {
            return array_values(array_filter(array_map(function ($stage) {
                return is_string($stage) ? trim($stage) : null;
            }, $stages), function ($stage) {
                return !empty($stage);
            }));
        }

        if (is_string($stages)) {
            $decoded = json_decode($stages, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                return array_values(array_filter(array_map(function ($stage) {
                    return is_string($stage) ? trim($stage) : null;
                }, $decoded), function ($stage) {
                    return !empty($stage);
                }));
            }
        }

        return [];
    }
}
