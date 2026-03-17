import { useSelector } from 'react-redux';
import { ar } from './ar';
import { en } from './en';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export const translations = {
    ar,
    en,
};

const reportMissingKey = (language, key) => {
    if (typeof window === 'undefined') return;
    if (!window.__i18nMissing) {
        window.__i18nMissing = {
            keys: new Set(),
            entries: [],
        };
    }
    if (!window.__i18nMissing.keys.has(key)) {
        window.__i18nMissing.keys.add(key);
        window.__i18nMissing.entries.push({ language, key, ts: Date.now() });
        // Visible signal during dev without breaking UI
        // eslint-disable-next-line no-console
        console.warn(`[i18n] Missing key "${key}" for language "${language}"`);
    }
};

const interpolate = (value, params) => {
    if (!params || typeof value !== 'string') {
        return value;
    }

    return Object.entries(params).reduce((result, [paramKey, paramValue]) => {
        const safeValue = paramValue === undefined || paramValue === null ? '' : String(paramValue);
        return result.replaceAll(`{${paramKey}}`, safeValue);
    }, value);
};

export const getTranslation = (language, key, params) => {
    const dictionary = translations[language] || translations.ar;

    if (dictionary && Object.prototype.hasOwnProperty.call(dictionary, key)) {
        return interpolate(dictionary[key], params) || key;
    }

    const keys = key.split('.');
    let value = dictionary;
    
    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            reportMissingKey(language, key);
            return key;
        }
    }
    
    if (value === undefined || value === null) {
        reportMissingKey(language, key);
        return key;
    }

    return interpolate(value, params) || key;
};

export const useTranslation = () => {
    const { currentLanguage } = useSelector((state) => state.language);
    
    return {
        t: (key, params) => getTranslation(currentLanguage, key, params),
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
