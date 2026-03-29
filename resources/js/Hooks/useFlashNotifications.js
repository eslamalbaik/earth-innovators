import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';

/**
 * Hook to automatically show toast notifications from Laravel flash messages
 * Non-intrusive popup notifications that don't interrupt user workflow
 */
export function useFlashNotifications() {
    const { flash } = usePage().props;
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const { t } = useTranslation();

    const resolveMessage = (payload) => {
        if (!payload) return null;

        // Strings are returned as-is
        if (typeof payload === 'string') {
            return payload;
        }

        // If Laravel sends arrays of messages
        if (Array.isArray(payload)) {
            return payload.map(resolveMessage).filter(Boolean).join(' ');
        }

        // Objects coming from controllers: { key, params?, message? }
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

            // Fallback: first string-ish value
            const firstString = Object.values(payload).find((val) => typeof val === 'string');
            if (firstString) return firstString;
        }

        return null;
    };

    useEffect(() => {
        const successMessage = resolveMessage(flash?.success);
        if (successMessage) {
            showSuccess(successMessage, {
                autoDismiss: 2500, // Short duration for success messages
                title: null, // No title for simple notifications
            });
        }

        const errorMessage = resolveMessage(flash?.error);
        if (errorMessage) {
            showError(errorMessage, {
                autoDismiss: 4000, // Slightly longer for errors
                title: null,
            });
        }

        const warningMessage = resolveMessage(flash?.warning);
        if (warningMessage) {
            showWarning(warningMessage, {
                autoDismiss: 3000,
                title: null,
            });
        }

        const infoMessage = resolveMessage(flash?.info);
        if (infoMessage) {
            showInfo(infoMessage, {
                autoDismiss: 3000,
                title: null,
            });
        }
    }, [flash, showSuccess, showError, showWarning, showInfo, t]);
}
