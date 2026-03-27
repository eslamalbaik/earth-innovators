import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useMemo, useState } from 'react';
import { FaCheckCircle, FaClock, FaDownload, FaFileSignature, FaSchool, FaSearch, FaTimesCircle, FaUserGraduate, FaUserTie } from 'react-icons/fa';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import axios from 'axios';
import { useToast } from '@/Contexts/ToastContext';

const STATUS_STYLES = {
    approved: 'bg-green-100 text-green-700',
    pending_school_approval: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
};

export default function SchoolCertificatesIndex({
    auth,
    recipients,
    pendingRequests = [],
    recentIssuedCertificates = [],
    membershipSummary = null,
    description = '',
}) {
    const { showSuccess, showError } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [certificateType, setCertificateType] = useState('achievement');
    const [formData, setFormData] = useState({
        course_name: 'شهادة إنجاز',
        description: '',
        join_date: new Date().toISOString().split('T')[0],
    });

    const filteredRecipients = useMemo(() => {
        const rows = recipients?.data || [];
        const q = searchTerm.trim().toLowerCase();
        if (!q) return rows;

        return rows.filter((recipient) => (
            recipient.name?.toLowerCase().includes(q) ||
            recipient.email?.toLowerCase().includes(q) ||
            recipient.membership_number?.toLowerCase().includes(q)
        ));
    }, [recipients, searchTerm]);

    const openIssueModal = (recipient, defaultType = 'achievement') => {
        setSelectedRecipient(recipient);
        setCertificateType(defaultType);
        setFormData({
            course_name: defaultType === 'membership' ? 'شهادة عضوية' : recipient.role === 'teacher' ? 'شهادة معلم' : 'شهادة إنجاز',
            description: '',
            join_date: recipient.created_at ? new Date(recipient.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });
        setShowIssueModal(true);
    };

    const handleIssueCertificate = async () => {
        if (!selectedRecipient) return;

        setSubmitting(true);
        try {
            const overrides = {
                course_name: formData.course_name,
                description: formData.description,
            };

            if (certificateType === 'membership') {
                overrides.join_date = formData.join_date;
                overrides.course_name = 'شهادة عضوية';
            }

            const response = await axios.post('/api/certificates/generate', {
                recipient_id: selectedRecipient.id,
                certificate_type: certificateType,
                overrides,
                date_format: 'Y-m-d',
            });

            if (response.data?.success) {
                showSuccess('تم إصدار الشهادة بنجاح.');
                setShowIssueModal(false);
                setSelectedRecipient(null);

                const downloadUrl = response.data?.certificate?.storage_url || response.data?.certificate?.download_url;
                if (downloadUrl) {
                    window.open(downloadUrl, '_blank');
                }

                router.reload({ only: ['recipients', 'pendingRequests', 'recentIssuedCertificates', 'membershipSummary'] });
                return;
            }

            showError(response.data?.message || 'تعذر إصدار الشهادة.');
        } catch (error) {
            showError(error.response?.data?.message || 'حدث خطأ أثناء إصدار الشهادة.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = (certificateId) => {
        router.post(`/school/certificates/${certificateId}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => showSuccess('تم اعتماد الشهادة بنجاح.'),
            onError: () => showError('تعذر اعتماد الشهادة.'),
        });
    };

    const handleReject = (certificateId) => {
        const rejectionReason = window.prompt('اكتب سبب رفض الشهادة:');
        if (!rejectionReason) return;

        router.post(`/school/certificates/${certificateId}/reject`, { rejection_reason: rejectionReason }, {
            preserveScroll: true,
            onSuccess: () => showSuccess('تم رفض طلب الشهادة.'),
            onError: () => showError('تعذر رفض الطلب.'),
        });
    };

    return (
        <DashboardLayout header="إدارة الشهادات">
            <Head title="إدارة الشهادات" />

            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                        <div className="mb-2 flex items-center gap-2 text-blue-700">
                            <FaSchool />
                            <span className="font-bold">عضوية المدرسة</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {membershipSummary?.membership_type === 'subscription' ? 'اشتراك فعّال' : 'عضوية أساسية'}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            {description}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <div className="mb-2 flex items-center gap-2 text-emerald-700">
                            <FaCheckCircle />
                            <span className="font-bold">صلاحية الشهادات</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {membershipSummary?.certificate_access ? 'متاحة الآن' : 'غير متاحة'}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            الباقة: {membershipSummary?.subscription?.package_name || 'لا توجد باقة فعالة'}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                        <div className="mb-2 flex items-center gap-2 text-amber-700">
                            <FaClock />
                            <span className="font-bold">طلبات بانتظار المراجعة</span>
                        </div>
                        <div className="text-3xl font-extrabold text-gray-900">{pendingRequests.length}</div>
                        <div className="mt-2 text-sm text-gray-600">
                            الطلبات القادمة من المعلمين تحتاج اعتماد المدرسة قبل التوليد النهائي.
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">طلبات المعلمين المعلقة</h2>
                            <p className="mt-1 text-sm text-gray-600">راجع الطلب ثم اعتمد أو ارفض مع توضيح السبب.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {pendingRequests.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                لا توجد طلبات معلقة حالياً.
                            </div>
                        ) : pendingRequests.map((request) => (
                            <div key={request.id} className="rounded-xl border border-gray-100 p-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="font-bold text-gray-900">{request.title}</div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES.pending_school_approval}`}>
                                                بانتظار الاعتماد
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            المستفيد: {request.recipient?.name || 'غير محدد'} - مقدم الطلب: {request.requester?.name || 'غير محدد'}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {request.recipient?.role === 'teacher' ? 'معلم' : 'طالب'} - {request.created_at}
                                        </div>
                                        {request.description && (
                                            <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                                {request.description}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            onClick={() => handleApprove(request.id)}
                                            className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700"
                                        >
                                            اعتماد
                                        </button>
                                        <button
                                            onClick={() => handleReject(request.id)}
                                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                                        >
                                            رفض
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">إصدار مباشر للطلاب والمعلمين</h2>
                            <p className="mt-1 text-sm text-gray-600">يمكن للمدرسة إصدار شهادة مباشرة بدون انتظار طلب من المعلم.</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ابحث بالاسم أو البريد أو رقم العضوية"
                                className="w-full rounded-xl border border-gray-300 py-3 ps-10 pe-4 focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#A3C042]/20"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">المستفيد</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">الدور</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">رقم العضوية</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">المعتمدة</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">المعلقة</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">الإجراء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredRecipients.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">
                                            لا توجد نتائج مطابقة.
                                        </td>
                                    </tr>
                                ) : filteredRecipients.map((recipient) => (
                                    <tr key={recipient.id}>
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-gray-900">{recipient.name}</div>
                                            <div className="text-sm text-gray-500">{recipient.email}</div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-700">
                                            <span className="inline-flex items-center gap-2">
                                                {recipient.role === 'teacher' ? <FaUserTie /> : <FaUserGraduate />}
                                                {recipient.role === 'teacher' ? 'معلم' : 'طالب'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{recipient.membership_number || 'غير متوفر'}</td>
                                        <td className="px-4 py-4 text-sm font-bold text-gray-900">{recipient.approved_certificates_count || 0}</td>
                                        <td className="px-4 py-4 text-sm font-bold text-amber-700">{recipient.pending_certificates_count || 0}</td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => openIssueModal(recipient, recipient.role === 'teacher' ? 'teacher' : 'achievement')}
                                                className="rounded-xl border border-[#A3C042] px-4 py-2 text-sm font-bold text-[#7E9B25] transition hover:bg-[#A3C042] hover:text-white"
                                            >
                                                إصدار شهادة
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">آخر الشهادات المعتمدة</h2>
                    <div className="space-y-3">
                        {recentIssuedCertificates.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                لا توجد شهادات معتمدة حديثاً.
                            </div>
                        ) : recentIssuedCertificates.map((certificate) => (
                            <div key={certificate.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="font-bold text-gray-900">{certificate.title}</div>
                                    <div className="mt-1 text-sm text-gray-600">
                                        {certificate.recipient_name} - {certificate.recipient_role === 'teacher' ? 'معلم' : 'طالب'}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500">{certificate.approved_at}</div>
                                </div>

                                {certificate.download_url && (
                                    <a
                                        href={certificate.download_url}
                                        className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <FaDownload />
                                            تحميل
                                        </span>
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal show={showIssueModal} onClose={() => setShowIssueModal(false)}>
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        إصدار شهادة لـ {selectedRecipient?.name}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="certificate_type" value="نوع الشهادة" />
                            <select
                                id="certificate_type"
                                value={certificateType}
                                onChange={(e) => {
                                    const nextType = e.target.value;
                                    setCertificateType(nextType);
                                    setFormData((prev) => ({
                                        ...prev,
                                        course_name: nextType === 'membership'
                                            ? 'شهادة عضوية'
                                            : nextType === 'teacher'
                                                ? 'شهادة معلم'
                                                : nextType === 'academic_excellence'
                                                    ? 'شهادة تميز أكاديمي'
                                                    : 'شهادة إنجاز',
                                    }));
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                            >
                                {selectedRecipient?.role === 'teacher' && <option value="teacher">شهادة معلم</option>}
                                <option value="achievement">شهادة إنجاز</option>
                                <option value="academic_excellence">شهادة تميز أكاديمي</option>
                                <option value="motivation">شهادة تحفيز</option>
                                <option value="innovation">شهادة ابتكار</option>
                                <option value="membership">شهادة عضوية</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="course_name" value="عنوان الشهادة" />
                            <TextInput
                                id="course_name"
                                value={formData.course_name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, course_name: e.target.value }))}
                                className="mt-1 block w-full"
                            />
                        </div>

                        {certificateType === 'membership' && (
                            <div>
                                <InputLabel htmlFor="join_date" value="تاريخ بداية العضوية" />
                                <TextInput
                                    id="join_date"
                                    type="date"
                                    value={formData.join_date}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, join_date: e.target.value }))}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="description" value="وصف مختصر" />
                            <textarea
                                id="description"
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                placeholder="يمكنك ترك الوصف فارغاً ليتم استخدام الوصف الافتراضي."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowIssueModal(false)}
                                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                            >
                                إلغاء
                            </button>
                            <PrimaryButton onClick={handleIssueCertificate} disabled={submitting}>
                                {submitting ? 'جاري الإصدار...' : 'إصدار الآن'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
