import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaArrowRight, FaSave, FaTimes } from 'react-icons/fa';

export default function CustomRolesEdit({ auth, customRole, baseRoles }) {
    const { data, setData, put, processing, errors } = useForm({
        name_ar: customRole.name_ar || '',
        name_en: customRole.name_en || '',
        slug: customRole.slug || '',
        base_role: customRole.base_role || 'teacher',
        is_active: customRole.is_active,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.custom-roles.update', customRole.id));
    };

    return (
        <DashboardLayout header="تعديل دور مخصص" auth={auth}>
            <Head title="تعديل دور مخصص - إرث المبتكرين" />

            <div className="mb-6">
                <Link
                    href={route('admin.custom-roles.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة الأدوار المخصصة
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات الدور</h2>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الاسم بالعربية <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name_ar}
                                onChange={(e) => setData('name_ar', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name_ar ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {errors.name_ar && <p className="mt-1 text-sm text-red-600">{errors.name_ar}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الاسم بالإنجليزية
                            </label>
                            <input
                                type="text"
                                value={data.name_en}
                                onChange={(e) => setData('name_en', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name_en ? 'border-red-500' : 'border-gray-300'}`}
                            />
                            {errors.name_en && <p className="mt-1 text-sm text-red-600">{errors.name_en}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المعرّف (slug) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                dir="ltr"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.slug ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                مبني على دور <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.base_role}
                                onChange={(e) => setData('base_role', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.base_role ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            >
                                {baseRoles.map((role) => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                            <p className="mt-2 text-sm text-gray-500">
                                تنبيه: تغيير الدور الأساسي يغيّر لوحة التحكم والصلاحيات لكل من يحمل هذا الدور المخصص حالياً.
                            </p>
                            {errors.base_role && <p className="mt-1 text-sm text-red-600">{errors.base_role}</p>}
                        </div>

                        <div>
                            <label className="flex items-center gap-2 mt-8">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-gray-300 text-[#A3C042] focus:ring-[#A3C042]"
                                />
                                <span className="text-sm font-medium text-gray-700">مفعّل (متاح للاختيار عند إسناده لمستخدم)</span>
                            </label>
                            <p className="mt-2 text-sm text-gray-500">
                                التعطيل لا يزيل الدور من المستخدمين الحاليين، فقط يخفيه من قوائم الإسناد الجديدة.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-[#A3C042] hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaSave />
                            {processing ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <Link
                            href={route('admin.custom-roles.index')}
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
