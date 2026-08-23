import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaSearch, FaBrain, FaUser, FaChartLine, FaLightbulb, FaSpinner, FaArrowLeft, FaFilter } from 'react-icons/fa';
import ClassificationBadge from '@/Components/Innovation/ClassificationBadge';
import { useTranslation } from '@/i18n';

export default function SmartSearch({ query = '', results = null }) {
    const { t, language } = useTranslation();
    const SAMPLE_QUERIES = [
        t('adminSmartSearchPage.sampleQueries.q1'),
        t('adminSmartSearchPage.sampleQueries.q2'),
        t('adminSmartSearchPage.sampleQueries.q3'),
        t('adminSmartSearchPage.sampleQueries.q4'),
        t('adminSmartSearchPage.sampleQueries.q5'),
    ];
    const [searchQuery, setSearchQuery] = useState(query);
    const [searching, setSearching] = useState(false);

    const handleSearch = (e, customQuery = null) => {
        if (e) e.preventDefault();
        const q = customQuery !== null ? customQuery : searchQuery;
        if (!q.trim() && !customQuery) return;

        setSearching(true);
        router.get(route('admin.innovation.smart-search'), { query: q }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setSearching(false)
        });
    };

    return (
        <DashboardLayout header={t('adminSmartSearchPage.headerTitle')}>
            <Head title={t('adminSmartSearchPage.pageTitle')} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {/* Header Card */}
                <div className="bg-gradient-to-l from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl shrink-0 backdrop-blur-sm">
                            <FaBrain />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black">{t('adminSmartSearchPage.heroTitle')}</h1>
                            <p className="text-white/80 text-xs sm:text-sm mt-1">{t('adminSmartSearchPage.heroSubtitle')}</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={(e) => handleSearch(e)} className="mt-6">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('adminSmartSearchPage.searchPlaceholder')}
                                className="w-full bg-white/95 text-gray-900 placeholder-gray-400 rounded-2xl py-4 pr-12 pl-32 text-sm sm:text-base font-medium shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30 border-0 transition"
                            />
                            <FaSearch className="absolute right-4 text-gray-400 text-lg" />
                            <button
                                type="submit"
                                disabled={searching || !searchQuery.trim()}
                                className="absolute left-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2"
                            >
                                {searching ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        <span>{t('adminSmartSearchPage.searching')}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{t('adminSmartSearchPage.searchButton')}</span>
                                        <FaArrowLeft className="text-xs" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Sample Query Pills */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-white/75 flex items-center gap-1 font-bold">
                            <FaLightbulb className="text-amber-300" /> {t('adminSmartSearchPage.quickSuggestionsLabel')}
                        </span>
                        {SAMPLE_QUERIES.map((sq, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    setSearchQuery(sq);
                                    handleSearch(null, sq);
                                }}
                                className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-sm transition border border-white/10 hover:border-white/30"
                            >
                                {sq}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Section */}
                {results !== null && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <FaFilter className="text-indigo-600 text-sm" />
                                <span>{t('adminSmartSearchPage.resultsForLabel')} "<span className="text-indigo-600">{query}</span>"</span>
                            </h2>
                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                                {t('adminSmartSearchPage.resultsCount', { count: results.length })}
                            </span>
                        </div>

                        {results.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center text-3xl mx-auto mb-4">
                                    <FaSearch />
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1">{t('adminSmartSearchPage.noResultsTitle')}</h3>
                                <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">{t('adminSmartSearchPage.noResultsDescription')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.map((student) => (
                                    <div
                                        key={student.id}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                                        {student.image ? (
                                                            <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                                                                <FaUser />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800 text-sm hover:text-blue-600 transition">
                                                            <Link href={route('admin.innovation.user-profile', student.id)}>
                                                                {student.name}
                                                            </Link>
                                                        </h3>
                                                        <p className="text-xs text-gray-400 truncate max-w-[180px]">{student.institution || t('adminSmartSearchPage.institutionFallback')}</p>
                                                    </div>
                                                </div>
                                                <ClassificationBadge classification={student.classification} size="sm" />
                                            </div>

                                            {/* Score Bar */}
                                            <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center justify-between border border-gray-100/80">
                                                <span className="text-xs text-gray-500 font-medium">{t('adminSmartSearchPage.overallScoreLabel')}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                                                            style={{ width: `${Math.min(100, Math.max(0, student.overall_score))}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-black text-xs text-indigo-700">{Math.round(student.overall_score)}%</span>
                                                </div>
                                            </div>

                                            {/* Skills */}
                                            {student.skills && student.skills.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-[10px] font-bold text-gray-400 mb-1.5">{t('adminSmartSearchPage.skillsLabel')}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {student.skills.slice(0, 5).map((skill, i) => (
                                                            <span key={i} className="bg-indigo-50/70 text-indigo-700 px-2.5 py-0.5 rounded-lg text-[11px] font-medium border border-indigo-100/50">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {student.skills.length > 5 && (
                                                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                                                +{student.skills.length - 5}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-3 border-t border-gray-100 mt-2">
                                            <Link
                                                href={route('admin.innovation.user-profile', student.id)}
                                                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                                            >
                                                <span>{t('adminSmartSearchPage.viewProfileButton')}</span>
                                                <FaArrowLeft className="text-[10px]" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
