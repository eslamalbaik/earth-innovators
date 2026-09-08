import { Head, useForm } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import { FaShieldAlt, FaDownload, FaEdit, FaTrashAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
import { router } from '@inertiajs/react';
import { useTranslation } from '@/i18n';

const TYPE_ICONS = { access: FaDownload, correction: FaEdit, deletion: FaTrashAlt };

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function MyData({ auth, requests, consentAt }) {
    const { t, language } = useTranslation();
    const isArabic = language === 'ar';
    const user = auth?.user || null;

    const { data, setData, post, processing, reset } = useForm({
        type: 'access',
        details: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/privacy/my-data', {
            preserveScroll: true,
            onSuccess: () => reset('details'),
        });
    };

    const Content = () => (
        <div className="max-w-3xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{t('myDataPage.title')}</h1>
                <p className="text-gray-500 mt-1">{t('myDataPage.subtitle')}</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <FaShieldAlt className="text-[#A3C042]" />
                    <h2 className="font-bold text-gray-900">{t('myDataPage.consentTitle')}</h2>
                </div>
                <p className="text-sm text-gray-600">
                    {consentAt
                        ? t('myDataPage.consentGiven', { date: new Date(consentAt).toLocaleDateString(isArabic ? 'ar' : 'en') })
                        : t('myDataPage.consentMissing')}
                </p>
            </div>

            <form onSubmit={submit} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-900">{t('myDataPage.formTitle')}</h2>
                <div className="grid grid-cols-3 gap-2">
                    {['access', 'correction', 'deletion'].map((type) => {
                        const Icon = TYPE_ICONS[type];
                        return (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setData('type', type)}
                                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition ${
                                    data.type === type ? 'border-[#A3C042] bg-[#A3C042]/10 text-[#8CA635]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                <Icon />
                                {t(`myDataPage.types.${type}`)}
                            </button>
                        );
                    })}
                </div>
                <textarea
                    value={data.details}
                    onChange={(e) => setData('details', e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder={t('myDataPage.detailsPlaceholder')}
                    className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-[#A3C042] focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-xl bg-[#A3C042] py-2.5 text-sm font-bold text-white transition hover:bg-[#8CA635] disabled:opacity-60"
                >
                    {t('myDataPage.submit')}
                </button>
            </form>

            <div className="space-y-3">
                <h2 className="font-bold text-gray-900">{t('myDataPage.historyTitle')}</h2>
                {requests.length === 0 && (
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-gray-400 text-sm">
                        {t('myDataPage.empty')}
                    </div>
                )}
                {requests.map((r) => {
                    const Icon = TYPE_ICONS[r.type];
                    return (
                        <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <Icon className="text-gray-400" />
                                    {t(`myDataPage.types.${r.type}`)}
                                </div>
                                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[r.status]}`}>
                                    {t(`myDataPage.status.${r.status}`)}
                                </span>
                            </div>
                            {r.details && <p className="text-xs text-gray-500 mb-1">{r.details}</p>}
                            {r.resolution_notes && (
                                <p className="text-xs text-gray-500">
                                    <strong>{t('myDataPage.resolutionLabel')}:</strong> {r.resolution_notes}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('myDataPage.title')} />
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('myDataPage.title')}
                    activeNav="explore"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                >
                    <Content />
                </MobileAppLayout>
            </div>
            <div className="hidden md:block">
                <MobileTopBar
                    title={t('myDataPage.title')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-7xl px-6 pb-24 pt-8">
                    <Content />
                </main>
                <MobileBottomNav active="explore" role={user?.role} isAuthed={!!user} user={user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}
