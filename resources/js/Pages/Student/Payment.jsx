import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n';

export default function Payment() {
    const { flash } = usePage().props;
    const { t } = useTranslation();
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        // Check for error after a short delay to allow redirect to complete
        const timer = setTimeout(() => {
            if (flash?.error) {
                setShowError(true);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [flash]);

    if (showError || flash?.error) {
        return (
            <DashboardLayout header={t('studentPaymentPage.errorHeader')}>
                <Head title={t('studentPaymentPage.errorHeader')} />
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <FaExclamationTriangle className="text-3xl text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{t('studentPaymentPage.errorTitle')}</h2>
                        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-lg space-y-2">
                            <p className="font-semibold">{flash?.error || t('studentPaymentPage.defaultErrorMessage')}</p>
                            {flash?.error && flash.error.includes('Invalid credentials') && (
                                <div className="mt-3 pt-3 border-t border-red-200">
                                    <p className="font-semibold mb-2">{t('studentPaymentPage.fixInstructionsTitle')}</p>
                                    <ol className="list-decimal list-inside space-y-1 text-xs">
                                        <li>
                                            {t('studentPaymentPage.fixSteps.openEnvBefore')}{' '}
                                            <code className="bg-red-100 px-1 rounded">.env</code>{' '}
                                            {t('studentPaymentPage.fixSteps.openEnvAfter')}
                                        </li>
                                        <li>
                                            {t('studentPaymentPage.fixSteps.sandboxBefore')}{' '}
                                            <code className="bg-red-100 px-1 rounded">TAMARA_ENV=sandbox</code>{' '}
                                            {t('studentPaymentPage.fixSteps.sandboxAfter')}
                                        </li>
                                        <li>
                                            {t('studentPaymentPage.fixSteps.apiKeyBefore')}{' '}
                                            <code className="bg-red-100 px-1 rounded">TAMARA_API_KEY</code>{' '}
                                            {t('studentPaymentPage.fixSteps.apiKeyAfter')}
                                        </li>
                                        <li>
                                            {t('studentPaymentPage.fixSteps.clearConfigBefore')}{' '}
                                            <code className="bg-red-100 px-1 rounded">php artisan config:clear</code>
                                        </li>
                                    </ol>
                                </div>
                            )}
                        </div>
                        <div className="pt-4 space-x-4">
                            <Link
                                href="/my-bookings"
                                className="inline-block px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                            >
                                {t('studentPaymentPage.backToBookings')}
                            </Link>
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-block px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                {t('studentPaymentPage.retry')}
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout header={t('studentPaymentPage.redirectHeader')}>
            <Head title={t('studentPaymentPage.redirectHeader')} />
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-4">
                    <FaSpinner className="text-4xl text-yellow-500 animate-spin mx-auto" />
                    <h2 className="text-xl font-bold text-gray-900">{t('studentPaymentPage.redirectTitle')}</h2>
                    <p className="text-sm text-gray-600">
                        {t('studentPaymentPage.redirectDescriptionBefore')}{' '}
                        <Link href="/my-bookings" className="text-yellow-600 underline">
                            {t('studentPaymentPage.backToBookings')}
                        </Link>
                        {' '}{t('studentPaymentPage.redirectDescriptionAfter')}
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}
