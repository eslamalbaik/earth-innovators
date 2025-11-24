import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FaProjectDiagram, FaPlus, FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash } from 'react-icons/fa';
import { toHijriDate } from '@/utils/dateUtils';

export default function TeacherProjects({ projects, auth }) {
    const handleDelete = (projectId, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
            router.delete(`/teacher/projects/${projectId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    // تم الحذف بنجاح
                },
                onError: (errors) => {
                    console.error('Error deleting project:', errors);
                    alert('حدث خطأ أثناء حذف المشروع. يرجى المحاولة مرة أخرى.');
                },
            });
        }
    };

    const categoryColors = {
        science: 'bg-blue-100 text-blue-700 border-blue-300',
        technology: 'bg-purple-100 text-purple-700 border-purple-300',
        engineering: 'bg-orange-100 text-orange-700 border-orange-300',
        mathematics: 'bg-green-100 text-green-700 border-green-300',
        arts: 'bg-pink-100 text-pink-700 border-pink-300',
        other: 'bg-gray-100 text-gray-700 border-gray-300',
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
        pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: FaClock },
        approved: { label: 'موافق', color: 'bg-green-100 text-green-700 border-green-300', icon: FaCheckCircle },
        rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-300', icon: FaTimesCircle },
    };

    return (
        <DashboardLayout header="مشاريعي">
            <Head title="مشاريعي - إرث المبتكرين" />

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">المشاريع المرسلة</h2>
                <Link
                    href="/teacher/projects/create"
                    className="bg-gradient-to-r from-legacy-green to-legacy-blue text-white px-6 py-3 rounded-lg font-semibold transition duration-300 flex items-center gap-2 shadow-md hover:shadow-xl"
                >
                    <FaPlus />
                    إرسال مشروع جديد
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FaProjectDiagram className="text-legacy-green" />
                        المشاريع ({projects.total || 0})
                    </h3>
                </div>
                <div className="p-6">
                    {projects.data && projects.data.length > 0 ? (
                        <div className="space-y-4">
                            {projects.data.map((project) => {
                                const StatusIcon = statusLabels[project.status]?.icon || FaClock;
                                return (
                                    <div key={project.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h4 className="text-xl font-bold text-gray-900">{project.title}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[project.category] || categoryColors.other}`}>
                                                        {categoryLabels[project.category] || 'أخرى'}
                                                    </span>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusLabels[project.status]?.color || statusLabels.pending.color}`}>
                                                        <StatusIcon className="text-xs" />
                                                        {statusLabels[project.status]?.label || 'قيد المراجعة'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 mb-3 line-clamp-2">{project.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    {project.school && (
                                                        <>
                                                            <span><strong>المدرسة:</strong> {project.school.name}</span>
                                                            <span>•</span>
                                                        </>
                                                    )}
                                                    <span>تاريخ الإرسال: {toHijriDate(project.created_at)}</span>
                                                    {project.approved_at && (
                                                        <>
                                                            <span>•</span>
                                                            <span>تاريخ الموافقة: {toHijriDate(project.approved_at)}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mr-6">
                                                <Link
                                                    href={`/teacher/projects/${project.id}`}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                                                >
                                                    <FaEye />
                                                    عرض
                                                </Link>
                                                {project.status === 'pending' && (
                                                    <>
                                                        <Link
                                                            href={`/teacher/projects/${project.id}/edit`}
                                                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                                                        >
                                                            <FaEdit />
                                                            تعديل
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleDelete(project.id, e)}
                                                            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                                                        >
                                                            <FaTrash />
                                                            حذف
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaProjectDiagram className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg mb-4">لا توجد مشاريع مرسلة</p>
                            <Link
                                href="/teacher/projects/create"
                                className="inline-block bg-gradient-to-r from-legacy-green to-legacy-blue text-white px-6 py-3 rounded-lg font-semibold transition"
                            >
                                <FaPlus className="inline ml-2" />
                                إرسال مشروع جديد
                            </Link>
                        </div>
                    )}

                    {projects.links && projects.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                {projects.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                            link.active
                                                ? 'bg-gradient-to-r from-legacy-green to-legacy-blue text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

