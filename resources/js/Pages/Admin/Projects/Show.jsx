import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaArrowRight, FaCheckCircle, FaTimesCircle, FaTrash, FaUser, FaSchool, FaChalkboardTeacher, FaEye, FaHeart, FaStar, FaFileAlt, FaCalendar, FaStar as FaStarIcon } from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function AdminProjectShow({ project }) {
    const { confirm } = useConfirmDialog();

    const handleApprove = async () => {
        const confirmed = await confirm({
            title: 'تأكيد الموافقة',
            message: `هل أنت متأكد من الموافقة على المشروع "${project.title}"؟`,
            confirmText: 'موافقة',
            cancelText: 'إلغاء',
            variant: 'info',
        });

        if (confirmed) {
            router.post(route('admin.projects.approve', project.id), {}, {
                preserveScroll: true,
            });
        }
    };

    const handleReject = async () => {
        const confirmed = await confirm({
            title: 'تأكيد الرفض',
            message: `هل أنت متأكد من رفض المشروع "${project.title}"؟ يمكنك إدخال سبب الرفض في الخطوة التالية.`,
            confirmText: 'رفض',
            cancelText: 'إلغاء',
            variant: 'warning',
        });

        if (confirmed) {
            const reason = prompt('يرجى إدخال سبب الرفض (اختياري):');
            if (reason !== null) {
                router.post(route('admin.projects.reject', project.id), {
                    reason: reason || '',
                }, {
                    preserveScroll: true,
                });
            }
        }
    };

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: `هل أنت متأكد من حذف المشروع "${project.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('admin.projects.destroy', project.id));
        }
    };

    return (
        <DashboardLayout header="تفاصيل المشروع">
            <Head title={`${project.title} - تفاصيل المشروع`} />

            <div className="mb-6">
                <Link
                    href={route('admin.projects.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة المشاريع
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.title}</h1>
                                {project.category && (
                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                        {project.category}
                                    </span>
                                )}
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                project.status === 'approved' ? 'bg-green-100 text-green-800' :
                                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {project.status === 'approved' ? 'معتمد' :
                                 project.status === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
                            </span>
                        </div>

                        <div className="prose max-w-none mb-6">
                            <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                                    <FaEye />
                                    <span className="text-sm">المشاهدات</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{project.views || 0}</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                                    <FaHeart className="text-red-500" />
                                    <span className="text-sm">الإعجابات</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{project.likes || 0}</p>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-600 mb-1">
                                    <FaStar className="text-yellow-500" />
                                    <span className="text-sm">التقييم</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{project.rating || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Files and Images */}
                    {(project.files && project.files.length > 0) || (project.images && project.images.length > 0) ? (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">الملفات والصور</h2>
                            
                            {project.images && project.images.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">الصور</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {project.images.map((image, index) => (
                                            <img
                                                key={index}
                                                src={image}
                                                alt={`صورة ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {project.files && project.files.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-3">الملفات</h3>
                                    <div className="space-y-2">
                                        {project.files.map((file, index) => (
                                            <a
                                                key={index}
                                                href={file}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                                            >
                                                <span className="text-blue-600 font-medium">{file}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Submissions Section */}
                    {project.submissions && project.submissions.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">التسليمات ({project.submissions.length})</h2>
                            <div className="space-y-4">
                                {project.submissions.map((submission) => (
                                    <div key={submission.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <FaUser className="text-blue-500" />
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{submission.student.name}</p>
                                                        <p className="text-sm text-gray-600">{submission.student.email}</p>
                                                    </div>
                                                </div>
                                                {submission.comment && (
                                                    <p className="text-sm text-gray-700 mb-2 mt-2">{submission.comment}</p>
                                                )}
                                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <FaCalendar />
                                                        <span>{submission.submitted_at || 'غير محدد'}</span>
                                                    </div>
                                                    {submission.rating && (
                                                        <div className="flex items-center gap-1">
                                                            <FaStarIcon className="text-yellow-500" />
                                                            <span>{submission.rating}/5</span>
                                                        </div>
                                                    )}
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        submission.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {submission.status === 'approved' ? 'معتمد' :
                                                         submission.status === 'rejected' ? 'مرفوض' :
                                                         submission.status === 'reviewed' ? 'تم المراجعة' : 'مقدم'}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link
                                                href={route('admin.submissions.show', submission.id)}
                                                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                            >
                                                <FaEye />
                                                {submission.status === 'submitted' ? 'تقييم' : 'عرض'}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Project Details */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات المشروع</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
                                <p className="font-semibold text-gray-900">{project.created_at}</p>
                            </div>
                            {project.approved_at && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">تاريخ الموافقة</p>
                                    <p className="font-semibold text-gray-900">{project.approved_at}</p>
                                </div>
                            )}
                            {project.points_earned > 0 && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">النقاط المكتسبة</p>
                                    <p className="font-semibold text-green-600">{project.points_earned}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Student/Publisher Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FaUser className="text-blue-500" />
                            {project.user?.role === 'admin' ? 'الناشر' : 'معلومات الطالب'}
                        </h2>
                        <div className="space-y-2">
                            <p className="font-semibold text-gray-900">{project.student?.name || project.user?.name}</p>
                            <p className="text-sm text-gray-600">{project.student?.email || project.user?.email}</p>
                        </div>
                    </div>

                    {/* School Info */}
                    {project.school ? (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaSchool className="text-green-500" />
                                تابع لمدرسة
                            </h2>
                            <p className="font-semibold text-gray-900">{project.school.name}</p>
                        </div>
                    ) : project.user?.role === 'admin' ? (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaSchool className="text-purple-500" />
                                المصدر
                            </h2>
                            <p className="font-semibold text-gray-900">من إدارة مجتمع إرث المبتكرين</p>
                        </div>
                    ) : null}

                    {/* Teacher Info - لا يعرض إذا كان المشروع من الإدارة */}
                    {project.teacher && project.user?.role !== 'admin' && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaChalkboardTeacher className="text-purple-500" />
                                المعلم
                            </h2>
                            <p className="font-semibold text-gray-900">{project.teacher.name}</p>
                        </div>
                    )}

                    {/* Actions */}
                    {project.status !== 'approved' && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">الإجراءات</h2>
                            <div className="space-y-3">
                                {project.status === 'pending' && (
                                    <button
                                        onClick={handleApprove}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <FaCheckCircle />
                                        الموافقة على المشروع
                                    </button>
                                )}
                                {project.status === 'pending' && (
                                    <button
                                        onClick={handleReject}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                    >
                                        <FaTimesCircle />
                                        رفض المشروع
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                                >
                                    <FaTrash />
                                    حذف المشروع
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

