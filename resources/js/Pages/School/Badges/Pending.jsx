import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FaMedal, FaSearch, FaEye, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState } from 'react';

export default function PendingBadges({ badges, auth }) {
    const { confirm } = useConfirmDialog();
    const { data, setData, get } = useForm({
        search: '',
    });

    const [rejectReason, setRejectReason] = useState('');
    const [rejectingBadgeId, setRejectingBadgeId] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        get('/school/badges/pending', {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleApprove = async (badgeId, badgeName) => {
        const confirmed = await confirm({
            title: 'تأكيد القبول',
            message: `هل أنت متأكد من قبول الشارة "${badgeName}"؟`,
            confirmText: 'قبول',
            cancelText: 'إلغاء',
            variant: 'info',
        });

        if (confirmed) {
            router.post(`/school/badges/${badgeId}/approve`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleReject = async (badgeId, badgeName) => {
        if (rejectReason.trim() === '') {
            alert('يرجى إدخال سبب الرفض');
            return;
        }
        
        const confirmed = await confirm({
            title: 'تأكيد الرفض',
            message: `هل أنت متأكد من رفض الشارة "${badgeName}"؟`,
            confirmText: 'رفض',
            cancelText: 'إلغاء',
            variant: 'warning',
        });

        if (confirmed) {
            router.post(`/school/badges/${badgeId}/reject`, {
                rejection_reason: rejectReason,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectReason('');
                    setRejectingBadgeId(null);
                },
            });
        }
    };

    return (
        <DashboardLayout header="الشارات المعلقة للمراجعة">
            <Head title="الشارات المعلقة - إرث المبتكرين" />

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                        <TextInput
                            type="text"
                            placeholder="ابحث عن الشارات..."
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <PrimaryButton type="submit">
                        <FaSearch className="inline ml-2" />
                        بحث
                    </PrimaryButton>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FaClock className="text-[#A3C042]" />
                        الشارات المعلقة للمراجعة ({badges.total || 0})
                    </h3>
                </div>
                <div className="p-6">
                    {badges.data && badges.data.length > 0 ? (
                        <div className="space-y-4">
                            {badges.data.map((badge) => (
                                <div key={badge.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                {badge.image && (
                                                    <img
                                                        src={badge.image.startsWith('http') ? badge.image : `/storage/${badge.image}`}
                                                        alt={badge.name_ar || badge.name}
                                                        className="w-16 h-16 rounded-lg object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <h4 className="text-xl font-bold text-gray-900">{badge.name_ar || badge.name}</h4>
                                                    <p className="text-sm text-gray-600">{badge.description_ar || badge.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                {badge.creator && (
                                                    <>
                                                        <span><strong>المعلم:</strong> {badge.creator.name}</span>
                                                        <span>•</span>
                                                    </>
                                                )}
                                                <span>النقاط المطلوبة: {badge.points_required}</span>
                                                <span>•</span>
                                                <span>تاريخ الإرسال: {new Date(badge.created_at).toLocaleDateString('en-US')}</span>
                                            </div>
                                            <div className="text-sm">
                                                <p><strong>النوع:</strong> {badge.type}</p>
                                                {badge.icon && <p><strong>الأيقونة:</strong> {badge.icon}</p>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 mr-6">
                                            <Link
                                                href={`/school/badges/${badge.id}`}
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2"
                                            >
                                                <FaEye />
                                                عرض
                                            </Link>
                                            <button
                                                onClick={() => handleApprove(badge.id, badge.name_ar || badge.name)}
                                                className="bg-[#A3C042] hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                            >
                                                <FaCheckCircle />
                                                قبول
                                            </button>
                                            {rejectingBadgeId === badge.id ? (
                                                <div className="flex flex-col gap-2 w-64">
                                                    <textarea
                                                        value={rejectReason}
                                                        onChange={(e) => setRejectReason(e.target.value)}
                                                        placeholder="سبب الرفض..."
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                        rows="3"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleReject(badge.id, badge.name_ar || badge.name)}
                                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
                                                        >
                                                            تأكيد الرفض
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRejectingBadgeId(null);
                                                                setRejectReason('');
                                                            }}
                                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium transition"
                                                        >
                                                            إلغاء
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setRejectingBadgeId(badge.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-md"
                                                >
                                                    <FaTimesCircle />
                                                    رفض
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FaMedal className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 text-lg">لا توجد شارات معلقة للمراجعة</p>
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

