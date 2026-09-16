import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { FaPlus, FaTrash, FaEdit, FaCalendar } from 'react-icons/fa';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import InitiativeForm from '@/Components/Initiatives/InitiativeForm';

export default function SchoolInitiativesIndex({ auth, initiatives }) {
    const { confirm } = useConfirmDialog();
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState(null);

    const remove = async (i) => {
        const ok = await confirm?.({ title: 'حذف المبادرة؟', message: `سيتم حذف "${i.title_ar}" نهائياً.` });
        if (ok === false) return;
        router.delete(route('school.initiatives.destroy', i.id));
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="مبادرات مدرستي" />
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-2xl font-black text-gray-900">مبادرات مدرستي</h1>
                    {!adding && !editing && (
                        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700">
                            <FaPlus /> مبادرة جديدة
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-600 mb-6">مبادراتك الخاصة (خصومات، رحلات، فعاليات) تظهر فقط لطلاب ومعلمي مدرستك، منفصلة تماماً عن المبادرات العامة.</p>

                {(adding || editing) && (
                    <InitiativeForm
                        initial={editing}
                        storeRoute="school.initiatives.store"
                        updateRoute="school.initiatives.update"
                        onCancel={() => { setAdding(false); setEditing(null); }}
                        onSaved={() => { setAdding(false); setEditing(null); }}
                    />
                )}

                <div className="space-y-3">
                    {initiatives.map((i) => (
                        <div key={i.id} className="bg-white border border-gray-100 rounded-2xl p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <h3 className="font-bold text-gray-900">{i.title_ar}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{i.description_ar}</p>
                                    {(i.start_date || i.end_date) && (
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                                            <FaCalendar /> {i.start_date || '—'} → {i.end_date || '—'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {!i.is_active && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">موقوفة</span>}
                                    <button onClick={() => setEditing(i)} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg"><FaEdit size={13} /></button>
                                    <button onClick={() => remove(i)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><FaTrash size={13} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {initiatives.length === 0 && !adding && (
                        <div className="text-center text-gray-400 py-10">لا توجد مبادرات بعد</div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
