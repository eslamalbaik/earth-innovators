import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { ToastProvider } from './Contexts/ToastContext';
import { ConfirmProvider } from './Contexts/ConfirmContext';

const appName = import.meta.env.VITE_APP_NAME || 'إرث المبتكرين - Innovators Legacy';

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
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <ConfirmProvider>
                        <App {...props} />
                    </ConfirmProvider>
                </ToastProvider>
            </QueryClientProvider>
        );
    },
    progress: {
        color: '#22c55e', // Green color from logo
    },
});
