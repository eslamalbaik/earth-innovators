import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaShieldAlt, FaCheck, FaTimes, FaHourglassHalf, FaDownload, FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-gray-100 text-gray-600 border-gray-200',
};

const TYPE_ICONS = { access: FaDownload, correction: FaEdit, deletion: FaTrashAlt };

export default function DataRequests({ requests }) {
    const { t, language } = useTranslation();
    const [notes, setNotes] = useState({});

    const resolve = (id, status) => {
        router.patch(`/admin/data-requests/${id}`, {
            status,
            resolution_notes: notes[id] || '',
        }, { preserveScroll: true });
    };

    return (
        <DashboardLayout header={t('adminDataRequests.headerTitle')}>
            <Head title={t('adminDataRequests.pageTitle')} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                        <FaShieldAlt className="text-xl text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{t('adminDataRequests.title')}</h1>
                        <p className="text-sm text-gray-500">{t('adminDataRequests.subtitle')}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {requests.data.length === 0 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-gray-500">
                            {t('adminDataRequests.empty')}
                        </div>
                    )}

                    {requests.data.map((r) => {
                        const Icon = TYPE_ICONS[r.type];
                        return (
                            <div key={r.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Icon className="text-gray-400" />
                                        <span className="font-bold text-gray-900">{r.user?.name}</span>
                                        <span className="mx-1 text-gray-300">•</span>
                                        <span className="text-sm text-gray-500">{t(`adminDataRequests.types.${r.type}`)}</span>
                                    </div>
                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[r.status] || ''}`}>
                                        {t(`adminDataRequests.status.${r.status}`)}
                                    </span>
                                </div>

                                {r.details && (
                                    <p className="mb-4 whitespace-pre-wrap rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
                                        {r.details}
                                    </p>
                                )}

                                {r.status === 'pending' || r.status === 'processing' ? (
                                    <div className="space-y-2">
                                        <textarea
                                            rows={2}
                                            value={notes[r.id] || ''}
                                            onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                                            placeholder={t('adminDataRequests.notesPlaceholder')}
                                            className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:border-indigo-400 focus:outline-none"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => resolve(r.id, 'processing')}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                            >
                                                <FaHourglassHalf /> {t('adminDataRequests.actions.processing')}
                                            </button>
                                            <button
                                                onClick={() => resolve(r.id, 'completed')}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-100"
                                            >
                                                <FaCheck /> {t('adminDataRequests.actions.complete')}
                                            </button>
                                            <button
                                                onClick={() => resolve(r.id, 'rejected')}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200"
                                            >
                                                <FaTimes /> {t('adminDataRequests.actions.reject')}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    r.resolution_notes && (
                                        <p className="text-sm text-gray-500">
                                            <strong>{t('adminDataRequests.resolutionLabel')}:</strong> {r.resolution_notes}
                                        </p>
                                    )
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
