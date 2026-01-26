import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaBook, FaPlus, FaEye, FaClock, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash } from 'react-icons/fa';

export default function TeacherPublications({ publications, auth }) {
    const statusLabels = {
        pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: FaClock },
        approved: { label: 'منشور', color: 'bg-green-100 text-green-700 border-green-300', icon: FaCheckCircle },
        rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-300', icon: FaTimesCircle },
    };

    const typeLabels = {
        magazine: 'مجلة',
        booklet: 'كتيب',
        report: 'تقرير',
        article: 'مقال',
    };

    return (
        <DashboardLayout header="مقالاتي">
            <Head title="مقالاتي - لوحة المعلم" />

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">المقالات المنشورة</h2>
                <Link
                    href="/teacher/publications/create"
                    className="bg-gradient-to-r from-[#A3C042] to-legacy-blue text-white px-6 py-3 rounded-lg font-semibold transition duration-300 flex items-center gap-2 shadow-md hover:shadow-xl"
                >
                    <FaPlus />
                    إنشاء مقال جديد
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FaBook className="text-[#A3C042]" />
                        المقالات ({publications.total || 0})
                    </h3>
                </div>
                <div className="p-6">
                    {publications.data && publications.data.length > 0 ? (
                        <div className="space-y-4">
                            {publications.data.map((publication) => {
                                const StatusIcon = statusLabels[publication.status]?.icon || FaClock;
                                return (
                                    <div key={publication.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <h4 className="text-xl font-bold text-gray-900">{publication.title}</h4>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusLabels[publication.status]?.color || statusLabels.pending.color}`}>
                                                        <StatusIcon className="inline text-xs mr-1" />
                                                        {statusLabels[publication.status]?.label || 'قيد المراجعة'}
                                                    </span>
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
                                                        {typeLabels[publication.type] || publication.type}
                                                    </span>
                                                </div>
                                                {publication.description && (
                                                    <p className="text-gray-700 mb-3 line-clamp-2">{publication.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    {publication.school && (
                                                        <>
                                                            <span><strong>المدرسة:</strong> {publication.school.name}</span>
                                                            <span>•</span>
                                                        </>
                                                    )}
                                                    <span>تاريخ الإرسال: {new Date(publication.created_at).toLocaleDateString('en-US')}</span>
                                                    {publication.approved_at && (
                                                        <>
                                                            <span>•</span>
                                                            <span>تاريخ الموافقة: {new Date(publication.approved_at).toLocaleDateString('en-US')}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 mr-6">
                                                <Link
                                                    href={`/teacher/publications/${publication.id}`}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                                                >
                                                    <FaEye />
                                                    عرض
                                                </Link>
                                                {publication.status === 'pending' && (
                                                    <Link
                                                        href={`/teacher/publications/${publication.id}/edit`}
                                                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                                                    >
                                                        <FaEdit />
                                                        تعديل
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg mb-4">لا توجد مقالات منشورة</p>
                            <Link
                                href="/teacher/publications/create"
                                className="inline-block bg-gradient-to-r from-[#A3C042] to-legacy-blue text-white px-6 py-3 rounded-lg font-semibold transition"
                            >
                                <FaPlus className="inline ml-2" />
                                إنشاء مقال جديد
                            </Link>
                        </div>
                    )}

                    {publications.links && publications.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                {publications.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg font-medium transition ${
                                            link.active
                                                ? 'bg-gradient-to-r from-[#A3C042] to-legacy-blue text-white'
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

