import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '../../Layouts/DashboardLayout';
import { FaPlus, FaTrash, FaEdit, FaEye, FaTimes } from 'react-icons/fa';

export default function Subjects({ auth, subjects }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name_ar: '',
        name_en: '',
        image: null,
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingSubject) {
            put(`/admin/subjects/${editingSubject.id}`, {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setIsModalOpen(false);
                    setEditingSubject(null);
                },
            });
        } else {
            post('/admin/subjects', {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    setIsModalOpen(false);
                },
            });
        }
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setData({
            name_ar: subject.name_ar || '',
            name_en: subject.name_en || '',
            image: null,
            description: subject.description || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = (subject) => {
        setSubjectToDelete(subject);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        if (subjectToDelete) {
            router.delete(`/admin/subjects/${subjectToDelete.id}`, {
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setSubjectToDelete(null);
                },
            });
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSubject(null);
        reset();
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="إدارة المواد" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">إدارة المواد</h1>
                        <p className="mt-2 text-gray-600">إدارة المواد الدراسية المتاحة في المنصة</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg transition duration-300"
                    >
                        <FaPlus />
                        إضافة مادة
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjects.map((subject) => (
                        <div key={subject.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-300">
                            <div className="h-40 bg-gray-100">
                                {subject.image ? (
                                    <img src={subject.image} alt={subject.name_ar} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FaEye className="text-4xl" />
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{subject.name_ar}</h3>
                                {subject.name_en && (
                                    <p className="text-sm text-gray-600 mb-2">{subject.name_en}</p>
                                )}
                                <div className="flex items-center justify-between mt-3">
                                    <span className="text-sm text-gray-600">
                                        {subject.teacher_count} معلم
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(subject)}
                                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subject)}
                                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingSubject ? 'تعديل المادة' : 'إضافة مادة جديدة'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <FaTimes className="text-2xl" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الاسم بالعربية *
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name_ar}
                                        onChange={(e) => setData('name_ar', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                        required
                                    />
                                    {errors.name_ar && <p className="mt-1 text-sm text-red-600">{errors.name_ar}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الاسم بالإنجليزية
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name_en}
                                        onChange={(e) => setData('name_en', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    />
                                    {errors.name_en && <p className="mt-1 text-sm text-red-600">{errors.name_en}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    صورة المادة
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('image', e.target.files[0])}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                />
                                {editingSubject?.image && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 mb-1">الصورة الحالية:</p>
                                        <img src={editingSubject.image} alt={editingSubject.name_ar} className="w-32 h-32 object-cover rounded-lg border border-gray-300" />
                                    </div>
                                )}
                                {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الوصف
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                    placeholder="أدخل وصف المادة..."
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            <div className="flex items-center gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition duration-300"
                                >
                                    {processing ? 'جاري الحفظ...' : editingSubject ? 'حفظ التعديلات' : 'إضافة'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition duration-300"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteConfirm && subjectToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <FaTrash className="text-2xl text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">تأكيد الحذف</h2>
                            <p className="text-gray-600 text-center mb-6">
                                هل أنت متأكد من حذف مادة <strong>{subjectToDelete.name_ar}</strong>؟ لا يمكن التراجع عن هذه العملية.
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
                                        setSubjectToDelete(null);
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
