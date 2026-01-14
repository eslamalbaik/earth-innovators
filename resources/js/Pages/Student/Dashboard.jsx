import { Head, router } from '@inertiajs/react';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import StudentCommunityScoreCard from '@/Pages/Student/Home/StudentCommunityScoreCard';
import StudentCurrentChallengeSection from '@/Pages/Student/Home/StudentCurrentChallengeSection';
import StudentLatestProjectsSection from '@/Pages/Student/Home/StudentLatestProjectsSection';
import StudentSuggestChallengeCard from '@/Pages/Student/Home/StudentSuggestChallengeCard';
import StudentWelcomeCard from '@/Pages/Student/Home/StudentWelcomeCard';

export default function StudentDashboard({ auth, stats = {}, communityScorePercent = 0 }) {
    const user = auth?.user;

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="الرئيسية - إرث المبتكرين" />

            <MobileTopBar
                title="الرئيسية"
                unreadCount={stats.unreadCount || 0}
                onNotifications={() => router.visit('/notifications')}
                onBack={() => router.visit('/')}
                reverseOrder={false}
            />

            <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                <div className="mx-auto w-full max-w-4xl">
                    <div className="space-y-4 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
                        <div className="space-y-4 lg:col-span-5">
                            <StudentWelcomeCard
                                userName={user?.name}
                                onUploadProject={() => router.visit('/student/projects')}
                            />
                            <StudentCommunityScoreCard
                                percent={communityScorePercent || 0}
                                points={stats.totalPoints || 0}
                            />
                        </div>

                        <div className="space-y-4 lg:col-span-7">
                            <StudentLatestProjectsSection
                                projects={stats.recentProjects || []}
                                onViewAll={() => router.visit('/student/projects')}
                                onOpenProject={(projectId) => router.visit(`/student/projects/${projectId}`)}
                            />

                            <StudentCurrentChallengeSection
                                challenges={stats.activeChallenges || []}
                                onViewAll={() => router.visit('/student/challenges')}
                                onJoin={(challengeId) => router.visit(`/student/challenges/${challengeId}`)}
                            />

                            <StudentSuggestChallengeCard
                                onSuggest={() => router.visit('/student/challenges')}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <MobileBottomNav active="home" role={user?.role} isAuthed={!!user} user={user} />
                </div>
    );
}
