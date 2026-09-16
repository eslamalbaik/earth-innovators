import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    FaPlus, FaTrash, FaEdit, FaTimes, FaSave, FaLandmark, FaCheckCircle, FaBan,
} from 'react-icons/fa';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';

const defaultLevels = () => ([
    { name: 'Excellent', name_ar: 'ممتاز', score: 4, description: '', description_ar: '' },
    { name: 'Good', name_ar: 'جيد', score: 3, description: '', description_ar: '' },
    { name: 'Fair', name_ar: 'مقبول', score: 2, description: '', description_ar: '' },
    { name: 'Needs Improvement', name_ar: 'يحتاج تحسين', score: 1, description: '', description_ar: '' },
]);

const blankForm = () => ({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    default_weight: 10,
    category: '',
    is_active: true,
    levels: defaultLevels(),
});

function CriterionForm({ initial, onCancel, onSaved, isAr }) {
    const { t } = useTranslation();
    const { showSuccess, showError } = useToast();
    const [form, setForm] = useState(initial);
    const [processing, setProcessing] = useState(false);
    const isEdit = !!initial.id;

    const updateLevel = (index, patch) => {
        setForm((f) => ({ ...f, levels: f.levels.map((l, i) => (i === index ? { ...l, ...patch } : l)) }));
    };
    const addLevel = () => setForm((f) => ({ ...f, levels: [...f.levels, { name: '', name_ar: '', score: 0, description: '', description_ar: '' }] }));
    const removeLevel = (index) => setForm((f) => ({ ...f, levels: f.levels.filter((_, i) => i !== index) }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const url = isEdit ? route('admin.rubric-library.update', initial.id) : route('admin.rubric-library.store');
        const method = isEdit ? 'put' : 'post';

        router[method](url, form, {
            onSuccess: () => {
                showSuccess(t(isEdit ? 'adminRubricLibraryPage.updateSuccess' : 'adminRubricLibraryPage.createSuccess'));
                onSaved();
            },
            onError: () => showError(t('adminRubricLibraryPage.saveError')),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                    type="text"
                    value={form.name_ar}
                    onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))}
                    placeholder={t('adminRubricLibraryPage.form.nameAr')}
                    dir="rtl"
                    required
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder={t('adminRubricLibraryPage.form.nameEn')}
                    dir="ltr"
                    required
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                />
                <textarea
                    value={form.description_ar}
                    onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))}
                    placeholder={t('adminRubricLibraryPage.form.descriptionAr')}
                    dir="rtl"
                    rows={2}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-indigo-400 focus:outline-none"
                />
                <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder={t('adminRubricLibraryPage.form.descriptionEn')}
                    dir="ltr"
                    rows={2}
                    className="rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-indigo-400 focus:outline-none"
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">{t('adminRubricLibraryPage.form.weight')}</label>
                    <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="100"
                        value={form.default_weight}
                        onChange={(e) => setForm((f) => ({ ...f, default_weight: e.target.value }))}
                        required
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">{t('adminRubricLibraryPage.form.category')}</label>
                    <input
                        type="text"
                        value={form.category || ''}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        placeholder={t('adminRubricLibraryPage.form.categoryPlaceholder')}
                        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none"
                    />
                </div>
                <label className="col-span-2 sm:col-span-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    {t('adminRubricLibraryPage.form.isActive')}
                </label>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold text-gray-500 uppercase">{t('adminRubricLibraryPage.form.levels')}</p>
                    <button type="button" onClick={addLevel} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
                        + {t('adminRubricLibraryPage.form.addLevel')}
                    </button>
                </div>
                <div className="space-y-2">
                    {form.levels.map((level, i) => (
                        <div key={i} className="grid grid-cols-12 gap-1.5 items-start bg-white rounded-lg p-2 border border-gray-100">
                            <input type="text" value={level.name_ar} onChange={(e) => updateLevel(i, { name_ar: e.target.value })}
                                placeholder={t('adminRubricLibraryPage.form.levelNameAr')} dir="rtl" required
                                className="col-span-3 rounded-md border border-gray-200 px-1.5 py-1 text-[11px]" />
                            <input type="text" value={level.name} onChange={(e) => updateLevel(i, { name: e.target.value })}
                                placeholder={t('adminRubricLibraryPage.form.levelNameEn')} dir="ltr" required
                                className="col-span-3 rounded-md border border-gray-200 px-1.5 py-1 text-[11px]" />
                            <input type="number" value={level.score} onChange={(e) => updateLevel(i, { score: e.target.value })}
                                placeholder={t('adminRubricLibraryPage.form.score')} required
                                className="col-span-1 rounded-md border border-gray-200 px-1 py-1 text-[11px] text-center" />
                            <input type="text" value={level.description_ar} onChange={(e) => updateLevel(i, { description_ar: e.target.value })}
                                placeholder={t('adminRubricLibraryPage.form.levelDescAr')} dir="rtl"
                                className="col-span-2 rounded-md border border-gray-200 px-1.5 py-1 text-[11px]" />
                            <input type="text" value={level.description} onChange={(e) => updateLevel(i, { description: e.target.value })}
                                placeholder={t('adminRubricLibraryPage.form.levelDescEn')} dir="ltr"
                                className="col-span-2 rounded-md border border-gray-200 px-1.5 py-1 text-[11px]" />
                            <button type="button" onClick={() => removeLevel(i)} className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-600">
                                <FaTimes />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">
                    {t('common.cancel')}
                </button>
                <button type="submit" disabled={processing} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold">
                    <FaSave />
                    {processing ? t('common.saving') : t('common.save')}
                </button>
            </div>
        </form>
    );
}

export default function AdminRubricLibraryIndex({ criteria = [], activeWeightTotal = 0 }) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const isAr = language === 'ar';
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const weightOk = Math.abs(activeWeightTotal - 100) < 0.5;

    const handleDelete = async (item) => {
        const confirmed = await confirm({
            title: t('adminRubricLibraryPage.deleteConfirm.title'),
            message: t('adminRubricLibraryPage.deleteConfirm.message', { name: isAr ? item.name_ar : item.name }),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });
        if (confirmed) {
            router.delete(route('admin.rubric-library.destroy', item.id), { preserveScroll: true });
        }
    };

    const toggleActive = (item) => {
        router.patch(route('admin.rubric-library.toggle-active', item.id), {}, { preserveScroll: true });
    };

    return (
        <DashboardLayout>
            <Head title={t('adminRubricLibraryPage.pageTitle', { appName: t('common.appName') })} />

            <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 rounded-xl flex items-center justify-center">
                            <FaLandmark className="text-indigo-600 text-xl" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{t('adminRubricLibraryPage.title')}</h1>
                            <p className="text-sm text-gray-500">{t('adminRubricLibraryPage.subtitle')}</p>
                        </div>
                    </div>
                    {!creating && (
                        <button
                            type="button"
                            onClick={() => { setCreating(true); setEditingId(null); }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
                        >
                            <FaPlus />
                            {t('adminRubricLibraryPage.addNew')}
                        </button>
                    )}
                </div>

                <div className={`rounded-2xl border p-4 flex items-center gap-3 ${weightOk ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                    {weightOk ? <FaCheckCircle className="text-emerald-600" /> : <FaBan className="text-amber-600" />}
                    <p className={`text-sm font-semibold ${weightOk ? 'text-emerald-800' : 'text-amber-800'}`}>
                        {t('adminRubricLibraryPage.activeWeightTotal', { total: activeWeightTotal })}
                    </p>
                    {!weightOk && (
                        <span className="text-xs text-amber-700">{t('adminRubricLibraryPage.weightHint')}</span>
                    )}
                </div>

                {creating && (
                    <CriterionForm
                        initial={blankForm()}
                        isAr={isAr}
                        onCancel={() => setCreating(false)}
                        onSaved={() => setCreating(false)}
                    />
                )}

                <div className="space-y-3">
                    {criteria.length === 0 && !creating && (
                        <p className="text-center text-sm text-gray-400 py-10">{t('adminRubricLibraryPage.empty')}</p>
                    )}

                    {criteria.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {editingId === item.id ? (
                                <div className="p-3">
                                    <CriterionForm
                                        initial={{ ...item, description: item.description || '', description_ar: item.description_ar || '', category: item.category || '' }}
                                        isAr={isAr}
                                        onCancel={() => setEditingId(null)}
                                        onSaved={() => setEditingId(null)}
                                    />
                                </div>
                            ) : (
                                <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-bold text-gray-900">{isAr ? item.name_ar : item.name}</p>
                                            {item.category && (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{item.category}</span>
                                            )}
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {item.is_active ? t('common.active') : t('common.inactive')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {t('adminRubricLibraryPage.weightLabel', { weight: item.default_weight })} · {item.levels?.length || 0} {t('adminRubricLibraryPage.levelsCount')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button type="button" onClick={() => toggleActive(item)}
                                            title={item.is_active ? t('adminRubricLibraryPage.deactivate') : t('adminRubricLibraryPage.activate')}
                                            className="p-2 text-gray-400 hover:text-indigo-600">
                                            {item.is_active ? <FaBan /> : <FaCheckCircle />}
                                        </button>
                                        <button type="button" onClick={() => { setEditingId(item.id); setCreating(false); }}
                                            className="p-2 text-gray-400 hover:text-indigo-600">
                                            <FaEdit />
                                        </button>
                                        <button type="button" onClick={() => handleDelete(item)}
                                            className="p-2 text-red-400 hover:text-red-600">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
