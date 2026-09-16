import { useState } from 'react';
import { router } from '@inertiajs/react';
import { FaPlus, FaTrash, FaCopy, FaKey } from 'react-icons/fa';
import { useToast } from '@/Contexts/ToastContext';

/**
 * Shared invite-code generation/listing UI used by both School and Teacher
 * pages. `storeRoute`/`destroyRoute` are the Ziggy route names to hit;
 * `allowedRoles` restricts what the current account may generate
 * (teachers can only issue student codes — enforced again server-side).
 */
export default function InviteCodesPanel({ codes, storeRoute, destroyRoute, allowedRoles = ['student', 'teacher'] }) {
    const { showSuccess } = useToast();
    const [form, setForm] = useState({ role: allowedRoles[0], grade: '', section: '', max_uses: '' });

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const create = (e) => {
        e.preventDefault();
        router.post(route(storeRoute), form, {
            preserveScroll: true,
            onSuccess: () => { showSuccess?.('تم إنشاء الكود'); setForm({ role: allowedRoles[0], grade: '', section: '', max_uses: '' }); },
        });
    };

    const revoke = (code) => {
        router.delete(route(destroyRoute, code.id), { preserveScroll: true });
    };

    const copyLink = (code) => {
        const link = `${window.location.origin}/register?code=${code.code}`;
        navigator.clipboard?.writeText(link);
        showSuccess?.('تم نسخ رابط الدعوة');
    };

    return (
        <div>
            <form onSubmit={create} className="flex flex-wrap gap-2 mb-5 bg-gray-50 p-3 rounded-xl items-end">
                {allowedRoles.length > 1 && (
                    <select className="border rounded-lg px-2 py-1.5" value={form.role} onChange={set('role')}>
                        {allowedRoles.map((r) => (
                            <option key={r} value={r}>{r === 'student' ? 'كود طالب' : 'كود معلم'}</option>
                        ))}
                    </select>
                )}
                <input placeholder="الصف (اختياري)" className="border rounded-lg px-2 py-1.5 w-28" value={form.grade} onChange={set('grade')} />
                <input placeholder="الشعبة (اختياري)" className="border rounded-lg px-2 py-1.5 w-24" value={form.section} onChange={set('section')} />
                <input type="number" min={1} placeholder="عدد الاستخدامات (بلا حد إن فارغ)" className="border rounded-lg px-2 py-1.5 w-48" value={form.max_uses} onChange={set('max_uses')} />
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1">
                    <FaPlus /> إنشاء كود
                </button>
            </form>

            <div className="space-y-2">
                {codes.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2.5">
                        <div className="flex items-center gap-3">
                            <FaKey className="text-indigo-500" />
                            <div>
                                <div className="font-mono font-bold text-gray-800">{c.code}</div>
                                <div className="text-xs text-gray-500">
                                    {c.role === 'student' ? 'طالب' : 'معلم'}
                                    {c.grade ? ` · ${c.grade}` : ''}{c.section ? ` / ${c.section}` : ''}
                                    {' · استُخدم '}{c.used_count}{c.max_uses ? `/${c.max_uses}` : ' (بلا حد)'}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!c.is_active && <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">ملغى</span>}
                            <button onClick={() => copyLink(c)} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg"><FaCopy size={13} /></button>
                            {c.is_active && (
                                <button onClick={() => revoke(c)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><FaTrash size={13} /></button>
                            )}
                        </div>
                    </div>
                ))}
                {codes.length === 0 && (
                    <div className="text-center text-gray-400 py-6">لا توجد أكواد دعوة بعد</div>
                )}
            </div>
        </div>
    );
}
