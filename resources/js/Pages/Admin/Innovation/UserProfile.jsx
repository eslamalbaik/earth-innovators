import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    FaUser, FaArrowLeft, FaChartLine, FaBrain, FaRegFileAlt,
    FaLightbulb, FaGraduationCap, FaTrophy, FaBriefcase, FaUsers,
    FaSpinner, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle,
    FaSyncAlt, FaMedal, FaFileWord, FaPrint, FaCopy, FaCheck
} from 'react-icons/fa';
import axios from 'axios';
import IndexRadarChart from '@/Components/Innovation/IndexRadarChart';
import ClassificationBadge from '@/Components/Innovation/ClassificationBadge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const COGNITIVE_FACTOR_NAMES = {
    fluid_reasoning: 'الاستدلال السائل',
    knowledge: 'المعرفة',
    quantitative_reasoning: 'الاستدلال الكمي',
    visual_spatial: 'المعالجة البصرية المكانية',
    working_memory: 'الذاكرة العاملة',
};

const classifyStandardScore = (score) => {
    if (score >= 130) return { label: 'متفوق جداً', color: 'bg-emerald-100 text-emerald-800' };
    if (score >= 120) return { label: 'متفوق', color: 'bg-emerald-50 text-emerald-700' };
    if (score >= 110) return { label: 'فوق المتوسط', color: 'bg-blue-100 text-blue-800' };
    if (score >= 90) return { label: 'متوسط', color: 'bg-gray-100 text-gray-800' };
    if (score >= 80) return { label: 'أقل من المتوسط', color: 'bg-amber-100 text-amber-800' };
    if (score >= 70) return { label: 'ضعف بيني', color: 'bg-orange-100 text-orange-800' };
    return { label: 'متأخر', color: 'bg-red-100 text-red-800' };
};

