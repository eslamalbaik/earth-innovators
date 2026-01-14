import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaTrophy, FaSave, FaTimes, FaAward, FaUser } from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function AdminBadgesIndex({ badges, stats, filters = {} }) {
    const { confirm } = useConfirmDialog();
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [type, setType] = useState(filters?.type || '');
    const [showAwardModal, setShowAwardModal] = useState(false);
    const [badgeToAward, setBadgeToAward] = useState(null);

    const { data: awardData, setData: setAwardData, post: awardBadge, processing: awardProcessing, errors: awardErrors, reset: resetAwardForm } = useForm({
        user_id: '',
        project_id: '',
        challenge_id: '',
        reason: '',
    });

    const handleFilter = () => {
        router.get(route('admin.badges.index'), {
            search: search || undefined,
            status: status || undefined,
            type: type || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = async (badgeId, badgeName) => {
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: `هل أنت متأكد من حذف الشارة "${badgeName}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('admin.badges.destroy', badgeId), {
                preserveScroll: true,
                onSuccess: () => {
                    // سيتم إعادة تحميل الصفحة تلقائياً
                },
            });
        }
    };

    const handleAward = (badge) => {
        setBadgeToAward(badge);
        setShowAwardModal(true);
    };

    const handleAwardSubmit = (e) => {
        e.preventDefault();
        if (!badgeToAward) return;

        awardBadge(route('admin.badges.award', badgeToAward.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowAwardModal(false);
                setBadgeToAward(null);
                resetAwardForm();
            },
        });
    };

    const closeAwardModal = () => {
        setShowAwardModal(false);
        setBadgeToAward(null);
        resetAwardForm();
    };

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    نشط
                </span>
            );
        }
        return (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                غير نشط
            </span>
        );
    };

    const getTypeLabel = (type) => {
        const typeMap = {
            'rank_first': 'المركز الأول',
            'rank_second': 'المركز الثاني',
            'rank_third': 'المركز الثالث',
            'excellent_innovator': 'مبتكر ممتاز',
            'active_participant': 'مشارك نشط',
            'custom': 'مخصص',
        };
        return typeMap[type] || type;
    };

    return (
        <DashboardLayout header="إدارة الشارات">
            <Head title="إدارة الشارات" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">إجمالي الشارات</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">الشارات النشطة</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">إجمالي الشارات الممنوحة</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalAwarded || 0}</p>
                </div>
            </div>

            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">قائمة الشارات</h2>
                <Link
                    href={route('admin.badges.create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                    <FaPlus />
                    إضافة شارة جديدة
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث عن شارة..."
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">الكل</option>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">الكل</option>
                            <option value="rank_first">المركز الأول</option>
                            <option value="rank_second">المركز الثاني</option>
                            <option value="rank_third">المركز الثالث</option>
                            <option value="excellent_innovator">مبتكر ممتاز</option>
                            <option value="active_participant">مشارك نشط</option>
                            <option value="custom">مخصص</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleFilter}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaFilter />
                            تصفية
                        </button>
                    </div>
                </div>
            </div>

            {/* Badges Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">الشارة</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">الاسم</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">النوع</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">النقاط المطلوبة</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">الحالة</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">تاريخ الإنشاء</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {badges.data && badges.data.length > 0 ? (
                                badges.data.map((badge) => (
                                    <tr key={badge.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center">
                                                {(() => {
                                                    // Helper function to check if a string is a valid image URL
                                                    const isValidImageUrl = (url) => {
                                                        if (!url) return false;
                                                        return url.startsWith('http') ||
                                                               url.startsWith('/storage/') ||
                                                               url.startsWith('/images/') ||
                                                               /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url);
                                                    };

                                                    // Helper function to check if icon is emoji/text (not a file path)
                                                    const isEmojiOrText = (icon) => {
                                                        if (!icon) return false;
                                                        // If it starts with /storage/, it's been incorrectly formatted
                                                        if (icon.startsWith('/storage/') && icon.length < 100) {
                                                            // Likely an emoji that was formatted incorrectly
                                                            return true;
                                                        }
                                                        // If it doesn't look like a file path, treat as emoji/text
                                                        return !isValidImageUrl(icon) && icon.length < 50;
                                                    };

                                                    // Priority: image > icon (if emoji) > icon (if file) > default
                                                    if (badge.image && isValidImageUrl(badge.image)) {
                                                        return (
                                                            <img
                                                                src={badge.image}
                                                                alt={badge.name_ar || badge.name}
                                                                className="w-16 h-16 object-contain rounded-lg"
                                                                onError={(e) => {
                                                                    // Fallback to icon or default
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        );
                                                    }

                                                    if (badge.icon) {
                                                        // If icon is emoji or text, display as text
                                                        if (isEmojiOrText(badge.icon)) {
                                                            // Remove /storage/ prefix if it was incorrectly added
                                                            const displayIcon = badge.icon.replace(/^\/storage\//, '');
                                                            return (
                                                                <div className="w-16 h-16 flex items-center justify-center text-3xl">
                                                                    {displayIcon}
                                                                </div>
                                                            );
                                                        }
                                                        // If icon is a file path, display as image
                                                        if (isValidImageUrl(badge.icon)) {
                                                            return (
                                                                <img
                                                                    src={badge.icon}
                                                                    alt={badge.name_ar || badge.name}
                                                                    className="w-16 h-16 object-contain rounded-lg"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            );
                                                        }
                                                    }

                                                    // Default fallback
                                                    return (
                                                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                                                            <FaTrophy className="text-white text-2xl" />
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <div className="font-semibold text-gray-900">{badge.name_ar || badge.name}</div>
                                                {badge.description_ar && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{badge.description_ar}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-gray-700">{getTypeLabel(badge.type)}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-medium text-gray-900">{badge.points_required || 0}</span>
                                        </td>
                                        <td className="py-4 px-6">{getStatusBadge(badge.is_active)}</td>
                                        <td className="py-4 px-6 text-sm text-gray-700">
                                            {badge.created_at ? new Date(badge.created_at).toLocaleDateString('ar-SA') : '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleAward(badge)}
                                                    className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50"
                                                    title="منح الشارة"
                                                >
                                                    <FaAward />
                                                </button>
                                                <Link
                                                    href={route('admin.badges.edit', badge.id)}
                                                    className="text-yellow-600 hover:text-yellow-800 p-2 rounded-lg hover:bg-yellow-50"
                                                    title="تعديل"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(badge.id, badge.name_ar || badge.name)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                                                    title="حذف"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-500">
                                        لا توجد شارات
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {badges.links && badges.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                عرض {badges.from} إلى {badges.to} من {badges.total} شارة
                            </div>
                            <div className="flex gap-2">
                                {badges.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Award Badge Modal */}
            {showAwardModal && badgeToAward && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
                            <h3 className="text-2xl font-bold text-gray-900">منح الشارة: {badgeToAward.name_ar || badgeToAward.name}</h3>
                            <button
                                onClick={closeAwardModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleAwardSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                {/* معرف المستخدم */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        معرف المستخدم (User ID) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={awardData.user_id}
                                            onChange={(e) => setAwardData('user_id', e.target.value)}
                                            placeholder="أدخل معرف المستخدم..."
                                            className={`w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                awardErrors.user_id ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        يمكنك العثور على معرف المستخدم من صفحة إدارة المستخدمين
                                    </p>
                                    {awardErrors.user_id && (
                                        <p className="mt-1 text-sm text-red-600">{awardErrors.user_id}</p>
                                    )}
                                </div>

                                {/* المشروع (اختياري) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        المشروع (اختياري)
                                    </label>
                                    <input
                                        type="number"
                                        value={awardData.project_id}
                                        onChange={(e) => setAwardData('project_id', e.target.value)}
                                        placeholder="معرف المشروع"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            awardErrors.project_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {awardErrors.project_id && (
                                        <p className="mt-1 text-sm text-red-600">{awardErrors.project_id}</p>
                                    )}
                                </div>

                                {/* التحدي (اختياري) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        التحدي (اختياري)
                                    </label>
                                    <input
                                        type="number"
                                        value={awardData.challenge_id}
                                        onChange={(e) => setAwardData('challenge_id', e.target.value)}
                                        placeholder="معرف التحدي"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            awardErrors.challenge_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {awardErrors.challenge_id && (
                                        <p className="mt-1 text-sm text-red-600">{awardErrors.challenge_id}</p>
                                    )}
                                </div>

                                {/* السبب */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        السبب (اختياري)
                                    </label>
                                    <textarea
                                        value={awardData.reason}
                                        onChange={(e) => setAwardData('reason', e.target.value)}
                                        rows={3}
                                        placeholder="سبب منح الشارة..."
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            awardErrors.reason ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {awardErrors.reason && (
                                        <p className="mt-1 text-sm text-red-600">{awardErrors.reason}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={awardProcessing || !awardData.user_id}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaAward />
                                    {awardProcessing ? 'جاري المنح...' : 'منح الشارة'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeAwardModal}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg flex items-center gap-2"
                                >
                                    <FaTimes />
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
