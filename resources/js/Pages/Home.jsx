import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { useToast } from '@/Contexts/ToastContext';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import HomeCommunityScoreCard from '@/Pages/Home/HomeCommunityScoreCard';
import HomeCurrentChallengeSection from '@/Pages/Home/HomeCurrentChallengeSection';
import HomeLatestProjectsSection from '@/Pages/Home/HomeLatestProjectsSection';
import HomeSuggestChallengeCard from '@/Pages/Home/HomeSuggestChallengeCard';
import HomeWelcomeCard from '@/Pages/Home/HomeWelcomeCard';

export default function Home({ auth, cities = [], subjects = [], featuredTeachers = [], testimonials = [], stats = [], featuredPublications = [], featuredProjects = [], uaeSchools = [], packages = [] }) {
    const user = auth?.user || null;
    const isAuthed = !!user;
    const { showSuccess, showError } = useToast();
    const [suggestOpen, setSuggestOpen] = useState(false);
    const [suggestText, setSuggestText] = useState('');

    const uploadTarget = (() => {
        const role = user?.role;
        if (!role) return '/register';
        if (role === 'teacher') return '/teacher/projects/create';
        if (role === 'school') return '/school/projects/create';
        if (role === 'student') return '/student/projects/create';
        return '/dashboard';
    })();

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="الرئيسية - إرث المبتكرين" />

            {/* Mobile: phone-like frame */}
            <div className="block md:hidden">
                <div className="mx-auto w-full">
                    <div className="bg-gray-50 min-h-screen">
                        <MobileTopBar
                            title="الرئيسية"
                            unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                            onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                            onBack={() => router.visit('/')}
                            reverseOrder={false}
                            auth={auth}
                        />

                        <main className="px-4 pb-24 pt-4 space-y-4">
                            <HomeWelcomeCard
                                userName={user?.name}
                                onUploadProject={() => router.visit(uploadTarget)}
                            />

                            <HomeCommunityScoreCard
                                percent={35}
                                points={isAuthed ? (user?.points || 0) : 0}
                            />

                            <HomeLatestProjectsSection
                                projects={featuredProjects || []}
                                onViewAll={() => router.visit('/projects')}
                                onOpenProject={(project) => {
                                    if (project?.id) {
                                        router.visit(`/projects/${project.id}`);
                                    } else {
                                        router.visit('/projects');
                                    }
                                }}
                            />

                            <HomeCurrentChallengeSection
                                onViewAll={() => router.visit('/challenges')}
                                onJoin={() => router.visit(isAuthed ? '/dashboard' : '/login')}
            />

                            <HomeSuggestChallengeCard
                                onSuggest={() => setSuggestOpen(true)}
                            />
                        </main>

                        <MobileBottomNav active="home" role={user?.role} isAuthed={isAuthed} user={user} />
                    </div>
                </div>
            </div>

            {/* Desktop: full-width layout like dashboard */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="الرئيسية"
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
                            </div>

                            <div className="space-y-4 lg:col-span-7">
                                <HomeLatestProjectsSection
                                    projects={featuredProjects || []}
                                    onViewAll={() => router.visit('/projects')}
                                    onOpenProject={(project) => {
                                        if (project?.id) {
                                            router.visit(`/projects/${project.id}`);
                                        } else {
                                            router.visit('/projects');
                                        }
                                    }}
            />

                                <HomeCurrentChallengeSection
                                    onViewAll={() => router.visit('/challenges')}
                                    onJoin={() => router.visit(isAuthed ? '/dashboard' : '/login')}
                                />

                                <HomeSuggestChallengeCard
                                    onSuggest={() => setSuggestOpen(true)}
            />
                            </div>
                        </div>
                    </div>
                </main>

                <MobileBottomNav active="home" role={user?.role} isAuthed={isAuthed} user={user} />
            </div>

            {/* Modal - اقترح تحدياً جديداً (مثل الصورة) */}
            {suggestOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl bg-[#eef8d6] border border-[#d7d39a] shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#d7d39a]/60">
                            <button
                                type="button"
                                onClick={() => setSuggestOpen(false)}
                                className="text-gray-700 text-xl leading-none"
                                aria-label="إغلاق"
                            >
                                ×
                            </button>
                            <div className="text-sm font-extrabold text-gray-900">اقترح تحدياً جديداً</div>
                            <div className="w-6" />
                        </div>
                        <div className="p-4">
                            <textarea
                                value={suggestText}
                                onChange={(e) => setSuggestText(e.target.value)}
                                placeholder="أدخل تحدي جديد"
                                rows={4}
                                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const text = suggestText.trim();
                                    if (!text) {
                                        showError('اكتب اقتراح التحدي أولاً');
                                        return;
                                    }
                                    if (!isAuthed) {
                                        router.visit('/login');
                                        return;
                                    }
                                    // لا يوجد endpoint حالياً - نحفظها كتجربة UI مثل التصميم
                                    showSuccess('تم إرسال الاقتراح');
                                    setSuggestText('');
                                    setSuggestOpen(false);
                                }}
                                className="mt-4 w-40 rounded-xl bg-[#A3C042] py-2 text-sm font-extrabold text-white hover:bg-[#93b03a] transition"
                            >
                                إرسال
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
