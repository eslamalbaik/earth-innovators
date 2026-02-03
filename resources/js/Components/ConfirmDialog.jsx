import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function ConfirmDialog({
    show = false,
    title = 'تأكيد الإجراء',
    message = 'هل أنت متأكد من تنفيذ هذا الإجراء؟',
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    onConfirm = () => { },
    onCancel = () => { },
    variant = 'danger', // 'danger' or 'warning' or 'info'
}) {
    const variantStyles = {
        danger: {
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmBg: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        },
        warning: {
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            confirmBg: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        },
        info: {
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            confirmBg: 'bg-[#A3C042] hover:bg-blue-700 focus:ring-blue-500',
        },
    };

    const styles = variantStyles[variant] || variantStyles.danger;

    return (
        <Transition show={show}>
            <Dialog
                as="div"
                className="relative z-50"
                onClose={onCancel}
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                <div className="p-6">
                                    {/* Icon */}
                                    <div className="flex items-center justify-center mb-4">
                                        <div className={`flex items-center justify-center w-16 h-16 rounded-full ${styles.iconBg}`}>
                                            <FaExclamationTriangle className={`text-3xl ${styles.iconColor}`} />
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                                        {title}
                                    </h3>

                                    {/* Message */}
                                    <p className="text-gray-600 text-center mb-6 leading-relaxed">
                                        {message}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={onCancel}
                                            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                                        >
                                            {cancelText}
                                        </button>
                                        <button
                                            onClick={onConfirm}
                                            className={`flex-1 px-4 py-3 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.confirmBg}`}
                                        >
                                            {confirmText}
                                        </button>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

