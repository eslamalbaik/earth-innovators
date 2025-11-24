import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { FaCalendar, FaPlus, FaEdit, FaTrash, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function TeacherCalendar({ teacher, availabilities, auth }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingAvailability, setEditingAvailability] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [availabilityToDelete, setAvailabilityToDelete] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        date: selectedDate,
        start_time: '',
        end_time: '',
        notes: '',
    });

    const filteredAvailabilities = availabilities.filter(avail => {
        if (filterStatus === 'all') return true;
        return avail.status === filterStatus;
    });

    const groupedAvailabilities = filteredAvailabilities.reduce((groups, avail) => {
        const date = avail.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(avail);
        return groups;
    }, {});

    const availableDates = Object.keys(groupedAvailabilities).sort();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingAvailability) {
            put(route('teacher.availabilities.update', editingAvailability.id), {
                onSuccess: () => {
                    setShowAddModal(false);
                    setEditingAvailability(null);
                    reset();
                }
            });
        } else {
            post(route('teacher.availabilities.store'), {
                onSuccess: () => {
                    setShowAddModal(false);
                    reset();
                }
            });
        }
    };

    const handleEdit = (availability) => {
        setEditingAvailability(availability);
        setData({
            date: availability.date,
            start_time: availability.start_time.split(' ')[1].substring(0, 5),
            end_time: availability.end_time.split(' ')[1].substring(0, 5),
            notes: availability.notes || '',
        });
        setShowAddModal(true);
    };

    const handleDelete = (availability) => {
        setAvailabilityToDelete(availability);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        if (availabilityToDelete) {
            destroy(route('teacher.availabilities.destroy', availabilityToDelete.id), {
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setAvailabilityToDelete(null);
                },
            });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'booked':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
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
            case 'cancelled':
                return 'ملغي';
            default:
                return 'غير معروف';
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={`تقويم ${teacher.name_ar}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 space-x-reverse">
                                <button
                                    onClick={() => window.history.back()}
                                    className="flex items-center text-gray-600 hover:text-gray-900 transition duration-300"
                                >
                                    <FaCalendar className="ml-2" />
                                    العودة
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    تقويم {teacher.name_ar}
                                </h1>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingAvailability(null);
                                    setData({
                                        date: selectedDate,
                                        start_time: '',
                                        end_time: '',
                                        notes: '',
                                    });
                                    setShowAddModal(true);
                                }}
                                className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
                            >
                                <FaPlus className="ml-2" />
                                إضافة وقت
                            </button>
                        </div>
                    </div>

                    <div className="mb-6 bg-white rounded-lg shadow p-4">
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <label className="text-sm font-medium text-gray-700">فلترة حسب الحالة:</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            >
                                <option value="all">جميع الأوقات</option>
                                <option value="available">متاح</option>
                                <option value="booked">محجوز</option>
                                <option value="cancelled">ملغي</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">التقويم</h3>
                                    <div className="grid grid-cols-7 gap-2 mb-4">
                                        {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7 gap-2">
                                        {availableDates.map(date => {
                                            const dayAvailabilities = groupedAvailabilities[date] || [];
                                            const availableCount = dayAvailabilities.filter(a => a.status === 'available').length;
                                            const bookedCount = dayAvailabilities.filter(a => a.status === 'booked').length;

                                            return (
                                                <div
                                                    key={date}
                                                    className={`p-2 rounded-lg border cursor-pointer hover:bg-gray-50 ${date === selectedDate ? 'bg-yellow-100 border-yellow-300' : 'border-gray-200'
                                                        }`}
                                                    onClick={() => setSelectedDate(date)}
                                                >
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {new Date(date).getDate()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {availableCount} متاح
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {bookedCount} محجوز
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US') : 'اختر تاريخ'}
                                    </h3>

                                    {selectedDate && groupedAvailabilities[selectedDate] ? (
                                        <div className="space-y-3">
                                            {groupedAvailabilities[selectedDate].map(availability => (
                                                <div
                                                    key={availability.id}
                                                    className="p-3 border border-gray-200 rounded-lg"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center space-x-2 space-x-reverse">
                                                            <FaClock className="text-gray-400" />
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {availability.start_time.split(' ')[1].substring(0, 5)} - {availability.end_time.split(' ')[1].substring(0, 5)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 space-x-reverse">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(availability.status)}`}>
                                                                {getStatusText(availability.status)}
                                                            </span>
                                                            {availability.status === 'available' && (
                                                                <div className="flex items-center space-x-1 space-x-reverse">
                                                                    <button
                                                                        onClick={() => handleEdit(availability)}
                                                                        className="text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        <FaEdit />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(availability)}
                                                                        className="text-red-600 hover:text-red-800"
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {availability.notes && (
                                                        <p className="text-xs text-gray-600">{availability.notes}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">لا توجد أوقات متاحة في هذا التاريخ</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {editingAvailability ? 'تعديل الوقت' : 'إضافة وقت جديد'}
                                </h3>

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                التاريخ
                                            </label>
                                            <input
                                                type="date"
                                                value={data.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    وقت البداية
                                                </label>
                                                <input
                                                    type="time"
                                                    value={data.start_time}
                                                    onChange={(e) => setData('start_time', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    required
                                                />
                                                {errors.start_time && <p className="text-red-500 text-sm mt-1">{errors.start_time}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    وقت النهاية
                                                </label>
                                                <input
                                                    type="time"
                                                    value={data.end_time}
                                                    onChange={(e) => setData('end_time', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                    required
                                                />
                                                {errors.end_time && <p className="text-red-500 text-sm mt-1">{errors.end_time}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ملاحظات (اختياري)
                                            </label>
                                            <textarea
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                                placeholder="أضف ملاحظات حول هذا الوقت..."
                                            />
                                            {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end space-x-4 space-x-reverse mt-6">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddModal(false);
                                                setEditingAvailability(null);
                                                reset();
                                            }}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition duration-300"
                                        >
                                            إلغاء
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition duration-300"
                                        >
                                            {processing ? 'جاري الحفظ...' : (editingAvailability ? 'تحديث' : 'إضافة')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showDeleteConfirm && availabilityToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <FaTrash className="text-2xl text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">تأكيد الحذف</h2>
                            <p className="text-gray-600 text-center mb-6">
                                هل أنت متأكد من حذف هذا الوقت؟ لا يمكن التراجع عن هذه العملية.
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
        </DashboardLayout>
    );
}
