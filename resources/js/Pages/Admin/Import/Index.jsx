import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function ImportIndex({ auth }) {
    const [files, setFiles] = useState({ students: null, teachers: null, bookings: null });
    const { props } = usePage();

    const submit = (type) => {
        const form = new FormData();
        form.append('file', files[type]);
        router.post(route(`admin.import.${type}`), form);
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="CSV Import" />
            <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
                <h1 className="text-xl font-bold mb-6">CSV Import</h1>
                {props.flash?.success && (
                    <div className="mb-4 p-3 rounded bg-green-100 text-green-800">{props.flash.success}</div>
                )}
                {props.flash?.error && (
                    <div className="mb-4 p-3 rounded bg-red-100 text-red-800">{props.flash.error}</div>
                )}
                {props.import_errors && props.import_errors.length > 0 && (
                    <div className="mb-4 p-3 rounded bg-yellow-50 text-yellow-900">
                        <div className="font-semibold mb-2">تحذيرات الاستيراد:</div>
                        <ul className="list-disc pr-6">
                            {props.import_errors.map((e, i) => (<li key={i}>{e}</li>))}
                        </ul>
                    </div>
                )}
                <div className="space-y-6">
                    {[{ key: 'students', label: 'Students' }, { key: 'teachers', label: 'Teachers' }, { key: 'bookings', label: 'Bookings' }].map(item => (
                        <div key={item.key} className="border rounded p-4">
                            <h2 className="font-semibold mb-2">{item.label}</h2>
                            <input type="file" accept=".csv" onChange={(e) => setFiles({ ...files, [item.key]: e.target.files[0] })} />
                            <button
                                onClick={() => submit(item.key)}
                                disabled={!files[item.key]}
                                className="ml-3 px-4 py-2 rounded bg-yellow-600 text-white disabled:opacity-50"
                            >
                                Import
                            </button>
                        </div>
                    ))}
                    <div className="mt-8 text-sm text-gray-600">
                        <div className="font-semibold mb-2">أعمدة مطلوبة:</div>
                        <div className="mb-1">الطلاب: name,email,password</div>
                        <div className="mb-1">المعلمون: name_ar,email,(اختياري: name_en,city,nationality,price_per_hour,subjects a|b,stages a|b,experience_years)</div>
                        <div className="mb-1">الحجوزات: student_email,teacher_email,availability_id,status,price,(اختياري: payment_status,payment_method,payment_reference)</div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}


