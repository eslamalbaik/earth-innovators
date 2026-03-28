import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useTranslation } from '@/i18n';
import { useMemo, useState } from 'react';
import { FaCheckCircle, FaClock, FaDownload, FaSchool, FaSearch, FaUserGraduate, FaUserTie } from 'react-icons/fa';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import axios from 'axios';
import { useToast } from '@/Contexts/ToastContext';
import { toHijriDate } from '@/utils/dateUtils';
import { downloadFile } from '@/utils/downloadFile';

const STATUS_STYLES = {
    approved: 'bg-green-100 text-green-700',
    pending_school_approval: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
};

const CERTIFICATE_TYPE_KEYS = {
    teacher: 'teacher',
    achievement: 'achievement',
    academic_excellence: 'academicExcellence',
    motivation: 'motivation',
    innovation: 'innovation',
    membership: 'membership',
};

export default function SchoolCertificatesIndex({
    auth,
    recipients,
    pendingRequests = [],
    recentIssuedCertificates = [],
    membershipSummary = null,
}) {
    const { t, language } = useTranslation();
    const { showSuccess, showError } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [certificateType, setCertificateType] = useState('achievement');
    const [formData, setFormData] = useState({
        course_name: '',
        description: '',
        join_date: new Date().toISOString().split('T')[0],
    });

    const getRecipientRoleLabel = (role) => {
        if (role === 'teacher') {
            return t('schoolCertificatesIndexPage.roles.teacher');
        }

        if (role === 'student') {
            return t('schoolCertificatesIndexPage.roles.student');
        }

        return t('schoolCertificatesIndexPage.roles.unknown');
    };

    const getPackageName = () => {
        const subscription = membershipSummary?.subscription;
        if (!subscription) {
            return t('schoolCertificatesIndexPage.summary.noActivePackage');
        }

        if (language === 'ar') {
            return subscription.package_name_ar || subscription.package_name || t('schoolCertificatesIndexPage.summary.noActivePackage');
        }

        return subscription.package_name || subscription.package_name_ar || t('schoolCertificatesIndexPage.summary.noActivePackage');
    };

    const getDefaultCourseName = (type, recipientRole) => {
        if (type === 'membership') {
            return t('schoolCertificatesIndexPage.certificateTypes.membership');
        }

        if (type === 'teacher' || recipientRole === 'teacher') {
            return t('schoolCertificatesIndexPage.certificateTypes.teacher');
        }

        const translationKey = CERTIFICATE_TYPE_KEYS[type] || 'achievement';
        return t(`schoolCertificatesIndexPage.certificateTypes.${translationKey}`);
    };

    const filteredRecipients = useMemo(() => {
        const rows = recipients?.data || [];
        const query = searchTerm.trim().toLowerCase();

        if (!query) {
            return rows;
        }

        return rows.filter((recipient) => (
            recipient.name?.toLowerCase().includes(query) ||
            recipient.email?.toLowerCase().includes(query) ||
            String(recipient.membership_number || '').toLowerCase().includes(query)
        ));
    }, [recipients, searchTerm]);

    const openIssueModal = (recipient, defaultType = 'achievement') => {
        setSelectedRecipient(recipient);
        setCertificateType(defaultType);
        setFormData({
            course_name: getDefaultCourseName(defaultType, recipient.role),
            description: '',
            join_date: recipient.created_at
                ? new Date(recipient.created_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
        });
        setShowIssueModal(true);
    };

    const handleIssueCertificate = async () => {
        if (!selectedRecipient) {
            return;
        }

        setSubmitting(true);
        try {
            const overrides = {
                course_name: formData.course_name,
                description: formData.description,
            };

            if (certificateType === 'membership') {
                overrides.join_date = formData.join_date;
            }

            const response = await axios.post('/api/certificates/generate', {
                recipient_id: selectedRecipient.id,
                certificate_type: certificateType,
                overrides,
                date_format: 'Y-m-d',
            });

            if (response.data?.success) {
                showSuccess(t('schoolCertificatesIndexPage.toasts.issueSuccess'));
                setShowIssueModal(false);
                setSelectedRecipient(null);

                const downloadUrl = response.data?.certificate?.download_url;
                if (downloadUrl) {
                    await downloadFile(
                        downloadUrl,
                        `certificate_${response.data?.certificate?.certificate_number || 'issued'}.pdf`
                    );
                }

                router.reload({ only: ['recipients', 'pendingRequests', 'recentIssuedCertificates', 'membershipSummary'] });
                return;
            }

            showError(response.data?.message || t('schoolCertificatesIndexPage.toasts.issueError'));
        } catch (error) {
            showError(error.response?.data?.message || t('schoolCertificatesIndexPage.toasts.issueError'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = (certificateId) => {
        router.post(`/school/certificates/${certificateId}/approve`, {}, {
            preserveScroll: true,
            onSuccess: () => showSuccess(t('schoolCertificatesIndexPage.toasts.approveSuccess')),
            onError: () => showError(t('schoolCertificatesIndexPage.toasts.approveError')),
        });
    };

    const handleReject = (certificateId) => {
        const rejectionReason = window.prompt(t('schoolCertificatesIndexPage.prompts.rejectionReason'));
        if (!rejectionReason) {
            return;
        }

        router.post(`/school/certificates/${certificateId}/reject`, { rejection_reason: rejectionReason }, {
            preserveScroll: true,
            onSuccess: () => showSuccess(t('schoolCertificatesIndexPage.toasts.rejectSuccess')),
            onError: () => showError(t('schoolCertificatesIndexPage.toasts.rejectError')),
        });
    };

    const pageTitle = t('schoolCertificatesIndexPage.pageTitle', {
        appName: t('common.appName'),
    });

    return (
        <DashboardLayout auth={auth} header={t('schoolCertificatesIndexPage.title')}>
            <Head title={pageTitle} />

            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                        <div className="mb-2 flex items-center gap-2 text-blue-700">
                            <FaSchool />
                            <span className="font-bold">{t('schoolCertificatesIndexPage.summary.membershipTitle')}</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {membershipSummary?.membership_type === 'subscription'
                                ? t('schoolCertificatesIndexPage.summary.subscriptionActive')
                                : t('schoolCertificatesIndexPage.summary.basicMembership')}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            {t('schoolCertificatesIndexPage.summary.workflowDescription')}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <div className="mb-2 flex items-center gap-2 text-emerald-700">
                            <FaCheckCircle />
                            <span className="font-bold">{t('schoolCertificatesIndexPage.summary.certificateAccessTitle')}</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {membershipSummary?.certificate_access
                                ? t('schoolCertificatesIndexPage.summary.accessAvailable')
                                : t('schoolCertificatesIndexPage.summary.accessUnavailable')}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            {t('schoolCertificatesIndexPage.summary.packageLabel')}: {getPackageName()}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                        <div className="mb-2 flex items-center gap-2 text-amber-700">
                            <FaClock />
                            <span className="font-bold">{t('schoolCertificatesIndexPage.summary.pendingRequestsTitle')}</span>
                        </div>
                        <div className="text-3xl font-extrabold text-gray-900">{pendingRequests.length}</div>
                        <div className="mt-2 text-sm text-gray-600">
                            {t('schoolCertificatesIndexPage.summary.pendingRequestsDescription')}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{t('schoolCertificatesIndexPage.pendingSection.title')}</h2>
                            <p className="mt-1 text-sm text-gray-600">{t('schoolCertificatesIndexPage.pendingSection.subtitle')}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {pendingRequests.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                {t('schoolCertificatesIndexPage.pendingSection.empty')}
                            </div>
                        ) : pendingRequests.map((request) => (
                            <div key={request.id} className="rounded-xl border border-gray-100 p-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="font-bold text-gray-900">{request.title}</div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES.pending_school_approval}`}>
                                                {t('schoolCertificatesIndexPage.pendingSection.pendingStatus')}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            {t('schoolCertificatesIndexPage.pendingSection.recipientLabel')}: {request.recipient?.name || t('schoolCertificatesIndexPage.roles.unknown')} -{' '}
                                            {t('schoolCertificatesIndexPage.pendingSection.requesterLabel')}: {request.requester?.name || t('schoolCertificatesIndexPage.roles.unknown')}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {getRecipientRoleLabel(request.recipient?.role)} - {toHijriDate(request.created_at, false, language)}
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
                                            {t('schoolCertificatesIndexPage.actions.approve')}
                                        </button>
                                        <button
                                            onClick={() => handleReject(request.id)}
                                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700"
                                        >
                                            {t('schoolCertificatesIndexPage.actions.reject')}
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
                            <h2 className="text-xl font-bold text-gray-900">{t('schoolCertificatesIndexPage.directIssueSection.title')}</h2>
                            <p className="mt-1 text-sm text-gray-600">{t('schoolCertificatesIndexPage.directIssueSection.subtitle')}</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('schoolCertificatesIndexPage.directIssueSection.searchPlaceholder')}
                                className="w-full rounded-xl border border-gray-300 py-3 ps-10 pe-4 focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#A3C042]/20"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">
                                        {t('schoolCertificatesIndexPage.recipientTable.recipient')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">
                                        {t('schoolCertificatesIndexPage.recipientTable.role')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">
                                        {t('schoolCertificatesIndexPage.recipientTable.membershipNumber')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">
                                        {t('schoolCertificatesIndexPage.recipientTable.approved')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">
                                        {t('schoolCertificatesIndexPage.recipientTable.pending')}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">
                                        {t('schoolCertificatesIndexPage.recipientTable.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredRecipients.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-500">
                                            {t('schoolCertificatesIndexPage.directIssueSection.empty')}
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
                                                {getRecipientRoleLabel(recipient.role)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-700">
                                            {recipient.membership_number || t('schoolCertificatesIndexPage.recipientTable.unavailable')}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-bold text-gray-900">
                                            {recipient.approved_certificates_count || 0}
                                        </td>
                                        <td className="px-4 py-4 text-sm font-bold text-amber-700">
                                            {recipient.pending_certificates_count || 0}
                                        </td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => openIssueModal(recipient, recipient.role === 'teacher' ? 'teacher' : 'achievement')}
                                                className="rounded-xl border border-[#A3C042] px-4 py-2 text-sm font-bold text-[#7E9B25] transition hover:bg-[#A3C042] hover:text-white"
                                            >
                                                {t('schoolCertificatesIndexPage.actions.issueNow')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">{t('schoolCertificatesIndexPage.recentSection.title')}</h2>
                    <div className="space-y-3">
                        {recentIssuedCertificates.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                {t('schoolCertificatesIndexPage.recentSection.empty')}
                            </div>
                        ) : recentIssuedCertificates.map((certificate) => (
                            <div key={certificate.id} className="flex flex-col gap-3 rounded-xl border border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="font-bold text-gray-900">{certificate.title}</div>
                                    <div className="mt-1 text-sm text-gray-600">
                                        {certificate.recipient_name} - {getRecipientRoleLabel(certificate.recipient_role)}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500">
                                        {certificate.approved_at ? toHijriDate(certificate.approved_at, false, language) : ''}
                                    </div>
                                </div>

                                {certificate.download_url && (
                                    <a
                                        href={certificate.download_url}
                                        download
                                        className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                                    >
                                        <span className="inline-flex items-center gap-2">
                                            <FaDownload />
                                            {t('schoolCertificatesIndexPage.actions.download')}
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
                        {t('schoolCertificatesIndexPage.modals.issue.title', { name: selectedRecipient?.name || '' })}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="certificate_type" value={t('schoolCertificatesIndexPage.form.certificateTypeLabel')} />
                            <select
                                id="certificate_type"
                                value={certificateType}
                                onChange={(e) => {
                                    const nextType = e.target.value;
                                    setCertificateType(nextType);
                                    setFormData((prev) => ({
                                        ...prev,
                                        course_name: getDefaultCourseName(nextType, selectedRecipient?.role),
                                    }));
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                            >
                                {selectedRecipient?.role === 'teacher' && (
                                    <option value="teacher">{t('schoolCertificatesIndexPage.certificateTypes.teacher')}</option>
                                )}
                                <option value="achievement">{t('schoolCertificatesIndexPage.certificateTypes.achievement')}</option>
                                <option value="academic_excellence">{t('schoolCertificatesIndexPage.certificateTypes.academicExcellence')}</option>
                                <option value="motivation">{t('schoolCertificatesIndexPage.certificateTypes.motivation')}</option>
                                <option value="innovation">{t('schoolCertificatesIndexPage.certificateTypes.innovation')}</option>
                                <option value="membership">{t('schoolCertificatesIndexPage.certificateTypes.membership')}</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="course_name" value={t('schoolCertificatesIndexPage.form.courseNameLabel')} />
                            <TextInput
                                id="course_name"
                                value={formData.course_name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, course_name: e.target.value }))}
                                className="mt-1 block w-full"
                            />
                        </div>

                        {certificateType === 'membership' && (
                            <div>
                                <InputLabel htmlFor="join_date" value={t('schoolCertificatesIndexPage.form.joinDateLabel')} />
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
                            <InputLabel htmlFor="description" value={t('schoolCertificatesIndexPage.form.shortDescriptionLabel')} />
                            <textarea
                                id="description"
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                placeholder={t('schoolCertificatesIndexPage.placeholders.issueDescription')}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowIssueModal(false)}
                                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </button>
                            <PrimaryButton onClick={handleIssueCertificate} disabled={submitting}>
                                {submitting
                                    ? t('schoolCertificatesIndexPage.actions.issuing')
                                    : t('schoolCertificatesIndexPage.actions.issueNow')}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
