import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaBox, FaUsers, FaDollarSign } from 'react-icons/fa';

export default function AdminPackagesIndex({ packages, stats }) {
    const [search, setSearch] = useState('');

    const handleSearch = () => {
        // يمكن إضافة فلترة لاحقاً
    };

    const formatCurrency = (amount, currency = 'SAR') => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    const handleDelete = (packageId) => {
        if (confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
            router.delete(route('admin.packages.destroy', packageId), {
                preserveScroll: true,
                onSuccess: () => {
                    // سيتم إعادة تحميل الصفحة تلقائياً
                },
            });
        }
    };

    return (
        <DashboardLayout header="إدارة الباقات">
            <Head title="إدارة الباقات" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">إجمالي الباقات</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">نشطة</p>
                    <p className="text-3xl font-bold text-green-600">{stats?.active || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">شائعة</p>
                    <p className="text-3xl font-bold text-blue-600">{stats?.popular || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">إجمالي المشتركين</p>
                    <p className="text-3xl font-bold text-purple-600">{stats?.totalSubscribers || 0}</p>
                </div>
            </div>

            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">قائمة الباقات</h2>
                <Link
                    href={route('admin.packages.create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                    <FaPlus />
                    إضافة باقة جديدة
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
                                placeholder="ابحث عن باقة..."
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                    >
                        <FaFilter />
                        بحث
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
                                                        شائع
                                                    </span>
                                                )}
                                                {pkg.is_active ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                        نشط
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                                                        غير نشط
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <FaBox className="text-4xl text-blue-500 opacity-50" />
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-3xl font-bold text-green-600 mb-1">
                                            {formatCurrency(pkg.price, pkg.currency)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {pkg.duration_type === 'monthly' && 'شهري'}
                                            {pkg.duration_type === 'quarterly' && 'ربع سنوي'}
                                            {pkg.duration_type === 'yearly' && 'سنوي'}
                                            {pkg.duration_type === 'lifetime' && 'مدى الحياة'}
                                        </p>
                                    </div>

                                    {pkg.description_ar && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {pkg.description_ar}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {pkg.points_bonus > 0 && (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                                +{pkg.points_bonus} نقاط
                                            </span>
                                        )}
                                        {pkg.projects_limit && (
                                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                                {pkg.projects_limit} مشروع
                                            </span>
                                        )}
                                        {pkg.challenges_limit && (
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                                                {pkg.challenges_limit} تحدٍ
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                                        <Link
                                            href={route('admin.packages.subscribers', pkg.id)}
                                            className="flex-1 text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg flex items-center justify-center gap-2 text-sm"
                                        >
                                            <FaUsers />
                                            المشتركين
                                        </Link>
                                        <Link
                                            href={route('admin.packages.edit', pkg.id)}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                            title="تعديل"
                                        >
                                            <FaEdit />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(pkg.id)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                                            title="حذف"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                ) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        لا توجد باقات
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
