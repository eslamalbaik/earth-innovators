import Toast from './Toast';

const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div
            className="fixed top-4 left-4 z-[9999] flex flex-col gap-3 pointer-events-none"
            style={{ direction: 'ltr' }}
        >
            {toasts.map((toast) => (
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

