import { Head, router } from '@inertiajs/react';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import StudentCommunityScoreCard from '@/Pages/Student/Home/StudentCommunityScoreCard';
import StudentWelcomeCard from '@/Pages/Student/Home/StudentWelcomeCard';
import StudentDashboardOverview from '@/Pages/Student/Dashboard/StudentDashboardOverview';
import { useTranslation } from '@/i18n';
import TrialCountdownBanner from '@/Components/Dashboard/TrialCountdownBanner';

export default function StudentDashboard({ auth, stats = {}, communityScorePercent = 0, engagement = null, membershipSummary = null }) {
    const user = auth?.user;
    const { t, language } = useTranslation();

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('studentDashboardPage.pageTitle', { appName: t('common.appName') })} />

            <MobileTopBar
                title={t('studentDashboardPage.topBarTitle')}
                unreadCount={stats.unreadCount || 0}
                onNotifications={() => router.visit('/notifications')}
                onBack={() => router.visit('/')}
                reverseOrder={false}
            />

            <main className="mx-auto w-full max-w-5xl px-3 pb-24 pt-5 sm:px-4 lg:px-6">
                <div className="space-y-6">
                    {/* Trial/subscription status banner */}
                    <TrialCountdownBanner membershipSummary={membershipSummary} />

                    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6" aria-label={t('studentDashboardPage.sections.hero')}>
                        <div className="lg:col-span-8">
                            <StudentWelcomeCard
                                userName={user?.name}
                                onUploadProject={() => router.visit('/student/projects/create')}
                            />
                        </div>
                        <div className="h-fit lg:sticky lg:top-24 lg:col-span-4">
                            <StudentCommunityScoreCard
                                percent={communityScorePercent || 0}
                                points={stats.totalPoints || 0}
                            />
                        </div>
                    </section>

                    <section aria-label={t('studentDashboardPage.sections.overview')}>
                        <StudentDashboardOverview stats={stats} engagement={engagement} />
                    </section>
                </div>
            </main>

            <MobileBottomNav active="home" role={user?.role} isAuthed={!!user} user={user} />
        </div>
    );
}
