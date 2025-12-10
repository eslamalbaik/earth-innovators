import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FaArrowRight, FaSave, FaTimes } from 'react-icons/fa';

export default function UsersCreate({ schools, auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'student',
        school_id: '',
        points: 0,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <DashboardLayout header="إضافة مستخدم جديد" auth={auth}>
            <Head title="إضافة مستخدم جديد" />

            <div className="mb-6">
                <Link
                    href={route('admin.users.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة المستخدمين
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات المستخدم</h2>

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* الاسم */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الاسم <span className="text-red-500">*</span>
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

                        {/* البريد الإلكتروني */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                البريد الإلكتروني <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* الهاتف */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الهاتف
                            </label>
                            <input
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.phone ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        {/* الدور */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الدور <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.role ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            >
                                <option value="student">طالب</option>
                                <option value="teacher">معلم</option>
                                <option value="school">مدرسة</option>
                                <option value="admin">أدمن</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                            )}
                        </div>

                        {/* المدرسة */}
                        {data.role === 'student' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المدرسة
                                </label>
                                <select
                                    value={data.school_id}
                                    onChange={(e) => setData('school_id', e.target.value)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.school_id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                >
                                    <option value="">اختر مدرسة</option>
                                    {schools.map((school) => (
                                        <option key={school.id} value={school.id}>
                                            {school.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.school_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.school_id}</p>
                                )}
                            </div>
                        )}

                        {/* النقاط */}
                        {data.role === 'student' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    النقاط
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.points}
                                    onChange={(e) => setData('points', parseInt(e.target.value) || 0)}
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.points ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.points && (
                                    <p className="mt-1 text-sm text-red-600">{errors.points}</p>
                                )}
                            </div>
                        )}

                        {/* كلمة المرور */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                كلمة المرور <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* تأكيد كلمة المرور */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                تأكيد كلمة المرور <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                }`}
                                required
                            />
                            {errors.password_confirmation && (
                                <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
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
                            {processing ? 'جاري الحفظ...' : 'حفظ'}
                        </button>
                        <Link
                            href={route('admin.users.index')}
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

