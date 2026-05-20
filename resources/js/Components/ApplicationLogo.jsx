import { useTranslation } from '@/i18n';

export default function ApplicationLogo({ className }) {
    const { t } = useTranslation();

    return (
        <img
            src="/images/logo-modified.png"
            alt={t('common.appName')}
            className={className ?? 'h-14 w-auto max-w-[280px] object-contain'}
        />
    );
}
