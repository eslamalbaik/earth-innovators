import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaMedal, FaPlus, FaEye, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function TeacherBadges({ badges, auth }) {
    const statusLabels = {
        pending: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: FaClock },
        approved: { label: 'موافق', color: 'bg-green-100 text-green-700 border-green-300', icon: FaCheckCircle },
        rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-300', icon: FaTimesCircle },
    };

    return (
        <DashboardLayout header="شاراتي">
            <Head title="شاراتي - إرث المبتكرين" />

            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">الشارات المرسلة</h2>
                <Link
                    href="/teacher/badges/create"
                    className="bg-gradient-to-r from-[#A3C042] to-legacy-blue text-white px-6 py-3 rounded-lg font-semibold transition duration-300 flex items-center gap-2 shadow-md hover:shadow-xl"
                >
                    <FaPlus />
                    إرسال شارة جديدة
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FaMedal className="text-[#A3C042]" />
                        الشارات ({badges.total || 0})
                    </h3>
                </div>
                <div className="p-6">
                    {badges.data && badges.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {badges.data.map((badge) => {
                                const StatusIcon = statusLabels[badge.status]?.icon || FaClock;
                                return (
                                    <div key={badge.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-gray-900 mb-2">{badge.name_ar || badge.name}</h4>
                                                <p className="text-sm text-gray-600 line-clamp-2">{badge.description_ar || badge.description}</p>
                                            </div>
                                            {badge.image && (
                                                <img
                                                    src={badge.image.startsWith('http') ? badge.image : `/storage/${badge.image}`}
                                                    alt={badge.name_ar || badge.name}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 ${statusLabels[badge.status]?.color || statusLabels.pending.color}`}>
                                                <StatusIcon className="text-xs" />
                                                {statusLabels[badge.status]?.label || 'قيد المراجعة'}
                                            </span>
                                            <span className="text-sm text-gray-600">
                                                {badge.points_required} نقطة
                                            </span>
                                        </div>

                                        <div className="text-sm text-gray-500 mb-4">
                                            {badge.school && (
                                                <p><strong>المدرسة:</strong> {badge.school.name}</p>
                                            )}
                                            {badge.approved_at && (
                                                <p><strong>تاريخ الموافقة:</strong> {new Date(badge.approved_at).toLocaleDateString('ar-SA')}</p>
                                            )}
                                            {badge.rejection_reason && (
                                                <p className="text-red-600 mt-2"><strong>سبب الرفض:</strong> {badge.rejection_reason}</p>
                                            )}
                                        </div>

                                        <Link
                                            href={`/teacher/badges/${badge.id}`}
                                            className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition"
                                        >
                                            <FaEye className="inline ml-2" />
                                            عرض التفاصيل
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaMedal className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg mb-4">لا توجد شارات مرسلة</p>
                            <Link
                                href="/teacher/badges/create"
                                className="inline-block bg-gradient-to-r from-[#A3C042] to-legacy-blue text-white px-6 py-3 rounded-lg font-semibold transition"
                            >
                                <FaPlus className="inline ml-2" />
                                إرسال شارة جديدة
                            </Link>
                        </div>
                    )}

                    {badges.links && badges.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                {badges.links.map((link, index) => (
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

