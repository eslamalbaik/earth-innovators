import { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from '@/Components/Toast/ToastContainer';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const generateId = () => {
        return `toast-${Date.now()}-${++toastIdCounter}`;
    };

    const addToast = useCallback((toast) => {
        const id = generateId();
        const newToast = {
            id,
            type: 'info',
            title: null,
            message: '',
            autoDismiss: 5000,
            ...toast,
        };

        // Prevent duplicates based on message and type
        setToasts((prev) => {
            const isDuplicate = prev.some(
                (t) => t.message === newToast.message && t.type === newToast.type
            );
            
            if (isDuplicate) {
                return prev;
            }

            // Queue notifications - add to the end of the array
            return [...prev, newToast];
        });

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((message, options = {}) => {
        return addToast({
            message,
            ...options,
        });
    }, [addToast]);

    const showSuccess = useCallback((message, options = {}) => {
        return addToast({
            message,
            type: 'success',
            ...options,
        });
    }, [addToast]);

    const showError = useCallback((message, options = {}) => {
        return addToast({
            message,
            type: 'error',
            ...options,
        });
    }, [addToast]);

    const showWarning = useCallback((message, options = {}) => {
        return addToast({
            message,
            type: 'warning',
            ...options,
        });
    }, [addToast]);

    const showInfo = useCallback((message, options = {}) => {
        return addToast({
            message,
            type: 'info',
            ...options,
        });
    }, [addToast]);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    const value = {
        toasts,
        addToast,
        removeToast,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        clearAll,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

