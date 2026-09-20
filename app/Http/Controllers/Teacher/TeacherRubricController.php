<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Rubric;
use App\Models\RubricCriterionLibrary;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Validator;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Teacher dashboard: build, customize, and reuse project-evaluation rubrics.
 * A rubric is a set of weighted criteria (each with its own performance-level
 * matrix) saved at the teacher level (broad) or class level (grade+subject),
 * and it becomes selectable the moment it's saved when creating any new
 * project — see TeacherProjectController::create()/store().
 */
class TeacherRubricController extends Controller
{
    public function index(): Response
    {
        $teacher = $this->resolveTeacher();

        $rubrics = Rubric::forTeacher($teacher->id)
            ->withCount('criteria')
            ->withCount('projects')
            ->latest()
            ->get();

        return Inertia::render('Teacher/Rubrics/Index', [
            'rubrics' => $rubrics,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Teacher/Rubrics/Builder', [
            'library' => RubricCriterionLibrary::active()->orderBy('category')->get(),
            'rubric'  => null,
        ]);
    }

    public function store(Request $request)
    {
        $teacher = $this->resolveTeacher();
        $validated = $this->validatePayload($request);

        $rubric = DB::transaction(function () use ($validated, $teacher) {
            $rubric = Rubric::create([
                'teacher_id'  => $teacher->id,
                'school_id'   => Auth::user()->school_id,
                'name'        => $validated['name'],
                'name_ar'     => $validated['name_ar'],
                'description' => $validated['description'] ?? null,
                'description_ar' => $validated['description_ar'] ?? null,
                'scope'       => $validated['scope'],
                'grade'       => $validated['scope'] === 'class' ? $validated['grade'] : null,
                'subject'     => $validated['scope'] === 'class' ? $validated['subject'] : null,
            ]);

            $this->syncCriteria($rubric, $validated['criteria']);

            return $rubric;
        });

        return redirect()->route('teacher.rubrics.index')
            ->with('success', 'تم إنشاء الرابرك بنجاح');
    }

    public function edit(Rubric $rubric): Response
    {
        $this->authorizeOwnership($rubric);

        return Inertia::render('Teacher/Rubrics/Builder', [
            'library' => RubricCriterionLibrary::active()->orderBy('category')->get(),
            'rubric'  => $rubric->load('criteria'),
        ]);
    }

    public function update(Request $request, Rubric $rubric)
    {
        $this->authorizeOwnership($rubric);
        $validated = $this->validatePayload($request);

        DB::transaction(function () use ($rubric, $validated) {
            $rubric->update([
                'name'        => $validated['name'],
                'name_ar'     => $validated['name_ar'],
                'description' => $validated['description'] ?? null,
                'description_ar' => $validated['description_ar'] ?? null,
                'scope'       => $validated['scope'],
                'grade'       => $validated['scope'] === 'class' ? $validated['grade'] : null,
                'subject'     => $validated['scope'] === 'class' ? $validated['subject'] : null,
            ]);

            // Simplest, safest sync: replace all criteria. Rubrics are edited
            // as a whole in the builder UI, so there's no partial-update case.
            $rubric->criteria()->delete();
            $this->syncCriteria($rubric, $validated['criteria']);
        });

        return redirect()->route('teacher.rubrics.index')
            ->with('success', 'تم تحديث الرابرك بنجاح');
    }

    /**
     * Archives the rubric rather than hard-deleting it, so projects that
     * already used it for grading keep their evaluation criteria intact.
     */
    public function destroy(Rubric $rubric)
    {
        $this->authorizeOwnership($rubric);
        $rubric->update(['is_active' => false]);

        return redirect()->route('teacher.rubrics.index')
            ->with('success', 'تم أرشفة الرابرك');
    }

    private function syncCriteria(Rubric $rubric, array $criteria): void
    {
        foreach ($criteria as $index => $criterion) {
            $rubric->criteria()->create([
                'library_criterion_id' => $criterion['library_criterion_id'] ?? null,
                'name'            => $criterion['name'],
                'name_ar'         => $criterion['name_ar'],
                'description'     => $criterion['description'] ?? null,
                'description_ar'  => $criterion['description_ar'] ?? null,
                'weight'          => $criterion['weight'],
                'order'           => $index,
                'levels'          => $criterion['levels'],
            ]);
        }
    }

    private function validatePayload(Request $request): array
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'name_ar'         => 'required|string|max:255',
            'description'     => 'nullable|string',
            'description_ar'  => 'nullable|string',
            'scope'           => 'required|in:teacher,class',
            'grade'           => 'required_if:scope,class|nullable|string|max:100',
            'subject'         => 'required_if:scope,class|nullable|string|max:100',
            'criteria'                     => 'required|array|min:1',
            'criteria.*.library_criterion_id' => 'nullable|exists:rubric_criterion_library,id',
            'criteria.*.name'              => 'required|string|max:255',
            'criteria.*.name_ar'           => 'required|string|max:255',
            'criteria.*.description'       => 'nullable|string',
            'criteria.*.description_ar'    => 'nullable|string',
            'criteria.*.weight'            => 'required|numeric|min:0.5|max:100',
            'criteria.*.levels'                        => 'required|array|min:2|max:6',
            'criteria.*.levels.*.name'                 => 'required|string|max:100',
            'criteria.*.levels.*.name_ar'               => 'required|string|max:100',
            'criteria.*.levels.*.score'                 => 'required|numeric|min:0',
            'criteria.*.levels.*.description'           => 'nullable|string',
            'criteria.*.levels.*.description_ar'        => 'nullable|string',
        ]);

        $this->assertWeightsSumToOneHundred($validated['criteria']);

        return $validated;
    }

    /**
     * Laravel's declarative rules can't express "sum of a nested field must
     * equal 100" cleanly, so the weight-sum check runs as a second pass after
     * the shape/type validation above already passed.
     */
    private function assertWeightsSumToOneHundred(array $criteria): void
    {
        $totalWeight = collect($criteria)->sum(fn ($c) => (float) $c['weight']);

        if (abs($totalWeight - 100) > 0.5) {
            $validator = validator([], []);
            $validator->after(function (Validator $v) use ($totalWeight) {
                $v->errors()->add(
                    'criteria',
                    "مجموع أوزان المعايير يجب أن يساوي 100% (المجموع الحالي: {$totalWeight}%)"
                );
            });
            $validator->validate();
        }
    }

    /**
     * Legacy/imported teacher accounts may have no teachers row yet; create it
     * on first use, mirroring TeacherProjectController::resolveTeacherProfile().
     */
    private function resolveTeacher(): Teacher
    {
        $user = Auth::user();

        if (!$user || !$user->isTeacher()) {
            abort(403, __('messages.msg_075'));
        }

        return $user->teacher()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'name_ar' => $user->name,
                'name_en' => $user->name,
                'nationality' => 'غير محدد',
                'gender' => null,
                'bio' => null,
                'qualifications' => null,
                'subjects' => [],
                'stages' => [],
                'experience_years' => 0,
                'city' => 'غير محدد',
                'neighborhoods' => [],
                'price_per_hour' => 0,
                'is_verified' => false,
                'is_active' => false,
            ]
        );
    }

    private function authorizeOwnership(Rubric $rubric): void
    {
        $teacher = $this->resolveTeacher();

        if ($rubric->teacher_id !== $teacher->id) {
            abort(403, __('messages.msg_153'));
        }
    }
}
