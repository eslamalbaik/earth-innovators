<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Certificate;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SchoolCertificateController extends Controller
{
    protected $certificateService;

    public function __construct(CertificateService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    /**
     * Display certificate generation page for school
     */
    public function index(Request $request)
    {
        $school = Auth::user();

        // Get all students for this school
        $query = User::where('school_id', $school->id)
            ->where('role', 'student')
            ->withCount('certificates');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('membership_number', 'like', "%{$search}%");
            });
        }

        $students = $query->latest()->paginate(20)->withQueryString()
            ->through(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'membership_number' => $student->membership_number,
                    'certificates_count' => $student->certificates_count,
                    'created_at' => $student->created_at ? $student->created_at->toISOString() : null,
                ];
            });

        return Inertia::render('School/Certificates/Index', [
            'students' => $students,
            'description' => 'قائمة بجميع الطلاب مع إمكانية إنشاء شهادات جماعية أو فردية',
        ]);
    }
}

