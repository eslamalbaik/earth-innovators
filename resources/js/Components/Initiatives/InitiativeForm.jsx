import { useState } from 'react';
import { router } from '@inertiajs/react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { useToast } from '@/Contexts/ToastContext';

const blank = () => ({
    title_ar: '', title_en: '', description_ar: '', description_en: '',
    audience: 'both', start_date: '', end_date: '', benefit_details: '', is_active: true,
});

export default function InitiativeForm({ initial, storeRoute, updateRoute, onCancel, onSaved }) {
    const { showSuccess, showError } = useToast();
    const [form, setForm] = useState(initial || blank());
    const [processing, setProcessing] = useState(false);
    const isEdit = !!initial?.id;

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        const url = isEdit ? route(updateRoute, initial.id) : route(storeRoute);
        router[isEdit ? 'put' : 'post'](url, form, {
            onSuccess: () => { showSuccess?.('تم الحفظ'); onSaved(); },
            onError: () => showError?.('تحقق من الحقول المطلوبة'),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <form onSubmit={submit} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
            <input required placeholder="العنوان (عربي)" className="border rounded-lg px-2 py-1.5" value={form.title_ar} onChange={set('title_ar')} />
            <input placeholder="Title (English)" className="border rounded-lg px-2 py-1.5" value={form.title_en} onChange={set('title_en')} />
            <textarea placeholder="الوصف (عربي)" className="border rounded-lg px-2 py-1.5 md:col-span-2" rows={2} value={form.description_ar} onChange={set('description_ar')} />
            <select className="border rounded-lg px-2 py-1.5" value={form.audience} onChange={set('audience')}>
                <option value="both">الطلاب والمعلمون</option>
                <option value="students">الطلاب فقط</option>
                <option value="teachers">المعلمون فقط</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
                <input type="date" className="border rounded-lg px-2 py-1.5" value={form.start_date || ''} onChange={set('start_date')} />
                <input type="date" className="border rounded-lg px-2 py-1.5" value={form.end_date || ''} onChange={set('end_date')} />
            </div>
            <textarea placeholder="تفاصيل الاستفادة" className="border rounded-lg px-2 py-1.5 md:col-span-2" rows={2} value={form.benefit_details} onChange={set('benefit_details')} />
            <div className="md:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 flex items-center gap-1">
                    <FaTimes /> إلغاء
                </button>
                <button type="submit" disabled={processing} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1">
                    <FaSave /> حفظ
                </button>
            </div>
        </form>
    );
}
