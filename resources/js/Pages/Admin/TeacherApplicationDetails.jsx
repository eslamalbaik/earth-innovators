import { Head } from '@inertiajs/react';
import {
    FaArrowRight,
    FaCheck,
    FaTimes,
    FaClock,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaGraduationCap,
    FaBriefcase,
    FaAward,
    FaMoneyBillWave,
} from 'react-icons/fa';
import AdminLayout from '../../Layouts/AdminLayout';
import { useTranslation } from '@/i18n';

export default function TeacherApplicationDetails({ application }) {
    const { t, language } = useTranslation();
    const teacher = application.teacher;
    const user = application.user;

    const parseJsonField = (field) => {
        try {
            return typeof field === 'string' ? JSON.parse(field) : field;
        } catch {
            return [];
        }
    };

    const subjects = parseJsonField(teacher?.subjects || '[]');
    const stages = parseJsonField(teacher?.stages || '[]');
    const certifications = parseJsonField(teacher?.certifications || '[]');
    const experiences = parseJsonField(teacher?.experiences || '[]');

    const getLocalizedSubjectName = (subject) => (
        language === 'en'
            ? (subject?.name_en || subject?.name_ar || t('common.notAvailable'))
            : (subject?.name_ar || subject?.name_en || t('common.notAvailable'))
    );

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, text: t('adminTeacherApplicationDetailsPage.statuses.pending') },
            under_review: { color: 'bg-blue-100 text-blue-800', icon: FaClock, text: t('adminTeacherApplicationDetailsPage.statuses.underReview') },
            approved: { color: 'bg-green-100 text-green-800', icon: FaCheck, text: t('adminTeacherApplicationDetailsPage.statuses.approved') },
            rejected: { color: 'bg-red-100 text-red-800', icon: FaTimes, text: t('adminTeacherApplicationDetailsPage.statuses.rejected') },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className="w-4 h-4" />
                {config.text}
            </span>
        );
    };

    const formatDate = (date) => new Date(date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <AdminLayout>
            <Head
                title={t('adminTeacherApplicationDetailsPage.pageTitle', {
                    name: teacher?.name || user?.name || t('common.notAvailable'),
                    appName: t('common.appName'),
                })}
            />

            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <a
                                href="/admin/teacher-applications"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <FaArrowRight className="rotate-180" />
                                {t('adminTeacherApplicationDetailsPage.backToList')}
                            </a>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('adminTeacherApplicationDetailsPage.title')}</h1>
                        <p className="text-gray-600">
                            {t('adminTeacherApplicationDetailsPage.subtitle', {
                                name: teacher?.name || user?.name || t('common.notAvailable'),
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(application.status)}
                        <div className="text-sm text-gray-500">
                            {t('adminTeacherApplicationDetailsPage.submittedAt', { date: formatDate(application.submitted_at) })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaUser />
                                {t('adminTeacherApplicationDetailsPage.sections.personalInfo')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('adminTeacherApplicationDetailsPage.fields.fullName')}</label>
                                    <p className="mt-1 text-sm text-gray-900">{teacher?.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('common.email')}</label>
                                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                                        <FaEnvelope className="w-4 h-4 text-gray-400" />
                                        {teacher?.email}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('common.phone')}</label>
                                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                                        <FaPhone className="w-4 h-4 text-gray-400" />
                                        {teacher?.phone}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('common.city')}</label>
                                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                                        <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                                        {teacher?.city}
                                    </p>
                                </div>
                            </div>
                            {teacher?.bio ? (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">{t('adminTeacherApplicationDetailsPage.fields.bio')}</label>
                                    <p className="mt-1 text-sm text-gray-900 leading-relaxed">{teacher.bio}</p>
                                </div>
                            ) : null}
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaGraduationCap />
                                {t('adminTeacherApplicationDetailsPage.sections.teachingInfo')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('adminTeacherApplicationDetailsPage.fields.hourlyPrice')}</label>
                                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                                        <FaMoneyBillWave className="w-4 h-4 text-gray-400" />
                                        {t('adminTeacherApplicationDetailsPage.currencyPerHour', { amount: teacher?.price_per_hour || 0 })}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('adminTeacherApplicationDetailsPage.fields.experienceYears')}</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {t('adminTeacherApplicationDetailsPage.experienceYearsValue', { count: teacher?.experience_years || 0 })}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminTeacherApplicationDetailsPage.fields.stages')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {stages.map((stage, index) => (
                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {stage}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.subjects')}</label>
                                <div className="flex flex-wrap gap-2">
                                    {subjects.map((subject, index) => (
                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            {getLocalizedSubjectName(subject)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {certifications.length > 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaAward />
                                    {t('common.certificates')}
                                </h2>
                                <div className="space-y-3">
                                    {certifications.map((cert, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                            <h3 className="font-medium text-gray-900">{cert.name}</h3>
                                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {experiences.length > 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaBriefcase />
                                    {t('adminTeacherApplicationDetailsPage.sections.experiences')}
                                </h2>
                                <div className="space-y-4">
                                    {experiences.map((exp, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-gray-900">{exp.title}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{exp.employer}</p>
                                            <p className="text-sm text-gray-500 mb-2">
                                                {exp.start_date} - {exp.still_working ? t('adminTeacherApplicationDetailsPage.present') : exp.end_date}
                                            </p>
                                            {exp.description ? (
                                                <p className="text-sm text-gray-700">{exp.description}</p>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminTeacherApplicationDetailsPage.sections.profileImage')}</h3>
                            {teacher?.image ? (
                                <img
                                    src={teacher.image}
                                    alt={teacher.name}
                                    className="w-32 h-32 rounded-full mx-auto object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto flex items-center justify-center">
                                    <span className="text-2xl font-medium text-gray-600">
                                        {teacher?.name?.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {application.status === 'pending' ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('common.actions')}</h3>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-[#8CA635] transition duration-200">
                                        <FaCheck />
                                        {t('adminTeacherApplicationDetailsPage.actions.approve')}
                                    </button>
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-blue-700 transition duration-200">
                                        <FaClock />
                                        {t('adminTeacherApplicationDetailsPage.actions.markUnderReview')}
                                    </button>
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200">
                                        <FaTimes />
                                        {t('adminTeacherApplicationDetailsPage.actions.reject')}
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminTeacherApplicationDetailsPage.sections.requestDetails')}</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('adminTeacherApplicationDetailsPage.fields.requestNumber')}</label>
                                    <p className="text-sm text-gray-900">#{application.id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t('adminTeacherApplicationDetailsPage.fields.submittedAt')}</label>
                                    <p className="text-sm text-gray-900">{formatDate(application.submitted_at)}</p>
                                </div>
                                {application.reviewed_at ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('adminTeacherApplicationDetailsPage.fields.reviewedAt')}</label>
                                        <p className="text-sm text-gray-900">{formatDate(application.reviewed_at)}</p>
                                    </div>
                                ) : null}
                                {application.reviewer ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('adminTeacherApplicationDetailsPage.fields.reviewedBy')}</label>
                                        <p className="text-sm text-gray-900">{application.reviewer.name}</p>
                                    </div>
                                ) : null}
                                {application.rejection_reason ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('adminTeacherApplicationDetailsPage.fields.rejectionReason')}</label>
                                        <p className="text-sm text-gray-900">{application.rejection_reason}</p>
                                    </div>
                                ) : null}
                                {application.notes ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">{t('adminTeacherApplicationDetailsPage.fields.notes')}</label>
                                        <p className="text-sm text-gray-900">{application.notes}</p>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
