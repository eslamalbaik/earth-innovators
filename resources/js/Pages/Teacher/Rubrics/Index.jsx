import { Head, Link, router } from '@inertiajs/react';
import { FaPlus, FaEdit, FaTrash, FaClipboardList, FaLayerGroup, FaChalkboardTeacher } from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useToast } from '@/Contexts/ToastContext';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useDir, useTranslation } from '@/i18n';

export default function TeacherRubricsIndex({ rubrics = [], auth }) {
    const { t, language } = useTranslation();
    const dir = useDir();
    const { confirm } = useConfirmDialog();
    const { showSuccess, showError } = useToast();

    const handleArchive = async (rubric) => {
        const name = language === 'ar' ? rubric.name_ar : rubric.name;
        const confirmed = await confirm({
            title: t('teacherRubricsPage.archiveConfirm.title'),
            message: t('teacherRubricsPage.archiveConfirm.message', { name }),
            confirmText: t('teacherRubricsPage.archiveAction'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (!confirmed) return;

        router.delete(route('teacher.rubrics.destroy', rubric.id), {
            preserveScroll: true,
            onSuccess: () => showSuccess(t('teacherRubricsPage.archiveSuccess')),
            onError: () => showError(t('teacherRubricsPage.archiveError')),
        });
    };

    const RubricsContent = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('teacherRubricsPage.title')}</h1>
                    <p className="text-gray-500 mt-1 text-sm">{t('teacherRubricsPage.subtitle')}</p>
                </div>
                <Link
                    href={route('teacher.rubrics.create')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition"
                >
                    <FaPlus />
                    {t('teacherRubricsPage.newRubric')}
                </Link>
            </div>

            {rubrics.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <FaClipboardList className="mx-auto text-5xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{t('teacherRubricsPage.empty.title')}</h3>
                    <p className="text-gray-500 mb-6 text-sm">{t('teacherRubricsPage.empty.description')}</p>
                    <Link
                        href={route('teacher.rubrics.create')}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
                    >
                        <FaPlus />
                        {t('teacherRubricsPage.empty.action')}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {rubrics.map((rubric) => (
                        <div key={rubric.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-bold text-gray-900">
                                    {language === 'ar' ? rubric.name_ar : rubric.name}
                                </h3>
                                <span
                                    className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                        rubric.scope === 'class' ? 'bg-purple-50 text-purple-700' : 'bg-indigo-50 text-indigo-700'
                                    }`}
                                >
                                    {rubric.scope === 'class' ? <FaLayerGroup /> : <FaChalkboardTeacher />}
                                    {rubric.scope === 'class'
                                        ? t('teacherRubricsPage.scopeClass')
                                        : t('teacherRubricsPage.scopeTeacher')}
                                </span>
                            </div>

                            {rubric.scope === 'class' && (
                                <p className="text-xs text-gray-500 mb-2">
                                    {rubric.grade} · {rubric.subject}
                                </p>
                            )}

                            {(rubric.description_ar || rubric.description) && (
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                    {language === 'ar' ? (rubric.description_ar || rubric.description) : (rubric.description || rubric.description_ar)}
                                </p>
                            )}

                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                                <span>{t('teacherRubricsPage.criteriaCount', { count: rubric.criteria_count })}</span>
                                <span>·</span>
                                <span>{t('teacherRubricsPage.projectsCount', { count: rubric.projects_count })}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('teacher.rubrics.edit', rubric.id)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold transition"
                                >
                                    <FaEdit />
                                    {t('common.edit')}
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleArchive(rubric)}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div dir={dir} className="min-h-screen bg-gray-50">
            <Head title={t('teacherRubricsPage.pageTitle', { appName: t('common.appName') })} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('teacherRubricsPage.title')}
                    activeNav="projects"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/teacher/dashboard')}
                >
                    <RubricsContent />
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('teacherRubricsPage.title')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/teacher/dashboard')}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-4">
                    <RubricsContent />
                </main>
                <MobileBottomNav active="projects" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}
