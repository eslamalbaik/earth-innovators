<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Project;
use App\Models\User;
use App\Services\CertificateService;
use App\Services\MembershipAccessService;
use App\Services\MembershipService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class CertificateController extends Controller
{
    public function __construct(
        private CertificateService $certificateService,
        private MembershipAccessService $membershipAccessService,
        private MembershipService $membershipService
    ) {}

    public function generate(Request $request)
    {
        $recipientId = $this->resolveRecipientId($request);
        $request->merge(['recipient_id' => $recipientId]);

        $validator = Validator::make($request->all(), [
            'recipient_id' => 'required|exists:users,id',
            'overrides' => 'sometimes|array',
            'template_path' => 'sometimes|string',
            'date_format' => 'sometimes|string|in:Y-m-d,d-m-Y,long,short',
            'certificate_type' => 'sometimes|string|in:student,teacher,school,achievement,membership,general_completion,academic_excellence,motivation,innovation',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        /** @var User $actor */
        $actor = Auth::user();
        $recipient = User::findOrFail($request->integer('recipient_id'));

        if (!$this->canManageCertificate($actor, $recipient)) {
            return response()->json([
                'success' => false,
                'message' => [
                    'key' => 'toastMessages.certificateUnauthorized',
                ],
            ], 403);
        }

        $overrides = $request->input('overrides', []);
        $templatePath = $request->input('template_path');
        $dateFormat = $request->input('date_format', 'Y-m-d');
        $certificateType = $request->input('certificate_type', 'student');

        try {
            if ($this->shouldCreateApprovalRequest($actor)) {
                $school = $actor->school;

                if (!$school || !$school->isSchool()) {
                    return response()->json([
                        'success' => false,
                        'message' => [
                            'key' => 'toastMessages.certificateTeacherNeedsSchool',
                        ],
                    ], 422);
                }

                if (!$this->membershipAccessService->hasCertificateAccess($school)) {
                    return response()->json([
                        'success' => false,
                        'message' => [
                            'key' => 'toastMessages.certificateSchoolAccessDenied',
                        ],
                    ], 422);
                }

                $certificate = $this->createPendingSchoolApprovalCertificate(
                    $actor,
                    $recipient,
                    $overrides,
                    $certificateType,
                    $templatePath
                );

                return response()->json([
                    'success' => true,
                    'requires_approval' => true,
                    'message' => [
                        'key' => 'toastMessages.certificateSentToSchoolForApproval',
                    ],
                    'certificate' => [
                        'id' => $certificate->id,
                        'certificate_number' => $certificate->certificate_number,
                        'status' => $certificate->status,
                    ],
                ]);
            }

            if (!$actor->isAdmin() && !$this->membershipAccessService->hasCertificateAccess($actor)) {
                return response()->json([
                    'success' => false,
                    'message' => [
                        'key' => 'toastMessages.certificateAccessDenied',
                    ],
                ], 422);
            }

            $certificate = $this->issueCertificateNow(
                $actor,
                $recipient,
                $overrides,
                $templatePath,
                $dateFormat,
                $certificateType,
                $actor->isSchool() ? 'school_direct' : ($actor->isAdmin() ? 'admin' : 'teacher_direct')
            );

            return response()->json([
                'success' => true,
                'certificate' => [
                    'id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'file_path' => $certificate->file_path,
                    'download_url' => route('certificates.download', $certificate->id),
                    'storage_url' => $certificate->file_path ? url('/storage/' . $certificate->file_path) : null,
                    'status' => $certificate->status,
                ],
            ]);
        } catch (\Exception $e) {
            $message = 'حدث خطأ أثناء إنشاء الشهادة: ' . $e->getMessage();

            if (str_contains($e->getMessage(), 'TCPDF') || str_contains($e->getMessage(), 'FPDI')) {
                $message = 'تعذر إنشاء ملف الشهادة لأن مكتبات إنشاء ملفات PDF غير مثبتة بالكامل.';
            } elseif (str_contains($e->getMessage(), 'template not found')) {
                $message = 'تعذر إنشاء الشهادة لأن قالب الشهادة غير موجود.';
            }

            return response()->json([
                'success' => false,
                'message' => $message,
            ], 500);
        }
    }

    public function download($id)
    {
        $certificate = Certificate::findOrFail($id);
        $user = Auth::user();

        if (!$this->canViewCertificate($user, $certificate)) {
            abort(403, 'غير مصرح لك بتحميل هذه الشهادة');
        }

        try {
            if ($certificate->file_path && Storage::disk('public')->exists($certificate->file_path)) {
                return Storage::disk('public')->download(
                    $certificate->file_path,
                    "certificate_{$certificate->certificate_number}.pdf"
                );
            }

            $filePath = $this->certificateService->rebuildCertificateFile($certificate);
            return Storage::disk('public')->download($filePath, "certificate_{$certificate->certificate_number}.pdf");
        } catch (\Throwable $e) {
            $messageKey = 'toastMessages.certificateDownloadFailed';
            if (str_contains($e->getMessage(), 'TCPDF') || str_contains($e->getMessage(), 'FPDI')) {
                $messageKey = 'toastMessages.certificatePdfLibraryMissing';
            } elseif (str_contains($e->getMessage(), 'template') || str_contains($e->getMessage(), 'field mapping')) {
                $messageKey = 'toastMessages.certificateTemplateMissing';
            }

            return redirect()->back()->with('error', [
                'key' => $messageKey,
            ]);
        }
    }

    protected function resolveRecipientId(Request $request): ?int
    {
        return $request->integer('recipient_id') ?: $request->integer('student_id');
    }

    protected function shouldCreateApprovalRequest(User $actor): bool
    {
        return $actor->isTeacher() && !empty($actor->school_id);
    }

    protected function canManageCertificate(User $actor, User $recipient): bool
    {
        if ($actor->isAdmin()) {
            return true;
        }

        if ($actor->isSchool()) {
            return $recipient->school_id === $actor->id;
        }

        if ($actor->isTeacher()) {
            return $this->teacherCanManageRecipient($actor, $recipient);
        }

        return false;
    }

    protected function teacherCanManageRecipient(User $actor, User $recipient): bool
    {
        if ($recipient->id === $actor->id) {
            return true;
        }

        $teacherId = $actor->teacher?->id;
        if (!$teacherId || $recipient->role !== 'student') {
            return false;
        }

        return Project::where('teacher_id', $teacherId)
            ->where('user_id', $recipient->id)
            ->exists();
    }

    protected function canViewCertificate(User $user, Certificate $certificate): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($certificate->user_id && $certificate->user_id === $user->id) {
            return true;
        }

        if ($certificate->school_id && $certificate->school_id == $user->id) {
            return true;
        }

        if ($user->isTeacher() && ($certificate->requested_by === $user->id || $certificate->issued_by === $user->id)) {
            return true;
        }

        return false;
    }

    protected function issueCertificateNow(
        User $actor,
        User $recipient,
        array $overrides,
        ?string $templatePath,
        string $dateFormat,
        string $certificateType,
        string $source
    ): Certificate {
        $this->membershipService->ensureMembershipNumber($recipient);
        $issueDate = now()->toDateString();
        $certificateNumber = $overrides['certificate_number'] ?? $this->certificateService->generateCertificateNumber($recipient);

        $preparedData = array_merge($overrides, [
            'course_name' => $overrides['course_name'] ?? $this->getCertificateCourseName($certificateType),
            'description' => $overrides['description'] ?? $this->getDefaultDescription($certificateType, $recipient),
            'description_ar' => $overrides['description_ar'] ?? ($overrides['description'] ?? $this->getDefaultDescription($certificateType, $recipient)),
            'certificate_number' => $certificateNumber,
            'issue_date' => $overrides['issue_date'] ?? $issueDate,
            'template' => $templatePath ?? 'default',
        ]);

        $filePath = $this->certificateService->generateCertificate(
            $recipient,
            $actor,
            $preparedData,
            $templatePath,
            $dateFormat,
            $certificateType
        );

        $certificate = $this->certificateService->saveCertificate(
            $recipient,
            $actor,
            $filePath,
            $preparedData,
            $certificateType
        );

        $certificate->update([
            'status' => 'approved',
            'source' => $source,
            'requested_by' => $actor->id,
            'reviewed_by' => $actor->id,
            'approved_at' => now(),
            'is_active' => true,
        ]);

        event(new \App\Events\CertificateIssued($certificate->fresh(), $recipient));

        return $certificate->fresh();
    }

    protected function createPendingSchoolApprovalCertificate(
        User $teacher,
        User $recipient,
        array $overrides,
        string $certificateType,
        ?string $templatePath
    ): Certificate {
        $this->membershipService->ensureMembershipNumber($recipient);

        $title = $overrides['course_name'] ?? $this->getCertificateCourseName($certificateType);
        $description = $overrides['description'] ?? $this->getDefaultDescription($certificateType, $recipient);

        return Certificate::create([
            'user_id' => $recipient->id,
            'school_id' => $teacher->school_id ?? $recipient->school_id,
            'type' => $certificateType,
            'status' => 'pending_school_approval',
            'source' => 'teacher_request',
            'title' => $title,
            'title_ar' => $title,
            'description' => $description,
            'description_ar' => $overrides['description_ar'] ?? $description,
            'certificate_number' => 'REQ-' . strtoupper(uniqid()),
            'issue_date' => now()->toDateString(),
            'expiry_date' => isset($overrides['expiry_date']) ? $overrides['expiry_date'] : null,
            'template' => $templatePath ?? 'default',
            'file_path' => null,
            'issued_by' => $teacher->id,
            'requested_by' => $teacher->id,
            'reviewed_by' => null,
            'approved_at' => null,
            'rejected_at' => null,
            'rejection_reason' => null,
            'is_active' => false,
            'therapeutic_plan' => $overrides['therapeutic_plan'] ?? null,
        ]);
    }

    protected function getCertificateCourseName(string $certificateType): string
    {
        return match ($certificateType) {
            'membership' => 'شهادة عضوية',
            'teacher' => 'شهادة معلم',
            'school' => 'شهادة مدرسة',
            'general_completion' => 'شهادة إتمام عامة',
            'academic_excellence' => 'شهادة تميز أكاديمي',
            'motivation' => 'شهادة تحفيز وتشجيع',
            'innovation' => 'شهادة إبداع وابتكار',
            'achievement' => 'شهادة إنجاز',
            default => 'شهادة إتمام',
        };
    }

    protected function getDefaultDescription(string $certificateType, User $recipient): string
    {
        return match ($certificateType) {
            'membership' => "تمنح هذه الشهادة تقديراً لعضوية {$recipient->name} الفعالة في المنصة.",
            'teacher' => "تمنح هذه الشهادة تقديراً لإسهامات {$recipient->name} التعليمية وتميزه في دعم الطلبة.",
            'school' => "تمنح هذه الشهادة تقديراً لمساهمة {$recipient->name} في دعم البيئة التعليمية والابتكار.",
            'general_completion' => "تمنح هذه الشهادة لـ {$recipient->name} تقديراً لإتمام البرنامج بنجاح.",
            'academic_excellence' => "تمنح هذه الشهادة لـ {$recipient->name} تقديراً لتميزه الأكاديمي.",
            'motivation' => "تمنح هذه الشهادة لـ {$recipient->name} تقديراً لالتزامه وتحفيزه المستمر.",
            'innovation' => "تمنح هذه الشهادة لـ {$recipient->name} تقديراً لإبداعه وابتكاره.",
            'achievement' => "تمنح هذه الشهادة لـ {$recipient->name} تقديراً لإنجازه المتميز.",
            default => "تمنح هذه الشهادة لـ {$recipient->name} تقديراً لإتمام البرنامج بنجاح.",
        };
    }
}
