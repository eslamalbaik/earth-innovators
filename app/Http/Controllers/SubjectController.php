<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = $this->subjectService->getActiveSubjects();

        return Inertia::render('Subjects', [
            'subjects' => $subjects,
        ]);
    }

    public function adminIndex()
    {
        $subjects = $this->subjectService->getAllSubjects();

        return Inertia::render('Admin/Subjects', [
            'subjects' => $subjects,
        ]);
    }

    public function create() {}

    public function store(\App\Http\Requests\Subject\StoreSubjectRequest $request)
    {
        $data = [
            'name_ar' => $request->validated()['name_ar'],
            'name_en' => $request->validated()['name_en'] ?? null,
            'description_ar' => $request->validated()['description'] ?? null,
            'description_en' => null,
            'sort_order' => 0,
        ];

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        $this->subjectService->createSubject($data);

        return redirect()->back()->with('success', 'تم إضافة المادة بنجاح');
    }

    public function show(string $id) {}

    public function edit(string $id) {}

    public function update(\App\Http\Requests\Subject\StoreSubjectRequest $request, string $id)
    {
        $subject = Subject::findOrFail($id);

        $data = [
            'name_ar' => $request->validated()['name_ar'],
            'name_en' => $request->validated()['name_en'] ?? null,
            'description_ar' => $request->validated()['description'] ?? null,
            'description_en' => null,
        ];

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image');
        }

        $this->subjectService->updateSubject($subject, $data);

        return redirect()->back()->with('success', 'تم تحديث المادة بنجاح');
    }

    public function destroy(string $id)
    {
        $subject = Subject::findOrFail($id);
        $this->subjectService->deleteSubject($subject);

        return redirect()->back()->with('success', 'تم حذف المادة بنجاح');
    }
}
