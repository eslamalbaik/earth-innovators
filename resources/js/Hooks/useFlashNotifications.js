import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';

/**
 * Hook to automatically show toast notifications from Laravel flash messages
 * Non-intrusive popup notifications that don't interrupt user workflow
 */
export function useFlashNotifications() {
    const { flash } = usePage().props;
    const { showSuccess, showError, showWarning, showInfo } = useToast();

    useEffect(() => {
        if (flash?.success) {
            showSuccess(flash.success, {
                autoDismiss: 2500, // Short duration for success messages
                title: null, // No title for simple notifications
            });
        }

        if (flash?.error) {
            showError(flash.error, {
                autoDismiss: 4000, // Slightly longer for errors
                title: null,
            });
        }

        if (flash?.warning) {
            showWarning(flash.warning, {
                autoDismiss: 3000,
                title: null,
            });
        }

        if (flash?.info) {
            showInfo(flash.info, {
                autoDismiss: 3000,
                title: null,
            });
        }
    }, [flash, showSuccess, showError, showWarning, showInfo]);
}

