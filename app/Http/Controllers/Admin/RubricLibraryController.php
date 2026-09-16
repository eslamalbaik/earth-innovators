<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RubricCriterionLibrary;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin management of the platform-wide RubricCriterionLibrary — the
 * "general national standards" (QFEmirates) default criteria that
 * App\Services\AIEngine\RubricEvaluationService automatically falls back to
 * evaluating a project against whenever its teacher hasn't attached a
 * custom Rubric. Every active entry here is used together as one implicit
 * default rubric, so this page is the single source of truth teachers and
 * classes share when they haven't customized their own.
 */
class RubricLibraryController extends Controller
{
    public function index(): Response
    {
        $criteria = RubricCriterionLibrary::query()
            ->orderBy('category')
            ->orderBy('name_ar')
            ->get();

        return Inertia::render('Admin/RubricLibrary/Index', [
            'criteria' => $criteria,
            'activeWeightTotal' => round((float) $criteria->where('is_active', true)->sum('default_weight'), 2),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);

        RubricCriterionLibrary::create($validated);

        return redirect()->route('admin.rubric-library.index')
            ->with('success', 'تمت إضافة المعيار بنجاح');
    }

    public function update(Request $request, RubricCriterionLibrary $rubric_library)
    {
        $validated = $this->validatePayload($request);

        $rubric_library->update($validated);

        return redirect()->route('admin.rubric-library.index')
            ->with('success', 'تم تحديث المعيار بنجاح');
    }

    public function destroy(RubricCriterionLibrary $rubric_library)
    {
        $rubric_library->delete();

        return redirect()->route('admin.rubric-library.index')
            ->with('success', 'تم حذف المعيار');
    }

    /**
     * Toggles is_active without touching anything else — the quickest way
     * for an admin to include/exclude a criterion from the default
     * fallback rubric without opening the full editor.
     */
    public function toggleActive(RubricCriterionLibrary $rubricLibrary)
    {
        $rubricLibrary->update(['is_active' => ! $rubricLibrary->is_active]);

        return redirect()->route('admin.rubric-library.index');
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'name'                  => 'required|string|max:255',
            'name_ar'               => 'required|string|max:255',
            'description'           => 'nullable|string',
            'description_ar'        => 'nullable|string',
            'default_weight'        => 'required|numeric|min:0.5|max:100',
            'category'              => 'nullable|string|max:100',
            'is_active'             => 'boolean',
            'levels'                        => 'required|array|min:2|max:6',
            'levels.*.name'                 => 'required|string|max:100',
            'levels.*.name_ar'              => 'required|string|max:100',
            'levels.*.score'                => 'required|numeric|min:0',
            'levels.*.description'          => 'nullable|string',
            'levels.*.description_ar'       => 'nullable|string',
        ]);
    }
}
