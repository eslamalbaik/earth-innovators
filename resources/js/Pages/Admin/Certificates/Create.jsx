import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaArrowRight, FaSave, FaTimes } from 'react-icons/fa';

export default function AdminCertificatesCreate({ users }) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        type: 'student',
        title: '',
        title_ar: '',
        description: '',
        description_ar: '',
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: '',
        template: '',
        is_active: true,
        generate_pdf: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.certificates.store'));
    };

    return (
        <DashboardLayout header="إضافة شهادة جديدة">
            <Head title="إضافة شهادة جديدة" />

            <div className="mb-6">
                <Link
                    href={route('admin.certificates.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة الشهادات
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات الشهادة</h2>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* المستخدم */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المستخدم <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.user_id}
                                onChange={(e) => setData('user_id', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.user_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            >
                                <option value="">اختر المستخدم</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email}) - {user.role}
                                    </option>
                                ))}
                            </select>
                            {errors.user_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
                            )}
                        </div>

                        {/* النوع */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                نوع الشهادة <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            >
                                <option value="student">طالب</option>
                                <option value="teacher">معلم</option>
                                <option value="school">مدرسة</option>
                                <option value="achievement">إنجاز</option>
                                <option value="membership">عضوية</option>
                            </select>
                            {errors.type && (
                                <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                            )}
                        </div>

                        {/* العنوان (إنجليزي) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                العنوان (إنجليزي) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                        </div>

                        {/* العنوان (عربي) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                العنوان (عربي) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title_ar}
                                onChange={(e) => setData('title_ar', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title_ar ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.title_ar && (
                                <p className="mt-1 text-sm text-red-600">{errors.title_ar}</p>
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
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
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
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description_ar ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.description_ar && (
                                <p className="mt-1 text-sm text-red-600">{errors.description_ar}</p>
                            )}
                        </div>

                        {/* تاريخ الإصدار */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                تاريخ الإصدار <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.issue_date}
                                onChange={(e) => setData('issue_date', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.issue_date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                required
                            />
                            {errors.issue_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.issue_date}</p>
                            )}
                        </div>

                        {/* تاريخ الانتهاء */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                تاريخ الانتهاء (اختياري)
                            </label>
                            <input
                                type="date"
                                value={data.expiry_date}
                                onChange={(e) => setData('expiry_date', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.expiry_date ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.expiry_date && (
                                <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>
                            )}
                        </div>

                        {/* القالب */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                القالب (اختياري)
                            </label>
                            <input
                                type="text"
                                value={data.template}
                                onChange={(e) => setData('template', e.target.value)}
                                placeholder="مسار القالب"
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.template ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.template && (
                                <p className="mt-1 text-sm text-red-600">{errors.template}</p>
                            )}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_active" className="mr-2 block text-sm text-gray-900">
                                تفعيل الشهادة
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="generate_pdf"
                                checked={data.generate_pdf}
                                onChange={(e) => setData('generate_pdf', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="generate_pdf" className="mr-2 block text-sm text-gray-900">
                                إنشاء ملف PDF تلقائياً
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <Link
                            href={route('admin.certificates.index')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <FaTimes />
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            <FaSave />
                            {processing ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

