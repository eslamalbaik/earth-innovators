import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { FaSave, FaLandmark } from 'react-icons/fa';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';

function LevelRow({ level }) {
    const { showSuccess, showError } = useToast();
    const [form, setForm] = useState({
        label_ar: level.label_ar,
        label_en: level.label_en,
        min_score: level.min_score,
        max_score: level.max_score,
        color: level.color,
    });
    const [processing, setProcessing] = useState(false);

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const save = () => {
        setProcessing(true);
        router.put(route('admin.national-levels.update', level.id), form, {
            preserveScroll: true,
            onSuccess: () => showSuccess?.('تم الحفظ'),
            onError: () => showError?.('تعذر الحفظ — تأكد أن الحد الأدنى أقل من أو يساوي الحد الأعلى'),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <tr className="border-b border-gray-100">
            <td className="p-3">
                <span
                    className="inline-flex items-center justify-center w-10 h-8 rounded-lg font-black text-white text-sm"
                    style={{ backgroundColor: form.color }}
                >
                    {level.code}
                </span>
            </td>
            <td className="p-3">
                <input className="w-full border rounded-lg px-2 py-1" value={form.label_ar} onChange={set('label_ar')} />
            </td>
            <td className="p-3">
                <input className="w-full border rounded-lg px-2 py-1" value={form.label_en} onChange={set('label_en')} />
            </td>
            <td className="p-3">
                <input type="number" min={0} max={100} className="w-20 border rounded-lg px-2 py-1" value={form.min_score} onChange={set('min_score')} />
            </td>
            <td className="p-3">
                <input type="number" min={0} max={100} className="w-20 border rounded-lg px-2 py-1" value={form.max_score} onChange={set('max_score')} />
            </td>
            <td className="p-3">
                <input type="color" className="w-12 h-8 border rounded-lg" value={form.color} onChange={set('color')} />
            </td>
            <td className="p-3">
                <button
                    onClick={save}
                    disabled={processing}
                    className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                    <FaSave /> حفظ
                </button>
            </td>
        </tr>
    );
}

export default function NationalLevelsIndex({ auth, levels }) {
    const { t } = useTranslation();

    return (
        <DashboardLayout auth={auth}>
            <Head title="المستويات الوطنية" />
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-2">
                    <FaLandmark className="text-2xl text-indigo-600" />
                    <h1 className="text-2xl font-black text-gray-900">المستويات الوطنية (L1–L5)</h1>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    هذه الحدود تحوّل كل نتيجة تقييم (0–100) تلقائياً إلى مستوى وطني معتمد، وتظهر بجانب النتيجة في صفحات
                    التقييم والتقارير والشهادات. أي تعديل هنا ينعكس فوراً بدون أي تعديل برمجي.
                </p>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs">
                                <th className="p-3 text-start">الرمز</th>
                                <th className="p-3 text-start">التصنيف (عربي)</th>
                                <th className="p-3 text-start">Classification (English)</th>
                                <th className="p-3 text-start">من</th>
                                <th className="p-3 text-start">إلى</th>
                                <th className="p-3 text-start">اللون</th>
                                <th className="p-3 text-start"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {levels.map((level) => (
                                <LevelRow key={level.id} level={level} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
