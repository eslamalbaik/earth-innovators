<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\ImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ImportController extends Controller
{
    public function __construct(
        private ImportService $importService
    ) {}

    public function index()
    {
        return Inertia::render('Admin/Import/Index');
    }

    public function importStudents(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        
        $path = $request->file('file')->getRealPath();
        [$rows, $parseErrors] = $this->importService->parseCsvFile($path, ['name', 'email', 'password']);
        
        if (!empty($parseErrors)) {
            return back()
                ->with('error', implode(', ', $parseErrors))
                ->with('import_errors', $parseErrors);
        }

        $result = $this->importService->importStudents($rows);
        $allErrors = array_merge($parseErrors, $result['errors']);

        return back()
            ->with('success', "تم استيراد الطلاب: {$result['inserted']}، تم تخطي: {$result['skipped']}")
            ->with('import_errors', $allErrors);
    }

    public function importTeachers(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        
        $path = $request->file('file')->getRealPath();
        [$rows, $parseErrors] = $this->importService->parseCsvFile($path, ['name_ar', 'email']);
        
        if (!empty($parseErrors)) {
            return back()
                ->with('error', implode(', ', $parseErrors))
                ->with('import_errors', $parseErrors);
        }

        $result = $this->importService->importTeachers($rows);
        $allErrors = array_merge($parseErrors, $result['errors']);

        if (!empty($result['errors']) && $result['inserted'] === 0) {
            return back()
                ->with('error', implode(', ', $result['errors']))
                ->with('import_errors', $allErrors);
        }

        return back()
            ->with('success', "تم استيراد المعلمين: {$result['inserted']}، تم تخطي: {$result['skipped']}")
            ->with('import_errors', $allErrors);
    }

    public function importBookings(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt']);
        
        $path = $request->file('file')->getRealPath();
        [$rows, $parseErrors] = $this->importService->parseCsvFile($path, ['student_email', 'teacher_email', 'availability_id', 'status', 'price']);
        
        if (!empty($parseErrors)) {
            return back()
                ->with('error', implode(', ', $parseErrors))
                ->with('import_errors', $parseErrors);
        }

        $result = $this->importService->importBookings($rows);
        $allErrors = array_merge($parseErrors, $result['errors']);

        if (!empty($result['errors']) && $result['inserted'] === 0) {
            return back()
                ->with('error', implode(', ', $result['errors']))
                ->with('import_errors', $allErrors);
        }

        return back()
            ->with('success', "تم استيراد الحجوزات: {$result['inserted']}، تم تخطي: {$result['skipped']}")
            ->with('import_errors', $allErrors);
    }
}
