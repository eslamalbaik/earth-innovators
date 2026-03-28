import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from '@/i18n';
import resolveLocalizedMessage from '@/utils/resolveLocalizedMessage';

export default function ImportIndex({ auth }) {
    const [files, setFiles] = useState({ students: null, teachers: null, bookings: null });
    const { props } = usePage();
    const { t, language } = useTranslation();

    const submit = (type) => {
        const form = new FormData();
        form.append('file', files[type]);
        router.post(route(`admin.import.${type}`), form);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={t('adminImportPage.pageTitle', { appName: t('common.appName') })} />
            <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
                <h1 className="text-xl font-bold mb-6">{t('adminImportPage.title')}</h1>
                {props.flash?.success && (
                    <div className="mb-4 p-3 rounded bg-green-100 text-green-800">{resolveLocalizedMessage(props.flash.success, language)}</div>
                )}
                {props.flash?.error && (
                    <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{resolveLocalizedMessage(props.flash.error, language)}</div>
                )}
                {props.import_errors && props.import_errors.length > 0 && (
                    <div className="mb-4 p-3 rounded bg-yellow-50 text-yellow-900">
                        <div className="font-semibold mb-2">{t('adminImportPage.importWarningsTitle')}</div>
                        <ul className="list-disc ps-6">
                            {props.import_errors.map((e, i) => (<li key={i}>{e}</li>))}
                        </ul>
                    </div>
                )}
                <div className="space-y-6">
                    {[
                        { key: 'students', label: t('common.students') },
                        { key: 'teachers', label: t('common.teachers') },
                        { key: 'bookings', label: t('adminImportPage.sections.bookings') },
                    ].map(item => (
                        <div key={item.key} className="border rounded p-4">
                            <h2 className="font-semibold mb-2">{item.label}</h2>
                            <input type="file" accept=".csv" onChange={(e) => setFiles({ ...files, [item.key]: e.target.files[0] })} />
                            <button
                                onClick={() => submit(item.key)}
                                disabled={!files[item.key]}
                                className="me-3 px-4 py-2 rounded bg-yellow-600 text-white disabled:opacity-50"
                            >
                                {t('adminImportPage.actions.import')}
                            </button>
                        </div>
                    ))}
                    <div className="mt-8 text-sm text-gray-600">
                        <div className="font-semibold mb-2">{t('adminImportPage.requiredColumnsTitle')}</div>
                        <div className="mb-1">{t('adminImportPage.requiredColumns.students')}</div>
                        <div className="mb-1">{t('adminImportPage.requiredColumns.teachers')}</div>
                        <div className="mb-1">{t('adminImportPage.requiredColumns.bookings')}</div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

