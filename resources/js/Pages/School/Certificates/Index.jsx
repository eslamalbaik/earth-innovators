import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import {
    FaFilePdf, FaDownload, FaSearch, FaUser, FaIdCard,
    FaCalendarAlt, FaGraduationCap, FaEdit, FaTimes, FaCheck
} from 'react-icons/fa';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';

export default function Index({ auth, students, description }) {
    const { showSuccess, showError } = useToast();
    const { t, language } = useTranslation();
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFormat, setDateFormat] = useState('Y-m-d');

    const [certificateType, setCertificateType] = useState('student');
    const [formData, setFormData] = useState({
        student_name: '',
        student_id: '',
        membership_number: '',
        course_name: t('schoolCertificatesIndexPage.certificateTypes.student'),
        date: new Date().toISOString().split('T')[0],
        signature: '',
        issued_by: auth.user?.name || '',
        join_date: '',
        description: '',
        therapeutic_plan: '',
    });

    const getDefaultDescription = (type) => {
        switch (type) {
            case 'general_completion':
                return t('schoolCertificatesIndexPage.defaultDescriptions.generalCompletion');
            case 'academic_excellence':
                return t('schoolCertificatesIndexPage.defaultDescriptions.academicExcellence');
            case 'motivation':
                return t('schoolCertificatesIndexPage.defaultDescriptions.motivation');
            case 'innovation':
                return t('schoolCertificatesIndexPage.defaultDescriptions.innovation');
            case 'achievement':
                return t('schoolCertificatesIndexPage.defaultDescriptions.achievement');
            case 'membership':
                return t('schoolCertificatesIndexPage.defaultDescriptions.membership');
            default:
                return t('schoolCertificatesIndexPage.defaultDescriptions.student');
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setCertificateType('student');
        setFormData({
            student_name: student.name,
            student_id: student.id.toString(),
            membership_number: student.membership_number || '',
            course_name: t('schoolCertificatesIndexPage.certificateTypes.student'),
            date: new Date().toISOString().split('T')[0],
            signature: '',
            issued_by: auth.user?.name || '',
            join_date: student.created_at ? new Date(student.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            description: '',
            therapeutic_plan: '',
        });
        setShowGenerateModal(true);
    };

    const handlePreview = () => {
        const preview = { ...formData, date_format: dateFormat, certificate_type: certificateType };
        if (certificateType === 'membership') {
            preview.join_date =
                formData.join_date ||
                (selectedStudent?.created_at
                    ? new Date(selectedStudent.created_at).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]);
        }
        setPreviewData(preview);
        setShowPreviewModal(true);
    };

    const handleGenerate = async () => {
        if (!selectedStudent) return;

        setGenerating(true);
        try {
            const overrides = {
                student_name: formData.student_name,
                student_id: formData.student_id,
                membership_number: formData.membership_number,
                course_name: formData.course_name,
                signature: formData.signature,
                issued_by: formData.issued_by,
            };

            // Add membership-specific fields
            if (certificateType === 'membership') {
                overrides.join_date = formData.join_date;
                overrides.course_name = t('schoolCertificatesIndexPage.certificateTypes.membership');
            }

            // Add custom description if provided
            if (formData.description) {
                overrides.description = formData.description;
            } else {
                // Use default description based on certificate type
                overrides.description = getDefaultDescription(certificateType);
            }

            // Add therapeutic plan if provided
            if (formData.therapeutic_plan) {
                overrides.therapeutic_plan = formData.therapeutic_plan;
            }

            const response = await axios.post('/api/certificates/generate', {
                student_id: selectedStudent.id,
                overrides: overrides,
                date_format: dateFormat,
                certificate_type: certificateType,
            });

            if (response.data.success) {
                showSuccess(t('schoolCertificatesIndexPage.toasts.generateSuccess'));
                setShowGenerateModal(false);
                setSelectedStudent(null);

                // Download the certificate
                if (response.data.certificate.storage_url) {
                    window.open(response.data.certificate.storage_url, '_blank');
                } else if (response.data.certificate.download_url) {
                    window.open(response.data.certificate.download_url, '_blank');
                }

                // Refresh the page to update student list
                router.reload();
            } else {
                showError(response.data.message || t('schoolCertificatesIndexPage.toasts.generateError'));
            }
        } catch (error) {
            showError(error.response?.data?.message || t('schoolCertificatesIndexPage.toasts.generateError'));
        } finally {
            setGenerating(false);
        }
    };

    const formatDatePreview = (dateString, format) => {
        const date = new Date(dateString);
        if (format === 'long') {
            const months = [
                t('common.months.january'),
                t('common.months.february'),
                t('common.months.march'),
                t('common.months.april'),
                t('common.months.may'),
                t('common.months.june'),
                t('common.months.july'),
                t('common.months.august'),
                t('common.months.september'),
                t('common.months.october'),
                t('common.months.november'),
                t('common.months.december'),
            ];
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        } else if (format === 'short') {
            return date.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } else {
            return date.toISOString().split('T')[0];
        }
    };

    const filteredStudents = students?.data?.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.membership_number?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <DashboardLayout header={t('schoolCertificatesIndexPage.title')}>
            <Head title={t('schoolCertificatesIndexPage.pageTitle', { appName: t('common.appName') })} />

            <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Description */}
                    {description && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-blue-800">{description}</p>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="bg-white rounded-lg shadow mb-6 p-4">
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('schoolCertificatesIndexPage.searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Students List */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('common.name')}
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('schoolCertificatesIndexPage.table.membershipNumber')}
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('common.email')}
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('schoolCertificatesIndexPage.table.certificatesCount')}
                                        </th>
                                        <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {t('common.actions')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                {t('schoolCertificatesIndexPage.empty')}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FaUser className="me-2 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {student.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.membership_number || t('common.notAvailable')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.certificates_count || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleSelectStudent(student)}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center"
                                                    >
                                                        <FaFilePdf className="me-1" />
                                                        {t('schoolCertificatesIndexPage.actions.createCertificate')}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {students?.links && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {students.links.prev && (
                                            <button
                                                onClick={() => router.visit(students.links.prev.url)}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                {t('common.previous')}
                                            </button>
                                        )}
                                        {students.links.next && (
                                            <button
                                                onClick={() => router.visit(students.links.next.url)}
                                                className="ms-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                {t('common.next')}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Generate Certificate Modal */}
            <Modal show={showGenerateModal} onClose={() => setShowGenerateModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{t('schoolCertificatesIndexPage.modals.generate.title', { name: selectedStudent?.name })}</h3>
                        <button
                            onClick={() => setShowGenerateModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Certificate Type */}
                        <div>
                            <InputLabel htmlFor="certificate_type" value={t('schoolCertificatesIndexPage.form.certificateTypeLabel')} />
                            <select
                                id="certificate_type"
                                value={certificateType}
                                onChange={(e) => {
                                    setCertificateType(e.target.value);
                                    if (e.target.value === 'membership') {
                                        setFormData({ ...formData, course_name: t('schoolCertificatesIndexPage.certificateTypes.membership') });
                                    } else if (e.target.value === 'general_completion') {
                                        setFormData({ ...formData, course_name: t('schoolCertificatesIndexPage.certificateTypes.generalCompletion') });
                                    } else if (e.target.value === 'academic_excellence') {
                                        setFormData({ ...formData, course_name: t('schoolCertificatesIndexPage.certificateTypes.academicExcellence') });
                                    } else if (e.target.value === 'motivation') {
                                        setFormData({ ...formData, course_name: t('schoolCertificatesIndexPage.certificateTypes.motivation') });
                                    } else if (e.target.value === 'innovation') {
                                        setFormData({ ...formData, course_name: t('schoolCertificatesIndexPage.certificateTypes.innovation') });
                                    } else {
                                        setFormData({ ...formData, course_name: t('schoolCertificatesIndexPage.certificateTypes.student') });
                                    }
                                }}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="student">{t('schoolCertificatesIndexPage.certificateTypes.student')}</option>
                                <option value="general_completion">{t('schoolCertificatesIndexPage.certificateTypes.generalCompletion')}</option>
                                <option value="academic_excellence">{t('schoolCertificatesIndexPage.certificateTypes.academicExcellence')}</option>
                                <option value="motivation">{t('schoolCertificatesIndexPage.certificateTypes.motivation')}</option>
                                <option value="innovation">{t('schoolCertificatesIndexPage.certificateTypes.innovation')}</option>
                                <option value="membership">{t('schoolCertificatesIndexPage.certificateTypes.membership')}</option>
                                <option value="achievement">{t('schoolCertificatesIndexPage.certificateTypes.achievement')}</option>
                            </select>
                        </div>

                        <div>
                            <InputLabel htmlFor="student_name" value={t('schoolCertificatesIndexPage.form.fullNameLabel')} />
                            <TextInput
                                id="student_name"
                                type="text"
                                value={formData.student_name || selectedStudent?.name || ''}
                                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                                className="mt-1 block w-full"
                                required
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="membership_number" value={t('schoolCertificatesIndexPage.form.membershipNumberLabel')} />
                            <TextInput
                                id="membership_number"
                                type="text"
                                value={formData.membership_number || selectedStudent?.membership_number || ''}
                                onChange={(e) => setFormData({ ...formData, membership_number: e.target.value })}
                                className="mt-1 block w-full"
                                required
                            />
                        </div>

                        {/* Show join date only for membership certificates */}
                        {certificateType === 'membership' && (
                            <div>
                                <InputLabel htmlFor="join_date" value={t('schoolCertificatesIndexPage.form.joinDateLabel')} />
                                <TextInput
                                    id="join_date"
                                    type="date"
                                    value={formData.join_date}
                                    onChange={(e) => setFormData({ ...formData, join_date: e.target.value })}
                                    className="mt-1 block w-full"
                                    required
                                />
                            </div>
                        )}

                        {/* Show course name only for non-membership certificates */}
                        {certificateType !== 'membership' && (
                            <div>
                                <InputLabel htmlFor="course_name" value={t('schoolCertificatesIndexPage.form.courseNameLabel')} />
                                <TextInput
                                    id="course_name"
                                    type="text"
                                    value={formData.course_name}
                                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        )}

                        <div>
                            <InputLabel htmlFor="date_format" value={t('schoolCertificatesIndexPage.form.dateFormatLabel')} />
                            <select
                                id="date_format"
                                value={dateFormat}
                                onChange={(e) => setDateFormat(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="Y-m-d">2025-12-09</option>
                                <option value="d-m-Y">09-12-2025</option>
                                <option value="short">09/12/2025</option>
                                <option value="long">{t('schoolCertificatesIndexPage.dateFormatExamples.long')}</option>
                            </select>
                        </div>

                        {/* Description Field - Optional */}
                        <div>
                            <InputLabel htmlFor="description" value={t('schoolCertificatesIndexPage.form.descriptionLabel')} />
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder={t('schoolCertificatesIndexPage.placeholders.description')}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {!formData.description && certificateType === 'general_completion' && getDefaultDescription('general_completion')}
                                {!formData.description && certificateType === 'academic_excellence' && getDefaultDescription('academic_excellence')}
                                {!formData.description && certificateType === 'motivation' && getDefaultDescription('motivation')}
                                {!formData.description && certificateType === 'innovation' && getDefaultDescription('innovation')}
                            </p>
                        </div>

                        {/* Therapeutic Support Plan - Optional */}
                        <div>
                            <InputLabel htmlFor="therapeutic_plan" value={t('schoolCertificatesIndexPage.form.therapeuticPlanLabel')} />
                            <textarea
                                id="therapeutic_plan"
                                value={formData.therapeutic_plan}
                                onChange={(e) => setFormData({ ...formData, therapeutic_plan: e.target.value })}
                                rows={4}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder={t('schoolCertificatesIndexPage.placeholders.therapeuticPlan')}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {t('schoolCertificatesIndexPage.hints.therapeuticPlan')}
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                            <button
                                type="button"
                                onClick={() => setShowGenerateModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handlePreview}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                {t('schoolCertificatesIndexPage.actions.preview')}
                            </button>
                            <PrimaryButton
                                onClick={handleGenerate}
                                disabled={generating}
                            >
                                {generating ? t('schoolCertificatesIndexPage.actions.generating') : t('schoolCertificatesIndexPage.actions.generateAndDownload')}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Preview Modal */}
            <Modal show={showPreviewModal} onClose={() => setShowPreviewModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">{t('schoolCertificatesIndexPage.modals.preview.title')}</h3>
                        <button
                            onClick={() => setShowPreviewModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {previewData && (
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                            <div><strong>{t('schoolCertificatesIndexPage.preview.labels.certificateType')}:</strong> {certificateType === 'membership' ? t('schoolCertificatesIndexPage.certificateTypes.membership') : certificateType === 'achievement' ? t('schoolCertificatesIndexPage.certificateTypes.achievement') : t('schoolCertificatesIndexPage.certificateTypes.student')}</div>
                            <div><strong>{t('schoolCertificatesIndexPage.preview.labels.fullName')}:</strong> {previewData.student_name}</div>
                            <div><strong>{t('schoolCertificatesIndexPage.preview.labels.membershipNumber')}:</strong> {previewData.membership_number}</div>
                            {certificateType === 'membership' && previewData.join_date && (
                                <div><strong>{t('schoolCertificatesIndexPage.preview.labels.joinDate')}:</strong> {formatDatePreview(previewData.join_date, previewData.date_format)}</div>
                            )}
                            {certificateType === 'membership' && (
                                <>
                                    <div><strong>{t('schoolCertificatesIndexPage.preview.labels.issueTime')}:</strong> {new Date().toLocaleTimeString('en-US')}</div>
                                    <div><strong>{t('schoolCertificatesIndexPage.preview.labels.todayDate')}:</strong> {formatDatePreview(new Date().toISOString().split('T')[0], previewData.date_format)}</div>
                                </>
                            )}
                            {certificateType !== 'membership' && (
                                <>
                                    <div><strong>{t('schoolCertificatesIndexPage.preview.labels.courseName')}:</strong> {previewData.course_name}</div>
                                    <div><strong>{t('common.date')}:</strong> {formatDatePreview(previewData.date, previewData.date_format)}</div>
                                </>
                            )}
                            <div><strong>{t('schoolCertificatesIndexPage.preview.labels.issuedBy')}:</strong> {previewData.issued_by}</div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setShowPreviewModal(false)}
                            className="px-4 py-2 bg-[#A3C042] text-white rounded-md hover:bg-blue-700"
                        >
                            {t('common.close')}
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}

