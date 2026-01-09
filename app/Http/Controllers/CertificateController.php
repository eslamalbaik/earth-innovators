<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Certificate;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CertificateController extends Controller
{
    protected $certificateService;

    public function __construct(CertificateService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    /**
     * Generate certificate API endpoint
     */
    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'overrides' => 'sometimes|array',
            'template_path' => 'sometimes|string',
            'date_format' => 'sometimes|string|in:Y-m-d,d-m-Y,long,short',
            'certificate_type' => 'sometimes|string|in:student,school,achievement,membership',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = Auth::user();
        $student = User::findOrFail($request->student_id);

        // Verify permissions
        if (!$this->canGenerateCertificate($user, $student)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإنشاء شهادة لهذا الطالب',
            ], 403);
        }

        try {
            // Generate PDF
            $overrides = $request->input('overrides', []);
            $templatePath = $request->input('template_path');
            $dateFormat = $request->input('date_format', 'Y-m-d');
            $certificateType = $request->input('certificate_type', 'student');

            $filePath = $this->certificateService->generateCertificate(
                $student,
                $user,
                $overrides,
                $templatePath,
                $dateFormat,
                $certificateType
            );

            // Save certificate record
            $certificate = $this->certificateService->saveCertificate(
                $student,
                $user,
                $filePath,
                array_merge($overrides, [
                    'course_name' => $overrides['course_name'] ?? ($certificateType === 'membership' ? 'شهادة عضوية' : 'شهادة إتمام'),
                ]),
                $certificateType
            );

            // Return download URL
            // For storage files, use the route helper or direct path
            $downloadUrl = route('certificates.download', $certificate->id);
            
            // Use storage route instead of symlink (works better on Windows)
            // This uses StorageController as fallback when symlink doesn't work
            $storageUrl = url('/storage/' . $filePath);

            return response()->json([
                'success' => true,
                'certificate' => [
                    'id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'file_path' => $filePath,
                    'download_url' => $downloadUrl,
                    'storage_url' => $storageUrl,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Certificate generation error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'student_id' => $request->student_id,
                'user_id' => $user->id,
            ]);

            $message = 'حدث خطأ أثناء إنشاء الشهادة: ' . $e->getMessage();
            
            // Provide more helpful error messages
            if (str_contains($e->getMessage(), 'TCPDF') || str_contains($e->getMessage(), 'FPDI')) {
                $message = 'حدث خطأ أثناء إنشاء الشهادة: المكتبات المطلوبة غير مثبتة. يرجى تشغيل: composer install';
            } elseif (str_contains($e->getMessage(), 'template not found')) {
                $message = 'حدث خطأ أثناء إنشاء الشهادة: ملف القالب غير موجود';
            }

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 500);
        }
    }

    /**
     * Download certificate
     */
    public function download($id)
    {
        $certificate = Certificate::findOrFail($id);
        $user = Auth::user();

        // Verify permissions
        if (!$this->canViewCertificate($user, $certificate)) {
            abort(403, 'غير مصرح لك بتحميل هذه الشهادة');
        }

        // Files are stored in public disk
        if (!$certificate->file_path || !Storage::disk('public')->exists($certificate->file_path)) {
            abort(404, 'ملف الشهادة غير موجود');
        }

        return Storage::disk('public')->download($certificate->file_path, "certificate_{$certificate->certificate_number}.pdf");
    }

    /**
     * Check if user can generate certificate for student
     */
    protected function canGenerateCertificate(User $user, User $student): bool
    {
        // Admin can generate for anyone
        if ($user->isAdmin()) {
            return true;
        }

        // School can generate for their students
        if ($user->isSchool() && $student->school_id === $user->id) {
            return true;
        }

        // Teacher can generate for students with their projects
        if ($user->isTeacher()) {
            $teacherProjects = \App\Models\Project::where('teacher_id', $user->id)
                ->where('user_id', $student->id)
                ->exists();
            return $teacherProjects;
        }

        return false;
    }

    /**
     * Check if user can view certificate
     */
    protected function canViewCertificate(User $user, Certificate $certificate): bool
    {
        // Admin can view any certificate
        if ($user->isAdmin()) {
            return true;
        }

        // Student can view their own certificates
        if ($user->isStudent() && $certificate->user_id === $user->id) {
            return true;
        }

        // School can view certificates of their students
        if ($user->isSchool() && $certificate->school_id == $user->id) {
            return true;
        }

        // Teacher can view certificates they issued
        if ($user->isTeacher() && $certificate->issued_by === $user->id) {
            return true;
        }

        return false;
    }
}

