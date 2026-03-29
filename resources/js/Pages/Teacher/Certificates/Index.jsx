import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useMemo, useState } from 'react';
import { FaCertificate, FaClock, FaDownload, FaSchool, FaSearch, FaTimesCircle } from 'react-icons/fa';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import axios from 'axios';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';
import { toHijriDate } from '@/utils/dateUtils';
import { downloadFile } from '@/utils/downloadFile';

const STATUS_STYLES = {
    approved: 'bg-green-100 text-green-700',
    pending_school_approval: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
};

export default function TeacherCertificatesIndex({
    auth,
    students,
    teacherRecipient,
    requestHistory = [],
    school = null,
    membershipSummary = null,
}) {
    const { showSuccess, showError } = useToast();
    const { t, language } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [certificateType, setCertificateType] = useState('achievement');
    const [formData, setFormData] = useState({
        course_name: '',
        description: '',
        join_date: new Date().toISOString().split('T')[0],
    });

    const formatDate = (value) => {
        if (!value) return '-';

        if (language === 'ar') {
            return toHijriDate(value, false, language);
        }

        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(new Date(value));
    };

    const getRoleLabel = (role) => t(`teacherCertificatesIndexPage.roles.${role === 'teacher' ? 'teacher' : 'student'}`);

    const getDefaultCourseName = (type) => {
        switch (type) {
        case 'membership':
            return t('teacherCertificatesIndexPage.defaultTitles.membership');
        case 'academic_excellence':
            return t('teacherCertificatesIndexPage.defaultTitles.academicExcellence');
        case 'motivation':
            return t('teacherCertificatesIndexPage.defaultTitles.motivation');
        case 'innovation':
            return t('teacherCertificatesIndexPage.defaultTitles.innovation');
        default:
            return t('teacherCertificatesIndexPage.defaultTitles.achievement');
        }
    };

    const statusLabels = {
        approved: t('teacherCertificatesIndexPage.statuses.approved'),
        pending_school_approval: t('teacherCertificatesIndexPage.statuses.pendingSchoolApproval'),
        rejected: t('teacherCertificatesIndexPage.statuses.rejected'),
    };

    const recipients = useMemo(() => {
        const studentRows = students?.data || [];
        return studentRows.filter((student) => {
            const q = searchTerm.trim().toLowerCase();
            if (!q) return true;
            return (
                student.name?.toLowerCase().includes(q) ||
                student.email?.toLowerCase().includes(q) ||
                student.membership_number?.toLowerCase().includes(q)
            );
        });
    }, [students, searchTerm]);

    const openRequestModal = (recipient, defaultType = 'achievement') => {
        if (!recipient) return;

        if (!school) {
            showError(t('teacherCertificatesIndexPage.toasts.noSchool'));
            return;
        }
        if (!membershipSummary?.certificate_access) {
            showError(t('teacherCertificatesIndexPage.toasts.certificateAccessDenied'));
            return;
        }

        setSelectedRecipient(recipient);
        setCertificateType(defaultType);
        setFormData({
            course_name: getDefaultCourseName(defaultType),
            description: '',
            join_date: recipient?.created_at
                ? new Date(recipient.created_at).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
        });
        setShowRequestModal(true);
    };

    const handleSubmitRequest = async () => {
        if (!selectedRecipient) return;

        setSubmitting(true);
        try {
            const overrides = {
                course_name: formData.course_name,
                description: formData.description,
            };

            if (certificateType === 'membership') {
                overrides.join_date = formData.join_date;
                overrides.course_name = getDefaultCourseName('membership');
            }

            const response = await axios.post('/api/certificates/generate', {
                recipient_id: selectedRecipient.id,
                certificate_type: certificateType,
                overrides,
                date_format: 'Y-m-d',
            });

            if (response.data?.success) {
                if (response.data.requires_approval) {
                    showSuccess(response.data.message || t('teacherCertificatesIndexPage.toasts.requestSentToSchool'));
                } else {
                    showSuccess(t('teacherCertificatesIndexPage.toasts.issuedSuccessfully'));
                    const downloadUrl = response.data?.certificate?.download_url;
                    if (downloadUrl) {
                        await downloadFile(
                            downloadUrl,
                            `certificate_${response.data?.certificate?.certificate_number || 'issued'}.pdf`
                        );
                    }
                }

                setShowRequestModal(false);
                setSelectedRecipient(null);
                router.reload({ only: ['students', 'requestHistory', 'teacherRecipient', 'membershipSummary'] });
                return;
            }

            showError(response.data?.message || t('teacherCertificatesIndexPage.toasts.requestFailed'));
        } catch (error) {
            showError(error.response?.data?.message || t('teacherCertificatesIndexPage.toasts.requestError'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout header={t('teacherCertificatesIndexPage.title')}>
            <Head title={t('teacherCertificatesIndexPage.pageTitle', { appName: t('common.appName') })} />

            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                        <div className="mb-2 flex items-center gap-2 text-blue-700">
                            <FaSchool />
                            <span className="font-bold">{t('teacherCertificatesIndexPage.authorityTitle')}</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{school?.name || t('teacherCertificatesIndexPage.noLinkedSchool')}</div>
                        <div className="mt-2 text-sm text-gray-600">
                            {t('teacherCertificatesIndexPage.authorityDescription')}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                        <div className="mb-2 flex items-center gap-2 text-emerald-700">
                            <FaCertificate />
                            <span className="font-bold">{t('teacherCertificatesIndexPage.membershipStatusTitle')}</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                            {membershipSummary?.membership_type === 'subscription'
                                ? t('teacherCertificatesIndexPage.membershipStatus.subscription')
                                : t('teacherCertificatesIndexPage.membershipStatus.basic')}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            {t('teacherCertificatesIndexPage.certificateAccessLabel', {
                                status: membershipSummary?.certificate_access
                                    ? t('teacherCertificatesIndexPage.certificateAccess.available')
                                    : t('teacherCertificatesIndexPage.certificateAccess.unavailable'),
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                        <div className="mb-2 flex items-center gap-2 text-amber-700">
                            <FaClock />
                            <span className="font-bold">{t('teacherCertificatesIndexPage.recentRequestsTitle')}</span>
                        </div>
                        <div className="text-3xl font-extrabold text-gray-900">{requestHistory.length}</div>
                        <div className="mt-2 text-sm text-gray-600">
                            {t('teacherCertificatesIndexPage.recentRequestsDescription')}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{t('teacherCertificatesIndexPage.selfCertificateTitle')}</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                {t('teacherCertificatesIndexPage.selfCertificateDescription')}
                            </p>
                        </div>
                        <button
                            onClick={() => openRequestModal(teacherRecipient, 'membership')}
                            disabled={!teacherRecipient}
                            className={`rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                                teacherRecipient
                                    ? 'bg-[#A3C042] hover:bg-[#8CA635]'
                                    : 'cursor-not-allowed bg-gray-300'
                            }`}
                        >
                            {t('teacherCertificatesIndexPage.selfCertificateAction')}
                        </button>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{t('teacherCertificatesIndexPage.studentsTitle')}</h2>
                            <p className="mt-1 text-sm text-gray-600">{t('teacherCertificatesIndexPage.studentsDescription')}</p>
                        </div>
                        <div className="relative w-full md:w-80">
                            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('teacherCertificatesIndexPage.searchPlaceholder')}
                                className="w-full rounded-xl border border-gray-300 py-3 ps-10 pe-4 focus:border-[#A3C042] focus:outline-none focus:ring-2 focus:ring-[#A3C042]/20"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">{t('teacherCertificatesIndexPage.table.student')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">{t('teacherCertificatesIndexPage.table.membershipNumber')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">{t('teacherCertificatesIndexPage.table.approvedCertificates')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500">{t('teacherCertificatesIndexPage.table.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {recipients.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500">
                                            {t('teacherCertificatesIndexPage.noResults')}
                                        </td>
                                    </tr>
                                ) : recipients.map((student) => (
                                    <tr key={student.id}>
                                        <td className="px-4 py-4">
                                            <div className="font-bold text-gray-900">{student.name}</div>
                                            <div className="text-sm text-gray-500">{student.email}</div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{student.membership_number || t('teacherCertificatesIndexPage.unavailableMembershipNumber')}</td>
                                        <td className="px-4 py-4 text-sm font-bold text-gray-900">{student.certificates_count || 0}</td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => openRequestModal(student, 'achievement')}
                                                className="rounded-xl border border-[#A3C042] px-4 py-2 text-sm font-bold text-[#7E9B25] transition hover:bg-[#A3C042] hover:text-white"
                                            >
                                                {t('teacherCertificatesIndexPage.requestCertificate')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-gray-900">{t('teacherCertificatesIndexPage.requestHistoryTitle')}</h2>
                    <div className="space-y-3">
                        {requestHistory.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                                {t('teacherCertificatesIndexPage.noRequests')}
                            </div>
                        ) : requestHistory.map((item) => (
                            <div key={item.id} className="rounded-xl border border-gray-100 p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="font-bold text-gray-900">{item.title}</div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {statusLabels[item.status] || item.status}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">
                                            {t('teacherCertificatesIndexPage.recipientLabel', {
                                                name: item.recipient?.name || t('teacherCertificatesIndexPage.unknownRecipient'),
                                                role: item.recipient?.role ? `(${getRoleLabel(item.recipient.role)})` : '',
                                            })}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500">
                                            {t('teacherCertificatesIndexPage.requestNumberLabel', {
                                                number: item.certificate_number,
                                                date: formatDate(item.created_at),
                                            })}
                                        </div>
                                        {item.reviewer?.name && (
                                            <div className="mt-1 text-xs text-gray-500">
                                                {t('teacherCertificatesIndexPage.reviewerLabel', { name: item.reviewer.name })}
                                            </div>
                                        )}
                                        {item.rejection_reason && (
                                            <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                                                {t('teacherCertificatesIndexPage.rejectionReasonLabel', { reason: item.rejection_reason })}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {item.status === 'approved' && item.download_url ? (
                                            <a
                                                href={item.download_url}
                                                download
                                                className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    <FaDownload />
                                                    {t('common.download')}
                                                </span>
                                            </a>
                                        ) : item.status === 'pending_school_approval' ? (
                                            <span className="inline-flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
                                                <FaClock />
                                                {t('teacherCertificatesIndexPage.statuses.pendingSchoolApproval')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                                                <FaTimesCircle />
                                                {t('teacherCertificatesIndexPage.statuses.rejected')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal show={showRequestModal} onClose={() => setShowRequestModal(false)}>
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">
                        {t('teacherCertificatesIndexPage.modalTitle', { name: selectedRecipient?.name || '' })}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="certificate_type" value={t('teacherCertificatesIndexPage.form.certificateTypeLabel')} />
                            <select
                                id="certificate_type"
                                value={certificateType}
                                onChange={(e) => {
                                    const nextType = e.target.value;
                                    setCertificateType(nextType);
                                    setFormData((prev) => ({
                                        ...prev,
                                        course_name: getDefaultCourseName(nextType),
                                    }));
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                            >
                                <option value="achievement">{t('teacherCertificatesIndexPage.certificateTypes.achievement')}</option>
                                <option value="academic_excellence">{t('teacherCertificatesIndexPage.certificateTypes.academicExcellence')}</option>
                                <option value="motivation">{t('teacherCertificatesIndexPage.certificateTypes.motivation')}</option>
                                <option value="innovation">{t('teacherCertificatesIndexPage.certificateTypes.innovation')}</option>
                                <option value="membership">{t('teacherCertificatesIndexPage.certificateTypes.membership')}</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="course_name" value={t('teacherCertificatesIndexPage.form.titleLabel')} />
                            <TextInput
                                id="course_name"
                                value={formData.course_name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, course_name: e.target.value }))}
                                className="mt-1 block w-full"
                            />
                        </div>

                        {certificateType === 'membership' && (
                            <div>
                                <InputLabel htmlFor="join_date" value={t('teacherCertificatesIndexPage.form.joinDateLabel')} />
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
                            <InputLabel htmlFor="description" value={t('teacherCertificatesIndexPage.form.descriptionLabel')} />
                            <textarea
                                id="description"
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                placeholder={t('teacherCertificatesIndexPage.form.descriptionPlaceholder')}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowRequestModal(false)}
                                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </button>
                            <PrimaryButton onClick={handleSubmitRequest} disabled={submitting}>
                                {submitting ? t('teacherCertificatesIndexPage.form.submitting') : t('teacherCertificatesIndexPage.form.submit')}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
