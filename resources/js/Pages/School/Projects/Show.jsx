import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaArrowLeft, FaEdit, FaTrash, FaFile, FaImage, FaDownload, FaUser, FaCalendar, FaTag } from 'react-icons/fa';
import { toHijriDate } from '@/utils/dateUtils';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function ShowSchoolProject({ project, auth }) {
    const { confirm } = useConfirmDialog();
    const categoryColors = {
        science: 'bg-blue-100 text-blue-700',
        technology: 'bg-purple-100 text-purple-700',
        engineering: 'bg-orange-100 text-orange-700',
        mathematics: 'bg-green-100 text-green-700',
        arts: 'bg-pink-100 text-pink-700',
        other: 'bg-gray-100 text-gray-700',
    };

    const categoryLabels = {
        science: 'علوم',
        technology: 'تقني',
        engineering: 'هندسة',
        mathematics: 'رياضيات',
        arts: 'فنون',
        other: 'أخرى',
    };

    const statusLabels = {
        pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700' },
        approved: { label: 'موافق', color: 'bg-green-100 text-green-700' },
        rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700' },
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
            // استخدام router.post مع _method: DELETE للتوافق مع Laravel
            router.post(`/school/projects/${project.id}`, {
                _method: 'DELETE',
            }, {
                preserveScroll: false,
                onSuccess: () => {
                    // إعادة التوجيه إلى قائمة المشاريع بعد الحذف
                    router.visit('/school/projects');
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                    alert('حدث خطأ أثناء حذف المشروع');
                },
            });
        }
    };

    const canEdit = project.user_id === auth.user.id || project.school_id === auth.user.id || project.teacher_id;

    return (
        <DashboardLayout header="تفاصيل المشروع">
            <Head title={`${project.title} - إرث المبتكرين`} />

            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link
                        href="/school/projects"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
                    >
                        <FaArrowLeft />
                        <span>العودة إلى المشاريع</span>
                    </Link>
                    {canEdit && (
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/school/projects/${project.id}/edit`}
                                className="bg-[#A3C042] hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                            >
                                <FaEdit />
                                تعديل
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                            >
                                <FaTrash />
                                حذف
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.title}</h1>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${categoryColors[project.category] || categoryColors.other}`}>
                                        <FaTag className="inline ml-1" />
                                        {categoryLabels[project.category] || 'أخرى'}
                                    </span>
                                    {statusLabels[project.status] && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusLabels[project.status].color}`}>
                                            {statusLabels[project.status].label}
                                        </span>
                                    )}
                                    {project.points_earned > 0 && (
                                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                                            {project.points_earned} نقطة
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Project Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="flex items-center gap-3 text-gray-700">
                                <FaUser className="text-[#A3C042]" />
                                <span className="font-medium">الطالب/المؤلف:</span>
                                <span>{project.user?.name || 'المدرسة'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <FaCalendar className="text-[#A3C042]" />
                                <span className="font-medium">تاريخ الإنشاء:</span>
                                <span>{toHijriDate(project.created_at)}</span>
                            </div>
                            {project.approved_at && (
                                <div className="flex items-center gap-3 text-gray-700">
                                    <FaCalendar className="text-[#A3C042]" />
                                    <span className="font-medium">تاريخ الموافقة:</span>
                                    <span>{toHijriDate(project.approved_at)}</span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">وصف المشروع</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{project.description}</p>
                        </div>

                        {/* Report */}
                        {project.report && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-3">تقرير المشروع</h2>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{project.report}</p>
                                </div>
                            </div>
                        )}

                        {/* Images */}
                        {project.images && project.images.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <FaImage className="text-[#A3C042]" />
                                    صور المشروع ({project.images.length})
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {project.images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={image.startsWith('http') ? image : `/storage/${image}`}
                                                alt={`Project image ${index + 1}`}
                                                className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition"
                                            />
                                            <a
                                                href={image.startsWith('http') ? image : `/storage/${image}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded-lg"
                                            >
                                                <FaDownload className="text-white text-2xl opacity-0 group-hover:opacity-100 transition" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Files */}
                        {project.files && project.files.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <FaFile className="text-[#A3C042]" />
                                    ملفات المشروع ({project.files.length})
                                </h2>
                                <div className="space-y-2">
                                    {project.files.map((file, index) => {
                                        const fileName = typeof file === 'string' ? file.split('/').pop() : file;
                                        const fileUrl = file.startsWith('http') ? file : `/storage/${file}`;
                                        return (
                                            <a
                                                key={index}
                                                href={fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FaFile className="text-gray-400 text-xl" />
                                                    <span className="text-gray-700 font-medium">{fileName}</span>
                                                </div>
                                                <FaDownload className="text-[#A3C042] opacity-0 group-hover:opacity-100 transition" />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

