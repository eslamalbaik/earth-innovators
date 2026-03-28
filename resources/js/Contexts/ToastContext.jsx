import { createContext, useContext, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ToastContainer from '@/Components/Toast/ToastContainer';
import { resolveLocalizedMessage } from '@/utils/resolveLocalizedMessage';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const { currentLanguage } = useSelector((state) => state.language);

    const generateId = () => {
        return `toast-${Date.now()}-${++toastIdCounter}`;
    };

    const addToast = useCallback((toast) => {
        const id = generateId();
        const resolvedMessage = resolveLocalizedMessage(toast.message, currentLanguage);
        const resolvedTitle = toast.title
            ? resolveLocalizedMessage(toast.title, currentLanguage)
            : null;
        const {
            message: _originalMessage,
            title: _originalTitle,
            type,
            autoDismiss,
            ...restToast
        } = toast;
        const newToast = {
            ...restToast,
            id,
            type: type || 'info',
            title: resolvedTitle,
            message: resolvedMessage,
            autoDismiss: autoDismiss ?? 3000, // Default shorter duration (3 seconds instead of 5)
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
    }, [currentLanguage]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const normalizeOptions = useCallback((options) => {
        if (typeof options === 'string') {
            return { type: options };
        }

        return options || {};
    }, []);

    const showToast = useCallback((message, options = {}) => {
        return addToast({
            ...normalizeOptions(options),
            message,
        });
    }, [addToast, normalizeOptions]);

    const showSuccess = useCallback((message, options = {}) => {
        return addToast({
            ...normalizeOptions(options),
            message,
            type: 'success',
        });
    }, [addToast, normalizeOptions]);

    const showError = useCallback((message, options = {}) => {
        return addToast({
            ...normalizeOptions(options),
            message,
            type: 'error',
        });
    }, [addToast, normalizeOptions]);

    const showWarning = useCallback((message, options = {}) => {
        return addToast({
            ...normalizeOptions(options),
            message,
            type: 'warning',
        });
    }, [addToast, normalizeOptions]);

    const showInfo = useCallback((message, options = {}) => {
        return addToast({
            ...normalizeOptions(options),
            message,
            type: 'info',
        });
    }, [addToast, normalizeOptions]);

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
