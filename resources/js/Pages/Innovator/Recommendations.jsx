import StudentPageShell from '@/Components/Innovation/StudentPageShell';

const PRIORITY_STYLES = {
    high:   { bg: 'bg-gray-50/50', border: 'border-gray-100', text: 'text-gray-900', badge: 'bg-red-50 text-red-600 border border-red-100' },
    medium: { bg: 'bg-gray-50/50', border: 'border-gray-100', text: 'text-gray-900', badge: 'bg-amber-50 text-amber-600 border border-amber-100' },
    low:    { bg: 'bg-gray-50/50', border: 'border-gray-100', text: 'text-gray-900', badge: 'bg-blue-50 text-blue-600 border border-blue-100' },
};

export default function Recommendations({ recommendations }) {
    const {
        general_recommendations = [],
        courses = [],
        competitions = [],
        projects = [],
        strengths = [],
        weaknesses = [],
        overall_advice = '',
    } = recommendations || {};

    const isEmpty = !recommendations
        || (general_recommendations.length === 0 && courses.length === 0
            && competitions.length === 0 && projects.length === 0 && !overall_advice);

    return (
        <StudentPageShell title="التوصيات الذكية">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🤖 توصيات الذكاء الاصطناعي</h1>
                    <p className="text-gray-500 mt-1">توصيات مخصصة بناءً على تحليل مؤشراتك</p>
                </div>

                {isEmpty && (
                    <div className="text-center py-16 bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg">
                        <span className="text-6xl block mb-4">🤖</span>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد توصيات بعد</h3>
                        <p className="text-gray-500">أضف المزيد من الإنجازات ليتمكن الذكاء الاصطناعي من تحليل ملفك وتوليد توصيات مخصصة.</p>
                    </div>
                )}

                {/* Overall Advice */}
                {overall_advice && (
                    <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 shadow-sm flex items-start gap-4">
                        <span className="text-3xl">💬</span>
                        <div>
                            <h3 className="text-lg font-bold text-indigo-900 mb-1">النصيحة العامة</h3>
                            <p className="text-indigo-800/90 leading-relaxed text-sm">{overall_advice}</p>
                        </div>
                    </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">💪</span> 
                            نقاط القوة
                        </h3>
                        <ul className="space-y-3">
                            {strengths.map((s, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span> <span>{s}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-rose-50 text-rose-600 p-2 rounded-xl">📌</span> 
                            نقاط التحسين
                        </h3>
                        <ul className="space-y-3">
                            {weaknesses.map((w, i) => (
                                <li key={i} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                                    <span className="text-rose-400 mt-0.5 flex-shrink-0">!</span> <span>{w}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* General Recommendations */}
                {general_recommendations.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">📋 التوصيات العامة</h3>
                        <div className="space-y-3">
                            {general_recommendations.map((rec, i) => {
                                const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.medium;
                                return (
                                    <div key={i} className={`p-4 rounded-xl border ${style.bg} ${style.border}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className={`font-semibold ${style.text}`}>{rec.title}</h4>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style.badge}`}>
                                                {rec.priority === 'high' ? 'أولوية عالية' : rec.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{rec.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Courses */}
                {courses.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">📚 دورات مقترحة</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {courses.map((course, i) => (
                                <div key={i} className="p-5 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
                                    <h4 className="font-bold text-gray-900">{course.title}</h4>
                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">{course.description}</p>
                                    {course.provider && <p className="text-xs font-semibold text-indigo-600 mt-3 flex items-center gap-1"><span className="text-base">🎓</span> {course.provider}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Competitions */}
                {competitions.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">🏆 مسابقات مقترحة</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {competitions.map((comp, i) => (
                                <div key={i} className="p-5 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
                                    <h4 className="font-bold text-gray-900">{comp.title}</h4>
                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">{comp.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">🏗️ مشاريع مقترحة</h3>
                        <div className="space-y-3">
                            {projects.map((project, i) => (
                                <div key={i} className="p-5 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
                                    <h4 className="font-bold text-gray-900">{project.title}</h4>
                                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">{project.description}</p>
                                    {project.skills_needed && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {(Array.isArray(project.skills_needed) ? project.skills_needed : [project.skills_needed]).map((skill, j) => (
                                                <span key={j} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 shadow-sm rounded-lg text-xs font-medium">{skill}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StudentPageShell>
    );
}
