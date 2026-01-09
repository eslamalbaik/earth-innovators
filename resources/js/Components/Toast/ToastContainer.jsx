import Toast from './Toast';

const ToastContainer = ({ toasts, onRemove }) => {
    // Limit to 3 toasts max to prevent clutter
    const visibleToasts = toasts.slice(-3);
    
    return (
        <div
            className="fixed top-4 left-4 z-[9999] flex flex-col gap-2 pointer-events-none"
            style={{ direction: 'ltr' }}
        >
            {visibleToasts.map((toast) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto"
                >
                    <Toast toast={toast} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;

