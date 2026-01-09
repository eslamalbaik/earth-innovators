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
    public function index()
    {
        $criteria = AcceptanceCriterion::ordered()
            ->get()
            ->map(function ($criterion) {
                return [
                    'id' => $criterion->id,
                    'name_ar' => $criterion->name_ar,
                    'description_ar' => $criterion->description_ar,
                    'weight' => $criterion->weight,
                    'order' => $criterion->order,
                    'is_active' => $criterion->is_active,
                    'created_at' => $criterion->created_at->format('Y-m-d H:i'),
                ];
            });

        $totalWeight = AcceptanceCriterion::sum('weight');

        return Inertia::render('Admin/AcceptanceCriteria/Index', [
            'criteria' => $criteria,
            'totalWeight' => $totalWeight,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ar' => 'required|string|max:255',
            'description_ar' => 'nullable|string',
            'weight' => 'required|numeric|min:0|max:100',
            'order' => 'nullable|integer|min:0',
        ], [
            'name_ar.required' => 'اسم المعيار مطلوب',
            'weight.required' => 'الوزن مطلوب',
            'weight.min' => 'الوزن يجب أن يكون أكبر من أو يساوي 0',
            'weight.max' => 'الوزن يجب أن يكون أقل من أو يساوي 100',
        ]);

        // Set default order if not provided
        if (!isset($validated['order'])) {
            $maxOrder = AcceptanceCriterion::max('order') ?? 0;
            $validated['order'] = $maxOrder + 1;
        }

        AcceptanceCriterion::create($validated);

        return redirect()->route('admin.acceptance-criteria.index')
            ->with('success', 'تم إضافة المعيار بنجاح');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AcceptanceCriterion $acceptanceCriterion)
    {
        $validated = $request->validate([
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
        ]);

        $acceptanceCriterion->update($validated);

        return redirect()->route('admin.acceptance-criteria.index')
            ->with('success', 'تم تحديث المعيار بنجاح');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AcceptanceCriterion $acceptanceCriterion)
    {
        $acceptanceCriterion->delete();

        return redirect()->route('admin.acceptance-criteria.index')
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
