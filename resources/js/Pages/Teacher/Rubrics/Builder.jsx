import { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    FaPlus, FaTrash, FaBookOpen, FaSave, FaMagic, FaTimes, FaChevronDown, FaChevronUp,
} from 'react-icons/fa';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useToast } from '@/Contexts/ToastContext';
import { useDir, useTranslation } from '@/i18n';

let uidCounter = 0;
const nextUid = () => `c${Date.now()}_${uidCounter++}`;

const defaultLevels = () => ([
    { name: 'Excellent', name_ar: 'ممتاز', score: 4, description: '', description_ar: '' },
    { name: 'Good', name_ar: 'جيد', score: 3, description: '', description_ar: '' },
    { name: 'Fair', name_ar: 'مقبول', score: 2, description: '', description_ar: '' },
    { name: 'Needs Improvement', name_ar: 'يحتاج تحسين', score: 1, description: '', description_ar: '' },
]);

const criterionFromLibrary = (lib) => ({
    _uid: nextUid(),
    library_criterion_id: lib.id,
    name: lib.name,
    name_ar: lib.name_ar,
    description: lib.description || '',
    description_ar: lib.description_ar || '',
    weight: Number(lib.default_weight),
    levels: lib.levels.map((l) => ({ ...l })),
});

const blankCriterion = () => ({
    _uid: nextUid(),
    library_criterion_id: null,
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    weight: 0,
    levels: defaultLevels(),
});

