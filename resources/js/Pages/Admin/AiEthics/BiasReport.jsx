import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { FaBalanceScale, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

const CLASSIFICATION_LABELS_AR = {
    diamond: 'ماسي', platinum: 'بلاتيني', gold: 'ذهبي',
    silver: 'فضي', bronze: 'برونزي', developing: 'قيد التطور',
};

export default function BiasReport({ report }) {
    const { t, language } = useTranslation();

    return (
        <DashboardLayout header={t('adminBiasReport.headerTitle')}>
            <Head title={t('adminBiasReport.pageTitle')} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50">
                        <FaBalanceScale className="text-xl text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('adminBiasReport.title')}</h1>
                        <p className="text-sm text-gray-500">{t('adminBiasReport.subtitle')}</p>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500">{t('adminBiasReport.platformAvgScore')}</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{report.platform_avg_score ?? '—'}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500">{t('adminBiasReport.platformFlaggedRate')}</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{report.platform_ai_flagged_rate ?? '—'}%</p>
                    </div>
                </div>

                <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 flex items-start gap-3">
                    <FaInfoCircle className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                        {report.limitations.map((l, i) => <li key={i}>{i === 0 ? t('adminBiasReport.limitations.gender') : t('adminBiasReport.limitations.sampleSize')}</li>)}
                    </ul>
                </div>

                <div className="space-y-4">
                    {report.schools.map((school) => (
                        <div key={school.school_id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="font-bold text-gray-900">{school.school_name}</h3>
                                {school.flags.length > 0 && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                                        <FaExclamationTriangle />
                                        {t('adminBiasReport.needsReview')}
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                <div>
                                    <p className="text-[11px] text-gray-500">{t('adminBiasReport.students')}</p>
                                    <p className="font-bold text-gray-900">{school.student_count}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500">{t('adminBiasReport.avgScore')}</p>
                                    <p className="font-bold text-gray-900">
                                        {school.avg_overall_score ?? '—'}
                                        {school.score_deviation_from_platform !== null && (
                                            <span className={`ms-1 text-xs ${school.score_deviation_from_platform < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                ({school.score_deviation_from_platform > 0 ? '+' : ''}{school.score_deviation_from_platform})
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500">{t('adminBiasReport.achievements')}</p>
                                    <p className="font-bold text-gray-900">{school.total_achievements}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] text-gray-500">{t('adminBiasReport.aiFlaggedRate')}</p>
                                    <p className="font-bold text-gray-900">
                                        {school.ai_flagged_rate ?? '—'}{school.ai_flagged_rate !== null ? '%' : ''}
                                        {school.flagged_rate_deviation_from_platform !== null && (
                                            <span className={`ms-1 text-xs ${school.flagged_rate_deviation_from_platform > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                ({school.flagged_rate_deviation_from_platform > 0 ? '+' : ''}{school.flagged_rate_deviation_from_platform})
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {Object.keys(school.classification_distribution).length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                                    {Object.entries(school.classification_distribution).map(([key, count]) => (
                                        <span key={key} className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                                            {CLASSIFICATION_LABELS_AR[key] || key}: {count}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
