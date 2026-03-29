import { Head, useForm } from '@inertiajs/react';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import { useTranslation } from '@/i18n';

export default function StudentChallengeSuggestionCreate({ auth, initialIdea = '' }) {
    const { t, language } = useTranslation();
    const user = auth?.user;
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: initialIdea || '',
        category: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/student/challenge-suggestions');
    };

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('challengeSuggestionsPage.create.pageTitle', { appName: t('common.appName') })} />

            <MobileTopBar
                title={t('challengeSuggestionsPage.create.title')}
                unreadCount={0}
                onNotifications={() => {}}
                onBack="/dashboard"
                reverseOrder={false}
            />

            <main className="mx-auto w-full max-w-5xl px-3 pb-24 pt-5 sm:px-4 lg:px-6">
                <div className="mx-auto w-full max-w-3xl">
                    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h1 className="text-2xl font-bold text-gray-900">{t('challengeSuggestionsPage.create.title')}</h1>
                        <p className="mt-1 text-sm text-gray-600">{t('challengeSuggestionsPage.create.subtitle')}</p>
                    </div>

                    <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="space-y-5">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">
                                    {t('challengeSuggestionsPage.create.fields.title')}
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#A3C042] focus:outline-none"
                                    maxLength={150}
                                />
                                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">
                                    {t('challengeSuggestionsPage.create.fields.category')}
                                </label>
                                <input
                                    type="text"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    placeholder={t('challengeSuggestionsPage.create.fields.categoryPlaceholder')}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#A3C042] focus:outline-none"
                                    maxLength={100}
                                />
                                {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-gray-700">
                                    {t('challengeSuggestionsPage.create.fields.description')}
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={8}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-[#A3C042] focus:outline-none"
                                    maxLength={3000}
                                />
                                {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
                            </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-[#A3C042] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#8CA635] disabled:opacity-60"
                            >
                                {processing ? t('common.saving') : t('challengeSuggestionsPage.create.submit')}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <MobileBottomNav active="home" role={user?.role} isAuthed={!!user} user={user} />
        </div>
    );
}
