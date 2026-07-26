import { Head, Link, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

const COMPOSITE_ABILITIES = [
    { key: 'planning', label: 'القدرة على التخطيط' },
    { key: 'attention_focus', label: 'الانتباه والتركيز' },
    { key: 'trial_error_solving', label: 'حل المشكلات بالمحاولة والخطأ' },
    { key: 'time_pressure_performance', label: 'الأداء تحت ضغط الوقت' },
];

const scoreHint = 'درجة معيارية 40-160 (المتوسط 100)';

export default function CognitiveAssessmentForm({ auth, student, assessment = null, factorNames = {} }) {
    const { data, setData, post, processing, errors } = useForm({
        assessor_name: assessment?.assessor_name || '',
        assessment_date: assessment?.assessment_date?.split('T')[0] || '',
        full_scale_iq: assessment?.full_scale_iq ?? '',
        verbal_iq: assessment?.verbal_iq ?? '',
        nonverbal_iq: assessment?.nonverbal_iq ?? '',
        fluid_reasoning: assessment?.fluid_reasoning ?? '',
        knowledge: assessment?.knowledge ?? '',
        quantitative_reasoning: assessment?.quantitative_reasoning ?? '',
        visual_spatial: assessment?.visual_spatial ?? '',
        working_memory: assessment?.working_memory ?? '',
        composite_abilities: assessment?.composite_abilities || {},
        strengths: assessment?.strengths?.length ? assessment.strengths : [''],
        weaknesses: assessment?.weaknesses?.length ? assessment.weaknesses : [''],
        notes: assessment?.notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('teacher.innovation.cognitive-assessment.store', student.id));
    };

    const numberInput = (field, label, hint = scoreHint) => (
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
            <input
                type="number"
                min="40"
                max="160"
                value={data[field]}
                onChange={(e) => setData(field, e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={hint}
            />
            {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
        </div>
    );

    const listEditor = (field, label, icon) => (
        <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{icon} {label}</label>
            {data[field].map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                            const next = [...data[field]];
                            next[idx] = e.target.value;
                            setData(field, next);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                    {data[field].length > 1 && (
                        <button
                            type="button"
                            onClick={() => setData(field, data[field].filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-600 px-2"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={() => setData(field, [...data[field], ''])}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
                + إضافة
            </button>
        </div>
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title={`تقييم معرفي — ${student.name}`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🧠 التقييم المعرفي (ستانفورد-بينيه)</h1>
                        <p className="text-gray-500 mt-1">
                            الطالب: <span className="font-semibold text-gray-700 dark:text-gray-300">{student.name}</span>
                            {assessment && ' — سيُحفظ كتقييم جديد ويبقى السجل السابق محفوظاً'}
                        </p>
                    </div>
                    <Link
                        href={route('teacher.innovation.student-report', student.id)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                        → تقرير الطالب
                    </Link>
                </div>

                <div className="p-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 rounded-xl text-sm text-sky-700 dark:text-sky-200">
                    🔒 هذه البيانات سرية وتظهر للمدربين والإدارة فقط — لا يطّلع عليها الطالب.
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Assessment meta */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">اسم الفاحص</label>
                            <input
                                type="text"
                                value={data.assessor_name}
                                onChange={(e) => setData('assessor_name', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                placeholder="الأخصائي النفسي الذي طبّق المقياس"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">تاريخ التطبيق</label>
                            <input
                                type="date"
                                value={data.assessment_date}
                                onChange={(e) => setData('assessment_date', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* IQ Scores */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">نسب الذكاء</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {numberInput('full_scale_iq', 'نسبة ذكاء المقياس الكلي')}
                            {numberInput('verbal_iq', 'نسبة الذكاء اللفظية')}
                            {numberInput('nonverbal_iq', 'نسبة الذكاء غير اللفظية')}
                        </div>
                    </div>

                    {/* Five factors */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-1">العوامل الخمسة الكبرى</h3>
                        <p className="text-xs text-gray-400 mb-4">{scoreHint}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(factorNames).map(([key, label]) => (
                                <div key={key}>{numberInput(key, label)}</div>
                            ))}
                        </div>
                    </div>

                    {/* Composite abilities */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">مركبات القدرة المشتركة (اختياري)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {COMPOSITE_ABILITIES.map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
                                    <input
                                        type="number"
                                        min="40"
                                        max="160"
                                        value={data.composite_abilities?.[key] ?? ''}
                                        onChange={(e) => setData('composite_abilities', {
                                            ...data.composite_abilities,
                                            [key]: e.target.value === '' ? undefined : Number(e.target.value),
                                        })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                                        placeholder={scoreHint}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {listEditor('strengths', 'نقاط القوة', '💪')}
                        {listEditor('weaknesses', 'نقاط الضعف', '📌')}
                    </div>

                    {/* Notes */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md border border-gray-100 dark:border-gray-700">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">📝 الملاحظات الكيفية (سجل المدرب)</label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500"
                            placeholder="ملاحظات سلوكية لا تظهر في الاختبارات الكمية: المثابرة، تحمل الغموض، التعامل مع الضغط..."
                        />
                        {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                        {processing ? '⏳ جاري الحفظ...' : '💾 حفظ التقييم المعرفي'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}
