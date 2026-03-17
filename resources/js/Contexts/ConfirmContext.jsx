import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { useTranslation } from '@/i18n';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const { t } = useTranslation();
    const [confirmState, setConfirmState] = useState({
        show: false,
        title: t('confirmDialog.title'),
        message: t('confirmDialog.message'),
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
        variant: 'danger',
    });

    const resolveRef = useRef(null);

    const confirm = useCallback((options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfirmState({
                show: true,
                title: options.title || t('confirmDialog.title'),
                message: options.message || t('confirmDialog.message'),
                confirmText: options.confirmText || t('common.confirm'),
                cancelText: options.cancelText || t('common.cancel'),
                variant: options.variant || 'danger',
            });
        });
    }, [t]);

    const handleConfirm = useCallback(() => {
        setConfirmState((prev) => ({ ...prev, show: false }));
        if (resolveRef.current) {
            resolveRef.current(true);
            resolveRef.current = null;
        }
    }, []);

    const handleCancel = useCallback(() => {
        setConfirmState((prev) => ({ ...prev, show: false }));
        if (resolveRef.current) {
            resolveRef.current(false);
            resolveRef.current = null;
        }
    }, []);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmDialog
                show={confirmState.show}
                title={confirmState.title}
                message={confirmState.message}
                confirmText={confirmState.confirmText}
                cancelText={confirmState.cancelText}
                variant={confirmState.variant}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
}

export function useConfirmDialog() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirmDialog must be used within ConfirmProvider');
    }
    return context;
}
