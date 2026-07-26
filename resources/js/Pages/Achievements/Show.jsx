import { Link } from '@inertiajs/react';
import StudentPageShell from '@/Components/Innovation/StudentPageShell';

export default function AchievementShow({ achievement }) {
    const analysis = achievement.ai_analysis_result || {};

    return (
        <StudentPageShell title={achievement.title} backHref="/innovation/achievements">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href={route('innovation.achievements.index')} className="text-indigo-600 hover:text-indigo-700 font-medium">
                        → العودة للإنجازات
                    </Link>
                    <Link
                        href={route('innovation.achievements.edit', achievement.id)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                        ✏️ تعديل
                    </Link>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Title Bar */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">
                                {achievement.type === 'project' ? '🏗️' : achievement.type === 'research' ? '🔬' :
                                 achievement.type === 'certificate' ? '📜' : achievement.type === 'award' ? '🏅' :
                                 achievement.type === 'patent' ? '💡' : achievement.type === 'article' ? '📝' : '📋'}
                            </span>
                            <div>
                                <h1 className="text-2xl font-bold">{achievement.title}</h1>
                                <div className="flex items-center gap-3 mt-1 text-white/80 text-sm">
                                    <span>{achievement.type_label || achievement.type}</span>
                                    {achievement.category && <span>• {achievement.category}</span>}
                                    {achievement.date && <span>• {achievement.date}</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* AI Status Bar */}
                        <div className={`flex items-center justify-between p-4 rounded-xl ${
                            achievement.ai_validation_status === 'validated' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200' :
                            achievement.ai_validation_status === 'flagged' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200' :
                            'bg-amber-50 dark:bg-amber-900/20 border border-amber-200'
                        }`}>
                            <div className="flex items-center gap-2">
                                <span className="text-xl">
                                    {achievement.ai_validation_status === 'validated' ? '✅' :
                                     achievement.ai_validation_status === 'flagged' ? '⚠️' : '⏳'}
                                </span>
                                <span className="font-medium">
                                    {achievement.ai_validation_status === 'validated' ? 'تم التحقق بنجاح' :
                                     achievement.ai_validation_status === 'flagged' ? 'يحتاج مراجعة' : 'قيد التحليل'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{Math.round(achievement.ai_confidence_score || 0)}%</p>
                                    <p className="text-xs text-gray-500">درجة الثقة</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{Math.round(achievement.evidence_score || 0)}%</p>
                                    <p className="text-xs text-gray-500">جودة الأدلة</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {achievement.description && (
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white mb-2">📝 الوصف</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{achievement.description}</p>
                            </div>
                        )}

                        {/* AI Analysis */}
                        {analysis.feedback && (
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-200 dark:border-indigo-700">
                                <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-3">🤖 تحليل الذكاء الاصطناعي</h3>
                                <p className="text-indigo-700 dark:text-indigo-200 mb-3">{analysis.feedback}</p>
                                {analysis.suggestions?.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-indigo-700 dark:text-indigo-300 mb-2">💡 اقتراحات:</h4>
                                        <ul className="space-y-1">
                                            {analysis.suggestions.map((s, i) => (
                                                <li key={i} className="text-sm text-indigo-600 dark:text-indigo-300 flex items-start gap-2">
                                                    <span className="mt-0.5">•</span>
                                                    <span>{s}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Attachments */}
                        {achievement.attachments?.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white mb-3">📎 المرفقات ({achievement.attachments.length})</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {achievement.attachments.map((att) => (
                                        <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">
                                                    {att.file_type === 'pdf' ? '📄' : att.file_type === 'image' ? '🖼️' :
                                                     att.file_type === 'video' ? '🎬' : att.file_type === 'url' ? '🔗' : '📁'}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {att.original_name || att.url || 'مرفق'}
                                                    </p>
                                                    {att.ai_evidence_type && (
                                                        <p className="text-xs text-gray-400">{att.ai_evidence_type} • {att.ai_confidence_score}%</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Extracted Skills */}
                        {achievement.skills?.length > 0 && (
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white mb-3">🎯 مهارات مستخرجة بالـ AI</h3>
                                <div className="flex flex-wrap gap-2">
                                    {achievement.skills.map((skill) => (
                                        <span key={skill.id} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium">
                                            {skill.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StudentPageShell>
    );
}
