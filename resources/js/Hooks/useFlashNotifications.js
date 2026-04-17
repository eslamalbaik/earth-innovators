import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';

/**
 * Hook to automatically show toast notifications from Laravel flash messages.
 * Uses a composite key (message + page-url) to deduplicate across navigations
 * while still showing the same message on different pages if needed.
 */
export function useFlashNotifications() {
    const { flash, ziggy } = usePage().props;
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const { t } = useTranslation();

    // Track the last shown message per type WITH its source URL so that:
    // - The same message does NOT appear twice on the same page load.
    // - The same message CAN appear again if the user navigates to a different page.
    const lastShownRef = useRef({
        success: null,
        error: null,
        warning: null,
        info: null,
    });

    const resolveMessage = (payload) => {
        if (!payload) return null;

        // Plain strings
        if (typeof payload === 'string') {
            return payload;
        }

        // Arrays of messages
        if (Array.isArray(payload)) {
            return payload.map(resolveMessage).filter(Boolean).join(' ');
        }

        // Objects: { key, params?, message? }
        if (typeof payload === 'object') {
            if (payload.key) {
                try {
                    return t(payload.key, payload.params || payload.values || {});
                } catch (e) {
                    return payload.message || payload.key;
                }
            }
            if (payload.message) {
                return payload.message;
            }
            // Fallback: first string value
            const firstString = Object.values(payload).find((v) => typeof v === 'string');
            if (firstString) return firstString;
        }

        return null;
    };

    useEffect(() => {
        // Build a fingerprint that is unique per (message + current url)
        const currentUrl = ziggy?.url || window.location.href;

        const check = (type, showFn, message, opts) => {
            if (!message) return;
            const fingerprint = `${currentUrl}||${message}`;
            if (lastShownRef.current[type] === fingerprint) return;
            lastShownRef.current[type] = fingerprint;
            showFn(message, { title: null, ...opts });
        };

        check('success', showSuccess, resolveMessage(flash?.success), { autoDismiss: 2500 });
        check('error',   showError,   resolveMessage(flash?.error),   { autoDismiss: 4000 });
        check('warning', showWarning, resolveMessage(flash?.warning), { autoDismiss: 3000 });
        check('info',    showInfo,    resolveMessage(flash?.info),    { autoDismiss: 3000 });

    }, [flash, ziggy?.url, showSuccess, showError, showWarning, showInfo, t]);
}
