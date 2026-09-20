import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { FaPlus, FaTrash, FaSave, FaBook, FaLayerGroup, FaTimes } from 'react-icons/fa';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';

function CurriculaTab({ curricula }) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const { showSuccess } = useToast();
    const [form, setForm] = useState({ name_ar: '', name_en: '', is_active: true });

    const add = (e) => {
        e.preventDefault();
        router.post(route('admin.academic-structure.curricula.store'), form, {
            preserveScroll: true,
            onSuccess: () => { showSuccess?.(t('adminAcademicStructurePage.addSuccess')); setForm({ name_ar: '', name_en: '', is_active: true }); },
        });
    };

    const remove = async (c) => {
        const ok = await confirm?.({
            title: t('adminAcademicStructurePage.deleteCurriculumTitle'),
            message: t('adminAcademicStructurePage.deleteCurriculumMessage', { name: c.name_ar })
        });
        if (ok === false) return;
        router.delete(route('admin.academic-structure.curricula.destroy', c.id), { preserveScroll: true });
    };

    const toggle = (c) => {
        router.put(route('admin.academic-structure.curricula.update', c.id), { ...c, is_active: !c.is_active }, { preserveScroll: true });
    };

    return (
        <div>
            <form onSubmit={add} className="flex flex-wrap gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
                <input required placeholder={t('adminAcademicStructurePage.curriculumPlaceholderAr')} className="border rounded-lg px-2 py-1.5 flex-1 min-w-[160px]" value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} />
                <input placeholder={t('adminAcademicStructurePage.curriculumPlaceholderEn')} className="border rounded-lg px-2 py-1.5 flex-1 min-w-[160px]" value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} />
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1"><FaPlus /> {t('adminAcademicStructurePage.addCurriculum')}</button>
            </form>
            <div className="space-y-2">
                {curricula.map((c) => (
                    <div key={c.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2.5">
                        <div>
                            <span className="font-semibold text-gray-800">{language === 'ar' ? c.name_ar : c.name_en}</span>
                            {(language === 'ar' ? c.name_en : c.name_ar) && <span className="text-gray-400 text-sm ms-2">({language === 'ar' ? c.name_en : c.name_ar})</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => toggle(c)} className={`text-xs px-2 py-1 rounded-full font-semibold ${c.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                {c.is_active ? t('adminAcademicStructurePage.active') : t('adminAcademicStructurePage.inactive')}
                            </button>
                            <button onClick={() => remove(c)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><FaTrash size={13} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SubjectsTab({ subjects }) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const { showSuccess } = useToast();
    const [form, setForm] = useState({ name_ar: '', name_en: '', is_active: true });

    const add = (e) => {
        e.preventDefault();
        router.post(route('admin.academic-structure.subjects.store'), form, {
            preserveScroll: true,
            onSuccess: () => { showSuccess?.(t('adminAcademicStructurePage.addSuccess')); setForm({ name_ar: '', name_en: '', is_active: true }); },
        });
    };

    const remove = async (s) => {
        const ok = await confirm?.({
            title: t('adminAcademicStructurePage.deleteSubjectTitle'),
            message: t('adminAcademicStructurePage.deleteSubjectMessage', { name: s.name_ar })
        });
        if (ok === false) return;
        router.delete(route('admin.academic-structure.subjects.destroy', s.id), { preserveScroll: true });
    };

    const toggle = (s) => {
        router.put(route('admin.academic-structure.subjects.update', s.id), { ...s, is_active: !s.is_active }, { preserveScroll: true });
    };

    return (
        <div>
            <form onSubmit={add} className="flex flex-wrap gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
                <input required placeholder={t('adminAcademicStructurePage.subjectPlaceholderAr')} className="border rounded-lg px-2 py-1.5 flex-1 min-w-[160px]" value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} />
                <input placeholder={t('adminAcademicStructurePage.subjectPlaceholderEn')} className="border rounded-lg px-2 py-1.5 flex-1 min-w-[160px]" value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} />
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1"><FaPlus /> {t('adminAcademicStructurePage.addSubject')}</button>
            </form>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {subjects.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2.5">
                        <div>
                            <span className="font-semibold text-gray-800">{language === 'ar' ? s.name_ar : s.name_en}</span>
                            {(language === 'ar' ? s.name_en : s.name_ar) && <span className="text-gray-400 text-sm ms-2">({language === 'ar' ? s.name_en : s.name_ar})</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => toggle(s)} className={`text-xs px-2 py-1 rounded-full font-semibold ${s.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                {s.is_active ? t('adminAcademicStructurePage.active') : t('adminAcademicStructurePage.inactive')}
                            </button>
                            <button onClick={() => remove(s)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><FaTrash size={13} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StudyPlansTab({ studyPlans, curricula, subjects, schools }) {
    const { t, language } = useTranslation();
    const { confirm } = useConfirmDialog();
    const { showSuccess, showError } = useToast();
    const blank = { school_id: '', curriculum_id: '', subject_id: '', stage: '', grade: '', section: '', hours: '', academic_year: '', semester: '' };
    const [form, setForm] = useState(blank);

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const add = (e) => {
        e.preventDefault();
        router.post(route('admin.academic-structure.study-plans.store'), form, {
            preserveScroll: true,
            onSuccess: () => { showSuccess?.(t('adminAcademicStructurePage.addSuccess')); setForm(blank); },
            onError: () => showError?.(t('adminAcademicStructurePage.addError')),
        });
    };

    const remove = async (p) => {
        const ok = await confirm?.({ title: t('adminAcademicStructurePage.deleteStudyPlanTitle'), message: t('adminAcademicStructurePage.deleteStudyPlanMessage') });
        if (ok === false) return;
        router.delete(route('admin.academic-structure.study-plans.destroy', p.id), { preserveScroll: true });
    };

    return (
        <div>
            <p className="text-xs text-gray-500 mb-3">
                يربط كل صف مادة بمنهج معين، ويحدد المرحلة/الصف/الشعبة وعدد الساعات والعام الدراسي والفصل — أي مدرسة تختار منهجها من هنا.
            </p>
            <form onSubmit={add} className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 bg-gray-50 p-3 rounded-xl">
                <select required className="border rounded-lg px-2 py-1.5" value={form.curriculum_id} onChange={set('curriculum_id')}>
                    <option value="">المنهج *</option>
                    {curricula.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                </select>
                <select required className="border rounded-lg px-2 py-1.5" value={form.subject_id} onChange={set('subject_id')}>
                    <option value="">المادة *</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name_ar}</option>)}
                </select>
                <select className="border rounded-lg px-2 py-1.5" value={form.school_id} onChange={set('school_id')}>
                    <option value="">— كل المدارس —</option>
                    {schools.map((sc) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                </select>
                <input placeholder={t('adminAcademicStructurePage.stagePlaceholder')} className="border rounded-lg px-2 py-1.5" value={form.stage} onChange={set('stage')} />
                <input placeholder={t('adminAcademicStructurePage.gradePlaceholder')} className="border rounded-lg px-2 py-1.5" value={form.grade} onChange={set('grade')} />
                <input placeholder={t('adminAcademicStructurePage.sectionPlaceholder')} className="border rounded-lg px-2 py-1.5" value={form.section} onChange={set('section')} />
                <input type="number" min={0} placeholder={t('adminAcademicStructurePage.hoursPlaceholder')} className="border rounded-lg px-2 py-1.5" value={form.hours} onChange={set('hours')} />
                <input placeholder={t('adminAcademicStructurePage.academicYearPlaceholder')} className="border rounded-lg px-2 py-1.5" value={form.academic_year} onChange={set('academic_year')} />
                <input placeholder={t('adminAcademicStructurePage.semesterPlaceholder')} className="border rounded-lg px-2 py-1.5" value={form.semester} onChange={set('semester')} />
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1"><FaPlus /> إضافة</button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-sm bg-white rounded-xl border border-gray-100">
                    <thead>
                        <tr className="text-gray-500 text-xs bg-gray-50">
                            <th className="p-2 text-start">المنهج</th>
                            <th className="p-2 text-start">المادة</th>
                            <th className="p-2 text-start">المدرسة</th>
                            <th className="p-2 text-start">المرحلة/الصف/الشعبة</th>
                            <th className="p-2 text-start">الساعات</th>
                            <th className="p-2 text-start">العام/الفصل</th>
                            <th className="p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {studyPlans.map((p) => (
                            <tr key={p.id} className="border-t border-gray-50">
                                <td className="p-2">{language === 'ar' ? p.curriculum?.name_ar : p.curriculum?.name_en}</td>
                                <td className="p-2">{language === 'ar' ? p.subject?.name_ar : p.subject?.name_en}</td>
                                <td className="p-2 text-gray-500">{p.school?.name || '— الكل —'}</td>
                                <td className="p-2 text-gray-500">{[p.stage, p.grade, p.section].filter(Boolean).join(' / ') || '—'}</td>
                                <td className="p-2">{p.hours ?? '—'}</td>
                                <td className="p-2 text-gray-500">{[p.academic_year, p.semester].filter(Boolean).join(' - ') || '—'}</td>
                                <td className="p-2">
                                    <button onClick={() => remove(p)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"><FaTrash size={13} /></button>
                                </td>
                            </tr>
                        ))}
                        {studyPlans.length === 0 && (
                            <tr><td colSpan={7} className="p-6 text-center text-gray-400">لا توجد بيانات بعد</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AcademicStructureIndex({ auth, curricula, subjects, studyPlans, schools }) {
    const { t } = useTranslation();
    const [tab, setTab] = useState('curricula');

    const tabs = [
        { key: 'curricula', label: t('adminAcademicStructurePage.curriculaTab'), icon: <FaLayerGroup /> },
        { key: 'subjects', label: t('adminAcademicStructurePage.subjectsTab'), icon: <FaBook /> },
        { key: 'study-plans', label: t('adminAcademicStructurePage.studyPlansTab'), icon: <FaLayerGroup /> },
    ];

    return (
        <DashboardLayout auth={auth}>
            <Head title={t('adminAcademicStructurePage.pageTitle', { appName: t('common.appName') })} />
            <div className="p-6 max-w-6xl mx-auto">
                <h1 className="text-2xl font-black text-gray-900 mb-1">إدارة المناهج والمواد</h1>
                <p className="text-sm text-gray-600 mb-6">نموذج بيانات هرمي: منهج ← مادة ← بيانات صف/شعبة. أي إضافة هنا تظهر فوراً بقوائم اختيار المشاريع والتقييمات.</p>

                <div className="flex gap-2 mb-5 border-b border-gray-200">
                    {tabs.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
                                tab === t.key ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'curricula' && <CurriculaTab curricula={curricula} />}
                {tab === 'subjects' && <SubjectsTab subjects={subjects} />}
                {tab === 'study-plans' && <StudyPlansTab studyPlans={studyPlans} curricula={curricula} subjects={subjects} schools={schools} />}
            </div>
        </DashboardLayout>
    );
}
