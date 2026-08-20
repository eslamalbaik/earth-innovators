import { Head, Link, router } from '@inertiajs/react';
import { FaProjectDiagram, FaUsers, FaTrophy, FaRocket, FaArrowLeft, FaCheckCircle, FaBook, FaMedal, FaChartLine, FaCertificate, FaDownload, FaArrowRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useTranslation, useForwardIcon } from '@/i18n';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import WhyChooseSection from '@/Components/Sections/WhyChooseSection';
import PlatformFeaturesSection from '@/Components/Sections/PlatformFeaturesSection';
import UAESchoolsSection from '@/Components/Sections/UAESchoolsSection';
import TeacherRecruitmentSection from '@/Components/Sections/TeacherRecruitmentSection';
import TestimonialsSection from '@/Components/Sections/TestimonialsSection';
import FAQSection from '@/Components/Sections/FAQSection';
import PublicationsSection from '@/Components/Sections/PublicationsSection';
import CTASection from '@/Components/Sections/CTASection';
import WhatCanYouMakeSection from '@/Components/Sections/WhatCanYouMakeSection';
import InnovatorJourneySection from '@/Components/Sections/InnovatorJourneySection';
import InnovationAxesSection from '@/Components/Sections/InnovationAxesSection';
import FeaturedProjectsSection from '@/Components/Sections/FeaturedProjectsSection';

