import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm } from '@inertiajs/react';
import { FaBook, FaPlus, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

export default function Subjects({ teacher, teacherSubjects, availableSubjects, stages }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    const getStages = () => {
        if (!teacher?.stages) return [];

        const filterValidStages = (stagesArray) => {
            if (!Array.isArray(stagesArray)) return [];

            const generalStages = ['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية'];
            const validStages = stagesArray
                .filter(stage => {
                    if (!stage) return false;
                    const stageStr = String(stage).trim();
                    if (stageStr.length === 0) return false;
                    if (stageStr.length > 50) return false;
                    return generalStages.includes(stageStr) || stageStr.match(/^[\u0600-\u06FF\s]+$/);
                })
                .map(stage => String(stage).trim());

            return [...new Set(validStages)];
        };

        if (Array.isArray(teacher.stages)) {
            return filterValidStages(teacher.stages);
        }

        if (typeof teacher.stages === 'string') {
            try {
                const parsed = JSON.parse(teacher.stages);
                if (Array.isArray(parsed)) {
                    return filterValidStages(parsed);
                }
            } catch (e) {
                return [];
            }
        }

        return [];
    };

    const formatStages = (stagesArray) => {
        if (!stagesArray || stagesArray.length === 0) return 'غير محدد';

        const generalStages = ['الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية'];
        const filtered = stagesArray.filter(stage => generalStages.includes(stage));

        if (filtered.length > 0) {
            return filtered.join(', ');
        }

        return stagesArray.join(', ');
    };

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        subject_id: '',
        stages: []
    });

    const handleAddSubmit = (e) => {
        e.preventDefault();
        post('/teacher/subjects', {
            onSuccess: () => {
                setIsAdding(false);
                reset();
            }
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(`/teacher/subjects/${editingSubject.id}`, {
            onSuccess: () => {
                setEditingSubject(null);
                reset();
            }
        });
    };

    const handleDelete = (subject) => {
        setSubjectToDelete(subject);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        if (subjectToDelete) {
            destroy(`/teacher/subjects/${subjectToDelete.id}`, {
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setSubjectToDelete(null);
                },
            });
        }
    };

    const handleEdit = (subject) => {
        setEditingSubject(subject);
        setData({
            subject_id: subject.id,
            stages: teacher?.stages || []
        });
    };

    const handleStageChange = (stage) => {
        const currentStages = data.stages;
        if (currentStages.includes(stage)) {
            setData('stages', currentStages.filter(s => s !== stage));
        } else {
            setData('stages', [...currentStages, stage]);
        }
    };

    return (
        <DashboardLayout header="إدارة المواد">
            <Head title="إدارة المواد" />

            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">إدارة المواد</h1>
                            <p className="text-gray-600 mt-1">أضف أو عدّل المواد التي تدرسها والمراحل الدراسية</p>
                        </div>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-lg transition"
                        >
                            <FaPlus />
                            إضافة مادة
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                        <h2 className="text-lg font-bold text-gray-900">المواد المضافة</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {teacherSubjects && teacherSubjects.length > 0 ? (
                            teacherSubjects.map((subject) => (
                                <div key={subject.id} className="p-6 hover:bg-gray-50 transition">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{subject.name_ar}</h3>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-600">
                                                    المراحل: {formatStages(getStages())}
                                                </span>
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                    نشط
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(subject)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="تعديل"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="حذف"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center text-gray-500">
                                <FaBook className="mx-auto text-4xl mb-4 text-gray-300" />
                                <p>لم تقم بإضافة أي مواد بعد</p>
                                <p className="text-sm">اضغط على "إضافة مادة" لبدء إضافة المواد التي تدرسها</p>
                            </div>
                        )}
                    </div>
                </div>

                {isAdding && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">إضافة مادة جديدة</h2>
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="text-2xl" />
                                </button>
                            </div>
                            <form onSubmit={handleAddSubmit} className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اختر المادة *
                                    </label>
                                    <select
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        required
                                    >
                                        <option value="">-- اختر المادة --</option>
                                        {availableSubjects?.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name_ar}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subject_id && <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>}
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        المراحل الدراسية *
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {stages?.map((stage) => (
                                            <label key={stage} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.stages.includes(stage)}
                                                    onChange={() => handleStageChange(stage)}
                                                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                                />
                                                <span className="text-sm text-gray-700">{stage}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.stages && <p className="text-red-500 text-sm mt-2">{errors.stages}</p>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition duration-300"
                                    >
                                        {processing ? 'جاري الإضافة...' : 'إضافة المادة'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAdding(false)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition duration-300"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {editingSubject && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">تعديل المادة</h2>
                                <button
                                    onClick={() => setEditingSubject(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes className="text-2xl" />
                                </button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="p-6">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اختر المادة *
                                    </label>
                                    <select
                                        value={data.subject_id}
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                        required
                                    >
                                        <option value="">-- اختر المادة --</option>
                                        {availableSubjects?.map((subject) => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.name_ar}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subject_id && <p className="text-red-500 text-sm mt-1">{errors.subject_id}</p>}
                                </div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        المراحل الدراسية *
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {stages?.map((stage) => (
                                            <label key={stage} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.stages.includes(stage)}
                                                    onChange={() => handleStageChange(stage)}
                                                    className="rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
                                                />
                                                <span className="text-sm text-gray-700">{stage}</span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.stages && <p className="text-red-500 text-sm mt-2">{errors.stages}</p>}
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition duration-300"
                                    >
                                        {processing ? 'جاري التحديث...' : 'تحديث المادة'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingSubject(null)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition duration-300"
                                    >
                                        إلغاء
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>

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
