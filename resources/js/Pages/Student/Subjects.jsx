import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaBook,
    FaPlus,
    FaTimes,
    FaGraduationCap,
    FaUsers,
    FaSearch,
    FaTrash,
} from 'react-icons/fa';

export default function StudentSubjects({ studentSubjects, allSubjects }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    // Filter available subjects for adding
    const availableSubjects = allSubjects.filter(subject =>
        !subject.is_added &&
        (subject.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (subject.name_en && subject.name_en.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    const handleAddSubject = (subjectId) => {
        router.post('/student/subjects', { subject_id: subjectId }, {
            preserveState: true,
            onSuccess: () => {
                setShowAddModal(false);
                setSearchTerm('');
            }
        });
    };

    const handleRemoveSubject = (subject) => {
        setSubjectToDelete(subject);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        if (subjectToDelete) {
            router.delete(`/student/subjects/${subjectToDelete.id}`, {
                preserveState: true,
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setSubjectToDelete(null);
                },
            });
        }
    };

    return (
        <DashboardLayout header="موادي">
            <Head title="موادي" />
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">موادي الدراسية</h2>
                    <p className="text-gray-600 mt-1">إدارة المواد التي تدرسها</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition shadow-lg hover:shadow-xl"
                >
                    <FaPlus />
                    إضافة مادة جديدة
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">عدد المواد</p>
                            <p className="text-3xl font-bold text-gray-900">{studentSubjects.length}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <FaBook className="text-2xl text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي المعلمين</p>
                            <p className="text-3xl font-bold text-green-600">
                                {studentSubjects.reduce((sum, subject) => sum + (subject.teacher_count || 0), 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-full">
                            <FaUsers className="text-2xl text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">المواد المتاحة</p>
                            <p className="text-3xl font-bold text-purple-600">{availableSubjects.length}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-full">
                            <FaGraduationCap className="text-2xl text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {studentSubjects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <FaBook className="mx-auto text-6xl mb-4 text-gray-300" />
                    <p className="text-xl text-gray-500 mb-2">لا توجد مواد حالياً</p>
                    <p className="text-sm text-gray-400 mb-6">ابدأ بإضافة المواد التي تدرسها</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition"
                    >
                        <FaPlus />
                        إضافة أول مادة
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {studentSubjects.map((subject) => (
                        <div
                            key={subject.id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                        >
                            <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                                {subject.image && (
                                    <img
                                        src={subject.image}
                                        alt={subject.name_ar}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div className="absolute bottom-4 right-4">
                                    <button
                                        onClick={() => handleRemoveSubject(subject)}
                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition"
                                        title="حذف المادة"
                                    >
                                        <FaTrash className="text-sm" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {subject.name_ar}
                                </h3>
                                {subject.name_en && (
                                    <p className="text-sm text-gray-500 mb-3">{subject.name_en}</p>
                                )}
                                {subject.description_ar && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {subject.description_ar}
                                    </p>
                                )}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FaUsers className="text-sm" />
                                        <span className="text-sm font-medium">
                                            {subject.teacher_count || 0} معلم
                                        </span>
                                    </div>
                                    <Link
                                        href={`/teachers?subject=${encodeURIComponent(subject.name_ar)}`}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        عرض المعلمين →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-white">إضافة مادة جديدة</h3>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setSearchTerm('');
                                }}
                                className="text-white hover:text-gray-100 transition"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ابحث عن مادة..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {availableSubjects.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaBook className="mx-auto text-4xl mb-4 text-gray-300" />
                                    <p className="text-gray-500">
                                        {searchTerm ? 'لا توجد نتائج' : 'لا توجد مواد متاحة'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableSubjects.map((subject) => (
                                        <div
                                            key={subject.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-yellow-400 hover:shadow-md transition cursor-pointer"
                                            onClick={() => handleAddSubject(subject.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                {subject.image && (
                                                    <img
                                                        src={subject.image}
                                                        alt={subject.name_ar}
                                                        className="w-16 h-16 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-gray-900 mb-1">
                                                        {subject.name_ar}
                                                    </h4>
                                                    {subject.description_ar && (
                                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                            {subject.description_ar}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <FaUsers />
                                                            {subject.teacher_count || 0} معلم
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddSubject(subject.id);
                                                    }}
                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition"
                                                    title="إضافة"
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
                                هل أنت متأكد من حذف مادة <strong>{subjectToDelete.name_ar}</strong> من قائمتك؟ لا يمكن التراجع عن هذه العملية.
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

