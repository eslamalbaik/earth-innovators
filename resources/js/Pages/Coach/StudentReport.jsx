import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import IndexRadarChart from '@/Components/Innovation/IndexRadarChart';
import ClassificationBadge from '@/Components/Innovation/ClassificationBadge';
import { useTranslation } from '@/i18n';

const COGNITIVE_FACTOR_NAMES = {
    fluid_reasoning: 'الاستدلال السائل',
    knowledge: 'المعرفة',
    quantitative_reasoning: 'الاستدلال الكمي',
    visual_spatial: 'المعالجة البصرية المكانية',
    working_memory: 'الذاكرة العاملة',
};

// تصنيف الدرجة المعيارية (متوسط 100، انحراف 15) وفق مقياس ستانفورد-بينيه
const classifyStandardScore = (score) => {
    if (score >= 130) return { key: 'verySuperior', color: 'text-emerald-600' };
    if (score >= 120) return { key: 'superior', color: 'text-emerald-500' };
    if (score >= 110) return { key: 'aboveAverage', color: 'text-blue-500' };
    if (score >= 90) return { key: 'average', color: 'text-gray-600' };
    if (score >= 80) return { key: 'belowAverage', color: 'text-amber-500' };
    if (score >= 70) return { key: 'borderline', color: 'text-orange-500' };
    return { key: 'delayed', color: 'text-red-500' };
};

