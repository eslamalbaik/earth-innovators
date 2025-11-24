import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { FaSave, FaTimes, FaSpinner } from 'react-icons/fa';

export default function EditStudent({ student, auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        password: '',
        password_confirmation: '',
        _method: 'put',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.students.update', student.id));
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={`تعديل الطالب: ${student.name}`} />
            <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
                <h1 className="text-xl font-bold mb-6">تعديل بيانات الطالب</h1>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
                        <input
                            type="text"
                            value={data.phone || ''}
                            onChange={(e) => setData('phone', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور (اختياري)</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.visit(route('admin.students.index'))}
                            className="px-4 py-2 border rounded text-gray-700"
                        >
                            <FaTimes className="inline ml-2" /> إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-75"
                        >
                            {processing ? <FaSpinner className="inline animate-spin ml-2" /> : <FaSave className="inline ml-2" />} حفظ
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}


