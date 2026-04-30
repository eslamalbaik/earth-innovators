import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaBox, FaUsers, FaDollarSign } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function AdminPackagesIndex({ packages, stats }) {
    const { t, language } = useTranslation();
    const [search, setSearch] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [packageToDelete, setPackageToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = () => {
        // يمكن إضافة فلترة لاحقاً
    };

    const formatCurrency = (amount, currency = 'AED') => {
        const locale = language === 'ar' ? 'ar-AE' : 'en-US';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const getAudienceLabel = (audience) => {
        const labels = {
            all: language === 'ar' ? 'الكل' : 'All',
            student: language === 'ar' ? 'الطلاب' : 'Students',
            teacher: language === 'ar' ? 'المعلمون' : 'Teachers',
            school: language === 'ar' ? 'المدارس' : 'Schools',
            educational_institution: language === 'ar' ? 'المؤسسات التعليمية' : 'Educational Institutions',
        };

        return labels[audience] || labels.all;
    };

    const handleDelete = (pkg) => {
        setPackageToDelete(pkg);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (packageToDelete && !isDeleting) {
            setIsDeleting(true);
            router.post(`/admin/packages/${packageToDelete.id}`, {
                _method: 'DELETE',
            }, {
                preserveScroll: false,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setPackageToDelete(null);
                    setIsDeleting(false);
                    router.reload({ only: ['packages', 'stats'] });
                },
                onError: (errors) => {
                    window.alert(
                        t('adminPackagesPage.deleteErrorAlert', {
                            message: errors?.message || t('adminPackagesPage.unknownError'),
                        })
                    );
                    setIsDeleting(false);
                },
                onFinish: () => {
                    setIsDeleting(false);
                }
            });
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setPackageToDelete(null);
    };

    return (
        <DashboardLayout header={t('adminPackagesPage.title')}>
            <Head title={t('adminPackagesPage.pageTitle', { appName: t('common.appName') })} />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('adminPackagesPage.stats.total')}</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('common.active')}</p>
                    <p className="text-3xl font-bold text-green-600">{stats?.active || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('common.popular')}</p>
                    <p className="text-3xl font-bold text-blue-600">{stats?.popular || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('adminPackagesPage.stats.totalSubscribers')}</p>
                    <p className="text-3xl font-bold text-purple-600">{stats?.totalSubscribers || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">{t('adminPackagesPage.stats.trial')}</p>
                    <p className="text-3xl font-bold text-emerald-600">{stats?.trial || 0}</p>
                </div>
            </div>

            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('adminPackagesPage.packagesList')}</h2>
                <Link
                    href={route('admin.packages.create')}
                    className="bg-[#A3C042] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                    <FaPlus />
                    {t('adminPackagesPage.addNew')}
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('adminPackagesPage.searchPlaceholder')}
                                className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-[#A3C042] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                    >
                        <FaFilter />
                        {t('common.search')}
                    </button>
                </div>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages && packages.length > 0 ? (
                    packages
                        .filter(pkg => {
                            if (!search) return true;
                            const searchLower = search.toLowerCase();
                            return (
                                (pkg.name_ar && pkg.name_ar.toLowerCase().includes(searchLower)) ||
                                (pkg.name && pkg.name.toLowerCase().includes(searchLower)) ||
                                (pkg.description_ar && pkg.description_ar.toLowerCase().includes(searchLower))
                            );
                        })
                        .map((pkg) => (
                            <div key={pkg.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {pkg.name_ar || pkg.name}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                {pkg.is_popular && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                        {t('common.popular')}
                                                    </span>
                                                )}
                                                {pkg.is_trial && (
                                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">
                                                        {t('adminPackagesPage.badges.trial')}
                                                    </span>
                                                )}
                                                {pkg.is_active ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                        {t('common.active')}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                                                        {t('common.inactive')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <FaBox className="text-4xl text-blue-500 opacity-50" />
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-3xl font-bold text-green-600 mb-1">
                                            {pkg.is_trial ? t('adminPackagesPage.badges.freeTrial') : formatCurrency(pkg.price, pkg.currency)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {pkg.is_trial && pkg.trial_days
                                                ? t('adminPackagesPage.badges.trialDuration', { days: pkg.trial_days })
                                                : null}
                                            {!pkg.is_trial && pkg.duration_type === 'monthly' && t('adminPackagesPage.duration.monthly')}
                                            {!pkg.is_trial && pkg.duration_type === 'quarterly' && t('adminPackagesPage.duration.quarterly')}
                                            {!pkg.is_trial && pkg.duration_type === 'yearly' && t('adminPackagesPage.duration.yearly')}
                                            {!pkg.is_trial && pkg.duration_type === 'lifetime' && t('adminPackagesPage.duration.lifetime')}
                                        </p>
                                    </div>

                                    {pkg.description_ar && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {pkg.description_ar}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2 py-1 bg-sky-100 text-sky-800 rounded text-xs font-semibold">
                                            {language === 'ar' ? 'الفئة: ' : 'Audience: '}
                                            {getAudienceLabel(pkg.audience)}
                                        </span>
                                        {pkg.points_bonus > 0 && (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                                {t('adminPackagesPage.badges.pointsBonus', { points: pkg.points_bonus })}
                                            </span>
                                        )}
                                        {pkg.projects_limit && (
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                                {t('adminPackagesPage.badges.projectsLimit', { count: pkg.projects_limit })}
                                            </span>
                                        )}
                                        {pkg.challenges_limit && (
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                                                {t('adminPackagesPage.badges.challengesLimit', { count: pkg.challenges_limit })}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                        <Link
                                            href={route('admin.packages.subscribers', pkg.id)}
                                            className="flex-1 text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg flex items-center justify-center gap-2 text-sm"
                                        >
                                            <FaUsers />
                                            {t('adminPackagesPage.subscribers')}
                                        </Link>
                                        <Link
                                            href={route('admin.packages.edit', pkg.id)}
                                            className="px-4 py-2 bg-[#A3C042] hover:bg-blue-700 text-white rounded-lg"
                                            title={t('common.edit')}
                                        >
                                            <FaEdit />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(pkg)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            title={t('common.delete')}
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        {t('adminPackagesPage.empty')}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && packageToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={cancelDelete}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                                <FaTrash className="text-3xl text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">{t('adminPackagesPage.deleteConfirm.title')}</h2>
                            <p className="text-gray-600 text-center mb-6">
                                {t('adminPackagesPage.deleteConfirm.message', { name: packageToDelete.name_ar || packageToDelete.name })}
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isDeleting ? t('common.deleting') : t('common.delete')}
                                </button>
                                <button
                                    onClick={cancelDelete}
                                    disabled={isDeleting}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
