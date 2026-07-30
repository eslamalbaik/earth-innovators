import { Link } from '@inertiajs/react';
import {
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaTwitter,
    FaInstagram,
    FaFacebook,
    FaLinkedin,
    FaRocket,
    FaUsers,
    FaTrophy,
    FaBook,
    FaCompass,
    FaYoutube,
    FaTiktok,
} from 'react-icons/fa';
import { useTranslation } from '@/i18n';
import WhatsAppSupportButton from '@/Components/Support/WhatsAppSupportButton';
import { resolveSupportPhoneDisplay, resolveSupportPhoneE164, supportTelHref } from '@/constants/supportContact';

export default function DesktopFooter({ auth }) {
    const { t } = useTranslation();
    const user = auth?.user;
    const isAuthed = !!user;
    
    const supportEmail = 'info@earthinnovators.ae';
    const supportPhone = resolveSupportPhoneDisplay();
    const supportPhoneTel = supportTelHref(resolveSupportPhoneE164());
    const supportAddress = 'دبي، الإمارات العربية المتحدة';

    const quickLinks = [
        { name: t('common.home'), href: '/', icon: FaRocket },
        { name: t('common.projects'), href: '/projects', icon: FaBook },
        { name: t('common.challenges'), href: '/challenges', icon: FaTrophy },
        { name: t('common.publications'), href: '/publications', icon: FaCompass },
        { name: t('common.badges'), href: '/badges', icon: FaTrophy },
        { name: t('common.about'), href: '/about', icon: FaUsers },
    ];

    const socialLinks = [
        { name: 'TikTok', icon: FaTiktok, href: 'https://www.tiktok.com/@earth.innovators', color: 'hover:text-white' },
        { name: 'YouTube', icon: FaYoutube, href: 'https://youtube.com/@earth-innovators-r8e', color: 'hover:text-red-500' },
        { name: 'Instagram', icon: FaInstagram, href: 'https://www.instagram.com/earth.innovators', color: 'hover:text-pink-500' },
        { name: 'LinkedIn', icon: FaLinkedin, href: 'https://www.linkedin.com/in/earth-innovators-0569913a7', color: 'hover:text-blue-700' },
        { name: 'Twitter', icon: FaTwitter, href: null, color: 'hover:text-blue-400' },
        { name: 'Facebook', icon: FaFacebook, href: null, color: 'hover:text-blue-600' },
    ].filter((link) => Boolean(link.href));

    const contactInfo = [
        { icon: FaPhone, text: supportPhone, href: supportPhoneTel },
        { icon: FaEnvelope, text: supportEmail, href: `mailto:${supportEmail}` },
        { icon: FaMapMarkerAlt, text: supportAddress },
    ].filter(Boolean);

    const dashboardHref = user?.role === 'student'
        ? '/dashboard'
        : user?.role === 'teacher'
            ? '/teacher/dashboard'
            : '/school/dashboard';

    return (
        <>
            <WhatsAppSupportButton />
            <footer className="hidden border-t border-white/20 bg-gradient-to-br from-[#A3C042] via-[#98b23e] to-[#8CA635] text-white md:block">
            <div className="mx-auto max-w-7xl px-6 pb-4 pt-8">
                <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
                    <div className="lg:col-span-1">
                        <Link href="/" className="mb-4 flex items-center">
                            <img
                                src="/images/logo.png"
                                alt={t('header.appName')}
                                className="h-14 w-auto max-w-[320px] object-contain"
                            />
                        </Link>
                        <p className="mb-4 text-sm leading-relaxed text-white/80">
                            {t('sections.whyChooseSubtitle')}
                        </p>
                        {socialLinks.length > 0 && (
                            <div className="flex items-center gap-3">
                                {socialLinks.map((social) => {
                                    const Icon = social.icon;

                                    return (
                                        <a
                                            key={social.name}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition-all hover:bg-white/20 ${social.color}`}
                                            aria-label={social.name}
                                        >
                                            <Icon className="text-lg" />
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <h3 className="mb-4 text-lg font-bold text-white">{t('sections.quickLinks')}</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => {
                                const Icon = link.icon;

                                return (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="group flex items-center gap-2 text-white/85 transition hover:text-white"
                                        >
                                            <Icon className="text-xs transition-opacity" />
                                            <span>{link.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="lg:col-span-1">
                        <h3 className="mb-4 text-lg font-bold text-white">{t('footer.contact')}</h3>
                        <ul className="space-y-3">
                            {contactInfo.map((contact, index) => {
                                const Icon = contact.icon;
                                const content = (
                                    <>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 transition group-hover:bg-white/25">
                                            <Icon className="text-sm text-white" />
                                        </div>
                                        <span className="text-sm" dir={contact.icon === FaPhone ? "ltr" : undefined}>{contact.text}</span>
                                    </>
                                );

                                return (
                                    <li key={index}>
                                        {contact.href ? (
                                            <a
                                                href={contact.href}
                                                className="group flex items-center gap-3 text-white/85 transition hover:text-white"
                                            >
                                                {content}
                                            </a>
                                        ) : (
                                            <div className="flex items-center gap-3 text-white/85">
                                                {content}
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    <div className="lg:col-span-1">
                        <h3 className="mb-4 text-lg font-bold text-white">{t('common.join')}</h3>
                        <p className="mb-4 text-sm text-white/80">
                            {t('sections.ctaSubtitle')}
                        </p>
                        {!isAuthed ? (
                            <div className="space-y-3">
                                <Link
                                    href="/register"
                                    className="block w-full rounded-xl bg-white py-3 text-center font-bold text-[#8CA635] shadow-lg transition hover:bg-gray-100"
                                >
                                    {t('common.register')}
                                </Link>
                                <Link
                                    href="/login"
                                    className="block w-full rounded-xl border border-white/40 bg-white/10 py-3 text-center font-semibold text-white transition hover:bg-white/20"
                                >
                                    {t('common.login')}
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-xl border border-white/20 bg-white/10 p-4">
                                <p className="mb-2 text-sm text-white/85">
                                    {t('dashboard.welcomeMessage')}, {user?.name?.split(' ')[0]}!
                                </p>
                                <Link
                                    href={dashboardHref}
                                    className="text-sm font-semibold text-white hover:underline"
                                >
                                    {t('hero.goToDashboard')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-white/20 pt-4">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="text-sm text-white/80">
                            {t('footer.copyright')} © {new Date().getFullYear()}
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="text-sm text-white/80 transition hover:text-white">
                                {t('common.privacy')}
                            </Link>
                            <Link href="/terms" className="text-sm text-white/80 transition hover:text-white">
                                {t('common.terms')}
                            </Link>
                            <Link href="/about" className="text-sm text-white/80 transition hover:text-white">
                                {t('common.about')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            </footer>
        </>
    );
}
