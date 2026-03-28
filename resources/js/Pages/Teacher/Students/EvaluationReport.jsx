import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { FaChartBar, FaInfoCircle } from 'react-icons/fa';

export default function EvaluationReport({ report, source }) {
    const { t, language } = useTranslation();
    const [selectedSource, setSelectedSource] = useState(source || 'projects');

    const categoryKeyMap = {
        outstanding: 'outstanding',
        excellent: 'excellent',
        average: 'average',
        follow_up: 'followUp',
    };

    const handleSourceChange = (newSource) => {
        setSelectedSource(newSource);
        router.get(route('teacher.students.evaluation-report'), { source: newSource }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getColorClasses = (color) => {
        const colors = {
            green: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-800',
                badge: 'bg-green-100 text-green-700',
            },
            blue: {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-800',
                badge: 'bg-blue-100 text-blue-700',
            },
            yellow: {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                text: 'text-yellow-800',
                badge: 'bg-yellow-100 text-yellow-700',
            },
            red: {
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-800',
                badge: 'bg-red-100 text-red-700',
            },
        };

        return colors[color] || colors.gray;
    };

    const getCategoryText = (category, field) => {
        const categoryKey = categoryKeyMap[category?.id];

        if (categoryKey) {
            const translated = t(`studentEvaluationReportPage.categories.${categoryKey}.${field}`);
            if (translated !== `studentEvaluationReportPage.categories.${categoryKey}.${field}`) {
                return translated;
            }
        }

        if (field === 'title') {
            return language === 'en' ? (category?.name_en || category?.name) : (category?.name || category?.name_en);
        }

        if (field === 'action') {
            return language === 'en' ? (category?.action_en || category?.action) : (category?.action || category?.action_en);
        }

        return category?.[field] || '';
    };

    return (
        <DashboardLayout header={t('studentEvaluationReportPage.title')}>
            <Head title={t('studentEvaluationReportPage.pageTitle', { appName: t('common.appName') })} />

            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <FaChartBar className="text-[#A3C042]" />
                                {t('studentEvaluationReportPage.title')}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {t('studentEvaluationReportPage.totalStudents', { count: report.total_students || 0 })}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSourceChange('projects')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    selectedSource === 'projects'
                                        ? 'bg-[#A3C042] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {t('studentEvaluationReportPage.sources.projects')}
                            </button>
                            <button
                                onClick={() => handleSourceChange('challenges')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    selectedSource === 'challenges'
                                        ? 'bg-[#A3C042] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {t('studentEvaluationReportPage.sources.challenges')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {report.categories?.map((categoryData) => {
                        const colorClasses = getColorClasses(categoryData.category.color);

                        return (
                            <div
                                key={categoryData.category.id}
                                className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-xl p-4`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl">{categoryData.category.icon}</span>
                                    <span className={`${colorClasses.badge} px-3 py-1 rounded-full text-sm font-semibold`}>
                                        {categoryData.count}
                                    </span>
                                </div>
                                <h3 className={`${colorClasses.text} font-bold text-lg mb-1`}>
                                    {getCategoryText(categoryData.category, 'title')}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {getCategoryText(categoryData.category, 'range')}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {report.categories?.map((categoryData) => {
                    const colorClasses = getColorClasses(categoryData.category.color);
                    if (categoryData.count === 0) return null;

                    return (
                        <div
                            key={categoryData.category.id}
                            className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${colorClasses.border}`}
                        >
                            <div className={`${colorClasses.bg} px-6 py-4 border-b ${colorClasses.border}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{categoryData.category.icon}</span>
                                        <div>
                                            <h3 className={`${colorClasses.text} font-bold text-xl`}>
                                                {getCategoryText(categoryData.category, 'title')} ({getCategoryText(categoryData.category, 'range')})
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {t('studentEvaluationReportPage.studentsCount', { count: categoryData.count })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-700">{t('studentEvaluationReportPage.labels.level')}</span>
                                        <p className="text-gray-600 mt-1">{getCategoryText(categoryData.category, 'level')}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">{t('studentEvaluationReportPage.labels.skill')}</span>
                                        <p className="text-gray-600 mt-1">{getCategoryText(categoryData.category, 'skill')}</p>
                                    </div>
                                    <div>
                                        <span className="font-semibold text-gray-700">{t('studentEvaluationReportPage.labels.requiredAction')}</span>
                                        <p className="text-gray-600 mt-1">{getCategoryText(categoryData.category, 'action')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                {t('studentEvaluationReportPage.table.name')}
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                {t('studentEvaluationReportPage.table.email')}
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                {t('studentEvaluationReportPage.table.score')}
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                                {t('studentEvaluationReportPage.table.requiredAction')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {categoryData.students.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{student.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`${colorClasses.badge} px-3 py-1 rounded-full text-sm font-semibold`}>
                                                        {student.score}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-600">
                                                        {getCategoryText(categoryData.category, 'action')}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}

                {report.total_students === 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <FaInfoCircle className="mx-auto text-gray-400 text-5xl mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {t('studentEvaluationReportPage.empty.title')}
                        </h3>
                        <p className="text-gray-500">
                            {t(
                                selectedSource === 'projects'
                                    ? 'studentEvaluationReportPage.empty.projects'
                                    : 'studentEvaluationReportPage.empty.challenges',
                            )}
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