export default function Landing({
    auth,
    stats = [],
    featuredProjects = [],
    featuredPublications = [],
    uaeSchools = [],
    testimonials = [],
    membershipCertificate = null
}) {
    const user = auth?.user || null;
    const isAuthed = !!user;
    const { dir } = useSelector((state) => state.language);
    const { t, language } = useTranslation();
    const ForwardIcon = useForwardIcon();

    // Translate stat labels from backend
    const getStatLabel = (label) => {
        const labelMap = {
            'طالب': t('about.stats.student'),
            'معلم': t('about.stats.teacher'),
            'جلسة ناجحة': t('about.stats.session'),
            'التقييم المتوسط': t('about.stats.rating'),
            'Student': t('about.stats.student'),
            'Teacher': t('about.stats.teacher'),
            'Successful Session': t('about.stats.session'),
            'Average Rating': t('about.stats.rating'),
        };
        return labelMap[label] || label;
    };

    const handleStartJourney = () => {
        if (isAuthed) {
            router.visit('/dashboard');
        } else {
            router.visit('/register');
        }
    };

    const getCertificateLink = () => {
        if (!user) return '/membership-certificate';

        switch (user.role) {
            case 'student':
                return '/student/certificate';
            case 'teacher':
                return '/teacher/certificate';
            case 'school':
                return '/school/certificate';
            default:
                return '/membership-certificate';
        }
    };

    const getCategoryLabel = (category) => {
        const categories = {
            'science': t('categories.science'),
            'technology': t('categories.technology'),
            'engineering': t('categories.engineering'),
            'mathematics': t('categories.mathematics'),
            'arts': t('categories.arts'),
            'other': t('categories.other')
        };
        return categories[category] || t('categories.other');
    };

    const whyChooseBenefits = [
        {
            title: t('features.creativeEnvironment'),
            description: t('features.creativeEnvironmentDesc')
        },
        {
            title: t('features.incentiveSystem'),
            description: t('features.incentiveSystemDesc')
        },
        {
            title: t('features.teacherFollowUp'),
            description: t('features.teacherFollowUpDesc')
        },
        {
            title: t('features.certificates'),
            description: t('features.certificatesDesc')
        }
    ];

    return (
        <div dir={dir} className="min-h-screen bg-gray-50">
            <Head title={t('header.appName') + ' - ' + t('hero.subtitle')} />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('header.appName')}
                    activeNav="home"
                    unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                    onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                    onBack={() => router.visit('/')}
                >
                    <div className="space-y-6">
                        {/* Membership Certificate Banner - Only for authenticated users */}
                        {isAuthed && membershipCertificate && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FaCertificate className="text-yellow-600 text-xl" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-gray-900 mb-1">
                                            {t('landingPage.membershipCertificate.title')}
                                        </h3>
                                        <p className="text-xs text-gray-600 mb-2">
                                            {membershipCertificate.description}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={getCertificateLink()}
                                                className="text-xs font-bold text-[#A3C042] hover:text-[#8CA635]"
                                            >
                                                {t('landingPage.membershipCertificate.viewCertificate')}
                                            </Link>
                                            <span className="text-gray-300">|</span>
                                            <a
                                                href={membershipCertificate.download_url}
                                                download
                                                className="text-xs font-bold text-[#A3C042] hover:text-[#8CA635] flex items-center gap-1"
                                            >
                                                <FaDownload className="text-xs" />
                                                {t('common.download')}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Hero Section */}
                        <div dir={dir} className="bg-gradient-to-br from-[#A3C042] to-[#8CA635] rounded-3xl p-6 text-white relative overflow-hidden">
                            <div className={`absolute top-0 ${dir === 'rtl' ? 'start-0' : 'end-0'} w-32 h-32 bg-white/10 rounded-full ${dir === 'rtl' ? '-ms-16 -mt-16' : '-me-16 -mt-16'} blur-2xl`}></div>
                            <div className="relative z-10">
                                <h1 className="text-2xl font-extrabold mb-3 leading-tight">
                                    {t('hero.title')}
                                </h1>
                                <p className="text-white/90 text-sm mb-4">
                                    {t('hero.subtitle')}
                                </p>
                                <button
                                    onClick={handleStartJourney}
                                    className="bg-white text-[#A3C042] px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition shadow-lg"
                                >
                                    {isAuthed ? t('hero.goToDashboard') : t('hero.startJourney')}
                                </button>
                            </div>
                        </div>

                        {/* Stats Section */}
                        {stats && stats.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">{t('stats.successNumbers')}</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {stats.map((stat, index) => (
                                        <div key={index} className="text-center">
                                            <div className="text-2xl font-extrabold text-[#A3C042] mb-1">
                                                {stat.value || '0'}
                                            </div>
                                            <div className="text-xs text-gray-600 font-semibold">
                                                {getStatLabel(stat.label)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* What Can You Make Section */}
                        <WhatCanYouMakeSection />

                        {/* Innovator Journey Section */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 p-4">
                            <InnovatorJourneySection />
                        </div>

                        {/* Innovation Axes Section */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <InnovationAxesSection />
                        </div>

                        {/* Featured Projects */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4">
                            <FeaturedProjectsSection
                                projects={featuredProjects}
                                getCategoryLabel={getCategoryLabel}
                            />
                        </div>


                        {/* Testimonials / Stories Section */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
                            <TestimonialsSection
                                title={t('sections.testimonials.title') || 'Stories from Our Community'}
                                subtitle={t('sections.testimonials.subtitle') || 'Real experiences from our students, teachers and innovators'}
                                testimonials={testimonials}
                                compact={true}
                            />
                        </div>


                        {/* FAQ Section */}
                        <div className="bg-gradient-to-br from-[#A3C042]/10 to-[#8CA635]/10 rounded-2xl border border-gray-100 p-4 md:p-6">
                            <FAQSection
                                title={t('sections.faq.title')}
                                subtitle={t('sections.faq.subtitle')}
                                compact={true}
                            />
                        </div>

                        {/* Publications Section */}
                        {featuredPublications && featuredPublications.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
                                <PublicationsSection
                                    title={t('sections.publications')}
                                    subtitle={t('landingPage.publications.subtitle')}
                                    publications={featuredPublications}
                                    viewAllLink="/publications"
                                    compact={true}
                                />
                            </div>
                        )}

                        {/* CTA Section */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-4 md:p-6 text-white">
                            <CTASection
                                title={t('sections.cta.title')}
                                description={t('sections.cta.description')}
                                primaryButtonText={isAuthed ? t('hero.goToDashboard') : t('sections.cta.registerNow')}
                                secondaryButtonText={t('sections.cta.contactUs')}
                                primaryButtonLink={isAuthed ? '/dashboard' : '/register'}
                                onPrimaryButtonClick={handleStartJourney}
                                onSecondaryButtonClick={() => router.visit('/about')}
                                compact={true}
                            />
                        </div>
                    </div>
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title={t('header.appName')}
                    unreadCount={isAuthed ? (auth?.unreadCount || 0) : 0}
                    onNotifications={() => router.visit(isAuthed ? '/notifications' : '/login')}
                    onBack={() => router.visit('/')}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="space-y-6">

                        {/* Membership Certificate Banner - Desktop */}
                        {isAuthed && membershipCertificate && (
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FaCertificate className="text-yellow-600 text-2xl" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {t('landingPage.membershipCertificate.title')}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {membershipCertificate.description}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={getCertificateLink()}
                                                className="text-sm font-bold text-[#A3C042] hover:text-[#8CA635]"
                                            >
                                                {t('landingPage.membershipCertificate.viewCertificate')}
                                            </Link>
                                            <span className="text-gray-300">|</span>
                                            <a
                                                href={membershipCertificate.download_url}
                                                download
                                                className="text-sm font-bold text-[#A3C042] hover:text-[#8CA635] flex items-center gap-1"
                                            >
                                                <FaDownload />
                                                {t('common.download')}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hero Section */}
                        <div dir={dir} className="relative min-h-[360px] overflow-hidden rounded-3xl bg-white shadow-sm lg:min-h-[460px]">
                            {/* Image side (opposite the green panel) */}
                            <div className="absolute inset-y-0 end-0 w-[64%]">
                                <img
                                    src="/images/hero.png"
                                    alt={t('hero.imageAlt')}
                                    className="h-full w-full object-cover object-center"
                                />
                            </div>

                            {/* Decorative shapes — drawn in CSS/SVG, mirrored for LTR */}
                            <div className={`pointer-events-none absolute inset-0 ${dir === 'rtl' ? '' : '-scale-x-100'}`}>
                                <svg
                                    className="absolute inset-0 h-full w-full"
                                    viewBox="0 0 500 440"
                                    preserveAspectRatio="none"
                                    aria-hidden="true"
                                >
                                    <defs>
                                        <linearGradient id="heroGreen" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#A3C042" />
                                            <stop offset="100%" stopColor="#8CA635" />
                                        </linearGradient>
                                    </defs>
                                    {/* lighter accent swoosh */}
                                    <path
                                        d="M500 0 L240 0 C205 130 205 300 285 440 L345 440 C270 300 270 130 305 0 Z"
                                        fill="#C1DA6C"
                                        opacity="0.85"
                                    />
                                    {/* main green panel */}
                                    <path
                                        d="M500 0 L300 0 C235 130 235 310 320 440 L500 440 Z"
                                        fill="url(#heroGreen)"
                                    />
                                </svg>

                                {/* dotted grid in the green top corner */}
                                <div
                                    className="absolute right-6 top-6 h-24 w-40 opacity-40"
                                    style={{
                                        backgroundImage:
                                            'radial-gradient(rgba(255,255,255,0.9) 1.5px, transparent 1.5px)',
                                        backgroundSize: '14px 14px',
                                    }}
                                />
                            </div>

                            {/* Text content over the green panel */}
                            <div className="absolute inset-y-0 start-0 z-10 flex w-[52%] flex-col justify-center gap-4 p-8 text-white lg:w-[46%] lg:p-12">
                                <h1 className="text-3xl font-extrabold leading-tight lg:text-4xl xl:text-5xl">
                                    {t('hero.title')}
                                </h1>
                                <p className="text-base text-white/90 lg:text-lg">
                                    {t('hero.subtitle')}
                                </p>
                                <div>
                                    <button
                                        onClick={handleStartJourney}
                                        className="mt-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-[#A3C042] shadow-lg transition hover:scale-105 hover:bg-gray-100"
                                    >
                                        {isAuthed ? t('hero.goToDashboard') : t('hero.startJourney')}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        {stats && stats.length > 0 && (
                            <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                                <div className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-[#A3C042]/5 blur-2xl" />
                                <div className="relative mb-8 text-center">
                                    <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">{t('stats.successNumbers')}</h2>
                                    <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#A3C042] to-[#8CA635]" />
                                </div>
                                <div className="relative grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-0">
                                    {stats.map((stat, index) => {
                                        const StatIcon = [FaMedal, FaChartLine, FaUsers, FaTrophy][index % 4];
                                        return (
                                            <div
                                                key={index}
                                                className="flex flex-col items-center text-center lg:border-gray-100 lg:px-6 lg:border-e lg:last:border-e-0"
                                            >
                                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A3C042] to-[#8CA635] text-white shadow-md">
                                                    <StatIcon className="text-2xl" />
                                                </div>
                                                <div className="bg-gradient-to-r from-[#A3C042] to-[#8CA635] bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
                                                    {stat.value || '0'}
                                                </div>
                                                <div className="mt-1 text-sm font-semibold text-gray-600">
                                                    {getStatLabel(stat.label)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* What Can You Make Section */}
                        <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                            <WhatCanYouMakeSection />
                        </section>

                        {/* Innovator Journey Section */}
                        <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-8 shadow-sm">
                            <div className="pointer-events-none absolute -start-16 -top-16 h-48 w-48 rounded-full bg-[#A3C042]/5 blur-2xl" />
                            <InnovatorJourneySection />
                        </section>

                        {/* Innovation Axes Section */}
                        <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                            <InnovationAxesSection />
                        </section>

                        {/* Featured Projects */}
                        <section className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                            <FeaturedProjectsSection
                                projects={featuredProjects}
                                getCategoryLabel={getCategoryLabel}
                            />
                        </section>

                        {/* Testimonials / Stories Section */}
                        <section>
                            <TestimonialsSection
                                title={t('sections.testimonials.title') || 'Stories from Our Community'}
                                subtitle={t('sections.testimonials.subtitle') || 'Real experiences from our students, teachers and innovators'}
                                testimonials={testimonials}
                                compact={false}
                            />
                        </section>

                        {/* CTA Section */}
                        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-12 text-white">
                            <CTASection
                                title={t('sections.cta.title')}
                                description={t('sections.cta.description')}
                                primaryButtonText={isAuthed ? t('hero.goToDashboard') : t('sections.cta.registerNow')}
                                secondaryButtonText={t('sections.cta.contactUs')}
                                primaryButtonLink={isAuthed ? '/dashboard' : '/register'}
                                onPrimaryButtonClick={handleStartJourney}
                                onSecondaryButtonClick={() => router.visit('/about')}
                                compact={true}
                            />
                        </section>
                    </div>
                </main>
                <MobileBottomNav active="home" role={user?.role} isAuthed={isAuthed} user={user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}
