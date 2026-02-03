import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaArrowRight, FaSave, FaTimes, FaUser, FaCheckCircle, FaStar, FaExclamationCircle } from 'react-icons/fa';

export default function AdminChallengesAssignStudents({ challenge, students, assignedStudents }) {
    const [selectedStudents, setSelectedStudents] = useState(() => {
        // تحميل الطلاب المعينين بالفعل
        const assigned = {};
        assignedStudents.forEach(student => {
            assigned[student.id] = student.participation_type;
        });
        return assigned;
    });

    const { data, setData, post, processing, errors } = useForm({
        students: [],
    });

    const handleStudentToggle = (studentId) => {
        setSelectedStudents(prev => {
            const newState = { ...prev };
            if (newState[studentId]) {
                // إذا كان الطالب محدداً، احذفه
                delete newState[studentId];
            } else {
                // إذا لم يكن محدداً، أضفه كنوع اختياري افتراضي
                newState[studentId] = 'optional';
            }
            return newState;
        });
    };

    const handleParticipationTypeChange = (studentId, type) => {
        setSelectedStudents(prev => ({
            ...prev,
            [studentId]: type,
        }));
    };

    const submit = (e) => {
        e.preventDefault();

        // تحويل selectedStudents إلى مصفوفة
        const studentsArray = Object.entries(selectedStudents).map(([user_id, participation_type]) => ({
            user_id: parseInt(user_id),
            participation_type,
        }));

        setData('students', studentsArray);

        post(route('admin.challenges.assign-students', challenge.id), {
            preserveScroll: true,
        });
    };

    const getParticipationTypeLabel = (type) => {
        const labels = {
            'mandatory': 'إلزامي',
            'optional': 'اختياري',
            'favorite': 'مفضل',
        };
        return labels[type] || 'اختياري';
    };

    const getParticipationTypeIcon = (type) => {
        switch (type) {
            case 'mandatory':
                return <FaExclamationCircle className="text-red-500" />;
            case 'favorite':
                return <FaStar className="text-yellow-500" />;
            default:
                return <FaCheckCircle className="text-green-500" />;
        }
    };

    const getParticipationTypeColor = (type) => {
        switch (type) {
            case 'mandatory':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'favorite':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default:
                return 'bg-green-100 text-green-800 border-green-300';
        }
    };

    return (
        <DashboardLayout header="تعيين الطلاب للتحدي">
            <Head title={`تعيين الطلاب - ${challenge.title}`} />

            <div className="mb-6">
                <Link
                    href={route('admin.challenges.show', challenge.id)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى تفاصيل التحدي
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h2>
                <p className="text-gray-600">المدرسة: {challenge.school_name}</p>
            </div>

            <form onSubmit={submit} className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">اختيار الطلاب</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        اختر الطلاب الذين تريد تعيينهم لهذا التحدي وحدد نوع المشاركة لكل طالب.
                    </p>
                </div>

                {students.length === 0 ? (
                    <div className="text-center py-12">
                        <FaUser className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">لا توجد طلاب متاحين في هذه المدرسة</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {students.map((student) => {
                            const isSelected = selectedStudents[student.id] !== undefined;
                            const participationType = selectedStudents[student.id] || 'optional';

                            return (
                                <div
                                    key={student.id}
                                    className={`p-4 rounded-lg border-2 transition ${isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleStudentToggle(student.id)}
                                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <FaUser className="text-gray-400" />
                                                    <span className="font-semibold text-gray-900">{student.name}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{student.email}</p>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="flex items-center gap-3">
                                                <select
                                                    value={participationType}
                                                    onChange={(e) => handleParticipationTypeChange(student.id, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`px-3 py-2 rounded-lg border-2 font-semibold text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getParticipationTypeColor(participationType)}`}
                                                >
                                                    <option value="mandatory">إلزامي</option>
                                                    <option value="optional">اختياري</option>
                                                    <option value="favorite">مفضل</option>
                                                </select>
                                                <div className="flex items-center gap-1">
                                                    {getParticipationTypeIcon(participationType)}
                                                    <span className="text-sm font-semibold">{getParticipationTypeLabel(participationType)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {errors.students && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{errors.students}</p>
                    </div>
                )}

                <div className="mt-6 flex items-center justify-between pt-6 border-t">
                    <div className="text-sm text-gray-600">
                        تم اختيار {Object.keys(selectedStudents).length} طالب
                    </div>
                    <div className="flex gap-4">
                        <Link
                            href={route('admin.challenges.show', challenge.id)}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <FaTimes />
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || Object.keys(selectedStudents).length === 0}
                            className="px-6 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaSave />
                            {processing ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Legend */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">أنواع المشاركة:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                        <FaExclamationCircle className="text-red-500" />
                        <span className="text-sm"><strong>إلزامي:</strong> يجب على الطالب المشاركة في التحدي</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaCheckCircle className="text-green-500" />
                        <span className="text-sm"><strong>اختياري:</strong> الطالب يمكنه اختيار المشاركة</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaStar className="text-yellow-500" />
                        <span className="text-sm"><strong>مفضل:</strong> التحدي موصى به للطالب</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

