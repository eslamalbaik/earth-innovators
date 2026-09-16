<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NationalLevelSetting;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin-editable thresholds for the national performance levels (L1-L5)
 * that App\Models\InnovationIndex::nationalLevelForScore() maps every
 * overall_score onto. Editing here needs no code change or deploy.
 */
class NationalLevelSettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/NationalLevels/Index', [
            'levels' => NationalLevelSetting::orderBy('sort_order')->get(),
        ]);
    }

    public function update(Request $request, NationalLevelSetting $nationalLevel)
    {
        $validated = $request->validate([
            'label_ar'  => 'required|string|max:255',
            'label_en'  => 'required|string|max:255',
            'min_score' => 'required|integer|min:0|max:100',
            'max_score' => 'required|integer|min:0|max:100|gte:min_score',
            'color'     => 'required|string|max:20',
        ]);

        $nationalLevel->update($validated);
        NationalLevelSetting::flushCache();

        return back()->with('flash', ['success' => true]);
    }
}
