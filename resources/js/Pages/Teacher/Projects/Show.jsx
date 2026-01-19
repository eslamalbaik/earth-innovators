import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaArrowRight,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaUser,
    FaSchool,
    FaChalkboardTeacher,
    FaEye,
    FaHeart,
    FaStar,
    FaFileAlt,
    FaCalendar,
    FaEdit,
    FaTrash,
    FaDownload,
    FaImage,
    FaVideo,
    FaFile,
    FaUsers,
    FaTrophy,
} from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function TeacherProjectShow({ project, auth }) {
    const { confirm } = useConfirmDialog();

    const getStatusBadge = (status) => {
        const statusMap = {
            'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'موافق', icon: FaCheckCircle },
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'قيد المراجعة', icon: FaClock },
            'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'مرفوض', icon: FaTimesCircle },
        };
        const statusConfig = statusMap[status] || statusMap.pending;
        const StatusIcon = statusConfig.icon;

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${statusConfig.bg} ${statusConfig.text}`}>
                <StatusIcon />
                {statusConfig.label}
            </span>
        );
    };

    const getCategoryLabel = (category) => {
        const categoryMap = {
            'science': 'علوم',
            'technology': 'تقنية',
            'engineering': 'هندسة',
            'mathematics': 'رياضيات',
            'arts': 'فنون',
            'other': 'أخرى',
        };
        return categoryMap[category] || 'أخرى';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'غير محدد';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getFileIcon = (filePath) => {
        const extension = filePath.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
            return FaImage;
        } else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension)) {
            return FaVideo;
        }
        return FaFile;
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
            router.delete(route('teacher.projects.destroy', project.id));
        }
    };

    return (
        <DashboardLayout header="تفاصيل المشروع">
            <Head title={`${project.title} - تفاصيل المشروع`} />

            <div className="mb-6">
                <Link
                    href={route('teacher.projects.index')}
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
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-3">{project.title}</h1>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {getStatusBadge(project.status)}
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                                        {getCategoryLabel(project.category)}
                                    </span>
                                    {project.views && (
                                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                                            <FaEye />
                                            <span>{project.views} مشاهدة</span>
                                        </div>
                                    )}
                                    {project.likes && (
                                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                                            <FaHeart className="text-red-500" />
                                            <span>{project.likes} إعجاب</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {project.status === 'pending' && (
                                <Link
                                    href={route('teacher.projects.edit', project.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <FaEdit />
                                    تعديل
                                </Link>
                            )}
                        </div>

                        <div className="prose max-w-none mb-6">
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{project.description}</p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{project.views || 0}</div>
                                <div className="text-sm text-gray-600">مشاهدة</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{project.likes || 0}</div>
                                <div className="text-sm text-gray-600">إعجاب</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{project.rating || 0}</div>
                                <div className="text-sm text-gray-600">تقييم</div>
                            </div>
                        </div>
                    </div>

                    {/* Files Section */}
                    {(project.files && project.files.length > 0) && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaFileAlt />
                                الملفات المرفقة
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {project.files.map((file, index) => {
                                    const FileIcon = getFileIcon(file);
                                    const fileUrl = file.startsWith('http') ? file : `/storage/${file}`;
                                    const fileName = file.split('/').pop();

                                    return (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
                                        >
                                            <FileIcon className="text-2xl text-gray-600" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                                            </div>
                                            <a
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800"
                                                title="تحميل"
                                            >
                                                <FaDownload />
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Images Section */}
                    {(project.images && project.images.length > 0) && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaImage />
                                الصور
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {project.images.map((image, index) => {
                                    const imageUrl = image.startsWith('http') ? image : `/storage/${image}`;
                                    return (
                                        <div key={index} className="relative group">
                                            <img
                                                src={imageUrl}
                                                alt={`${project.title} - صورة ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                            />
                                            <a
                                                href={imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center rounded-lg"
                                            >
                                                <FaEye className="text-white opacity-0 group-hover:opacity-100 transition text-2xl" />
                                            </a>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Submissions Section */}
                    {project.submissions && project.submissions.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaUsers />
                                التسليمات ({project.submissions.length})
                            </h2>
                            <div className="space-y-3">
                                {project.submissions.map((submission) => (
                                    <div
                                        key={submission.id}
                                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <FaUser className="text-gray-400" />
                                                <span className="font-medium text-gray-900">
                                                    {submission.student?.name || 'طالب'}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                submission.status === 'evaluated' ? 'bg-green-100 text-green-800' :
                                                submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {submission.status === 'evaluated' ? 'تم التقييم' :
                                                 submission.status === 'submitted' ? 'تم التسليم' : 'قيد المراجعة'}
                                            </span>
                                        </div>
                                        {submission.comment && (
                                            <p className="text-sm text-gray-600 mb-2">{submission.comment}</p>
                                        )}
                                        {submission.submitted_at && (
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <FaCalendar />
                                                {formatDate(submission.submitted_at)}
                                            </div>
                                        )}
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
                                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                                    <FaCalendar />
                                    تاريخ الإنشاء
                                </p>
                                <p className="font-semibold text-gray-900">{formatDate(project.created_at)}</p>
                            </div>
                            {project.approved_at && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                                        <FaCheckCircle />
                                        تاريخ الموافقة
                                    </p>
                                    <p className="font-semibold text-gray-900">{formatDate(project.approved_at)}</p>
                                </div>
                            )}
                            {project.points_earned > 0 && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                                        <FaTrophy />
                                        النقاط المكتسبة
                                    </p>
                                    <p className="font-semibold text-green-600">{project.points_earned}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Student/Publisher Info */}
                    {project.user && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات الطالب</h2>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                    <FaUser className="text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{project.user.name}</p>
                                    <p className="text-sm text-gray-600">{project.user.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* School Info */}
                    {project.school && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaSchool />
                                المدرسة
                            </h2>
                            <p className="font-semibold text-gray-900">{project.school.name}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">الإجراءات</h2>
                        <div className="space-y-2">
                            {project.status === 'pending' && (
                                <Link
                                    href={route('teacher.projects.edit', project.id)}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                                >
                                    <FaEdit />
                                    تعديل المشروع
                                </Link>
                            )}
                            {project.status === 'pending' && (
                                <button
                                    onClick={handleDelete}
                                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                                >
                                    <FaTrash />
                                    حذف المشروع
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

