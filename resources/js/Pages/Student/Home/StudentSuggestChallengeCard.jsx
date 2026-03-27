import { FaLightbulb } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function StudentSuggestChallengeCard({ onSuggest }) {
    const { t } = useTranslation();

    return (
        <section className="bg-[#f8f7e7] rounded-2xl border border-[#d7d39a] p-4">
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/70 border border-[#d7d39a] flex items-center justify-center">
                    <FaLightbulb className="text-[#A3C042]" />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-extrabold text-gray-900">{t('homePage.suggestChallengeTitle')}</div>
                    <div className="mt-1 text-xs text-gray-600">
                        {t('homePage.suggestChallengeDescription')}
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onSuggest}
                className="mt-4 w-40 rounded-xl bg-[#A3C042] py-2 text-sm font-bold text-white hover:bg-[#8CA635] transition"
            >
                {t('homePage.suggestChallengeButton')}
            </button>
        </section>
    );
}


