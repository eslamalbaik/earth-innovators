import StudentPageShell from '@/Components/Innovation/StudentPageShell';
import { useTranslation } from '@/i18n';

const PRIORITY_STYLES = {
    high:   { bg: 'bg-gray-50/50', border: 'border-gray-100', text: 'text-gray-900', badge: 'bg-red-50 text-red-600 border border-red-100' },
    medium: { bg: 'bg-gray-50/50', border: 'border-gray-100', text: 'text-gray-900', badge: 'bg-amber-50 text-amber-600 border border-amber-100' },
    low:    { bg: 'bg-gray-50/50', border: 'border-gray-100', text: 'text-gray-900', badge: 'bg-blue-50 text-blue-600 border border-blue-100' },
};

export default function Recommendations({ recommendations }) {
    const { t } = useTranslation();
    const {
        general_recommendations = [],
        courses = [],
        competitions = [],
        projects = [],
        strengths = [],
        weaknesses = [],
        overall_advice = '',
        student_level_profile = null,
    } = recommendations || {};

    const isEmpty = !recommendations
        || (general_recommendations.length === 0 && courses.length === 0
            && competitions.length === 0 && projects.length === 0 && !overall_advice);

    return (
        <StudentPageShell title={t('innovation.recommendations.pageTitle')}>
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('innovation.recommendations.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('innovation.recommendations.subtitle')}</p>
                </div>

                {isEmpty && (
                    <div className="text-center py-16 bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200 shadow-lg">
                        <span className="text-6xl block mb-4">🤖</span>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t('innovation.recommendations.empty.title')}</h3>
                        <p className="text-gray-500">{t('innovation.recommendations.empty.description')}</p>
                    </div>
                )}

                {/* Overall Advice */}
                {overall_advice && (
                    <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100 shadow-sm flex items-start gap-4">
                        <span className="text-3xl">💬</span>
                        <div>
                            <h3 className="text-lg font-bold text-indigo-900 mb-1">{t('innovation.recommendations.generalAdvice')}</h3>
                            <p className="text-indigo-800/90 leading-relaxed text-sm">{overall_advice}</p>
                        </div>
                    </div>
                )}

                {/* Student Level Profile */}
                {student_level_profile && (
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-xl overflow-hidden text-white mb-8">
                        <div className="p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/20 pb-6">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight mb-2 flex items-center gap-3">
                                        <span className="bg-white/20 p-2 rounded-xl text-yellow-300">🎓</span>
                                        {t('innovation.recommendations.studentLevel', { level: t(`innovation.smartSearch.levels.${student_level_profile.current_level?.toLowerCase()}`) || student_level_profile.current_level })}
                                    </h2>
                                    <p className="text-indigo-100 font-medium">
                                        {t('innovation.recommendations.score', { score: student_level_profile.score })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center justify-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                                        <span className="text-sm text-indigo-100 ml-2">{t('innovation.recommendations.targetLevel')}</span>
                                        <span className="text-xl font-bold text-yellow-300">
                                            {t(`innovation.smartSearch.levels.${student_level_profile.target_level?.toLowerCase()}`) || student_level_profile.target_level}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Strengths */}
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-300">
                                        <span>💪</span> {t('innovation.recommendations.strengths')}
                                    </h3>
                                    <ul className="space-y-2">
                                        {(student_level_profile.strengths || []).map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-indigo-50">
                                                <span className="text-emerald-400 mt-0.5">✓</span> <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* Learning Gaps */}
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-300">
                                        <span>🔍</span> {t('innovation.recommendations.gaps')}
                                    </h3>
                                    <ul className="space-y-2">
                                        {(student_level_profile.learning_gaps || []).map((g, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-indigo-50">
                                                <span className="text-rose-400 mt-0.5">!</span> <span>{g}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Acquired Skills */}
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-300">
                                        <span>⚙️</span> {t('innovation.recommendations.skills')}
                                    </h3>
                                    <ul className="space-y-2">
                                        {(student_level_profile.acquired_skills || []).map((s, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-indigo-50">
                                                <span className="text-blue-400 mt-0.5">•</span> <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Achieved Outcomes */}
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-300">
                                        <span>🏆</span> {t('innovation.recommendations.outcomes')}
                                    </h3>
                                    <ul className="space-y-2">
                                        {(student_level_profile.achieved_outcomes || []).map((o, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-indigo-50">
                                                <span className="text-yellow-400 mt-0.5">★</span> <span>{o}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            
                            {/* Next Challenge */}
                            {student_level_profile.next_challenge && (
                                <div className="mt-6 bg-yellow-400/20 rounded-xl p-5 border border-yellow-400/30 flex items-start gap-4">
                                    <span className="text-2xl text-yellow-300">🚀</span>
                                    <div>
                                        <h3 className="text-lg font-bold text-yellow-300 mb-1">{t('innovation.recommendations.nextChallenge')}</h3>
                                        <p className="text-white text-sm">{student_level_profile.next_challenge}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">💪</span> 
                            {t('innovation.recommendations.strengthsLabel')}
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
                            {t('innovation.recommendations.improvementsLabel')}
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
                        <h3 className="font-bold text-gray-900 mb-4">{t('innovation.recommendations.generalRecs')}</h3>
                        <div className="space-y-3">
                            {general_recommendations.map((rec, i) => {
                                const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.medium;
                                return (
                                    <div key={i} className={`p-4 rounded-xl border ${style.bg} ${style.border}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className={`font-semibold ${style.text}`}>{rec.title}</h4>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style.badge}`}>
                                                {t(`innovation.recommendations.priority.${rec.priority}`)}
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
                        <h3 className="font-bold text-gray-900 mb-4">{t('innovation.recommendations.suggestedCourses')}</h3>
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
                        <h3 className="font-bold text-gray-900 mb-4">{t('innovation.recommendations.suggestedCompetitions')}</h3>
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
                        <h3 className="font-bold text-gray-900 mb-4">{t('innovation.recommendations.suggestedProjects')}</h3>
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
