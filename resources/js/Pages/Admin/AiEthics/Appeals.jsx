import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaRobot, FaCheck, FaTimes, FaHourglassHalf } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    reviewing: 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function Appeals({ appeals }) {
    const { t, language } = useTranslation();
    const [notes, setNotes] = useState({});

    const resolve = (id, status) => {
        router.patch(`/admin/ai-appeals/${id}`, {
            status,
            resolution_notes: notes[id] || '',
        }, { preserveScroll: true });
    };

    return (
        <DashboardLayout header={t('adminAiAppeals.headerTitle')}>
            <Head title={t('adminAiAppeals.pageTitle')} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                        <FaRobot className="text-xl text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('adminAiAppeals.title')}</h1>
                        <p className="text-sm text-gray-500">{t('adminAiAppeals.subtitle')}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {appeals.data.length === 0 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
                            {t('adminAiAppeals.empty')}
                        </div>
                    )}

                    {appeals.data.map((appeal) => (
                        <div key={appeal.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <span className="font-bold text-gray-900">{appeal.user?.name}</span>
                                    <span className="mx-2 text-gray-300">•</span>
                                    <span className="text-sm text-gray-500">{appeal.feature}</span>
                                </div>
                                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[appeal.status] || ''}`}>
                                    {t(`adminAiAppeals.status.${appeal.status}`)}
                                </span>
                            </div>

                            <p className="mb-4 whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                                {appeal.reason}
                            </p>

                            {appeal.status === 'pending' || appeal.status === 'reviewing' ? (
                                <div className="space-y-2">
                                    <textarea
                                        rows={2}
                                        value={notes[appeal.id] || ''}
                                        onChange={(e) => setNotes((prev) => ({ ...prev, [appeal.id]: e.target.value }))}
                                        placeholder={t('adminAiAppeals.notesPlaceholder')}
                                        className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-indigo-400 focus:outline-none"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => resolve(appeal.id, 'reviewing')}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                        >
                                            <FaHourglassHalf /> {t('adminAiAppeals.actions.reviewing')}
                                        </button>
                                        <button
                                            onClick={() => resolve(appeal.id, 'resolved')}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
                                        >
                                            <FaCheck /> {t('adminAiAppeals.actions.resolve')}
                                        </button>
                                        <button
                                            onClick={() => resolve(appeal.id, 'rejected')}
                                            className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                                        >
                                            <FaTimes /> {t('adminAiAppeals.actions.reject')}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                appeal.resolution_notes && (
                                    <p className="text-sm text-gray-500">
                                        <strong>{t('adminAiAppeals.resolutionLabel')}:</strong> {appeal.resolution_notes}
                                    </p>
                                )
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
