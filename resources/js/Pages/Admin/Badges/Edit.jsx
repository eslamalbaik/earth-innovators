import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaArrowRight, FaSave, FaTimes, FaUpload } from 'react-icons/fa';
import { useState } from 'react';

export default function AdminBadgesEdit({ badge }) {
    const [imagePreview, setImagePreview] = useState(badge.image || null);

    const { data, setData, post, processing, errors } = useForm({
        name: badge.name || '',
        name_ar: badge.name_ar || '',
        description: badge.description || '',
        description_ar: badge.description_ar || '',
        icon: badge.icon || '',
        image: null,
        type: badge.type || '',
        points_required: badge.points_required || 0,
        is_active: badge.is_active ?? true,
        _method: 'PUT',
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.badges.update', badge.id), {
            forceFormData: true,
        });
    };

    return (
        <DashboardLayout header="تعديل الشارة">
            <Head title="تعديل الشارة" />

            <div className="mb-6">
                <Link
                    href={route('admin.badges.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة الشارات
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات الشارة</h2>

                <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
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

                        {/* الوصف (إنجليزي) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الوصف (إنجليزي)
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* الوصف (عربي) */}
                        <div>
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
                            {errors.description_ar && (
                                <p className="mt-1 text-sm text-red-600">{errors.description_ar}</p>
                            )}
                        </div>

                        {/* الأيقونة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الأيقونة (Emoji أو نص)
                            </label>
                            <input
                                type="text"
                                value={data.icon}
                                onChange={(e) => setData('icon', e.target.value)}
                                placeholder="مثال: 🏆 أو 🥇"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.icon ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.icon && (
                                <p className="mt-1 text-sm text-red-600">{errors.icon}</p>
                            )}
                        </div>

                        {/* النوع */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                النوع <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.type ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="">اختر النوع</option>
                                <option value="rank_first">المركز الأول</option>
                                <option value="rank_second">المركز الثاني</option>
                                <option value="rank_third">المركز الثالث</option>
                                <option value="excellent_innovator">مبتكر ممتاز</option>
                                <option value="active_participant">مشارك نشط</option>
                                <option value="custom">مخصص</option>
                            </select>
                            {errors.type && (
                                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                            )}
                        </div>

                        {/* النقاط المطلوبة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                النقاط المطلوبة <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.points_required}
                                onChange={(e) => setData('points_required', parseInt(e.target.value) || 0)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.points_required ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.points_required && (
                                <p className="mt-1 text-sm text-red-600">{errors.points_required}</p>
                            )}
                        </div>

                        {/* الحالة */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الحالة
                            </label>
                            <select
                                value={data.is_active ? '1' : '0'}
                                onChange={(e) => setData('is_active', e.target.value === '1')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="1">نشط</option>
                                <option value="0">غير نشط</option>
                            </select>
                        </div>

                        {/* صورة الشارة */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                صورة الشارة
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FaUpload className="w-8 h-8 mb-2 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">انقر للرفع</span> أو اسحب الملف هنا
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF حتى 2MB</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                {imagePreview && (
                                    <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                            {errors.image && (
                                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                            )}
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
                            href={route('admin.badges.index')}
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
