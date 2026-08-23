import { useForm, router } from '@inertiajs/react';
import StudentPageShell from '@/Components/Innovation/StudentPageShell';
import { useTranslation } from '@/i18n';

const TYPE_ICONS = {
    project: '🏗️', research: '🔬', certificate: '📜', skill: '🎯',
    award: '🏅', patent: '💡', article: '📝', product: '📦',
};

export default function AchievementEdit({ achievement, types }) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors } = useForm({
        title: achievement.title || '',
        description: achievement.description || '',
        type: achievement.type || 'project',
        category: achievement.category || '',
        date: achievement.date || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('innovation.achievements.update', achievement.id));
    };

    const handleDelete = () => {
        if (confirm(t('achievements.edit.confirmDelete'))) {
            router.delete(route('innovation.achievements.destroy', achievement.id));
        }
    };

    return (
        <StudentPageShell title={t('achievements.edit.pageTitle')} backHref={`/innovation/achievements/${achievement.id}`}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{t('achievements.edit.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('achievements.edit.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Type Selection */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-3">{t('achievements.edit.typeLabel')}</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {Object.entries(types).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setData('type', key)}
                                    className={`p-3 rounded-xl text-center transition-all border-2 ${
                                        data.type === key
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                                            : 'border-gray-200 hover:border-indigo-300 text-gray-600'
                                    }`}
                                >
                                    <span className="text-2xl block mb-1">{TYPE_ICONS[key] || '📦'}</span>
                                    <span className="text-xs font-medium">{t(`achievements.types.${key}`)}</span>
                                </button>
                            ))}
                        </div>
                        {errors.type && <p className="text-red-500 text-sm mt-2">{errors.type}</p>}
                    </div>

                    {/* Title & Description */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('achievements.edit.titleLabel')}</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">{t('achievements.edit.descriptionLabel')}</label>
                            <textarea
                                value={data.description}
                                onChange={e => setData('description', e.target.value)}
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('achievements.edit.categoryLabel')}</label>
                                <input
                                    type="text"
                                    value={data.category}
                                    onChange={e => setData('category', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                    placeholder={t('achievements.edit.categoryPlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('achievements.edit.dateLabel')}</label>
                                <input
                                    type="date"
                                    value={data.date || ''}
                                    onChange={e => setData('date', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Existing attachments (read-only) */}
                    {achievement.attachments?.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                            <label className="block text-sm font-bold text-gray-700 mb-3">{t('achievements.edit.currentAttachments')}</label>
                            <div className="space-y-2">
                                {achievement.attachments.map((att) => (
                                    <div key={att.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                                        <span className="text-lg">
                                            {att.file_type === 'pdf' ? '📄' : att.file_type === 'image' ? '🖼️' :
                                             att.file_type === 'video' ? '🎬' : att.file_type === 'url' ? '🔗' : '📁'}
                                        </span>
                                        <span className="text-sm text-gray-700 truncate">
                                            {att.original_name || att.url || t('achievements.show.attachmentFallback')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit + Delete */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                            {processing ? t('achievements.edit.saving') : t('achievements.edit.saveChanges')}
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold transition-colors border border-red-200"
                        >
                            {t('achievements.edit.delete')}
                        </button>
                    </div>
                </form>
            </div>
        </StudentPageShell>
    );
}
