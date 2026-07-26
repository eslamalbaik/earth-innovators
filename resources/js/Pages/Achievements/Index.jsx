import { Link, router } from '@inertiajs/react';
import StudentPageShell from '@/Components/Innovation/StudentPageShell';
import { useState } from 'react';
import '../../../css/whiteTheme.css';

const TYPE_ICONS = {
    project: '🏗️', research: '🔬', certificate: '📜', skill: '🎯',
    award: '🏅', patent: '💡', article: '📝', product: '📦',
};

const STATUS_STYLES = {
    validated: { bg: 'bg-emerald-100 text-emerald-700', label: '✅ مُتحقق' },
    flagged:   { bg: 'bg-red-100 text-red-700',         label: '⚠️ مُعلّم' },
    pending:   { bg: 'bg-amber-100 text-amber-700',     label: '⏳ قيد التحليل' },
};

export default function AchievementsIndex({ achievements, statistics, types, filters }) {
    const [activeType, setActiveType] = useState(filters.type || '');
    const [activeStatus, setActiveStatus] = useState(filters.status || '');

    const handleFilter = (type, status) => {
        router.get(route('innovation.achievements.index'), {
            type: type || undefined,
            status: status || undefined,
        }, { preserveState: true });
    };

    return (
        <StudentPageShell title="إنجازاتي">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">🏆 إنجازاتي</h1>
                        <p className="text-gray-500 mt-1">إدارة وتتبع جميع إنجازاتك</p>
                    </div>
                    <Link
                        href={route('innovation.achievements.create')}
                        className="px-5 py-2.5 bg-accent text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
                    >
                        + إضافة إنجاز جديد
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-card border-light rounded-2xl p-4 shadow-sm">
                        <p className="text-3xl font-black text-accent">{statistics.total}</p>
                        <p className="text-sm text-gray-500 mt-1">إجمالي الإنجازات</p>
                    </div>
                    <div className="bg-card border-light rounded-2xl p-4 shadow-sm">
                        <p className="text-3xl font-black text-accent">{statistics.validated}</p>
                        <p className="text-sm text-gray-500 mt-1">مُتحقق منها</p>
                    </div>
                    <div className="bg-card border-light rounded-2xl p-4 shadow-sm">
                        <p className="text-3xl font-black text-accent">{statistics.pending}</p>
                        <p className="text-sm text-gray-500 mt-1">قيد التحليل</p>
                    </div>
                    <div className="bg-card border-light rounded-2xl p-4 shadow-sm">
                        <p className="text-3xl font-black text-accent">{statistics.avg_confidence}%</p>
                        <p className="text-sm text-gray-500 mt-1">متوسط الثقة</p>
                    </div>
                </div>

                {/* Type Filters */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => { setActiveType(''); handleFilter('', activeStatus); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            !activeType ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        الكل
                    </button>
                    {Object.entries(types).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => { setActiveType(key); handleFilter(key, activeStatus); }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                activeType === key ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {TYPE_ICONS[key]} {label}
                        </button>
                    ))}
                </div>

                {/* Achievements List */}
                {achievements?.data?.length > 0 ? (
                    <div className="space-y-4">
                        {achievements.data.map((achievement) => {
                            const statusStyle = STATUS_STYLES[achievement.ai_validation_status] || STATUS_STYLES.pending;
                            return (
                                <Link
                                    key={achievement.id}
                                    href={route('innovation.achievements.show', achievement.id)}
                                    className="bg-card border-light rounded-2xl shadow-sm overflow-hidden"
                                >
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-accent-light border border-accent">
                                        <div className="flex items-start gap-4">
                                            <span className="text-3xl mt-1">{TYPE_ICONS[achievement.type] || '📋'}</span>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{achievement.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{achievement.description}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    {achievement.category && (
                                                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium">
                                                            {achievement.category}
                                                        </span>
                                                    )}
                                                    <span className="text-xl">
                                                        {achievement.ai_validation_status === 'validated' ? '✅' :
                                                         achievement.ai_validation_status === 'flagged' ? '⚠️' : '⏳'}
                                                    </span>
                                                    {achievement.attachments?.length > 0 && (
                                                        <span className="text-xs text-gray-400">📎 {achievement.attachments.length} مرفق</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
<span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg}`}>{statusStyle.label}</span>
                                            
                                            {achievement.ai_confidence_score && (
                                                <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                                                    {Math.round(achievement.ai_confidence_score)}%
                                                </span>
                                            )}
                                        </div>
                                    
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md">
                        <span className="text-6xl block mb-4">🎯</span>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">لا توجد إنجازات</h3>
                        <p className="text-gray-500 mb-6">ابدأ بإضافة إنجازاتك لبناء ملفك!</p>
                        <Link
                            href={route('innovation.achievements.create')}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                        >
                            إضافة أول إنجاز
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {achievements?.links && achievements.data?.length > 0 && (
                    <div className="flex justify-center gap-2">
                        {achievements.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-4 py-2 rounded-lg text-sm ${
                                    link.active ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </StudentPageShell>
    );
}
