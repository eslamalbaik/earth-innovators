import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaClock } from 'react-icons/fa';

export default function Availability({ auth, availabilities, subjects = [], filters = {} }) {
    const { flash } = usePage().props;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAvailability, setEditingAvailability] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState(filters.subject_id || '');
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [availabilityToDelete, setAvailabilityToDelete] = useState(null);

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'error' });
        }, 5000);
    };

    useEffect(() => {
        if (flash?.error) {
            showToast(flash.error, 'error');
        }
        if (flash?.success) {
            showToast(flash.success, 'success');
        }
    }, [flash]);

    const { data: addData, setData: setAddData, post: addPost, processing: isAdding, reset: resetAddForm, errors: addErrors } = useForm({
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        subject_id: '',
    });

    const { data: editData, setData: setEditData, put: editPut, processing: isEditing, reset: resetEditForm, errors: editErrors } = useForm({
        date: '',
        start_time: '',
        end_time: '',
        subject_id: '',
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting data:', addData);
        addPost('/teacher/availability', {
            onSuccess: () => {
                resetAddForm();
                setAddData('date', new Date().toISOString().split('T')[0]);
                setIsAddModalOpen(false);
                showToast('تم إضافة الموعد بنجاح', 'success');
            },
            onError: (errors) => {
                console.error('Errors:', errors);
                const errorMessage = errors.message || Object.values(errors).flat().join(', ') || 'حدث خطأ أثناء إضافة الموعد';
                showToast(errorMessage, 'error');
            },
        });
    };

    const handleSubjectFilterChange = (subjectId) => {
        setSelectedSubjectFilter(subjectId);
        router.get('/teacher/availability', { subject_id: subjectId || null }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!editData.subject_id || editData.subject_id === '') {
            setEditData('subject_id', '');
        }
        editPut(`/teacher/availability/${editingAvailability.id}`, {
            onSuccess: () => {
                resetEditForm();
                setIsEditModalOpen(false);
                setEditingAvailability(null);
                showToast('تم تحديث الموعد بنجاح', 'success');
            },
            onError: (errors) => {
                console.error('Errors:', errors);
                const errorMessage = errors.message || Object.values(errors).flat().join(', ') || 'حدث خطأ أثناء تحديث الموعد';
                showToast(errorMessage, 'error');
            },
        });
    };

    const handleDelete = (availability) => {
        setAvailabilityToDelete(availability);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        if (availabilityToDelete) {
            router.delete(`/teacher/availability/${availabilityToDelete.id}`, {
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setAvailabilityToDelete(null);
                    showToast('تم حذف الموعد بنجاح', 'success');
                },
                onError: () => {
                    showToast('حدث خطأ أثناء حذف الموعد', 'error');
                },
            });
        }
    };

    const handleEditClick = (availability) => {
        setEditingAvailability(availability);
        const startTime = availability.start_time.includes('T')
            ? availability.start_time.substring(11, 16)
            : availability.start_time.substring(0, 5);
        const endTime = availability.end_time.includes('T')
            ? availability.end_time.substring(11, 16)
            : availability.end_time.substring(0, 5);
        setEditData({
            date: availability.date,
            start_time: startTime,
            end_time: endTime,
            subject_id: availability.subject_id ? String(availability.subject_id) : '',
        });
        setIsEditModalOpen(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'booked':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'available':
                return 'متاح';
            case 'booked':
                return 'محجوز';
            default:
                return status;
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="إدارة المواعيد" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                        {flash.error}
                    </div>
                )}
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">إدارة المواعيد</h1>
                        <p className="mt-2 text-gray-600">أضف وحدد المواعيد المتاحة للحصص</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {subjects.length > 0 && (
                            <select
                                value={selectedSubjectFilter}
                                onChange={(e) => handleSubjectFilterChange(e.target.value)}
                                className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
                            >
                                <option value="">جميع المواد</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name_ar}
                                    </option>
                                ))}
                            </select>
                        )}
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg transition duration-300"
                        >
                            <FaPlus />
                            إضافة موعد
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-3 rounded-full">
                                <FaClock className="text-green-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">المواعيد المتاحة</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {availabilities.filter(a => a.status === 'available').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-100 p-3 rounded-full">
                                <FaCheck className="text-red-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">المواعيد المحجوزة</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {availabilities.filter(a => a.status === 'booked').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <FaClock className="text-blue-600 text-2xl" />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">إجمالي المواعيد</p>
                                <p className="text-2xl font-bold text-gray-900">{availabilities.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        التاريخ
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        المادة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        وقت البدء
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        وقت الانتهاء
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الحالة
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {availabilities.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <FaClock className="mx-auto text-4xl mb-4 text-gray-300" />
                                            <p>لا توجد مواعيد حالياً</p>
                                            <button
                                                onClick={() => setIsAddModalOpen(true)}
                                                className="mt-4 text-yellow-600 hover:text-yellow-700 font-medium"
                                            >
                                                أضف موعداً جديداً
                                            </button>
                                        </td>
                                    </tr>
                                ) : (
                                    availabilities.map((availability) => {
                                        const formatTime = (timeString) => {
                                            if (!timeString) return '';

                                            if (timeString.includes('T')) {
                                                return new Date(timeString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                            }

                                            const timeMatch = timeString.match(/(\d{1,2}):(\d{2})/);
                                            if (timeMatch) {
                                                const hours = parseInt(timeMatch[1]);
                                                const minutes = timeMatch[2];
                                                const period = hours >= 12 ? 'م' : 'ص';
                                                const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
                                                return `${displayHours.toString().padStart(2, '0')}:${minutes} ${period}`;
                                            }

                                            return timeString.substring(0, 5);
                                        };

                                        const startTime = formatTime(availability.start_time);
                                        const endTime = formatTime(availability.end_time);

                                        return (
                                            <tr key={availability.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(availability.date).toLocaleDateString('en-US')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {availability.subject_name || 'عام'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {startTime}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {endTime}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(availability.status)}`}>
                                                        {getStatusText(availability.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {availability.status !== 'booked' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleEditClick(availability)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    <FaEdit />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(availability)}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    <FaTrash />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">إضافة موعد جديد</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">المادة الدراسية</label>
                                <select
                                    value={addData.subject_id || ''}
                                    onChange={(e) => setAddData('subject_id', e.target.value || '')}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                >
                                    <option value="">اختر المادة (اختياري)</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name_ar}
                                        </option>
                                    ))}
                                </select>
                                {addErrors.subject_id && <p className="mt-1 text-sm text-red-600">{addErrors.subject_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                                <input
                                    type="date"
                                    value={addData.date}
                                    onChange={(e) => setAddData('date', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    required
                                />
                                {addErrors.date && <p className="mt-1 text-sm text-red-600">{addErrors.date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">وقت البدء</label>
                                <input
                                    type="time"
                                    value={addData.start_time}
                                    onChange={(e) => setAddData('start_time', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    required
                                />
                                {addErrors.start_time && <p className="mt-1 text-sm text-red-600">{addErrors.start_time}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">وقت الانتهاء</label>
                                <input
                                    type="time"
                                    value={addData.end_time}
                                    onChange={(e) => setAddData('end_time', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    required
                                />
                                {addErrors.end_time && <p className="mt-1 text-sm text-red-600">{addErrors.end_time}</p>}
                            </div>
                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isAdding}
                                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition duration-300"
                                >
                                    {isAdding ? 'جاري الإضافة...' : 'إضافة'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition duration-300"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && editingAvailability && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">تعديل الموعد</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">المادة الدراسية</label>
                                <select
                                    value={editData.subject_id || ''}
                                    onChange={(e) => setEditData('subject_id', e.target.value || '')}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                >
                                    <option value="">اختر المادة (اختياري)</option>
                                    {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name_ar}
                                        </option>
                                    ))}
                                </select>
                                {editErrors.subject_id && <p className="mt-1 text-sm text-red-600">{editErrors.subject_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ</label>
                                <input
                                    type="date"
                                    value={editData.date}
                                    onChange={(e) => setEditData('date', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    required
                                />
                                {editErrors.date && <p className="mt-1 text-sm text-red-600">{editErrors.date}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">وقت البدء</label>
                                <input
                                    type="time"
                                    value={editData.start_time}
                                    onChange={(e) => setEditData('start_time', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    required
                                />
                                {editErrors.start_time && <p className="mt-1 text-sm text-red-600">{editErrors.start_time}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">وقت الانتهاء</label>
                                <input
                                    type="time"
                                    value={editData.end_time}
                                    onChange={(e) => setEditData('end_time', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    required
                                />
                                {editErrors.end_time && <p className="mt-1 text-sm text-red-600">{editErrors.end_time}</p>}
                            </div>
                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={isEditing}
                                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition duration-300"
                                >
                                    {isEditing ? 'جاري التعديل...' : 'حفظ التعديلات'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition duration-300"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && availabilityToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <FaTrash className="text-2xl text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">تأكيد الحذف</h2>
                            <p className="text-gray-600 text-center mb-6">
                                هل أنت متأكد من حذف هذا الموعد؟ لا يمكن التراجع عن هذه العملية.
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
                                >
                                    حذف
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setAvailabilityToDelete(null);
                                    }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className={`fixed top-4 left-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${toast.type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    <span>{toast.message}</span>
                    <button
                        onClick={() => setToast({ show: false, message: '', type: 'error' })}
                        className="text-white hover:text-gray-200"
                    >
                        <FaTimes />
                    </button>
                </div>
            )}
        </DashboardLayout>
    );
}
