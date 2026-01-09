import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmDialog from '@/Components/ConfirmDialog';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
    const [confirmState, setConfirmState] = useState({
        show: false,
        title: 'تأكيد الإجراء',
        message: 'هل أنت متأكد من تنفيذ هذا الإجراء؟',
        confirmText: 'تأكيد',
        cancelText: 'إلغاء',
        variant: 'danger',
    });

    const resolveRef = useRef(null);

    const confirm = useCallback((options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfirmState({
                show: true,
                title: options.title || 'تأكيد الإجراء',
                message: options.message || 'هل أنت متأكد من تنفيذ هذا الإجراء؟',
                confirmText: options.confirmText || 'تأكيد',
                cancelText: options.cancelText || 'إلغاء',
                variant: options.variant || 'danger',
            });
        });
    }, []);

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

