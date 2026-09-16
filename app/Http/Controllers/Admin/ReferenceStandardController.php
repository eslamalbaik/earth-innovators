<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InnovationIndex;
use App\Models\ReferenceStandard;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin CRUD for the national/international reference-standards map
 * (QFEmirates, SFIA, UNESCO, ISO, EFQM, WIPO, ...) that evaluation domains
 * are linked to. Editable data, not hardcoded UI text — see requirement 2.4.
 */
class ReferenceStandardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/ReferenceStandards/Index', [
            'standards' => ReferenceStandard::orderBy('scope')->orderBy('sort_order')->get(),
            'indexKeys' => InnovationIndex::INDEX_NAMES,
        ]);
    }

    public function store(Request $request)
    {
        ReferenceStandard::create($this->validatePayload($request));
        ReferenceStandard::flushCache();

        return back()->with('flash', ['success' => true]);
    }

    public function update(Request $request, ReferenceStandard $referenceStandard)
    {
        $referenceStandard->update($this->validatePayload($request));
        ReferenceStandard::flushCache();

        return back()->with('flash', ['success' => true]);
    }

    public function destroy(ReferenceStandard $referenceStandard)
    {
        $referenceStandard->delete();
        ReferenceStandard::flushCache();

        return back()->with('flash', ['success' => true]);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'scope'         => 'required|in:national,international',
            'domain_ar'     => 'required|string|max:255',
            'domain_en'     => 'required|string|max:255',
            'standard_name' => 'required|string|max:255',
            'usage_ar'      => 'required|string|max:255',
            'usage_en'      => 'required|string|max:255',
            'index_key'     => 'nullable|string|in:' . implode(',', array_keys(InnovationIndex::INDEX_NAMES)),
            'is_active'     => 'boolean',
            'sort_order'    => 'nullable|integer',
        ]);
    }
}
