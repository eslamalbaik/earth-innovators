import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaTrophy, FaSave, FaTimes, FaAward, FaUser } from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';

export default function AdminBadgesIndex({ badges, stats, filters = {} }) {
    const { confirm } = useConfirmDialog();
    const { t } = useTranslation();
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
            title: t('adminBadgesPage.deleteConfirm.title'),
            message: t('adminBadgesPage.deleteConfirm.message', { name: badgeName }),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
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
                    {t('common.active')}
                </span>
            );
        }
        return (
            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                {t('common.inactive')}
            </span>
        );
    };

    const getTypeLabel = (type) => {
        const typeMap = {
            rank_first: t('adminBadgesPage.types.rankFirst'),
            rank_second: t('adminBadgesPage.types.rankSecond'),
            rank_third: t('adminBadgesPage.types.rankThird'),
            excellent_innovator: t('adminBadgesPage.types.excellentInnovator'),
            active_participant: t('adminBadgesPage.types.activeParticipant'),
            custom: t('adminBadgesPage.types.custom'),
        };
        return typeMap[type] || type;
    };

    return (
        <DashboardLayout header={t('adminBadgesPage.title')}>
            <Head title={t('adminBadgesPage.pageTitle', { appName: t('common.appName') })} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('adminBadgesPage.stats.total')}</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('adminBadgesPage.stats.active')}</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('adminBadgesPage.stats.totalAwarded')}</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalAwarded || 0}</p>
                </div>
            </div>

            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('adminBadgesPage.badgesList')}</h2>
                <Link
                    href={route('admin.badges.create')}
                    className="bg-[#A3C042] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                    <FaPlus />
                    {t('adminBadgesPage.addNew')}
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.search')}</label>
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('adminBadgesPage.searchPlaceholder')}
                                className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.status')}</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">{t('common.all')}</option>
                            <option value="active">{t('common.active')}</option>
                            <option value="inactive">{t('common.inactive')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminBadgesPage.table.type')}</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">{t('common.all')}</option>
                            <option value="rank_first">{t('adminBadgesPage.types.rankFirst')}</option>
                            <option value="rank_second">{t('adminBadgesPage.types.rankSecond')}</option>
                            <option value="rank_third">{t('adminBadgesPage.types.rankThird')}</option>
                            <option value="excellent_innovator">{t('adminBadgesPage.types.excellentInnovator')}</option>
                            <option value="active_participant">{t('adminBadgesPage.types.activeParticipant')}</option>
                            <option value="custom">{t('adminBadgesPage.types.custom')}</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleFilter}
                            className="w-full bg-[#A3C042] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaFilter />
                            {t('common.filter')}
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
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminBadgesPage.table.badge')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('common.name')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminBadgesPage.table.type')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminBadgesPage.table.pointsRequired')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('common.status')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminBadgesPage.table.createdAt')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('common.actions')}</th>
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
                                            {badge.created_at ? new Date(badge.created_at).toLocaleDateString('en-US') : '-'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleAward(badge)}
                                                    className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50"
                                                    title={t('adminBadgesPage.actions.award')}
                                                >
                                                    <FaAward />
                                                </button>
                                                <Link
                                                    href={route('admin.badges.edit', badge.id)}
                                                    className="text-yellow-600 hover:text-yellow-800 p-2 rounded-lg hover:bg-yellow-50"
                                                    title={t('common.edit')}
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(badge.id, badge.name_ar || badge.name)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                                                    title={t('common.delete')}
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
                                        {t('adminBadgesPage.empty')}
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
                                {t('pagination.showing')}{' '}
                                {badges.from} {t('pagination.to')} {badges.to} {t('pagination.of')} {badges.total}{' '}
                                {t('adminBadgesPage.badgeUnit')}
                            </div>
                            <div className="flex gap-2">
                                {badges.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${link.active
                                                ? 'bg-[#A3C042] text-white'
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
                            <h3 className="text-2xl font-bold text-gray-900">
                                {t('adminBadgesPage.awardModal.title', { name: badgeToAward.name_ar || badgeToAward.name })}
                            </h3>
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
                                        {t('adminBadgesPage.awardModal.userIdLabel')} <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={awardData.user_id}
                                            onChange={(e) => setAwardData('user_id', e.target.value)}
                                            placeholder={t('adminBadgesPage.awardModal.userIdPlaceholder')}
                                            className={`w-full ps-10 pe-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${awardErrors.user_id ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            required
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {t('adminBadgesPage.awardModal.userIdHint')}
                                    </p>
                                    {awardErrors.user_id && (
                                        <p className="mt-1 text-sm text-red-600">{awardErrors.user_id}</p>
                                    )}
                                </div>

                                {/* المشروع (اختياري) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('adminBadgesPage.awardModal.projectLabel')}
                                    </label>
                                    <input
                                        type="number"
                                        value={awardData.project_id}
                                        onChange={(e) => setAwardData('project_id', e.target.value)}
                                        placeholder={t('adminBadgesPage.awardModal.projectPlaceholder')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${awardErrors.project_id ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {awardErrors.project_id && (
                                        <p className="mt-1 text-sm text-red-600">{awardErrors.project_id}</p>
                                    )}
                                </div>

                                {/* التحدي (اختياري) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('adminBadgesPage.awardModal.challengeLabel')}
                                    </label>
                                    <input
                                        type="number"
                                        value={awardData.challenge_id}
                                        onChange={(e) => setAwardData('challenge_id', e.target.value)}
                                        placeholder={t('adminBadgesPage.awardModal.challengePlaceholder')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${awardErrors.challenge_id ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {awardErrors.challenge_id && (
                                        <p className="mt-1 text-sm text-red-600">{awardErrors.challenge_id}</p>
                                    )}
                                </div>

                                {/* السبب */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('adminBadgesPage.awardModal.reasonLabel')}
                                    </label>
                                    <textarea
                                        value={awardData.reason}
                                        onChange={(e) => setAwardData('reason', e.target.value)}
                                        rows={3}
                                        placeholder={t('adminBadgesPage.awardModal.reasonPlaceholder')}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${awardErrors.reason ? 'border-red-500' : 'border-gray-300'
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
                                    {awardProcessing ? t('adminBadgesPage.awardModal.awarding') : t('adminBadgesPage.actions.award')}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeAwardModal}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg flex items-center gap-2"
                                >
                                    <FaTimes />
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
