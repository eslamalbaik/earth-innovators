import { useTranslation } from '@/i18n';

export default function StudentWelcomeCard({ userName, onUploadProject }) {
    const { t } = useTranslation();

    return (
        <section className="flex h-full min-h-[140px] flex-col justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-center">
                <div className="text-sm font-bold text-gray-900">
                    {userName
                        ? t('homePage.welcomeTitleWithName', { name: userName })
                        : t('homePage.welcomeTitleWithoutName')}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    {t('homePage.welcomeSubtitle')}
                </div>
                <button
                    type="button"
                    onClick={onUploadProject}
                    className="mt-3 inline-flex items-center justify-center rounded-xl bg-[#A3C042] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8CA635] transition w-40"
                >
                    {t('homePage.uploadProjectButton')}
                </button>
            </div>
        </section>
    );
}