export default function StudentReport({ auth, student, report = {}, index, indexNames, cognitiveAssessment = null }) {
    const { t } = useTranslation();
    const {
        title,
        summary,
        strengths_analysis,
        weaknesses_analysis,
        index_analysis = [],
        overall_assessment,
        development_plan = [],
        conclusion,
    } = report || {};

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
        <DashboardLayout auth={auth}>
            <Head title={`${t('studentReport.pageTitlePrefix')} ${student?.name || t('studentReport.studentFallback')}`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 {title || `${t('studentReport.pageTitlePrefix')} ${student?.name}`}</h1>
                        <p className="text-gray-500 mt-1">{t('studentReport.subtitle')}</p>
                    </div>
                    <Link
                        href={route('teacher.innovation.dashboard')}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                    >
                        {t('studentReport.backLink')}
                    </Link>
                </div>

                {/* Student overview */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                        <div className="lg:col-span-4 space-y-3 text-center">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{student?.name}</h2>
                            {index && (
                                <>
                                    <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-5 text-white">
                                        <p className="text-sm opacity-90">{t('studentReport.overallScore')}</p>
                                        <p className="text-4xl font-black mt-1">{Math.round(index.overall_score)}</p>
                                    </div>
                                    {index.classification_details && (
                                        <ClassificationBadge details={index.classification_details} classificationKey={index.classification} size="lg" />
                                    )}
                                </>
                            )}
                        </div>
                        <div className="lg:col-span-8">
                            {Object.keys(indexes).length > 0 ? (
                                <IndexRadarChart indexes={indexes} indexNames={indexNames} height={280} />
                            ) : (
                                <p className="text-center text-gray-400 py-10">{t('studentReport.indexesNotCalculated')}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Cognitive Assessment (Stanford-Binet) */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white">{t('studentReport.cognitiveMapHeading')}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">{t('studentReport.cognitiveMapSubtitle')}</p>
                        </div>
                        <Link
                            href={route('teacher.innovation.cognitive-assessment.form', student?.id)}
                            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors"
                        >
                            {cognitiveAssessment ? t('studentReport.updateAssessment') : t('studentReport.addAssessment')}
                        </Link>
                    </div>

                    {cognitiveAssessment ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                            <div className="lg:col-span-5">
                                <IndexRadarChart
                                    indexes={cognitiveFactors}
                                    indexNames={COGNITIVE_FACTOR_NAMES}
                                    namespace="cognitiveAssessment.factors"
                                    height={260}
                                    color="#0ea5e9"
                                    name={t('cognitiveAssessment.standardScore')}
                                    maxValue={160}
                                />
                            </div>
                            <div className="lg:col-span-7 space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 p-3 text-center">
                                        <p className="text-2xl font-black text-sky-600">{cognitiveAssessment.full_scale_iq ?? '—'}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">{t('studentReport.fullScaleIq')}</p>
                                    </div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 p-3 text-center">
                                        <p className="text-2xl font-black text-gray-700 dark:text-gray-200">{cognitiveAssessment.verbal_iq ?? '—'}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">{t('studentReport.verbalIq')}</p>
                                    </div>
                                    <div className="rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 p-3 text-center">
                                        <p className="text-2xl font-black text-gray-700 dark:text-gray-200">{cognitiveAssessment.nonverbal_iq ?? '—'}</p>
                                        <p className="text-[11px] text-gray-500 mt-0.5">{t('studentReport.nonverbalIq')}</p>
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                    {Object.keys(COGNITIVE_FACTOR_NAMES).map((key) => {
                                        const score = cognitiveFactors[key];
                                        if (score == null) return null;
                                        const cls = classifyStandardScore(score);
                                        return (
                                            <div key={key} className="flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t(`cognitiveAssessment.factors.${key}`)}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs font-semibold ${cls.color}`}>{t(`cognitiveAssessment.scoreLabels.${cls.key}`)}</span>
                                                    <span className="text-lg font-black text-gray-800 dark:text-white w-10 text-end">{score}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {(cognitiveAssessment.strengths?.length > 0 || cognitiveAssessment.weaknesses?.length > 0) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {cognitiveAssessment.strengths?.length > 0 && (
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">{t('studentReport.strengthsHeading')}</p>
                                                <ul className="text-xs text-emerald-600 dark:text-emerald-200 space-y-0.5">
                                                    {cognitiveAssessment.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {cognitiveAssessment.weaknesses?.length > 0 && (
                                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">{t('studentReport.weaknessesHeading')}</p>
                                                <ul className="text-xs text-amber-600 dark:text-amber-200 space-y-0.5">
                                                    {cognitiveAssessment.weaknesses.map((w, i) => <li key={i}>• {w}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {cognitiveAssessment.notes && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">{t('studentReport.examinerNotes')}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap">{cognitiveAssessment.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <span className="text-4xl block mb-2">🧠</span>
                            <p className="text-sm">{t('studentReport.noCognitiveAssessment')}</p>
                        </div>
                    )}
                </div>

                {/* AI Report sections */}
                {summary && (
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                        <h3 className="text-lg font-bold mb-2">{t('studentReport.summaryHeading')}</h3>
                        <p className="text-white/90 leading-relaxed">{summary}</p>
                    </div>
                )}

                {(strengths_analysis || weaknesses_analysis) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {strengths_analysis && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-700">
                                <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2">{t('studentReport.strengthsAnalysisHeading')}</h3>
                                <p className="text-sm text-emerald-700 dark:text-emerald-200 leading-relaxed">{strengths_analysis}</p>
                            </div>
                        )}
                        {weaknesses_analysis && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-700">
                                <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2">{t('studentReport.weaknessesAnalysisHeading')}</h3>
                                <p className="text-sm text-amber-700 dark:text-amber-200 leading-relaxed">{weaknesses_analysis}</p>
                            </div>
                        )}
                    </div>
                )}

                {index_analysis.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t('studentReport.indexAnalysisHeading')}</h3>
                        <div className="space-y-3">
                            {index_analysis.map((item, i) => (
                                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-gray-800 dark:text-white">{item.index_name}</h4>
                                        <span className="text-lg font-black text-indigo-600">{item.score}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{item.analysis}</p>
                                    {item.recommendation && (
                                        <p className="text-sm text-indigo-600 dark:text-indigo-300 mt-2">💡 {item.recommendation}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {development_plan.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-4">{t('studentReport.developmentPlanHeading')}</h3>
                        <div className="space-y-3">
                            {development_plan.map((phase, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {i + 1}
                                        </span>
                                        {i < development_plan.length - 1 && <div className="w-0.5 flex-1 bg-indigo-100 dark:bg-indigo-900 mt-1" />}
                                    </div>
                                    <div className="pb-4">
                                        <h4 className="font-semibold text-gray-800 dark:text-white">
                                            {phase.phase}
                                            {phase.duration && <span className="text-xs text-gray-400 font-normal mr-2">({phase.duration})</span>}
                                        </h4>
                                        {Array.isArray(phase.actions) && (
                                            <ul className="mt-1 space-y-1">
                                                {phase.actions.map((action, j) => (
                                                    <li key={j} className="text-sm text-gray-600 dark:text-gray-300">• {action}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(overall_assessment || conclusion) && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700 space-y-4">
                        {overall_assessment && (
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white mb-2">{t('studentReport.overallAssessmentHeading')}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{overall_assessment}</p>
                            </div>
                        )}
                        {conclusion && (
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white mb-2">{t('studentReport.conclusionHeading')}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{conclusion}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
