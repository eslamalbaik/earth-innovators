import { useEffect, useState } from 'react';
import { FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

const Toast = ({ toast, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(() => {
            onRemove(toast.id);
        }, 300); // Match fadeOut animation duration
    };

    useEffect(() => {
        if (toast.autoDismiss !== false && toast.autoDismiss > 0) {
            const timer = setTimeout(() => {
                handleRemove();
            }, toast.autoDismiss);

            return () => clearTimeout(timer);
        }
    }, [toast.autoDismiss, toast.id, onRemove]);

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <FaCheckCircle className="text-green-500" />;
            case 'error':
                return <FaTimesCircle className="text-red-500" />;
            case 'warning':
                return <FaExclamationTriangle className="text-yellow-500" />;
            case 'info':
            default:
                return <FaInfoCircle className="text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const getTextColor = () => {
        switch (toast.type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'warning':
                return 'text-yellow-800';
            case 'info':
            default:
                return 'text-blue-800';
        }
    };

    return (
        <div
            className={`
                relative flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 min-w-[320px] max-w-md
                ${getBgColor()}
                ${isExiting ? 'animate-fadeOut' : 'animate-slideInLeft'}
                transition-all duration-300
            `}
            role="alert"
        >
            <div className={`flex-shrink-0 text-xl ${getTextColor()}`}>
                {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <h4 className={`font-semibold mb-1 ${getTextColor()}`}>
                        {toast.title}
                    </h4>
                )}
                <p className={`text-sm ${getTextColor()} opacity-90`}>
                    {toast.message}
                </p>
            </div>
            <button
                onClick={handleRemove}
                className={`flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ${getTextColor()} opacity-70 hover:opacity-100`}
                aria-label="Close notification"
            >
                <FaTimes className="text-sm" />
            </button>
        </div>
    );
};

export default Toast;

