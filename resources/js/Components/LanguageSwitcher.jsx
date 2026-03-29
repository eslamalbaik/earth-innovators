import { router } from '@inertiajs/react';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../store/slices/languageSlice';
import { useTranslation } from '@/i18n';

export default function LanguageSwitcher({ showText = false }) {
    const dispatch = useDispatch();
    const { currentLanguage } = useSelector((state) => state.language);
    const { t } = useTranslation();
    const isArabic = currentLanguage === 'ar';

    const handleLanguageChange = () => {
        const newLanguage = isArabic ? 'en' : 'ar';
        dispatch(setLanguage(newLanguage));
        // Reload so Laravel trans() / Inertia props match the new locale (cookie set in setLanguage)
        router.reload({ preserveScroll: true });
    };

    return (
        <button
            onClick={handleLanguageChange}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 rounded-lg text-black text-xs font-bold transition duration-200"
            title={isArabic ? t('language.switchToEnglishTitle') : t('language.switchToArabicTitle')}
        >
            <span className="min-w-[24px] text-center">
                {isArabic ? t('language.switchToEnglishShort') : t('language.switchToArabicShort')}
            </span>
            {showText && (
                <span className="ms-1.5 hidden lg:inline text-[11px] font-medium">
                    {isArabic ? t('language.switchToEnglish') : t('language.switchToArabic')}
                </span>
            )}
        </button>
    );
}
