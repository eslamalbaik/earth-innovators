import { useSelector } from 'react-redux';
import { ar } from './ar';
import { en } from './en';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export const translations = {
    ar,
    en,
};

export const getTranslation = (language, key) => {
    const keys = key.split('.');
    let value = translations[language] || translations.ar;
    
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key;
        }
    }
    
    return value || key;
};

export const useTranslation = () => {
    const { currentLanguage } = useSelector((state) => state.language);
    
    return {
        t: (key) => getTranslation(currentLanguage, key),
        language: currentLanguage,
    };
};

export const useDir = () => {
    const { dir } = useSelector((state) => state.language);
    return dir;
};

export const useArrowDirection = () => {
    const { currentLanguage } = useSelector((state) => state.language);
    return currentLanguage === 'ar' ? FaArrowRight : FaArrowLeft;
};

export const useBackIcon = () => {
    const { currentLanguage } = useSelector((state) => state.language);
    return currentLanguage === 'ar' ? FaArrowRight : FaArrowLeft;
};

export const useForwardIcon = () => {
    const { currentLanguage } = useSelector((state) => state.language);
    return currentLanguage === 'ar' ? FaArrowRight : FaArrowLeft;
};

export { ar, en };
