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
                                            🎉 تم منحك شهادة العضوية!
                                        </h3>
                                        <p className="text-xs text-gray-600 mb-2">
                                            {membershipCertificate.description}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={getCertificateLink()}
                                                className="text-xs font-bold text-[#A3C042] hover:text-[#8CA635]"
                                            >
                                                عرض الشهادة
                                            </Link>
                                            <span className="text-gray-300">|</span>
                                            <a
                                                href={membershipCertificate.download_url}
                                                className="text-xs font-bold text-[#A3C042] hover:text-[#8CA635] flex items-center gap-1"
                                            >
                                                <FaDownload className="text-xs" />
                                                تحميل
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

                        {/* Featured Projects */}
                        {featuredProjects && featuredProjects.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-900">{t('sections.featuredProjects')}</h2>
                                    <Link
                                        href="/projects"
                                        className="text-[#A3C042] text-sm font-semibold flex items-center gap-1"
                                    >
                                        {t('common.viewAll')}
                                        <ForwardIcon className="text-xs" />
                                    </Link>
                                </div>
                                <div className="space-y-3">
                                    {featuredProjects.slice(0, 3).map((project) => (
                                        <Link
                                            key={project.id}
                                            href={`/projects/${project.id}`}
                                            className="block bg-gray-50 rounded-xl p-3 border border-gray-100 hover:shadow-md transition"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <FaProjectDiagram className="text-[#A3C042] text-xl" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">
                                                        {project.title}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                        {project.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-semibold rounded-full">
                                                            {getCategoryLabel(project.category)}
                                                        </span>
                                                        {project.views > 0 && (
                                                            <span className="text-[10px] text-gray-500">
                                                                {project.views} {t('project.views')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Links */}
                            <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/challenges"
                                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                                        <FaTrophy className="text-yellow-600 text-lg" />
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">{t('quickLinks.challenges')}</div>
                                </div>
                                <p className="text-xs text-gray-600">{t('quickLinks.challengesDesc')}</p>
                            </Link>

                            <Link
                                href="/publications"
                                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                        <FaBook className="text-blue-600 text-lg" />
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">{t('quickLinks.publications')}</div>
                                </div>
                                <p className="text-xs text-gray-600">{t('quickLinks.publicationsDesc')}</p>
                            </Link>

                            <Link
                                href="/badges"
                                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                        <FaMedal className="text-purple-600 text-lg" />
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">{t('quickLinks.badges')}</div>
                                </div>
                                <p className="text-xs text-gray-600">{t('quickLinks.badgesDesc')}</p>
                            </Link>

                            <Link
                                href="/about"
                                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                        <FaRocket className="text-green-600 text-lg" />
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">{t('quickLinks.about')}</div>
                                </div>
                                <p className="text-xs text-gray-600">{t('quickLinks.aboutDesc')}</p>
                            </Link>
                        </div>

                        {/* Why Choose Section */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
                            <WhyChooseSection
                                title={t('sections.whyChoose')}
                                subtitle={t('sections.whyChooseSubtitle')}
                                benefits={whyChooseBenefits}
                                imageSrc="/images/erth-img.jpg"
                                imageAlt={t('header.appName')}
                                compact={true}
                            />
                        </div>

                        {/* Platform Features Section */}
                        <div className="bg-gradient-to-br from-[#A3C042]/5 to-[#8CA635]/5 rounded-2xl border border-gray-100 p-4 md:p-6">
                            <PlatformFeaturesSection
                                title={t('sections.platformFeatures')}
                                subtitle={t('sections.platformFeaturesSubtitle')}
                                compact={true}
                            />
                        </div>

                        {/* UAE Schools Section */}
                        {uaeSchools && uaeSchools.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
                                <UAESchoolsSection
                                    title={t('sections.uaeSchools')}
                                    subtitle={t('sections.uaeSchoolsSubtitle')}
                                    schools={uaeSchools}
                                    compact={true}
                                />
                            </div>
                        )}

                        {/* Teacher Recruitment Section - Only show to non-authenticated users or non-teachers */}
                        {(!isAuthed || (user?.role !== 'teacher' && user?.role !== 'school')) && (
                            <div className="bg-gradient-to-br from-[#A3C042] to-[#8CA635] rounded-2xl p-4 md:p-6 text-white">
                                <TeacherRecruitmentSection
                                    title={t('sections.teacherRecruitment.title')}
                                    callToAction="انضم إلى إرث المبتكرين!"
                                    description="شارك في بناء مجتمع المبتكرين. قيّم مشاريع الطلاب، شارك في التحديات، ونشر المقالات التعليمية لتكون جزءاً من حركة الإبداع."
                                    buttonText={isAuthed ? t('hero.goToDashboard') : t('sections.join')}
                                    imageSrc="/images/avatar2.svg"
                                    imageAlt="معلم خصوصي"
                                    onJoinClick={() => router.visit(isAuthed ? '/dashboard' : '/register')}
                                    compact={true}
                                />
                            </div>
                        )}

                        {/* Testimonials Section */}
                        {testimonials && testimonials.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6">
                                <TestimonialsSection
                                    title={t('sections.testimonials.title')}
                                    subtitle={t('sections.testimonials.subtitle')}
                                    testimonials={testimonials}
                                    compact={true}
                                />
                            </div>
                        )}

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
                                    subtitle="اكتشف محتوى مبتكر من الطلاب والمعلمين: مجلات، كتيبات وتقارير تعرض إبداع مؤسسات تعليميةنا."
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
                                            🎉 تم منحك شهادة العضوية!
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {membershipCertificate.description}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={getCertificateLink()}
                                                className="text-sm font-bold text-[#A3C042] hover:text-[#8CA635]"
                                            >
                                                عرض الشهادة
                                            </Link>
                                            <span className="text-gray-300">|</span>
                                            <a
                                                href={membershipCertificate.download_url}
                                                className="text-sm font-bold text-[#A3C042] hover:text-[#8CA635] flex items-center gap-1"
                                            >
                                                <FaDownload />
                                                تحميل
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hero Section */}
                        <div dir={dir} className="bg-gradient-to-br from-[#A3C042] to-[#8CA635] rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div className='z-10'>
                                    <h1 className="text-4xl font-extrabold mb-4 leading-tight">
                                        {t('hero.title')}
                                    </h1>
                                    <p className="text-white/90 text-lg mb-6">
                                        {t('hero.subtitle')}
                                    </p>
                                    <button
                                        onClick={handleStartJourney}
                                        className="bg-white text-[#A3C042] px-8 py-4 rounded-xl font-bold text-base hover:bg-gray-100 transition shadow-lg"
                                    >
                                        {isAuthed ? t('hero.goToDashboard') : t('hero.startJourney')}
                                    </button>
                                </div>
                                <div className={`flex justify-center items-center ${dir === 'rtl' ? '' : 'lg:order-last'}`}>
                                    <div className={`absolute bg-[#C1DA6C] md:w-[298px] md:h-[1500px] rotate-45 ${dir === 'rtl' ? '' : 'lg:-scale-x-100'}`}></div>
                                    <img
                                        src="/images/hero.png"
                                        alt="Hero"
                                        className="z-10 w-full max-w-md"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        {stats && stats.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('stats.successNumbers')}</h2>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {stats.map((stat, index) => (
                                        <div key={index} className="text-center">
                                            <div className="text-3xl font-extrabold text-[#A3C042] mb-2">
                                                {stat.value || '0'}
                                            </div>
                                            <div className="text-sm text-gray-600 font-semibold">
                                                {getStatLabel(stat.label)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Featured Projects */}
                        {featuredProjects && featuredProjects.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">{t('sections.featuredProjects')}</h2>
                                    <Link
                                        href="/projects"
                                        className="text-[#A3C042] text-sm font-semibold flex items-center gap-2 hover:text-[#8CA635] transition"
                                    >
                                        {t('sections.allProjects')}
                                        <ForwardIcon />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {featuredProjects.slice(0, 4).map((project) => (
                                        <Link
                                            key={project.id}
                                            href={`/projects/${project.id}`}
                                            className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition"
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <FaProjectDiagram className="text-[#A3C042] text-lg" />
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                                    معتمد
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">
                                                {project.title}
                                            </h3>
                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                                {project.description}
                                            </p>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                                    {getCategoryLabel(project.category)}
                                                </span>
                                                {project.views > 0 && (
                                                    <span>{project.views} {t('project.views')}</span>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Links */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Link
                                href="/challenges"
                                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition text-center"
                            >
                                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FaTrophy className="text-yellow-600 text-2xl" />
                                </div>
                                <div className="text-base font-bold text-gray-900 mb-2">{t('quickLinks.challenges')}</div>
                                <p className="text-sm text-gray-600">{t('quickLinks.challengesDesc')}</p>
                            </Link>

                            <Link
                                href="/publications"
                                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition text-center"
                            >
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FaBook className="text-blue-600 text-2xl" />
                                </div>
                                <div className="text-base font-bold text-gray-900 mb-2">{t('quickLinks.publications')}</div>
                                <p className="text-sm text-gray-600">{t('quickLinks.publicationsDesc')}</p>
                            </Link>

                            <Link
                                href="/badges"
                                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition text-center"
                            >
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FaMedal className="text-purple-600 text-2xl" />
                                </div>
                                <div className="text-base font-bold text-gray-900 mb-2">{t('quickLinks.badges')}</div>
                                <p className="text-sm text-gray-600">{t('quickLinks.badgesDesc')}</p>
                            </Link>

                            <Link
                                href="/about"
                                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition text-center"
                            >
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <FaRocket className="text-green-600 text-2xl" />
                                </div>
                                <div className="text-base font-bold text-gray-900 mb-2">{t('quickLinks.about')}</div>
                                <p className="text-sm text-gray-600">{t('quickLinks.aboutDesc')}</p>
                            </Link>
                        </div>

                        {/* Why Choose Section */}
                        <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
                            <WhyChooseSection
                                title={t('sections.whyChoose')}
                                subtitle={t('sections.whyChooseSubtitle')}
                                benefits={whyChooseBenefits}
                                imageSrc="/images/erth-img.jpg"
                                imageAlt={t('header.appName')}
                                compact={true}
                            />
                        </section>

                        {/* Platform Features Section */}
                        <section className="bg-gradient-to-br from-[#A3C042]/5 to-[#8CA635]/5 rounded-2xl border border-gray-100 p-6 md:p-8">
                            <PlatformFeaturesSection
                                title={t('sections.platformFeatures')}
                                subtitle={t('sections.platformFeaturesSubtitle')}
                                compact={true}
                            />
                        </section>

                        {/* UAE Schools Section */}
                        {uaeSchools && uaeSchools.length > 0 && (
                            <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
                                <UAESchoolsSection
                                    title={t('sections.uaeSchools')}
                                    subtitle={t('sections.uaeSchoolsSubtitle')}
                                    schools={uaeSchools}
                                    compact={true}
                                />
                            </section>
                        )}

                        {/* Teacher Recruitment Section - Only show to non-authenticated users or non-teachers */}
                        {(!isAuthed || (user?.role !== 'teacher' && user?.role !== 'school')) && (
                            <section className="bg-gradient-to-br from-[#A3C042] to-[#8CA635] rounded-2xl p-6 md:p-8 text-white">
                                <TeacherRecruitmentSection
                                    title={t('sections.teacherRecruitment.title')}
                                    callToAction="انضم إلى إرث المبتكرين!"
                                    description="شارك في بناء مجتمع المبتكرين. قيّم مشاريع الطلاب، شارك في التحديات، ونشر المقالات التعليمية لتكون جزءاً من حركة الإبداع."
                                    buttonText={isAuthed ? t('hero.goToDashboard') : t('sections.join')}
                                    imageSrc="/images/avatar2.svg"
                                    imageAlt="معلم خصوصي"
                                    onJoinClick={() => router.visit(isAuthed ? '/dashboard' : '/register')}
                                    compact={true}
                                />
                            </section>
                        )}

                        {/* Testimonials Section */}
                        {testimonials && testimonials.length > 0 && (
                            <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
                                <TestimonialsSection
                                    title={t('sections.testimonials.title')}
                                    subtitle="ماذا يقول مستخدمونا عن منصة إرث المبتكرين"
                                    testimonials={testimonials}
                                    compact={true}
                                />
                            </section>
                        )}

                        {/* FAQ Section */}
                        <section className="bg-gradient-to-br from-[#A3C042]/10 to-[#8CA635]/10 rounded-2xl border border-gray-100 p-6 md:p-8">
                            <FAQSection
                                title={t('sections.faq.title')}
                                subtitle={t('sections.faq.subtitle')}
                                compact={true}
                            />
                        </section>

                        {/* Publications Section */}
                        {featuredPublications && featuredPublications.length > 0 && (
                            <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
                                <PublicationsSection
                                    title={t('sections.publications')}
                                    subtitle="اكتشف محتوى مبتكر من الطلاب والمعلمين: مجلات، كتيبات وتقارير تعرض إبداع مؤسسات تعليميةنا."
                                    publications={featuredPublications}
                                    viewAllLink="/publications"
                                    compact={true}
                                />
                            </section>
                        )}

                        {/* CTA Section */}
                        <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white">
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

