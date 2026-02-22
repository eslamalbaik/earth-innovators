import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../store/slices/languageSlice';

export default function LanguageSwitcher({ showText = false }) {
    const dispatch = useDispatch();
    const { currentLanguage } = useSelector((state) => state.language);

    const handleLanguageChange = () => {
        const newLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
        dispatch(setLanguage(newLanguage));
    };

    return (
        <button
            onClick={handleLanguageChange}
            className="flex items-center justify-center h-10 w-10 rounded-xl bg-gray-50 border border-gray-100 rounded-lg text-black text-xs font-bold transition duration-200"
            title={currentLanguage === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
        >
            <span className="min-w-[24px] text-center">
                {currentLanguage === 'ar' ? 'EN' : 'ع'}
            </span>
            {showText && (
                <span className="ms-1.5 hidden lg:inline text-[11px] font-medium">
                    {currentLanguage === 'ar' ? 'English' : 'العربية'}
                </span>
            )}
        </button>
    );
}
