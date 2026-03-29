import { createSlice } from '@reduxjs/toolkit';

const getStoredLanguage = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('language');
        return stored || 'ar';
    }
    return 'ar';
};

const initialState = {
    currentLanguage: getStoredLanguage(),
    dir: getStoredLanguage() === 'ar' ? 'rtl' : 'ltr',
};

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action) => {
            const language = action.payload;
            state.currentLanguage = language;
            state.dir = language === 'ar' ? 'rtl' : 'ltr';
            if (typeof window !== 'undefined') {
                localStorage.setItem('language', language);
                document.documentElement.dir = state.dir;
                document.documentElement.lang = language;
                // Laravel SetLocale middleware reads this cookie for trans() / __() on the server
                document.cookie = `locale=${language};path=/;max-age=31536000;SameSite=Lax`;
            }
        },
    },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
