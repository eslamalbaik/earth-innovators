<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\StudentService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Support\Activity;

class StudentController extends Controller
{
    public function __construct(
        private StudentService $studentService
    ) {}

    public function index(Request $request)
    {
        $students = $this->studentService->getAllStudents(
            $request->get('search'),
            $request->get('status'),
            $request->get('date_from'),
            $request->get('date_to'),
            15
        )->withQueryString();

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function edit(string $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        return Inertia::render('Admin/Students/Edit', [
            'student' => $student,
        ]);
    }

    public function update(Request $request, string $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $student->id,
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $update = [
            'name' => $request->name,
            'email' => $request->email,
        ];
        
        if ($request->filled('phone')) {
            $update['phone'] = $request->phone;
        }
        
        if ($request->filled('password')) {
            $update['password'] = Hash::make($request->password);
        }

        $student->update($update);

        Log::info('Admin updated student', [
            'admin_id' => $request->user()->id ?? null,
            'student_id' => $student->id,
        ]);

        Activity::record($request->user()->id ?? null, 'student.updated', User::class, $student->id, [
            'updated' => array_keys($update),
        ]);

        return redirect()->route('admin.students.index')->with('success', 'تم تحديث بيانات الطالب بنجاح');
    }

    public function destroy(string $id)
    {
        $student = User::where('role', 'student')->findOrFail($id);
        $student->delete();

        Activity::record(auth()->id(), 'student.deleted', User::class, $student->id);

        return redirect()->back()->with('success', 'تم حذف الطالب بنجاح');
    }

    public function export(Request $request)
    {
        $query = User::query()->where('role', 'student');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $students = $query->latest()->get();

        $rows = [];
        $rows[] = ['ID', 'الاسم', 'البريد الإلكتروني', 'تاريخ التسجيل'];
        foreach ($students as $s) {
            $rows[] = [
                $s->id,
                $s->name,
                $s->email,
                optional($s->created_at)->format('Y-m-d H:i:s'),
            ];
        }

        $filename = 'students_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $callback = function () use ($rows) {
            $f = fopen('php://output', 'w');
            foreach ($rows as $row) {
                fputcsv($f, $row);
            }
            fclose($f);
        };

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}
