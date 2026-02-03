import { Link, router } from '@inertiajs/react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaRocket, FaUsers, FaTrophy, FaBook, FaCompass } from 'react-icons/fa';

export default function DesktopFooter({ auth }) {
    const user = auth?.user;
    const isAuthed = !!user;

    const quickLinks = [
        { name: 'الرئيسية', href: '/', icon: FaRocket },
        { name: 'المشاريع', href: '/projects', icon: FaBook },
        { name: 'التحديات', href: '/challenges', icon: FaTrophy },
        { name: 'الإصدارات', href: '/publications', icon: FaCompass },
        { name: 'الشارات', href: '/badges', icon: FaTrophy },
        { name: 'من نحن', href: '/about', icon: FaUsers },
    ];

    const socialLinks = [
        { name: 'Twitter', icon: FaTwitter, href: '#', color: 'hover:text-blue-400' },
        { name: 'Instagram', icon: FaInstagram, href: '#', color: 'hover:text-pink-500' },
        { name: 'Facebook', icon: FaFacebook, href: '#', color: 'hover:text-blue-600' },
        { name: 'LinkedIn', icon: FaLinkedin, href: '#', color: 'hover:text-blue-700' },
    ];

    const contactInfo = [
        { icon: FaEnvelope, text: 'info@innovatorslegacy.ae', href: 'mailto:info@innovatorslegacy.ae' },
        { icon: FaPhone, text: '+971 4 XXX XXXX', href: 'tel:+9714XXXXXXX' },
        { icon: FaMapMarkerAlt, text: 'دبي، الإمارات العربية المتحدة', href: '#' },
    ];

    return (
        <footer className="hidden md:block bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-6 py-8 pb-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                    {/* Logo & Description */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            <img
                                src="/images/logo-modified.png"
                                alt="إرث المبتكرين"
                                className="h-12 w-auto object-contain"
                            />
                            <div>
                                <div className="text-xl font-extrabold bg-gradient-to-r from-[#A3C042] to-[#8CA635] bg-clip-text text-transparent">
                                    إرث المبتكرين
                                </div>
                                <div className="text-xs text-gray-400">Innovators Legacy</div>
                            </div>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            منصة تعليمية تهدف إلى بناء مجتمع من المبتكرين والموهوبين في المؤسسات تعليمية من خلال توفير بيئة محفزة للإبداع والابتكار.
                        </p>
                        {/* Social Media */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.name}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center transition-all ${social.color} hover:bg-gray-700 border border-gray-700`}
                                        aria-label={social.name}
                                    >
                                        <Icon className="text-lg" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-1">
                        <h3 className="text-lg font-bold mb-4 text-[#A3C042]">روابط سريعة</h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="flex items-center gap-2 text-gray-300 hover:text-[#A3C042] transition group"
                                        >
                                            <Icon className="text-xs transition-opacity" />
                                            <span>{link.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="lg:col-span-1">
                        <h3 className="text-lg font-bold mb-4 text-[#A3C042]">تواصل معنا</h3>
                        <ul className="space-y-3">
                            {contactInfo.map((contact, index) => {
                                const Icon = contact.icon;
                                return (
                                    <li key={index}>
                                        <a
                                            href={contact.href}
                                            className="flex items-center gap-3 text-gray-300 hover:text-[#A3C042] transition group"
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-lg flex items-center justify-center group-hover:from-[#A3C042] group-hover:to-[#8CA635] transition">
                                                <Icon className="text-sm text-white" />
                                            </div>
                                            <span className="text-sm">{contact.text}</span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Newsletter / CTA */}
                    <div className="lg:col-span-1">
                        <h3 className="text-lg font-bold mb-4 text-[#A3C042]">انضم إلينا</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            اشترك في نشرتنا الإخبارية للحصول على آخر الأخبار والتحديثات
                        </p>
                        {!isAuthed ? (
                            <div className="space-y-3">
                                <Link
                                    href="/register"
                                    className="block w-full bg-gradient-to-r from-[#A3C042] to-[#8CA635] text-white text-center py-3 rounded-xl font-bold hover:opacity-90 transition shadow-lg"
                                >
                                    إنشاء حساب
                                </Link>
                                <Link
                                    href="/login"
                                    className="block w-full bg-gray-800 border border-gray-700 text-white text-center py-3 rounded-xl font-semibold hover:bg-gray-700 transition"
                                >
                                    تسجيل الدخول
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-[#A3C042]/10 to-[#8CA635]/10 border border-[#A3C042]/20 rounded-xl p-4">
                                <p className="text-sm text-gray-300 mb-2">مرحباً بك، {user?.name?.split(' ')[0]}!</p>
                                <Link
                                    href={user?.role === 'student' ? '/student/dashboard' : user?.role === 'teacher' ? '/teacher/dashboard' : '/school/dashboard'}
                                    className="text-[#A3C042] text-sm font-semibold hover:underline"
                                >
                                    اذهب إلى لوحة التحكم
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 pt-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-gray-400 text-sm">
                            جميع الحقوق محفوظة لإرث المبتكرين © {new Date().getFullYear()}
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href="/privacy" className="text-gray-400 hover:text-[#A3C042] transition text-sm">
                                سياسة الخصوصية
                            </Link>
                            <Link href="/terms" className="text-gray-400 hover:text-[#A3C042] transition text-sm">
                                الشروط والأحكام
                            </Link>
                            <Link href="/about" className="text-gray-400 hover:text-[#A3C042] transition text-sm">
                                من نحن
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

