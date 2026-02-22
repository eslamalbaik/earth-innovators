import SectionTitle from '../SectionTitle';
import { useTranslation } from '@/i18n';

export default function AboutSection() {
    const { t } = useTranslation();
    
    return (
        <div className="text-center">
            <SectionTitle
                text={t('about.aboutUs')}
                size="2xl"
                align="right"
                className="pb-6"
            />

            <div className="space-y-4 text-gray-800 leading-relaxed">
                <p className="text-lg">
                    {t('about.description1')}
                </p>
                <p className="text-lg">
                    {t('about.description2')}
                </p>
                <p className="text-lg">
                    {t('about.description3')}
                </p>
            </div>
        </div>
    );
}