export default function UserProfile({
    student,
    index = null,
    cognitiveAssessment = null,
    report = null,
    recommendations = {},
    isGenerating = false,
    benchmarking = null,
    indexNames = {}
}) {
    const [activeTab, setActiveTab] = useState('recommendations');
    const [recSubTab, setRecSubTab] = useState('general');
    const [localGenerating, setLocalGenerating] = useState(isGenerating);
    const [docGenerating, setDocGenerating] = useState(false);
    const [docType, setDocType] = useState('');
    const [generatedDoc, setGeneratedDoc] = useState(null);
    const [copied, setCopied] = useState(false);

    // التحديث التلقائي إذا كان التقرير جاري التوليد
    useEffect(() => {
        let interval;
        if (localGenerating) {
            interval = setInterval(() => {
                router.reload({
                    preserveScroll: true,
                    only: ['isGenerating', 'report'],
                    onSuccess: (page) => {
                        if (!page.props.isGenerating && page.props.report) {
                            setLocalGenerating(false);
                        }
                    }
                });
            }, 5000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [localGenerating]);

    const handleGenerateReport = () => {
        setLocalGenerating(true);
        router.post(route('admin.innovation.generate-report', student.id), {}, {
            preserveScroll: true
        });
    };

    const handleGenerateDoc = async (type, purpose = 'تميز ابتكاري وعلمي') => {
        setDocGenerating(true);
        setDocType(type);
        setGeneratedDoc(null);
        try {
            const res = await axios.post(route('admin.innovation.generate-document', student.id), { type, purpose });
            if (res.data.success) {
                setGeneratedDoc(res.data);
            }
        } catch (err) {
            alert('حدث خطأ أثناء إعداد المستند. حاول لاحقاً.');
        } finally {
            setDocGenerating(false);
        }
    };

    // حساب التوقعات لـ 5 سنوات — معادلة تقلص واقعية (أسرع بالدرجات المنخفضة، أبطأ قرب السقف)
    const currentScore = index ? Math.round(index.overall_score) : 0;
    const projectGrowth = (score, years) => {
        const growth = (100 - score) * (1 - Math.exp(-0.15 * years));
        return Math.round(score + growth);
    };
    const projectionData = [
        { year: 'الحالي', readiness: currentScore },
        { year: 'السنة 1', readiness: projectGrowth(currentScore, 1) },
        { year: 'السنة 2', readiness: projectGrowth(currentScore, 2) },
        { year: 'السنة 3', readiness: projectGrowth(currentScore, 3) },
        { year: 'السنة 4', readiness: projectGrowth(currentScore, 4) },
        { year: 'السنة 5', readiness: projectGrowth(currentScore, 5) },
    ];

    const indexes = index?.indexes_array || (index ? {
        skills: index.skills_index, innovation: index.innovation_index,
        intelligence: index.intelligence_index, creativity: index.creativity_index,
        projects: index.projects_index, leadership: index.leadership_index,
        ip: index.ip_index, future_readiness: index.future_readiness_index,
    } : {});

    const cognitiveFactors = cognitiveAssessment ? {
        fluid_reasoning: cognitiveAssessment.fluid_reasoning,
        knowledge: cognitiveAssessment.knowledge,
        quantitative_reasoning: cognitiveAssessment.quantitative_reasoning,
        visual_spatial: cognitiveAssessment.visual_spatial,
        working_memory: cognitiveAssessment.working_memory,
    } : null;

    return (
        <DashboardLayout header="ملف الطالب الابتكاري">
            <Head title={`ملف الطالب الابتكاري - ${student.name}`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6 text-right" dir="rtl">
                {/* زر الرجوع */}
                <div className="flex items-center justify-between">
                    <Link
                        href={route('admin.innovation.talent-map')}
                        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                    >
                        <FaArrowLeft /> الرجوع إلى خريطة المواهب
                    </Link>
                </div>

                {/* كارت معلومات الطالب الرئيسي */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold shrink-0 overflow-hidden border border-blue-100">
                            {student.image ? (
                                <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <FaUser />
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
                            <p className="text-sm text-gray-500 mt-1">{student.email}</p>
                            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                {student.institution || 'مؤسسة تعليمية غير محددة'}
                            </span>
                        </div>
                    </div>

                    {index ? (
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 shrink-0 w-full md:w-auto">
                            <div className="text-center bg-blue-600 text-white rounded-lg p-3 w-20 shrink-0">
                                <p className="text-[10px] opacity-95">الدرجة الكلية</p>
                                <p className="text-2xl font-black mt-0.5">{Math.round(index.overall_score)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-semibold">تصنيف الجاهزية</p>
                                <div className="mt-1">
                                    <ClassificationBadge details={index.classification_details} size="md" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                            <FaExclamationTriangle /> الطالب لم يحسب مؤشراته بعد.
                        </div>
                    )}
                </div>

                {/* التقسيم الرئيسي: تشخيص الابتكار والقدرات المعرفية */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* عمود رادار المؤشرات والتنبؤ */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* رادار المؤشرات الثمانية */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaChartLine className="text-blue-500" /> تشخيص مؤشرات الابتكار والجاهزية
                            </h2>
                            {Object.keys(indexes).length > 0 ? (
                                <div className="flex flex-col md:flex-row items-center gap-4">
                                    <div className="w-full md:w-3/5">
                                        <IndexRadarChart indexes={indexes} indexNames={indexNames} height={260} />
                                    </div>
                                    <div className="w-full md:w-2/5 grid grid-cols-2 gap-2">
                                        {Object.entries(indexNames).map(([key, label]) => (
                                            <div key={key} className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                                <p className="text-[10px] text-gray-500 font-semibold">{label}</p>
                                                <p className="text-base font-bold text-gray-800 mt-0.5">{Math.round(indexes[key])}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                              ) : (
                                <p className="text-center text-gray-400 py-10">لم يتم حساب مؤشرات الابتكار بعد</p>
                            )}
                        </div>

                        {/* التنبؤ بالجاهزية (خمس سنوات) */}
                        {index && (
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <FaCalendarAlt className="text-indigo-500" /> تنبؤ مستوى الجاهزية (خمس سنوات)
                                </h2>
                                <p className="text-xs text-gray-500 mb-4">مسار النمو والجاهزية المستقبلي للطالب بناءً على وتيرة النشاط الحالي.</p>
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                            <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#6b7280' }} />
                                            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} />
                                            <RechartsTooltip />
                                            <Line type="monotone" dataKey="readiness" name="الجاهزية المتوقعة" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* عمود القدرات المعرفية */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-full flex flex-col">
                            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaBrain className="text-sky-500" /> القدرات المعرفية (ستانفورد-بينيه)
                            </h2>
                            {cognitiveAssessment ? (
                                <div className="space-y-4 flex-1 flex flex-col justify-between">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-sky-50 rounded-xl border border-sky-100 p-2.5 text-center">
                                            <p className="text-xl font-black text-sky-700">{cognitiveAssessment.full_scale_iq}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">نسبة الذكاء الكلية</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-2.5 text-center">
                                            <p className="text-xl font-black text-gray-700">{cognitiveAssessment.verbal_iq}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">اللفظية</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl border border-gray-100 p-2.5 text-center">
                                            <p className="text-xl font-black text-gray-700">{cognitiveAssessment.nonverbal_iq}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">غير اللفظية</p>
                                        </div>
                                    </div>

                                    {cognitiveFactors && (
                                        <div className="h-44">
                                            <IndexRadarChart
                                                indexes={cognitiveFactors}
                                                indexNames={COGNITIVE_FACTOR_NAMES}
                                                height={170}
                                                color="#0ea5e9"
                                                name="الدرجة المعيارية"
                                                maxValue={160}
                                            />
                                        </div>
                                    )}

                                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden text-xs">
                                        {Object.entries(COGNITIVE_FACTOR_NAMES).map(([key, label]) => {
                                            const val = cognitiveFactors?.[key];
                                            if (val == null) return null;
                                            const cls = classifyStandardScore(val);
                                            return (
                                                <div key={key} className="flex justify-between items-center px-3 py-2 bg-white">
                                                    <span className="font-medium text-gray-700">{label}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${cls.color}`}>{cls.label}</span>
                                                        <span className="font-black text-gray-800">{val}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400 my-auto">
                                    <FaBrain className="text-3xl block mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">لم يُسجّل أي تقييم معرفي لهذا الطالب بعد.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* التبويبات السفلى: تقارير AI والتوصيات */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('recommendations')}
                            className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${activeTab === 'recommendations' ? 'border-blue-600 text-blue-600 bg-blue-50/20' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                        >
                            <FaLightbulb className="inline-block ml-2" /> التوصيات الذكية
                        </button>
                        <button
                            onClick={() => setActiveTab('report')}
                            className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${activeTab === 'report' ? 'border-blue-600 text-blue-600 bg-blue-50/20' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                        >
                            <FaRegFileAlt className="inline-block ml-2" /> تقارير AI الشاملة
                        </button>
                        <button
                            onClick={() => setActiveTab('benchmarking')}
                            className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${activeTab === 'benchmarking' ? 'border-blue-600 text-blue-600 bg-blue-50/20' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                        >
                            <FaMedal className="inline-block ml-2" /> المقارنة المعيارية
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`flex-1 py-4 text-center font-bold text-sm transition-colors border-b-2 ${activeTab === 'documents' ? 'border-blue-600 text-blue-600 bg-blue-50/20' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                        >
                            <FaFileWord className="inline-block ml-2" /> المستندات والخطابات
                        </button>
                    </div>

                    <div className="p-6">
                        {/* محتوى تبويب التوصيات */}
                        {activeTab === 'recommendations' && (
                            <div className="space-y-6">
                                {index ? (
                                    <>
                                        <div className="flex border-b border-gray-100 gap-4 overflow-x-auto pb-1 text-xs sm:text-sm">
                                            {[
                                                { id: 'general', label: 'توصيات عامة', icon: FaCheckCircle },
                                                { id: 'courses', label: 'دورات تدريبية', icon: FaGraduationCap },
                                                { id: 'projects', label: 'مشاريع مقترحة', icon: FaBriefcase },
                                                { id: 'competitions', label: 'مسابقات ومنافسات', icon: FaTrophy },
                                                { id: 'collaborators', label: 'معايير زملاء العمل', icon: FaUsers }
                                            ].map(sub => (
                                                <button
                                                    key={sub.id}
                                                    onClick={() => setRecSubTab(sub.id)}
                                                    className={`py-2 px-3 rounded-lg font-bold transition flex items-center gap-1.5 shrink-0 ${recSubTab === sub.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                                                >
                                                    <sub.icon /> {sub.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="pt-2 text-sm leading-relaxed text-gray-700">
                                            {/* توصيات عامة */}
                                            {recSubTab === 'general' && (
                                                <div className="space-y-4">
                                                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                                        <h3 className="font-bold text-indigo-900 mb-1">نصيحة عامة للمبتكر:</h3>
                                                        <p className="text-indigo-950">{recommendations.overall_advice || 'تطوير مستمر للأفكار والمشاريع التقنية.'}</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {recommendations.general_recommendations?.map((rec, i) => (
                                                            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start gap-3">
                                                                <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} title={`أولوية ${rec.priority}`} />
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900 text-sm">{rec.title}</h4>
                                                                    <p className="text-xs text-gray-500 mt-1">{rec.description}</p>
                                                                    {rec.target_index && <span className="inline-block mt-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{rec.target_index}</span>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* دورات تدريبية */}
                                            {recSubTab === 'courses' && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {recommendations.courses?.map((c, i) => (
                                                        <div key={i} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                                                            <h4 className="font-bold text-gray-950">{c.title}</h4>
                                                            <p className="text-xs text-gray-500 mt-1">{c.description}</p>
                                                            <div className="flex justify-between items-center mt-3 text-xs">
                                                                <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{c.provider}</span>
                                                                {c.target_index && <span className="text-gray-400 font-semibold">{c.target_index}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* مشاريع مقترحة */}
                                            {recSubTab === 'projects' && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {recommendations.projects?.map((p, i) => (
                                                        <div key={i} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                                                            <h4 className="font-bold text-gray-950">{p.title}</h4>
                                                            <p className="text-xs text-gray-500 mt-1">{p.description}</p>
                                                            {p.skills_needed?.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-3">
                                                                    {p.skills_needed.map((s, idx) => (
                                                                        <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-semibold">{s}</span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* مسابقات */}
                                            {recSubTab === 'competitions' && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {recommendations.competitions?.map((comp, i) => (
                                                        <div key={i} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                                                            <h4 className="font-bold text-gray-950">{comp.title}</h4>
                                                            <p className="text-xs text-gray-500 mt-1">{comp.description}</p>
                                                            <span className="inline-block mt-3 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{comp.type}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* زملاء العمل */}
                                            {recSubTab === 'collaborators' && (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {recommendations.collaborators_criteria?.map((col, i) => (
                                                        <div key={i} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                                                <FaUsers />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-gray-900 text-sm">البحث عن مهارة: {col.skill}</h4>
                                                                <p className="text-xs text-gray-500 mt-1">{col.reason}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-center text-gray-400 py-6">لم يتم حساب مؤشرات الطالب، لا توجد توصيات متاحة.</p>
                                )}
                            </div>
                        )}

                        {/* محتوى تبويب التقرير */}
                        {activeTab === 'report' && (
                            <div className="space-y-6">
                                {localGenerating ? (
                                    <div className="text-center py-16 space-y-4">
                                        <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto" />
                                        <h3 className="font-bold text-gray-800">جاري توليد تقرير الذكاء الاصطناعي الشامل...</h3>
                                        <p className="text-xs text-gray-400 max-w-xs mx-auto">نقوم الآن بتحليل المهارات، الإنجازات والقدرات المعرفية لبناء خطة تطوير متكاملة. سيتم تحديث الصفحة تلقائياً.</p>
                                    </div>
                                ) : report ? (
                                    <div className="space-y-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <div>
                                                <h3 className="font-bold text-gray-800">📋 {report.title || 'تقرير الطالب الشامل'}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">تم التوليد باستخدام الذكاء الاصطناعي بنجاح.</p>
                                            </div>
                                            <button
                                                onClick={handleGenerateReport}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                                            >
                                                <FaSyncAlt /> إعادة توليد التقرير
                                            </button>
                                        </div>

                                        {/* التلخيص التنفيذي */}
                                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-md">
                                            <h4 className="font-bold mb-2">📄 الملخص التنفيذي</h4>
                                            <p className="text-white/90 text-sm leading-relaxed">{report.summary}</p>
                                        </div>

                                        {/* نقاط القوة والضعف */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                                                <h4 className="font-bold text-emerald-800 mb-2 flex items-center gap-1.5">💪 تحليل نقاط القوة</h4>
                                                <p className="text-emerald-950 text-xs leading-relaxed whitespace-pre-line">{report.strengths_analysis}</p>
                                            </div>
                                            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                                                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-1.5">📌 تحليل فجوات التطوير</h4>
                                                <p className="text-amber-950 text-xs leading-relaxed whitespace-pre-line">{report.weaknesses_analysis}</p>
                                            </div>
                                        </div>

                                        {/* خطة التطوير الأكاديمي والمهني */}
                                        {report.development_plan?.length > 0 && (
                                            <div className="bg-white border border-gray-100 rounded-xl p-4">
                                                <h4 className="font-bold text-gray-900 mb-4">🛠️ خطة التطوير الأكاديمي المقترحة</h4>
                                                <div className="space-y-4">
                                                    {report.development_plan.map((phase, idx) => (
                                                        <div key={idx} className="flex gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold text-sm border border-blue-100 mt-1">
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-gray-950 text-sm">{phase.phase} <span className="text-xs text-indigo-600 font-semibold mr-2 bg-indigo-50 px-2 py-0.5 rounded">{phase.duration}</span></h5>
                                                                <ul className="text-xs text-gray-500 mt-1.5 space-y-1 list-disc list-inside">
                                                                    {phase.actions?.map((act, actIdx) => <li key={actIdx} className="leading-relaxed">{act}</li>)}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* الخلاصة */}
                                        {report.conclusion && (
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 leading-relaxed">
                                                <h4 className="font-bold text-gray-800 mb-1">🏁 خلاصة التقرير</h4>
                                                <p>{report.conclusion}</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl max-w-md mx-auto">
                                        <FaRegFileAlt className="text-4xl text-gray-300 block mx-auto mb-3" />
                                        <h3 className="font-bold text-gray-800 mb-1">لا يوجد تقرير AI مولّد للطالب</h3>
                                        <p className="text-xs text-gray-400 mb-6">قم بتوليد تقرير شامل بالذكاء الاصطناعي لتشخيص مستوى وجاهزية الطالب وتوجيهه بمسار تعليمي مخصص.</p>
                                        <button
                                            onClick={handleGenerateReport}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 mx-auto shadow-md"
                                        >
                                            🚀 توليد تقرير AI شامل
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* محتوى تبويب المقارنة المعيارية */}
                        {activeTab === 'benchmarking' && (
                            <div className="space-y-6">
                                {benchmarking ? (
                                    <>
                                        {/* بطاقات الترتيب */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-white/80">الترتيب المئوي العام</span>
                                                    <FaMedal className="text-2xl text-amber-200" />
                                                </div>
                                                <div className="text-3xl font-black mb-1">{benchmarking.percentile}%</div>
                                                <p className="text-xs text-white/90">أعلى من {benchmarking.percentile}% من إجمالي المبتكرين في المنصة</p>
                                            </div>

                                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-white/80">ترتيب الدفعة ({student.year || 'العامة'})</span>
                                                    <FaTrophy className="text-2xl text-blue-200" />
                                                </div>
                                                <div className="text-3xl font-black mb-1">#{benchmarking.cohort?.user_rank || 1}</div>
                                                <p className="text-xs text-white/90">من أصل {benchmarking.cohort?.total_users || 1} طالب في نفس السنة الدراسية</p>
                                            </div>

                                            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-white/80">ترتيب المؤسسة</span>
                                                    <FaUsers className="text-2xl text-emerald-200" />
                                                </div>
                                                <div className="text-3xl font-black mb-1">#{benchmarking.institution?.user_rank || 1}</div>
                                                <p className="text-xs text-white/90">من أصل {benchmarking.institution?.total_users || 1} في {student.institution || 'المؤسسة'}</p>
                                            </div>
                                        </div>

                                        {/* جدول مقارنة المؤشرات مع المتوسطات */}
                                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                            <h4 className="font-bold text-gray-800 text-sm mb-4">مقارنة المؤشرات الثمانية مع متوسطات الدفعة والمؤسسة</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-right text-xs">
                                                    <thead>
                                                        <tr className="border-b border-gray-200 text-gray-500 font-bold">
                                                            <th className="pb-3">المؤشر</th>
                                                            <th className="pb-3">درجة الطالب</th>
                                                            <th className="pb-3">متوسط الدفعة</th>
                                                            <th className="pb-3">الفرق عن الدفعة</th>
                                                            <th className="pb-3">متوسط المؤسسة</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {Object.entries(indexNames).map(([key, label]) => {
                                                            const field = key + '_index';
                                                            const cohortComp = benchmarking.cohort?.comparisons?.[field];
                                                            const instComp = benchmarking.institution?.comparisons?.[field];
                                                            const val = index ? Math.round(index[field] || 0) : 0;

                                                            return (
                                                                <tr key={key} className="hover:bg-white/50 transition">
                                                                    <td className="py-3 font-bold text-gray-800">{label}</td>
                                                                    <td className="py-3 font-black text-indigo-600">{val}%</td>
                                                                    <td className="py-3 text-gray-600">{cohortComp?.avg_value || 0}%</td>
                                                                    <td className="py-3">
                                                                        <span className={`px-2 py-0.5 rounded font-bold ${cohortComp?.above_average ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                            {cohortComp?.difference > 0 ? `+${cohortComp.difference}` : cohortComp?.difference || 0}%
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-3 text-gray-600">{instComp?.avg_value || 0}%</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                                        <FaMedal className="text-4xl text-gray-300 block mx-auto mb-3" />
                                        <h3 className="font-bold text-gray-800 mb-1">لا توجد بيانات مقارنة معيارية</h3>
                                        <p className="text-xs text-gray-400">يجب حساب مؤشرات الطالب أولاً لتفعيل الترتيب المئوي والمقارنات.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* محتوى تبويب المستندات والخطابات */}
                        {activeTab === 'documents' && (
                            <div className="space-y-6">
                                <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-indigo-950 text-sm mb-1">🤖 مركز الإصدار الذكي للمستندات والخطابات</h4>
                                        <p className="text-xs text-indigo-700/80">استخدم الذكاء الاصطناعي لإعداد خطابات توصية رسمية، سيرة ذاتية ابتكارية، أو ملف إنجاز بضغطة زر بناءً على مؤشرات الطالب.</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 shrink-0">
                                        <button
                                            onClick={() => handleGenerateDoc('recommendation_letter')}
                                            disabled={docGenerating}
                                            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                                        >
                                            {docGenerating && docType === 'recommendation_letter' ? <FaSpinner className="animate-spin" /> : <FaFileWord />}
                                            <span>خطاب توصية رسمي</span>
                                        </button>
                                        <button
                                            onClick={() => handleGenerateDoc('cv')}
                                            disabled={docGenerating}
                                            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                                        >
                                            {docGenerating && docType === 'cv' ? <FaSpinner className="animate-spin" /> : <FaFileWord />}
                                            <span>سيرة ذاتية ابتكارية</span>
                                        </button>
                                        <button
                                            onClick={() => handleGenerateDoc('portfolio')}
                                            disabled={docGenerating}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                                        >
                                            {docGenerating && docType === 'portfolio' ? <FaSpinner className="animate-spin" /> : <FaFileWord />}
                                            <span>ملف إنجاز شامل</span>
                                        </button>
                                    </div>
                                </div>

                                {docGenerating && (
                                    <div className="py-12 text-center bg-gray-50 rounded-2xl border border-gray-100">
                                        <FaSpinner className="animate-spin text-4xl text-indigo-600 block mx-auto mb-3" />
                                        <h4 className="font-bold text-gray-800 text-sm mb-1">جاري إعداد وصياغة المستند الاحترافي...</h4>
                                        <p className="text-xs text-gray-400">يقوم الذكاء الاصطناعي الآن بتحليل إنجازات ومؤشرات الطالب لصياغة مستند أكاديمي متكامل.</p>
                                    </div>
                                )}

                                {generatedDoc && !docGenerating && (
                                    <div className="bg-white rounded-2xl border-2 border-indigo-200 shadow-md p-6">
                                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                                            <h3 className="font-bold text-gray-900 text-base">{generatedDoc.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(generatedDoc.content);
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 2000);
                                                    }}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                                >
                                                    {copied ? <FaCheck className="text-green-600" /> : <FaCopy />}
                                                    <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
                                                </button>
                                                <button
                                                    onClick={() => window.print()}
                                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1"
                                                >
                                                    <FaPrint />
                                                    <span>طباعة</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="prose max-w-none text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                                            {generatedDoc.content}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
