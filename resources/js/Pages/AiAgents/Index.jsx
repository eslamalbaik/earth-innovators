import { Head, router } from '@inertiajs/react';
import { FaRobot } from 'react-icons/fa';
import MobileAppLayout from '../../Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import { useTranslation } from '@/i18n';
import { AI_AGENTS, AI_AGENT_CATEGORIES } from '@/constants/aiAgents';

const CATEGORY_STYLES = {
    scoring: 'bg-indigo-50 text-indigo-700',
    guidance: 'bg-emerald-50 text-emerald-700',
    generation: 'bg-amber-50 text-amber-700',
    validation: 'bg-teal-50 text-teal-700',
    search: 'bg-sky-50 text-sky-700',
    reporting: 'bg-violet-50 text-violet-700',
    conversational: 'bg-rose-50 text-rose-700',
    governance: 'bg-purple-50 text-purple-700',
};

export default function AiAgentDirectory({ auth }) {
    const { t, language } = useTranslation();
    const user = auth?.user || null;
    const isAuthed = !!user;
    const isArabic = language === 'ar';

    const AiAgentsContent = () => (
        <div className="space-y-6 lg:space-y-8">
            <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-6 md:p-12 text-white overflow-hidden">
                <div className="absolute top-0 start-0 w-64 h-64 bg-white/10 rounded-full -ms-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 end-0 w-48 h-48 bg-white/10 rounded-full -me-24 -mb-24 blur-2xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <FaRobot className="text-2xl md:text-3xl" />
                        </div>
                        <h1 className="text-2xl md:text-4xl font-extrabold">{t('aiAgents.title')}</h1>
                    </div>
                    <p className="text-white/90 text-sm md:text-lg leading-relaxed max-w-3xl">
                        {t('aiAgents.heroDescription')}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {AI_AGENTS.map((agent) => (
                    <div
                        key={agent.key}
                        id={`agent-${agent.key}`}
                        className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition scroll-mt-24"
                    >
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 shrink-0 bg-gradient-to-br from-indigo-500/15 to-purple-500/15 rounded-xl flex items-center justify-center text-2xl">
                                    {agent.icon}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        {t(`aiAgents.agents.${agent.key}.name`)}
                                    </h3>
                                    <p className="text-xs font-semibold text-indigo-600">
                                        {t(`aiAgents.agents.${agent.key}.title`)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold mb-3 ${CATEGORY_STYLES[agent.category] || 'bg-gray-50 text-gray-600'}`}>
                            {t(`aiAgents.categories.${agent.category}`)}
                        </span>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {t(`aiAgents.agents.${agent.key}.description`)}
                        </p>
                    </div>
                ))}
            </div>

            <p className="text-center text-xs text-gray-400">
                {t('aiAgents.footnote', { count: AI_AGENTS.length })}
            </p>
        </div>
    );

    return (
        <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('aiAgents.pageTitle', { appName: t('common.appName') })} />

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('aiAgents.title')}
                    activeNav="explore"
                    unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                    onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                    onBack={() => router.visit('/ai-ethics')}
                >
                    <AiAgentsContent />
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('aiAgents.title')}
                    unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                    onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                    onBack={() => router.visit('/ai-ethics')}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-7xl px-6 pb-24 pt-8">
                    <AiAgentsContent />
                </main>
                <MobileBottomNav active="explore" role={user?.role} isAuthed={isAuthed} user={user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}
