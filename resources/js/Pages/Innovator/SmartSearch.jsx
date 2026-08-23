import { useForm } from '@inertiajs/react';
import StudentPageShell from '@/Components/Innovation/StudentPageShell';
import ClassificationBadge from '@/Components/Innovation/ClassificationBadge';
import { useTranslation } from '@/i18n';

export default function SmartSearch({ searchResults = null, query = '' }) {
    const { t } = useTranslation();
    const { data, setData, post, processing } = useForm({ query: query || '' });

    const CLASSIFICATION_DETAILS = {
        diamond:    { label: t('innovation.smartSearch.levels.diamond') || 'Diamond',    color: '#b9f2ff', icon: '💎' },
        platinum:   { label: t('innovation.smartSearch.levels.platinum') || 'Platinum', color: '#e5e4e2', icon: '🏆' },
        gold:       { label: t('innovation.smartSearch.levels.gold') || 'Gold',    color: '#ffd700', icon: '🥇' },
        silver:     { label: t('innovation.smartSearch.levels.silver') || 'Silver',     color: '#c0c0c0', icon: '🥈' },
        bronze:     { label: t('innovation.smartSearch.levels.bronze') || 'Bronze',  color: '#cd7f32', icon: '🥉' },
        developing: { label: t('innovation.smartSearch.levels.developing') || 'Developing',     color: '#90ee90', icon: '🌱' },
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!data.query.trim()) return;
        post(route('innovation.smart-search'));
    };

    const results = searchResults?.results || [];

    return (
        <StudentPageShell title={t('innovation.smartSearch.pageTitle')}>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('innovation.smartSearch.title')}</h1>
                    <p className="text-gray-500 mt-1">
                        {t('innovation.smartSearch.subtitle')}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={data.query}
                        onChange={(e) => setData('query', e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={t('innovation.smartSearch.placeholder')}
                    />
                    <button
                        type="submit"
                        disabled={processing || !data.query.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-md disabled:opacity-50"
                    >
                        {processing ? t('innovation.smartSearch.searching') : t('innovation.smartSearch.search')}
                    </button>
                </form>

                {searchResults?.message && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                        {searchResults.message}
                    </div>
                )}

                {results.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">
                            {t('innovation.smartSearch.results', { total: searchResults.total })}
                        </p>
                        {results.map((user) => (
                            <div key={user.id} className="bg-white rounded-2xl p-5 shadow-md border border-gray-100">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{user.name}</h3>
                                        {user.institution && (
                                            <p className="text-xs text-gray-400 mt-0.5">🏫 {user.institution}</p>
                                        )}
                                        {user.skills?.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {user.skills.slice(0, 6).map((skill, i) => (
                                                    <span key={i} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <ClassificationBadge
                                            details={CLASSIFICATION_DETAILS[user.classification] || CLASSIFICATION_DETAILS.developing}
                                            size="sm"
                                        />
                                        <span className="text-xl font-black text-gray-700">{Math.round(user.overall_score)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {searchResults && !searchResults.message && results.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                        <span className="text-5xl block mb-3">🔍</span>
                        <p className="text-gray-500">{t('innovation.smartSearch.noResults')}</p>
                    </div>
                )}
            </div>
        </StudentPageShell>
    );
}
