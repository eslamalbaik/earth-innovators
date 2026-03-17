import { useTranslation } from '@/i18n';

export default function ApplicationLogo() {
    const { t } = useTranslation();

    return (
        <img
            src="/images/logo-modified.png"
            alt={t('common.appName')}
            className="h-9 w-auto object-contain"
        />
    );
}
