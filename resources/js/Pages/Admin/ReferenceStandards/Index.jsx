import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { FaPlus, FaTrash, FaSave, FaGlobe, FaFlag, FaTimes } from 'react-icons/fa';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';

const blank = () => ({
    scope: 'national',
    domain_ar: '',
    domain_en: '',
    standard_name: '',
    usage_ar: '',
    usage_en: '',
    index_key: '',
});

function StandardForm({ initial, indexKeys, onCancel, onSaved }) {
    const { t } = useTranslation();
    const { showSuccess, showError } = useToast();
    const [form, setForm] = useState(initial);
    const [processing, setProcessing] = useState(false);
    const isEdit = !!initial.id;

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        const url = isEdit
            ? route('admin.reference-standards.update', initial.id)
            : route('admin.reference-standards.store');
        router[isEdit ? 'put' : 'post'](url, form, {
            onSuccess: () => { showSuccess?.(t('adminReferenceStandardsPage.saveSuccess')); onSaved(); },
            onError: () => showError?.(t('adminReferenceStandardsPage.saveError')),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <form onSubmit={submit} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <select className="border rounded-lg px-2 py-1.5" value={form.scope} onChange={set('scope')}>
                <option value="national">{t('adminReferenceStandardsPage.nationalReference')}</option>
                <option value="international">{t('adminReferenceStandardsPage.internationalAlignment')}</option>
            </select>
            <select className="border rounded-lg px-2 py-1.5" value={form.index_key || ''} onChange={set('index_key')}>
                <option value="">{t('adminReferenceStandardsPage.notLinked')}</option>
                {Object.entries(indexKeys).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                ))}
            </select>
            <input required placeholder={t('adminReferenceStandardsPage.domainAr')} className="border rounded-lg px-2 py-1.5" value={form.domain_ar} onChange={set('domain_ar')} />
            <input required placeholder={t('adminReferenceStandardsPage.domainEn')} className="border rounded-lg px-2 py-1.5" value={form.domain_en} onChange={set('domain_en')} />
            <input required placeholder={t('adminReferenceStandardsPage.standardName')} className="border rounded-lg px-2 py-1.5 md:col-span-2" value={form.standard_name} onChange={set('standard_name')} />
            <input required placeholder={t('adminReferenceStandardsPage.usageAr')} className="border rounded-lg px-2 py-1.5" value={form.usage_ar} onChange={set('usage_ar')} />
            <input required placeholder={t('adminReferenceStandardsPage.usageEn')} className="border rounded-lg px-2 py-1.5" value={form.usage_en} onChange={set('usage_en')} />
            <div className="md:col-span-2 flex gap-2 justify-end">
                <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 flex items-center gap-1">
                    <FaTimes /> {t('adminReferenceStandardsPage.cancel')}
                </button>
                <button type="submit" disabled={processing} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1">
                    <FaSave /> {t('adminReferenceStandardsPage.save')}
                </button>
            </div>
        </form>
    );
}

function ScopeTable({ title, icon, rows, indexKeys, onEdit, onDelete }) {
    const { t } = useTranslation();
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100 font-bold text-gray-800">
                {icon} {title}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-500 text-xs">
                            <th className="p-3 text-start">{t('adminReferenceStandardsPage.domain')}</th>
                            <th className="p-3 text-start">{t('adminReferenceStandardsPage.standard')}</th>
                            <th className="p-3 text-start">{t('adminReferenceStandardsPage.usage')}</th>
                            <th className="p-3 text-start">{t('adminReferenceStandardsPage.linkedTo')}</th>
                            <th className="p-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.id} className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => onEdit(r)}>
                                <td className="p-3 font-semibold text-gray-800">{r.domain_ar}</td>
                                <td className="p-3 text-indigo-700 font-medium">{r.standard_name}</td>
                                <td className="p-3 text-gray-600">{r.usage_ar}</td>
                                <td className="p-3 text-xs">
                                    {r.index_key
                                        ? <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{indexKeys[r.index_key]}</span>
                                        : <span className="text-gray-400">—</span>}
                                </td>
                                <td className="p-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDelete(r); }}
                                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                                    >
                                        <FaTrash size={13} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr><td colSpan={5} className="p-6 text-center text-gray-400">لا توجد معايير بعد</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function ReferenceStandardsIndex({ auth, standards, indexKeys }) {
    const { t } = useTranslation();
    const { confirm } = useConfirmDialog();
    const { showSuccess } = useToast();
    const [editing, setEditing] = useState(null);
    const [adding, setAdding] = useState(false);

    const national = standards.filter((s) => s.scope === 'national');
    const international = standards.filter((s) => s.scope === 'international');

    const handleDelete = async (row) => {
        const ok = await confirm?.({ title: t('adminReferenceStandardsPage.deleteTitle'), message: t('adminReferenceStandardsPage.deleteMessage') });
        if (ok === false) return;
        router.delete(route('admin.reference-standards.destroy', row.id), {
            onSuccess: () => showSuccess?.('تم الحذف'),
        });
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={t('adminReferenceStandardsPage.pageTitle', { appName: t('common.appName') })} />
            <div className="p-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-black text-gray-900">{t('adminReferenceStandardsPage.title')}</h1>
                    {!adding && !editing && (
                        <button
                            onClick={() => setAdding(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
                        >
                            <FaPlus /> {t('adminReferenceStandardsPage.addButton')}
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-600 mb-6">
                    {t('adminReferenceStandardsPage.subtitle')}
                </p>

                {(adding || editing) && (
                    <div className="mb-6">
                        <StandardForm
                            initial={editing || blank()}
                            indexKeys={indexKeys}
                            onCancel={() => { setAdding(false); setEditing(null); }}
                            onSaved={() => { setAdding(false); setEditing(null); }}
                        />
                    </div>
                )}

                <ScopeTable
                    title={t('adminReferenceStandardsPage.nationalReference')}
                    icon={<FaFlag className="text-emerald-600" />}
                    rows={national}
                    indexKeys={indexKeys}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                />
                <ScopeTable
                    title={t('adminReferenceStandardsPage.internationalAlignment')}
                    icon={<FaGlobe className="text-blue-600" />}
                    rows={international}
                    indexKeys={indexKeys}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                />
            </div>
        </DashboardLayout>
    );
}