export default function RubricBuilder({ library = [], rubric = null, auth }) {
    const { t, language } = useTranslation();
    const dir = useDir();
    const { showSuccess, showError } = useToast();
    const isEdit = !!rubric;
    const isAr = language === 'ar';

    const [name, setName] = useState(rubric?.name || '');
    const [nameAr, setNameAr] = useState(rubric?.name_ar || '');
    const [description, setDescription] = useState(rubric?.description || '');
    const [descriptionAr, setDescriptionAr] = useState(rubric?.description_ar || '');
    const [scope, setScope] = useState(rubric?.scope || 'teacher');
    const [grade, setGrade] = useState(rubric?.grade || '');
    const [subject, setSubject] = useState(rubric?.subject || '');
    const [criteria, setCriteria] = useState(() => (rubric?.criteria || []).map((c) => ({ ...c, _uid: nextUid() })));
    const [showLibrary, setShowLibrary] = useState(false);
    const [expanded, setExpanded] = useState({});
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const totalWeight = useMemo(
        () => criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0),
        [criteria]
    );
    const weightOk = Math.abs(totalWeight - 100) < 0.5;
    const canSave = name.trim() && nameAr.trim() && criteria.length > 0 && weightOk
        && (scope !== 'class' || (grade.trim() && subject.trim()));

    const toggleExpanded = (uid) => setExpanded((prev) => ({ ...prev, [uid]: !prev[uid] }));

    const addAllFromLibrary = () => {
        setCriteria(library.map(criterionFromLibrary));
        setShowLibrary(false);
    };

    const addOneFromLibrary = (lib) => {
        setCriteria((prev) => [...prev, criterionFromLibrary(lib)]);
    };

    const addCustomCriterion = () => {
        const c = blankCriterion();
        setCriteria((prev) => [...prev, c]);
        setExpanded((prev) => ({ ...prev, [c._uid]: true }));
    };

    const updateCriterion = (uid, patch) => {
        setCriteria((prev) => prev.map((c) => (c._uid === uid ? { ...c, ...patch } : c)));
    };

    const removeCriterion = (uid) => {
        setCriteria((prev) => prev.filter((c) => c._uid !== uid));
    };

    const updateLevel = (uid, index, patch) => {
        setCriteria((prev) => prev.map((c) => {
            if (c._uid !== uid) return c;
            return { ...c, levels: c.levels.map((l, i) => (i === index ? { ...l, ...patch } : l)) };
        }));
    };

    const addLevel = (uid) => {
        setCriteria((prev) => prev.map((c) => (c._uid === uid
            ? { ...c, levels: [...c.levels, { name: '', name_ar: '', score: 0, description: '', description_ar: '' }] }
            : c)));
    };

    const removeLevel = (uid, index) => {
        setCriteria((prev) => prev.map((c) => (c._uid === uid
            ? { ...c, levels: c.levels.filter((_, i) => i !== index) }
            : c)));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSave || processing) return;

        setProcessing(true);
        setErrors({});

        const payload = {
            name,
            name_ar: nameAr,
            description,
            description_ar: descriptionAr,
            scope,
            grade: scope === 'class' ? grade : null,
            subject: scope === 'class' ? subject : null,
            criteria: criteria.map(({ _uid, ...c }) => c),
        };

        const url = isEdit ? route('teacher.rubrics.update', rubric.id) : route('teacher.rubrics.store');
        const method = isEdit ? 'put' : 'post';

        router[method](url, payload, {
            onError: (errs) => {
                setErrors(errs);
                showError(t('teacherRubricsPage.builder.saveError'));
            },
            onSuccess: () => showSuccess(t('teacherRubricsPage.builder.saveSuccess')),
            onFinish: () => setProcessing(false),
        });
    };

    const BuilderContent = () => (
        <form onSubmit={handleSubmit} className="space-y-5 pb-28">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? t('teacherRubricsPage.builder.editTitle') : t('teacherRubricsPage.builder.createTitle')}
                </h1>
                <p className="text-gray-500 mt-1 text-sm">{t('teacherRubricsPage.builder.subtitle')}</p>
            </div>

            {/* Basic info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                <h2 className="font-bold text-gray-800 text-sm">{t('teacherRubricsPage.builder.basicInfo')}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('teacherRubricsPage.builder.nameAr')}</label>
                        <input
                            type="text"
                            value={nameAr}
                            onChange={(e) => setNameAr(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            dir="rtl"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('teacherRubricsPage.builder.nameEn')}</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('teacherRubricsPage.builder.descriptionAr')}</label>
                        <textarea
                            value={descriptionAr}
                            onChange={(e) => setDescriptionAr(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            dir="rtl"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('teacherRubricsPage.builder.descriptionEn')}</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            dir="ltr"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">{t('teacherRubricsPage.builder.scopeLabel')}</label>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setScope('teacher')}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                                scope === 'teacher' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200'
                            }`}
                        >
                            {t('teacherRubricsPage.scopeTeacher')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setScope('class')}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                                scope === 'class' ? 'bg-purple-600 border-purple-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-purple-200'
                            }`}
                        >
                            {t('teacherRubricsPage.scopeClass')}
                        </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                        {scope === 'class' ? t('teacherRubricsPage.builder.scopeClassHint') : t('teacherRubricsPage.builder.scopeTeacherHint')}
                    </p>
                </div>

                {scope === 'class' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('teacherRubricsPage.builder.grade')}</label>
                            <input
                                type="text"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                placeholder={t('teacherRubricsPage.builder.gradePlaceholder')}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">{t('teacherRubricsPage.builder.subject')}</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder={t('teacherRubricsPage.builder.subjectPlaceholder')}
                                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Criteria actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-gray-800 text-sm">{t('teacherRubricsPage.builder.criteriaTitle')}</h2>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${weightOk ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {t('teacherRubricsPage.builder.totalWeight', { total: totalWeight })}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {criteria.length === 0 && library.length > 0 && (
                        <button
                            type="button"
                            onClick={addAllFromLibrary}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-sm hover:shadow-md transition"
                        >
                            <FaMagic />
                            {t('teacherRubricsPage.builder.quickStart')}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowLibrary((v) => !v)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition"
                    >
                        <FaBookOpen />
                        {t('teacherRubricsPage.builder.browseLibrary')}
                    </button>
                    <button
                        type="button"
                        onClick={addCustomCriterion}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition"
                    >
                        <FaPlus />
                        {t('teacherRubricsPage.builder.addCustom')}
                    </button>
                </div>

                {showLibrary && (
                    <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-2">
                        {library.map((lib) => (
                            <div key={lib.id} className="flex items-center justify-between gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{isAr ? lib.name_ar : lib.name}</p>
                                    <p className="text-[11px] text-gray-400">{t('teacherRubricsPage.builder.defaultWeight', { weight: lib.default_weight })}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addOneFromLibrary(lib)}
                                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition"
                                >
                                    <FaPlus />
                                    {t('common.add')}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {errors.criteria && (
                    <p className="text-xs text-red-600 mb-3 font-semibold">{errors.criteria}</p>
                )}

                <div className="space-y-3">
                    {criteria.map((c) => (
                        <div key={c._uid} className="rounded-xl border border-gray-200 overflow-hidden">
                            <div className="flex items-center gap-2 p-3 bg-gray-50">
                                <input
                                    type="text"
                                    value={isAr ? c.name_ar : c.name}
                                    onChange={(e) => updateCriterion(c._uid, isAr ? { name_ar: e.target.value } : { name: e.target.value })}
                                    placeholder={t('teacherRubricsPage.builder.criterionNamePlaceholder')}
                                    className="flex-1 min-w-0 rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm font-semibold focus:border-indigo-400 focus:outline-none"
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0"
                                        max="100"
                                        value={c.weight}
                                        onChange={(e) => updateCriterion(c._uid, { weight: e.target.value })}
                                        className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-center focus:border-indigo-400 focus:outline-none"
                                    />
                                    <span className="text-xs text-gray-400">%</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => toggleExpanded(c._uid)}
                                    className="shrink-0 p-2 text-gray-400 hover:text-gray-600"
                                    title={t('teacherRubricsPage.builder.editLevels')}
                                >
                                    {expanded[c._uid] ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeCriterion(c._uid)}
                                    className="shrink-0 p-2 text-red-400 hover:text-red-600"
                                >
                                    <FaTrash />
                                </button>
                            </div>

                            {expanded[c._uid] && (
                                <div className="p-3 space-y-3 border-t border-gray-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            value={c.name_ar}
                                            onChange={(e) => updateCriterion(c._uid, { name_ar: e.target.value })}
                                            placeholder={t('teacherRubricsPage.builder.nameAr')}
                                            dir="rtl"
                                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                                        />
                                        <input
                                            type="text"
                                            value={c.name}
                                            onChange={(e) => updateCriterion(c._uid, { name: e.target.value })}
                                            placeholder={t('teacherRubricsPage.builder.nameEn')}
                                            dir="ltr"
                                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                                        />
                                        <textarea
                                            value={c.description_ar}
                                            onChange={(e) => updateCriterion(c._uid, { description_ar: e.target.value })}
                                            placeholder={t('teacherRubricsPage.builder.descriptionAr')}
                                            dir="rtl"
                                            rows={2}
                                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                                        />
                                        <textarea
                                            value={c.description}
                                            onChange={(e) => updateCriterion(c._uid, { description: e.target.value })}
                                            placeholder={t('teacherRubricsPage.builder.descriptionEn')}
                                            dir="ltr"
                                            rows={2}
                                            className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:border-indigo-400 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[11px] font-bold text-gray-500 uppercase">{t('teacherRubricsPage.builder.performanceLevels')}</p>
                                            <button
                                                type="button"
                                                onClick={() => addLevel(c._uid)}
                                                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                                            >
                                                + {t('teacherRubricsPage.builder.addLevel')}
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {c.levels.map((level, i) => (
                                                <div key={i} className="grid grid-cols-12 gap-1.5 items-start bg-gray-50 rounded-lg p-2">
                                                    <input
                                                        type="text"
                                                        value={level.name_ar}
                                                        onChange={(e) => updateLevel(c._uid, i, { name_ar: e.target.value })}
                                                        placeholder={t('teacherRubricsPage.builder.levelNameAr')}
                                                        dir="rtl"
                                                        className="col-span-3 rounded-md border border-gray-200 px-1.5 py-1 text-[11px]"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={level.name}
                                                        onChange={(e) => updateLevel(c._uid, i, { name: e.target.value })}
                                                        placeholder={t('teacherRubricsPage.builder.levelNameEn')}
                                                        dir="ltr"
                                                        className="col-span-3 rounded-md border border-gray-200 px-1.5 py-1 text-[11px]"
                                                    />
                                                    <input
                                                        type="number"
                                                        value={level.score}
                                                        onChange={(e) => updateLevel(c._uid, i, { score: e.target.value })}
                                                        placeholder={t('teacherRubricsPage.builder.score')}
                                                        className="col-span-1 rounded-md border border-gray-200 px-1 py-1 text-[11px] text-center"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={level.description_ar}
                                                        onChange={(e) => updateLevel(c._uid, i, { description_ar: e.target.value })}
                                                        placeholder={t('teacherRubricsPage.builder.levelDescAr')}
                                                        dir="rtl"
                                                        className="col-span-2 rounded-md border border-gray-200 px-1.5 py-1 text-[11px]"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={level.description}
                                                        onChange={(e) => updateLevel(c._uid, i, { description: e.target.value })}
                                                        placeholder={t('teacherRubricsPage.builder.levelDescEn')}
                                                        dir="ltr"
                                                        className="col-span-2 rounded-md border border-gray-200 px-1.5 py-1 text-[11px]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLevel(c._uid, i)}
                                                        className="col-span-1 flex items-center justify-center text-red-400 hover:text-red-600"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {criteria.length === 0 && (
                        <p className="text-center text-sm text-gray-400 py-6">{t('teacherRubricsPage.builder.noCriteria')}</p>
                    )}
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-gray-100 p-3 md:static md:bg-transparent md:backdrop-blur-none md:border-0 md:p-0">
                <div className="mx-auto max-w-5xl flex items-center justify-end gap-3 px-1">
                    <button
                        type="submit"
                        disabled={!canSave || processing}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold shadow-sm transition"
                    >
                        <FaSave />
                        {processing ? t('common.saving') : t('teacherRubricsPage.builder.save')}
                    </button>
                </div>
            </div>
        </form>
    );

    return (
        <div dir={dir} className="min-h-screen bg-gray-50">
            <Head title={t('teacherRubricsPage.builder.pageTitle', { appName: t('common.appName') })} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('teacherRubricsPage.title')}
                    activeNav="projects"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit(route('teacher.rubrics.index'))}
                >
                    <BuilderContent />
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('teacherRubricsPage.title')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit(route('teacher.rubrics.index'))}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-4">
                    <BuilderContent />
                </main>
                <MobileBottomNav active="projects" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}
