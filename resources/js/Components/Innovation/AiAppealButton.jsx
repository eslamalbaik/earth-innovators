import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function AiAppealButton({ feature, subjectType = null, subjectId = null, className = '' }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, reset, errors } = useForm({
        feature,
        subject_type: subjectType,
        subject_id: subjectId,
        reason: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/ai-appeals', {
            preserveScroll: true,
            onSuccess: () => {
                reset('reason');
                setOpen(false);
            },
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 ${className}`}
            >
                <FaExclamationTriangle className="text-amber-500" />
                {t('common.aiAppealAction')}
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">{t('common.aiAppealTitle')}</h3>
                            <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <textarea
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                rows={4}
                                minLength={10}
                                maxLength={2000}
                                required
                                placeholder={t('common.aiAppealPlaceholder')}
                                className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-indigo-400 focus:outline-none"
                            />
                            {errors.reason && <p className="text-xs text-red-600">{errors.reason}</p>}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-60"
                            >
                                {t('common.aiAppealSubmit')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
