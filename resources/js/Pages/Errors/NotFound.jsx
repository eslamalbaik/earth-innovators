import { Head, Link } from '@inertiajs/react';
import { FaHome, FaArrowLeft } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import MainLayout from '@/Layouts/MainLayout';
import { useTranslation } from '@/i18n';

export default function NotFound({ auth, requestedPath = null }) {
    const { dir } = useSelector((state) => state.language);
    const { t } = useTranslation();

    // A missing route never reaches the web middleware group, so Inertia's
    // shared props are not available here — auth may legitimately be undefined.
    // MainLayout already guards on auth?.user, so passing it through is safe.
    return (
        <MainLayout auth={auth}>
            <Head title={t('errors.notFound.title')} />

            <div className="flex-1 flex items-center justify-center px-4 py-20" dir={dir}>
                <div className="max-w-lg w-full text-center">
                    <div className="text-[#A3C042] font-black leading-none select-none text-8xl sm:text-9xl">
                        404
                    </div>

                    <h1 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
                        {t('errors.notFound.heading')}
                    </h1>

                    <p className="mt-3 text-gray-600 leading-relaxed">
                        {t('errors.notFound.message')}
                    </p>

                    {requestedPath && (
                        <p
                            className="mt-4 inline-block max-w-full truncate rounded-lg bg-gray-100 px-3 py-1.5 font-mono text-sm text-gray-500"
                            dir="ltr"
                        >
                            {requestedPath}
                        </p>
                    )}

                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3C042] text-white rounded-xl font-semibold hover:bg-[#8FA838] transition-colors"
                        >
                            <FaHome />
                            {t('errors.notFound.goHome')}
                        </Link>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                        >
                            <FaArrowLeft className={dir === 'rtl' ? 'rotate-180' : ''} />
                            {t('errors.notFound.goBack')}
                        </button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
