import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { useToast } from '@/Contexts/ToastContext';

const STATUS_KEYS = ['pending', 'under_review', 'approved', 'rejected'];

function StatusBadge({ status, t }) {
    const classes = {
        pending: 'bg-amber-100 text-amber-800 border-amber-200',
        under_review: 'bg-blue-100 text-blue-800 border-blue-200',
        approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        rejected: 'bg-rose-100 text-rose-800 border-rose-200',
    };

    return (
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[status] || classes.pending}`}>
            {t(`challengeSuggestionsPage.statuses.${status}`)}
        </span>
    );
}

export default function ChallengeSuggestionsManagement({
    suggestions,
    stats,
    filters,
    listRoute,
    updateStatusPrefix,
    showSchool = false,
    showNoSchoolWarning = false,
}) {
    const { t, language } = useTranslation();
    const { showSuccess, showError } = useToast();
    const [notes, setNotes] = useState({});
    const selectedStatus = filters?.status || '';

    const handleFilter = (status) => {
        router.get(
            listRoute,
            { status: status || undefined },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleStatusUpdate = (id, status) => {
        router.patch(
            `${updateStatusPrefix}/${id}/status`,
            {
                status,
                review_notes: notes[id] || '',
            },
            {
                preserveScroll: true,
                onSuccess: () => showSuccess(t('challengeSuggestionsPage.toasts.statusUpdated')),
                onError: () => showError(t('challengeSuggestionsPage.toasts.statusUpdateFailed')),
            }
        );
    };

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
            {showNoSchoolWarning && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {t('challengeSuggestionsPage.noSchoolLinked')}
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">{t('challengeSuggestionsPage.stats.total')}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs text-amber-700">{t('challengeSuggestionsPage.stats.pending')}</p>
                    <p className="mt-1 text-2xl font-bold text-amber-800">{stats?.pending || 0}</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs text-blue-700">{t('challengeSuggestionsPage.stats.underReview')}</p>
                    <p className="mt-1 text-2xl font-bold text-blue-800">{stats?.under_review || 0}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs text-emerald-700">{t('challengeSuggestionsPage.stats.approved')}</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-800">{stats?.approved || 0}</p>
                </div>
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-xs text-rose-700">{t('challengeSuggestionsPage.stats.rejected')}</p>
                    <p className="mt-1 text-2xl font-bold text-rose-800">{stats?.rejected || 0}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => handleFilter('')}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold ${!selectedStatus ? 'bg-[#A3C042] text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                >
                    {t('common.all')}
                </button>
                {STATUS_KEYS.map((statusKey) => (
                    <button
                        key={statusKey}
                        type="button"
                        onClick={() => handleFilter(statusKey)}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold ${selectedStatus === statusKey ? 'bg-[#A3C042] text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                    >
                        {t(`challengeSuggestionsPage.statuses.${statusKey}`)}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('challengeSuggestionsPage.table.title')}</th>
                                <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('challengeSuggestionsPage.table.student')}</th>
                                {showSchool && (
                                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('challengeSuggestionsPage.table.school')}</th>
                                )}
                                <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('challengeSuggestionsPage.table.category')}</th>
                                <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('common.status')}</th>
                                <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('challengeSuggestionsPage.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(suggestions?.data || []).length === 0 && (
                                <tr>
                                    <td colSpan={showSchool ? 6 : 5} className="px-4 py-8 text-center text-sm text-gray-500">
                                        {t('challengeSuggestionsPage.empty')}
                                    </td>
                                </tr>
                            )}
                            {(suggestions?.data || []).map((item) => (
                                <tr key={item.id} className="align-top">
                                    <td className="px-4 py-4">
                                        <p className="font-semibold text-gray-900">{item.title}</p>
                                        <p className="mt-1 text-xs text-gray-600 line-clamp-2">{item.description}</p>
                                        <p className="mt-1 text-[11px] text-gray-400">{item.created_at}</p>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-gray-700">
                                        <p>{item.student?.name || t('common.notAvailable')}</p>
                                        <p className="text-xs text-gray-500">{item.student?.email || ''}</p>
                                    </td>
                                    {showSchool && (
                                        <td className="px-4 py-4 text-sm text-gray-700">{item.school?.name || t('common.notAvailable')}</td>
                                    )}
                                    <td className="px-4 py-4 text-sm text-gray-700">{item.category || t('common.notAvailable')}</td>
                                    <td className="px-4 py-4">
                                        <StatusBadge status={item.status} t={t} />
                                    </td>
                                    <td className="px-4 py-4">
                                        <textarea
                                            value={notes[item.id] || item.review_notes || ''}
                                            onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                                            rows={2}
                                            placeholder={t('challengeSuggestionsPage.table.reviewNotesPlaceholder')}
                                            className="mb-2 w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs focus:border-[#A3C042] focus:outline-none"
                                        />
                                        <div className="flex flex-wrap gap-1">
                                            <button type="button" onClick={() => handleStatusUpdate(item.id, 'under_review')} className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                                {t('challengeSuggestionsPage.actions.markUnderReview')}
                                            </button>
                                            <button type="button" onClick={() => handleStatusUpdate(item.id, 'approved')} className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                                                {t('challengeSuggestionsPage.actions.approve')}
                                            </button>
                                            <button type="button" onClick={() => handleStatusUpdate(item.id, 'rejected')} className="rounded bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-800">
                                                {t('challengeSuggestionsPage.actions.reject')}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {suggestions?.links && suggestions.links.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-2 border-t border-gray-100 p-4">
                        {suggestions.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`rounded-lg px-3 py-1.5 text-sm ${link.active ? 'bg-[#A3C042] text-white' : 'bg-gray-50 text-gray-700'} ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
