import { useState, useRef, useEffect } from 'react';
import { FaEllipsisV, FaEye, FaEdit, FaTrash, FaChartLine, FaPause, FaPlay } from 'react-icons/fa';

/**
 * Actions Menu Component - 3-dot menu for challenge actions
 * Supports RTL layout
 */
export default function ActionsMenu({
    challenge,
    onView,
    onEdit,
    onDelete,
    onPause,
    showAnalytics = false,
    isDeleting = false,
    isUpdating = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleAction = (action) => {
        setIsOpen(false);
        if (action === 'view' && onView) onView(challenge);
        if (action === 'edit' && onEdit) onEdit(challenge);
        if (action === 'delete' && onDelete) onDelete(challenge.id);
        if (action === 'pause' && onPause) onPause(challenge);
        if (action === 'analytics' && showAnalytics && onView) onView(challenge);
    };

    const canPause = challenge.status === 'active';
    const canResume = challenge.status === 'draft' || challenge.status === 'cancelled';

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isDeleting || isUpdating}
                className={`p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${
                    isOpen ? 'bg-gray-100 text-gray-900' : ''
                } ${isDeleting || isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="الإجراءات"
                aria-label="الإجراءات"
            >
                <FaEllipsisV className="text-sm" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu - RTL Support */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1 rtl:left-0 rtl:right-auto">
                        {onView && (
                            <button
                                onClick={() => handleAction('view')}
                                className="w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <FaEye className="text-blue-500 flex-shrink-0" />
                                <span>عرض</span>
                            </button>
                        )}

                        {showAnalytics && (
                            <button
                                onClick={() => handleAction('analytics')}
                                className="w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <FaChartLine className="text-indigo-500 flex-shrink-0" />
                                <span>تحليل</span>
                            </button>
                        )}

                        {onEdit && (
                            <button
                                onClick={() => handleAction('edit')}
                                className="w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                <FaEdit className="text-amber-500 flex-shrink-0" />
                                <span>تعديل</span>
                            </button>
                        )}

                        {(canPause || canResume) && onPause && (
                            <button
                                onClick={() => handleAction('pause')}
                                className="w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                            >
                                {canPause ? (
                                    <>
                                        <FaPause className="text-orange-500 flex-shrink-0" />
                                        <span>إيقاف</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPlay className="text-green-500 flex-shrink-0" />
                                        <span>استئناف</span>
                                    </>
                                )}
                            </button>
                        )}

                        {onDelete && (
                            <>
                                <div className="border-t border-gray-200 my-1" />
                                <button
                                    onClick={() => handleAction('delete')}
                                    disabled={isDeleting}
                                    className={`w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors ${
                                        isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="animate-spin text-xs">⏳</span>
                                            <span>جاري الحذف...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaTrash className="flex-shrink-0" />
                                            <span>حذف</span>
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

