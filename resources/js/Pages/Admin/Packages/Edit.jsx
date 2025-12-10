import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaArrowRight, FaSave, FaTimes } from 'react-icons/fa';

export default function AdminPackagesEdit({ package: pkg }) {
    const { data, setData, put, processing, errors } = useForm({
        name: pkg.name || '',
        name_ar: pkg.name_ar || '',
        description: pkg.description || '',
        description_ar: pkg.description_ar || '',
        price: pkg.price || 0,
        currency: pkg.currency || 'SAR',
        duration_type: pkg.duration_type || 'monthly',
        duration_months: pkg.duration_months || 1,
        points_bonus: pkg.points_bonus || 0,
        projects_limit: pkg.projects_limit || null,
        challenges_limit: pkg.challenges_limit || null,
        certificate_access: pkg.certificate_access || false,
        badge_access: pkg.badge_access || false,
        features: pkg.features || [],
        features_ar: pkg.features_ar || [],
        is_active: pkg.is_active !== undefined ? pkg.is_active : true,
        is_popular: pkg.is_popular || false,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.packages.update', pkg.id));
    };

    return (
        <DashboardLayout header="تعديل الباقة">
            <Head title="تعديل الباقة" />

            <div className="mb-6">
                <Link
                    href={route('admin.packages.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة الباقات
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات الباقة</h2>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* الاسم (إنجليزي) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الاسم (إنجليزي) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* الاسم (عربي) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الاسم (عربي)
                            </label>
                            <input
                                type="text"
                                value={data.name_ar}
                                onChange={(e) => setData('name_ar', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.name_ar ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.name_ar && (
                                <p className="mt-1 text-sm text-red-600">{errors.name_ar}</p>
                            )}
                        </div>

                        {/* الوصف */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الوصف
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                        </div>

                        {/* الوصف (عربي) */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الوصف (عربي)
                            </label>
                            <textarea
                                value={data.description_ar}
                                onChange={(e) => setData('description_ar', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.description_ar ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                        </div>

                        {/* السعر */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                السعر <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.price}
                                onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                            )}
                        </div>

                        {/* العملة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                العملة <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.currency}
                                onChange={(e) => setData('currency', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.currency ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="SAR">ريال سعودي (SAR)</option>
                                <option value="USD">دولار (USD)</option>
                                <option value="AED">درهم إماراتي (AED)</option>
                            </select>
                        </div>

                        {/* نوع المدة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نوع المدة <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.duration_type}
                                onChange={(e) => setData('duration_type', e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                                required
                            >
                                <option value="monthly">شهري</option>
                                <option value="quarterly">ربع سنوي</option>
                                <option value="yearly">سنوي</option>
                                <option value="lifetime">مدى الحياة</option>
                            </select>
                        </div>

                        {/* عدد الأشهر */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                عدد الأشهر
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={data.duration_months}
                                onChange={(e) => setData('duration_months', parseInt(e.target.value) || 1)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                            />
                        </div>

                        {/* نقاط المكافأة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نقاط المكافأة
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.points_bonus}
                                onChange={(e) => setData('points_bonus', parseInt(e.target.value) || 0)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                            />
                        </div>

                        {/* حد المشاريع */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                حد المشاريع
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.projects_limit || ''}
                                onChange={(e) => setData('projects_limit', e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                                placeholder="غير محدود"
                            />
                        </div>

                        {/* حد التحديات */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                حد التحديات
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.challenges_limit || ''}
                                onChange={(e) => setData('challenges_limit', e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                                placeholder="غير محدود"
                            />
                        </div>

                        {/* Checkboxes */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.certificate_access}
                                    onChange={(e) => setData('certificate_access', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="mr-2 text-sm font-medium text-gray-700">
                                    الوصول إلى الشهادات
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.badge_access}
                                    onChange={(e) => setData('badge_access', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="mr-2 text-sm font-medium text-gray-700">
                                    الوصول إلى الشارات
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="mr-2 text-sm font-medium text-gray-700">
                                    نشط
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_popular}
                                    onChange={(e) => setData('is_popular', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="mr-2 text-sm font-medium text-gray-700">
                                    شائع
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaSave />
                            {processing ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                        <Link
                            href={route('admin.packages.index')}
                            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg flex items-center gap-2"
                        >
                            <FaTimes />
                            إلغاء
                        </Link>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
