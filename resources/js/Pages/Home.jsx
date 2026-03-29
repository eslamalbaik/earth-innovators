import { Head, Link, router } from '@inertiajs/react';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import HomeCommunityScoreCard from '@/Pages/Home/HomeCommunityScoreCard';
import HomeCurrentChallengeSection from '@/Pages/Home/HomeCurrentChallengeSection';
import HomeLatestProjectsSection from '@/Pages/Home/HomeLatestProjectsSection';
import HomeSuggestChallengeCard from '@/Pages/Home/HomeSuggestChallengeCard';
import HomeWelcomeCard from '@/Pages/Home/HomeWelcomeCard';
import { FaCreditCard, FaChevronLeft } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function Home({ auth, cities = [], subjects = [], featuredTeachers = [], testimonials = [], stats = [], featuredPublications = [], featuredProjects = [], uaeSchools = [], packages = [] }) {
    const user = auth?.user || null;
    const isAuthed = !!user;
    const { t, language } = useTranslation();

    const uploadTarget = (() => {
        const role = user?.role;
        if (!role) return '/register';
        if (role === 'teacher') return '/teacher/projects/create';
        if (role === 'school' || role === 'educational_institution') return '/school/projects/create';
        if (role === 'student') return '/student/projects/create';
        return '/dashboard';
    })();

    const suggestChallengeTarget = (() => {
        if (!isAuthed) return '/login';
        if (user?.role === 'student') return '/student/challenge-suggestions/create';
        if (user?.role === 'teacher') return '/teacher/challenge-suggestions';
        if (user?.role === 'school' || user?.role === 'educational_institution') return '/school/challenge-suggestions';
        if (user?.role === 'admin') return '/admin/challenge-suggestions';
        return '/challenges';
    })();

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('homePage.pageTitle')} />

            <div className="block md:hidden">
                <div className="mx-auto w-full">
                    <div className="min-h-screen bg-gray-50">
                        <MobileTopBar
                            title={t('common.home')}
                            unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                            onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                            onBack={() => router.visit('/')}
                            reverseOrder={false}
                            auth={auth}
                        />

                        <main className="space-y-4 px-4 pb-24 pt-4">
                            <HomeWelcomeCard
                                userName={user?.name}
                                onUploadProject={() => router.visit(uploadTarget)}
                            />

                            <HomeCommunityScoreCard
                                percent={35}
                                points={isAuthed ? (user?.points || 0) : 0}
                            />

                            {isAuthed && user?.role === 'student' && (
                                <Link
                                    href="/packages"
                                    className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-[#A3C042] via-[#8CA635] to-[#7a9a2f] p-4 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                                >
                                    <div className="absolute start-0 top-0 h-32 w-32 -ms-16 -mt-16 rounded-full bg-white/15 blur-3xl"></div>
                                    <div className="absolute bottom-0 end-0 h-24 w-24 -mb-12 -me-12 rounded-full bg-white/15 blur-2xl"></div>
                                    <div className="relative flex items-center gap-4">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/30 shadow-lg backdrop-blur-sm">
                                            <FaCreditCard className="text-2xl text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-bold text-white">{t('homePage.packagesCardTitle')}</div>
                                            <div className="mt-1 text-xs text-white/90">{t('homePage.packagesCardSubtitle')}</div>
                                        </div>
                                        <FaChevronLeft className="text-base text-white/80" />
                                    </div>
                                </Link>
                            )}

                            <HomeLatestProjectsSection
                                projects={featuredProjects || []}
                                onViewAll={() => router.visit('/projects')}
                                onOpenProject={(project) => {
                                    if (project?.id) {
                                        router.visit(`/projects/${project.id}`);
                                        return;
                                    }
                                    router.visit('/projects');
                                }}
                            />

                            <HomeCurrentChallengeSection
                                onViewAll={() => router.visit('/challenges')}
                                onJoin={() => router.visit(isAuthed ? '/dashboard' : '/login')}
                            />

                            <HomeSuggestChallengeCard onSuggest={() => router.visit(suggestChallengeTarget)} />
                        </main>

                        <MobileBottomNav active="home" role={user?.role} isAuthed={isAuthed} user={user} />
                    </div>
                </div>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('common.home')}
                    unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                    onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                    onBack={() => router.visit('/')}
                    reverseOrder={false}
                />

                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <div className="space-y-4 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
                            <div className="space-y-4 lg:col-span-5">
                                <HomeWelcomeCard
                                    userName={user?.name}
                                    onUploadProject={() => router.visit(uploadTarget)}
                                />
                                <HomeCommunityScoreCard
                                    percent={35}
                                    points={isAuthed ? (user?.points || 0) : 0}
                                />

                                {isAuthed && user?.role === 'student' && (
                                    <Link
                                        href="/packages"
                                        className="group relative block overflow-hidden rounded-2xl bg-gradient-to-br from-[#A3C042] via-[#8CA635] to-[#7a9a2f] p-4 shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                                    >
                                        <div className="absolute start-0 top-0 h-32 w-32 -ms-16 -mt-16 rounded-full bg-white/15 blur-3xl"></div>
                                        <div className="absolute bottom-0 end-0 h-24 w-24 -mb-12 -me-12 rounded-full bg-white/15 blur-2xl"></div>
                                        <div className="relative flex items-center gap-4">
                                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/30 shadow-lg backdrop-blur-sm">
                                                <FaCreditCard className="text-2xl text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-base font-bold text-white">{t('homePage.packagesCardTitle')}</div>
                                                <div className="mt-1 text-xs text-white/90">{t('homePage.packagesCardSubtitle')}</div>
                                            </div>
                                            <FaChevronLeft className="text-base text-white/80" />
                                        </div>
                                    </Link>
                                )}
                            </div>

                            <div className="space-y-4 lg:col-span-7">
                                <HomeLatestProjectsSection
                                    projects={featuredProjects || []}
                                    onViewAll={() => router.visit('/projects')}
                                    onOpenProject={(project) => {
                                        if (project?.id) {
                                            router.visit(`/projects/${project.id}`);
                                            return;
                                        }
                                        router.visit('/projects');
                                    }}
                                />

                                <HomeCurrentChallengeSection
                                    onViewAll={() => router.visit('/challenges')}
                                    onJoin={() => router.visit(isAuthed ? '/dashboard' : '/login')}
                                />

                                <HomeSuggestChallengeCard onSuggest={() => router.visit(suggestChallengeTarget)} />
                            </div>
                        </div>
                    </div>
                </main>

                <MobileBottomNav active="home" role={user?.role} isAuthed={isAuthed} user={user} />
            </div>
        </div>
    );
}
