<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::query()->orderByDesc('id');

        if ($request->get('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->get('type')) {
            $query->where('type', $request->get('type'));
        }

        if ($request->get('status') !== null && $request->get('status') !== '') {
            $query->where('is_active', $request->get('status') === 'active');
        }

        $categories = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'filters' => [
                'search' => $request->get('search'),
                'type' => $request->get('type'),
                'status' => $request->get('status'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Categories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|string|in:project,challenge,publication,other',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        $exists = Category::where('slug', $validated['slug'])->exists();
        if ($exists) {
            $validated['slug'] = $validated['slug'] . '-' . time();
        }

        Category::create($validated);

        return redirect()->route('admin.categories.index')
            ->with('success', ['key' => 'adminCategoriesPage.created']);
    }

    public function edit(Category $category)
    {
        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|string|in:project,challenge,publication,other',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        $exists = Category::where('slug', $validated['slug'])
            ->where('id', '!=', $category->id)
            ->exists();
        if ($exists) {
            $validated['slug'] = $validated['slug'] . '-' . time();
        }

        $category->update($validated);

        return redirect()->route('admin.categories.index')
            ->with('success', ['key' => 'adminCategoriesPage.updated']);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('admin.categories.index')
            ->with('success', ['key' => 'adminCategoriesPage.deleted']);
    }
}