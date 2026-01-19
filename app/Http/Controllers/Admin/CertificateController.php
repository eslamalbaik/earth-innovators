<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\User;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CertificateController extends Controller
{
    public function __construct(
        private CertificateService $certificateService
    ) {}

    public function index(Request $request)
    {
        $query = Certificate::with(['user:id,name,email', 'issuer:id,name'])
            ->orderBy('created_at', 'desc');

        // Filters
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('certificate_number', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('title_ar', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search) {
                        $userQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        $certificates = $query->paginate(20)->withQueryString();

        // Stats
        $stats = [
            'total' => Certificate::count(),
            'active' => Certificate::where('is_active', true)->count(),
            'inactive' => Certificate::where('is_active', false)->count(),
            'by_type' => Certificate::selectRaw('type, COUNT(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
        ];

        // Get users for filter dropdown
        $users = User::whereIn('role', ['student', 'teacher', 'school'])
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Certificates/Index', [
            'certificates' => $certificates,
            'stats' => $stats,
            'users' => $users,
            'filters' => [
                'search' => $request->get('search'),
                'type' => $request->get('type', 'all'),
                'status' => $request->get('status', 'all'),
                'user_id' => $request->get('user_id'),
            ],
        ]);
    }

    public function create()
    {
        $users = User::whereIn('role', ['student', 'teacher', 'school'])
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Certificates/Create', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|string|in:student,teacher,school,achievement,membership',
            'title' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'issue_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:issue_date',
            'template' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['issued_by'] = auth()->id();
        $validated['is_active'] = $validated['is_active'] ?? true;

        // Get user and set school_id
        $user = User::findOrFail($validated['user_id']);
        $validated['school_id'] = $user->school_id;

        // Generate certificate number
        $validated['certificate_number'] = 'CERT-' . strtoupper(uniqid());

        // Generate PDF if template is provided
        if ($request->has('generate_pdf') && $request->generate_pdf) {
            try {
                $filePath = $this->certificateService->generateCertificate(
                    $user,
                    auth()->user(),
                    [
                        'title' => $validated['title_ar'] ?? $validated['title'],
                        'description' => $validated['description_ar'] ?? $validated['description'],
                        'certificate_number' => $validated['certificate_number'],
                        'issue_date' => $validated['issue_date'],
                    ],
                    $validated['template'] ?? null,
                    'Y-m-d',
                    $validated['type']
                );

                $validated['file_path'] = $filePath;
            } catch (\Exception $e) {
                \Log::error('Certificate PDF generation error: ' . $e->getMessage());
                // Continue without PDF, admin can generate it later
            }
        }

        try {
            $certificate = Certificate::create($validated);

            return redirect()->route('admin.certificates.index')
                ->with('success', 'تم إنشاء الشهادة بنجاح');
        } catch (\Exception $e) {
            \Log::error('Certificate creation error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'validated' => $validated,
            ]);

            return back()
                ->withErrors(['error' => 'حدث خطأ أثناء إنشاء الشهادة: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function edit(Certificate $certificate)
    {
        $certificate->load(['user:id,name,email', 'issuer:id,name']);

        $users = User::whereIn('role', ['student', 'teacher', 'school'])
            ->select('id', 'name', 'email', 'role')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Certificates/Edit', [
            'certificate' => $certificate,
            'users' => $users,
        ]);
    }

    public function update(Request $request, Certificate $certificate)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|string|in:student,teacher,school,achievement,membership',
            'title' => 'required|string|max:255',
            'title_ar' => 'required|string|max:255',
            'description' => 'nullable|string',
            'description_ar' => 'nullable|string',
            'issue_date' => 'required|date',
            'expiry_date' => 'nullable|date|after:issue_date',
            'template' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;

        // Generate PDF if requested
        if ($request->has('regenerate_pdf') && $request->regenerate_pdf) {
            try {
                $user = User::findOrFail($validated['user_id']);
                
                // Delete old file if exists
                if ($certificate->file_path && Storage::disk('public')->exists($certificate->file_path)) {
                    Storage::disk('public')->delete($certificate->file_path);
                }

                $filePath = $this->certificateService->generateCertificate(
                    $user,
                    auth()->user(),
                    [
                        'title' => $validated['title_ar'] ?? $validated['title'],
                        'description' => $validated['description_ar'] ?? $validated['description'],
                        'certificate_number' => $certificate->certificate_number,
                        'issue_date' => $validated['issue_date'],
                    ],
                    $validated['template'] ?? null,
                    'Y-m-d',
                    $validated['type']
                );

                $validated['file_path'] = $filePath;
            } catch (\Exception $e) {
                \Log::error('Certificate PDF regeneration error: ' . $e->getMessage());
            }
        }

        $certificate->update($validated);

        return redirect()->route('admin.certificates.index')
            ->with('success', 'تم تحديث الشهادة بنجاح');
    }

    public function destroy(Certificate $certificate)
    {
        // Delete PDF file if exists
        if ($certificate->file_path && Storage::disk('public')->exists($certificate->file_path)) {
            Storage::disk('public')->delete($certificate->file_path);
        }

        $certificate->delete();

        return redirect()->route('admin.certificates.index')
            ->with('success', 'تم حذف الشهادة بنجاح');
    }

    public function download(Certificate $certificate)
    {
        if (!$certificate->file_path || !Storage::disk('public')->exists($certificate->file_path)) {
            abort(404, 'ملف الشهادة غير موجود');
        }

        return Storage::disk('public')->download(
            $certificate->file_path,
            "certificate_{$certificate->certificate_number}.pdf"
        );
    }

    public function toggleStatus(Certificate $certificate)
    {
        $certificate->update([
            'is_active' => !$certificate->is_active,
        ]);

        return redirect()->back()
            ->with('success', $certificate->is_active ? 'تم تفعيل الشهادة' : 'تم إلغاء تفعيل الشهادة');
    }
}

