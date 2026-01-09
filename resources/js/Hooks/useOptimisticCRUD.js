import { useState, useCallback, useMemo } from 'react';
import { router, usePage } from '@inertiajs/react';
import { useToast } from '@/Contexts/ToastContext';

/**
 * PERFORMANCE HOOK: Optimistic CRUD operations with instant UI feedback
 * 
 * This hook provides:
 * - Instant UI updates before server confirmation
 * - Partial reloads to prevent full page reloads
 * - Loading states per item
 * - Error handling with rollback
 * 
 * @param {Array} items - The items array from props (e.g., users.data, projects.data)
 * @param {string} resourceName - Resource name for partial reload (e.g., 'users', 'projects')
 * @param {Array} additionalProps - Additional props to reload (e.g., ['stats', 'filters'])
 * @returns {Object} - CRUD handlers and state
 */
export function useOptimisticCRUD(items = [], resourceName, additionalProps = []) {
    // Get toast functions for non-intrusive notifications
    const { showSuccess, showError } = useToast();
    const { flash } = usePage().props;
    
    // Optimistic state: stores local changes before server confirmation
    const [optimisticItems, setOptimisticItems] = useState(null);
    
    // Loading states per item ID
    const [deletingIds, setDeletingIds] = useState(new Set());
    const [updatingId, setUpdatingId] = useState(null);

    // Get current items (optimistic or server data)
    const currentItems = useMemo(() => {
        if (optimisticItems !== null) {
            return optimisticItems;
        }
        return items || [];
    }, [optimisticItems, items]);

    /**
     * Optimistic delete with instant UI feedback
     */
    const handleDelete = useCallback((itemId, deleteRoute, options = {}) => {
        const {
            confirmMessage = 'هل أنت متأكد من الحذف؟',
            onSuccess,
            onError,
            ...routerOptions
        } = options;

        // Note: This hook should be used with useConfirmDialog in the component
        // For now, we'll keep the confirm check but it should be replaced in the component
        // by calling the hook's confirm function before calling handleDelete
        // if (!confirm(confirmMessage)) {
        //     return;
        // }

        // INSTANT UI UPDATE: Remove from local state immediately
        setOptimisticItems((prev) => {
            const current = prev !== null ? prev : items;
            return current.filter((item) => item.id !== itemId);
        });
        
        setDeletingIds((prev) => new Set([...prev, itemId]));

        // Server sync: Use partial reload
        router.delete(deleteRoute, {
            preserveState: true,
            preserveScroll: true,
            only: [resourceName, ...additionalProps], // PARTIAL RELOAD
            ...routerOptions,
            onSuccess: () => {
                setDeletingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(itemId);
                    return next;
                });
                setOptimisticItems(null); // Clear optimistic state, use server data
                
                // Show non-intrusive success notification (short duration for delete)
                const successMessage = flash?.success || 'تم الحذف بنجاح';
                showSuccess(successMessage, {
                    autoDismiss: 2500, // Shorter duration for delete operations
                    title: null, // No title for simple operations
                });
                
                onSuccess?.();
            },
            onError: (errors) => {
                // Revert optimistic update on error
                setOptimisticItems(null);
                setDeletingIds((prev) => {
                    const next = new Set(prev);
                    next.delete(itemId);
                    return next;
                });
                
                // Show error notification
                const errorMessage = flash?.error || errors?.message || 'حدث خطأ أثناء الحذف';
                showError(errorMessage, {
                    autoDismiss: 3000,
                    title: null,
                });
                
                onError?.(errors);
            },
        });
    }, [items, resourceName, additionalProps]);

    /**
     * Optimistic update with instant UI feedback
     */
    const handleUpdate = useCallback((itemId, updateRoute, updateData, options = {}) => {
        const {
            onSuccess,
            onError,
            ...routerOptions
        } = options;

        // INSTANT UI UPDATE: Mark as updating
        setUpdatingId(itemId);

        // Update with partial reload
        router.put(updateRoute, updateData, {
            preserveState: true,
            preserveScroll: true,
            only: [resourceName, ...additionalProps], // PARTIAL RELOAD
            ...routerOptions,
            onSuccess: () => {
                setUpdatingId(null);
                setOptimisticItems(null); // Clear optimistic state
                
                // Show success notification
                const successMessage = flash?.success || 'تم التحديث بنجاح';
                showSuccess(successMessage, {
                    autoDismiss: 2500,
                    title: null,
                });
                
                onSuccess?.();
            },
            onError: (errors) => {
                setUpdatingId(null);
                setOptimisticItems(null);
                
                // Show error notification
                const errorMessage = flash?.error || errors?.message || 'حدث خطأ أثناء التحديث';
                showError(errorMessage, {
                    autoDismiss: 3000,
                    title: null,
                });
                
                onError?.(errors);
            },
        });
    }, [resourceName, additionalProps]);

    /**
     * Optimistic create with instant UI feedback
     */
    const handleCreate = useCallback((createRoute, createData, options = {}) => {
        const {
            onSuccess,
            onError,
            ...routerOptions
        } = options;

        // Create with partial reload
        router.post(createRoute, createData, {
            preserveState: true,
            preserveScroll: true,
            only: [resourceName, ...additionalProps], // PARTIAL RELOAD
            ...routerOptions,
            onSuccess: () => {
                setOptimisticItems(null);
                
                // Show success notification
                const successMessage = flash?.success || 'تم الإنشاء بنجاح';
                showSuccess(successMessage, {
                    autoDismiss: 2500,
                    title: null,
                });
                
                onSuccess?.();
            },
            onError: (errors) => {
                setOptimisticItems(null);
                
                // Show error notification
                const errorMessage = flash?.error || errors?.message || 'حدث خطأ أثناء الإنشاء';
                showError(errorMessage, {
                    autoDismiss: 3000,
                    title: null,
                });
                
                onError?.(errors);
            },
        });
    }, [resourceName, additionalProps]);

    /**
     * Clear optimistic state manually
     */
    const clearOptimisticState = useCallback(() => {
        setOptimisticItems(null);
        setDeletingIds(new Set());
        setUpdatingId(null);
    }, []);

    return {
        // Current items (optimistic or server data)
        items: currentItems,
        
        // Loading states
        deletingIds,
        updatingId,
        isDeleting: (id) => deletingIds.has(id),
        isUpdating: (id) => updatingId === id,
        
        // CRUD handlers
        handleDelete,
        handleUpdate,
        handleCreate,
        clearOptimisticState,
        
        // Direct state setters (for advanced usage)
        setOptimisticItems,
    };
}

