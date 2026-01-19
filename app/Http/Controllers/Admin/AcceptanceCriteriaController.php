<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcceptanceCriterion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AcceptanceCriteriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $projectId = $request->get('project_id');
        
        $query = AcceptanceCriterion::with('project:id,title')
            ->ordered();
        
        if ($projectId) {
            $query->where('project_id', $projectId);
        } else {
            // Show only criteria without project (general criteria) if no project selected
            $query->whereNull('project_id');
        }
        
        $criteria = $query->get()
            ->map(function ($criterion) {
                return [
                    'id' => $criterion->id,
                    'project_id' => $criterion->project_id,
                    'project_title' => $criterion->project->title ?? 'عام',
                    'name_ar' => $criterion->name_ar,
                    'description_ar' => $criterion->description_ar,
                    'weight' => $criterion->weight,
                    'order' => $criterion->order,
                    'is_active' => $criterion->is_active,
                    'created_at' => $criterion->created_at->format('Y-m-d H:i'),
                ];
            });

        // Calculate total weight for the selected project
        $totalWeight = $projectId 
            ? AcceptanceCriterion::where('project_id', $projectId)->sum('weight')
            : AcceptanceCriterion::whereNull('project_id')->sum('weight');

        // Get all projects for dropdown
        $projects = \App\Models\Project::select('id', 'title')
            ->orderBy('title')
            ->get();

        return Inertia::render('Admin/AcceptanceCriteria/Index', [
            'criteria' => $criteria,
            'totalWeight' => $totalWeight,
            'projects' => $projects,
            'selectedProjectId' => $projectId,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'name_ar' => 'required|string|max:255',
            'description_ar' => 'nullable|string',
            'weight' => 'required|numeric|min:0|max:100',
            'order' => 'nullable|integer|min:0',
        ], [
            'name_ar.required' => 'اسم المعيار مطلوب',
            'weight.required' => 'الوزن مطلوب',
            'weight.min' => 'الوزن يجب أن يكون أكبر من أو يساوي 0',
            'weight.max' => 'الوزن يجب أن يكون أقل من أو يساوي 100',
            'project_id.exists' => 'المشروع المحدد غير موجود',
        ]);

        // Check if total weight exceeds 100% for this project
        $projectId = $validated['project_id'] ?? null;
        $currentTotal = AcceptanceCriterion::where('project_id', $projectId)->sum('weight');
        $newTotal = $currentTotal + $validated['weight'];
        
        if ($newTotal > 100) {
            return back()->withErrors([
                'weight' => "مجموع الأوزان للمشروع المحدد سيكون {$newTotal}% وهو أكبر من 100%. المجموع الحالي: {$currentTotal}%"
            ])->withInput();
        }

        // Set default order if not provided
        if (!isset($validated['order'])) {
            $maxOrder = AcceptanceCriterion::where('project_id', $projectId)->max('order') ?? 0;
            $validated['order'] = $maxOrder + 1;
        }

        AcceptanceCriterion::create($validated);

        $redirectUrl = route('admin.acceptance-criteria.index');
        if ($projectId) {
            $redirectUrl .= '?project_id=' . $projectId;
        }

        return redirect($redirectUrl)
            ->with('success', 'تم إضافة المعيار بنجاح');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AcceptanceCriterion $acceptanceCriterion)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'name_ar' => 'required|string|max:255',
            'description_ar' => 'nullable|string',
            'weight' => 'required|numeric|min:0|max:100',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ], [
            'name_ar.required' => 'اسم المعيار مطلوب',
            'weight.required' => 'الوزن مطلوب',
            'weight.min' => 'الوزن يجب أن يكون أكبر من أو يساوي 0',
            'weight.max' => 'الوزن يجب أن يكون أقل من أو يساوي 100',
            'project_id.exists' => 'المشروع المحدد غير موجود',
        ]);

        // Check if total weight exceeds 100% for this project
        $projectId = $validated['project_id'] ?? null;
        $currentTotal = AcceptanceCriterion::where('project_id', $projectId)
            ->where('id', '!=', $acceptanceCriterion->id)
            ->sum('weight');
        $newTotal = $currentTotal + $validated['weight'];
        
        if ($newTotal > 100) {
            return back()->withErrors([
                'weight' => "مجموع الأوزان للمشروع المحدد سيكون {$newTotal}% وهو أكبر من 100%. المجموع الحالي (بدون هذا المعيار): {$currentTotal}%"
            ])->withInput();
        }

        $acceptanceCriterion->update($validated);

        $redirectUrl = route('admin.acceptance-criteria.index');
        if ($projectId) {
            $redirectUrl .= '?project_id=' . $projectId;
        }

        return redirect($redirectUrl)
            ->with('success', 'تم تحديث المعيار بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, AcceptanceCriterion $acceptanceCriterion)
    {
        $projectId = $request->get('project_id');
        $acceptanceCriterion->delete();

        $redirectUrl = route('admin.acceptance-criteria.index');
        if ($projectId) {
            $redirectUrl .= '?project_id=' . $projectId;
        }

        return redirect($redirectUrl)
            ->with('success', 'تم حذف المعيار بنجاح');
    }

    /**
     * Update the order of criteria
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'criteria' => 'required|array',
            'criteria.*.id' => 'required|exists:acceptance_criteria,id',
            'criteria.*.order' => 'required|integer',
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['criteria'] as $item) {
                AcceptanceCriterion::where('id', $item['id'])
                    ->update(['order' => $item['order']]);
            }
        });

        return redirect()->route('admin.acceptance-criteria.index')
            ->with('success', 'تم تحديث ترتيب المعايير بنجاح');
    }
}
