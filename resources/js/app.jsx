import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { ToastProvider } from './Contexts/ToastContext';
import { ConfirmProvider } from './Contexts/ConfirmContext';
import store from './store/store';
import { getTranslation } from './i18n';

const getStoredLanguage = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('language');
        const lang = stored || 'ar';
        const dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.dir = dir;
        document.documentElement.lang = lang;
        // Sync cookie so the next Inertia request uses the same locale for server-rendered strings
        document.cookie = `locale=${lang};path=/;max-age=31536000;SameSite=Lax`;
        return lang;
    }
    return 'ar';
};

const currentLanguage = getStoredLanguage();

const appName = import.meta.env.VITE_APP_NAME || getTranslation(currentLanguage, 'common.appName');

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ToastProvider>
                        <ConfirmProvider>
                            <App {...props} />
                        </ConfirmProvider>
                    </ToastProvider>
                </QueryClientProvider>
            </Provider>
        );
    },
    progress: {
        color: '#22c55e',
    },
});
