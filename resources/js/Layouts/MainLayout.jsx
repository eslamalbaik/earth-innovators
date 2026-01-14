import { Link, router } from '@inertiajs/react';
import { FaUser, FaSignInAlt, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, FaTwitter, FaInstagram, FaEnvelope } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import { getUserImageUrl, getInitials, getColorFromName } from '../utils/imageUtils';

export default function MainLayout({ children, auth }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    const handleLogout = () => {
        router.post(route('logout'));
    };

    useEffect(() => {
        const onDocClick = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col" dir="rtl">
            <header className="bg-gradient-to-r from-[#A3C042] to-legacy-blue sticky top-0 z-50 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <Link href="/" className="flex items-center space-x-3 space-x-reverse">
                                <img
                                    src="/images/logo-modified.png"
                                    alt="إرث المبتكرين - Innovators Legacy"
                                    className="h-8 w-auto object-contain"
                                />
                              <p className="text-white text-2xl font-bold">إرث المبتكرين</p>
                            </Link>
                        </div>

                        <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
                            <Link href="/" className="text-white hover:text-gray-100 font-medium transition">
                                الرئيسية
                            </Link>
                            <Link href="/projects" className="text-white hover:text-gray-100 font-medium transition">
                                المشاريع
                            </Link>
                            <Link href="/challenges" className="text-white hover:text-gray-100 font-medium transition">
                                التحديات
                            </Link>
                            <Link href="/publications" className="text-white hover:text-gray-100 font-medium transition">
                                الإصدارات
                            </Link>
                            <Link href="/badges" className="text-white hover:text-gray-100 font-medium transition">
                                الشارات
                            </Link>
                            <Link href="/about" className="text-white hover:text-gray-100 font-medium transition">
                                عن إرث المبتكرين
                            </Link>
                        </nav>

                        {!auth?.user && (
                            <div className="hidden md:flex justify-end items-center gap-2">
                                <Link
                                    href="/register"
                                    className="text-sm bg-white hover:bg-gray-100 text-[#A3C042] px-4 py-2 rounded-lg font-semibold transition duration-300 flex items-center space-x-1 space-x-reverse shadow-md"
                                >
                                    <span>انضم للمنصة</span>
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-sm bg-legacy-blue hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-300 flex items-center space-x-1 space-x-reverse shadow-md"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span>تسجيل الدخول</span>
                                </Link>
                            </div>
                        )}

                        {!auth?.user ? (
                            <div className="hidden md:hidden">
                            </div>
                        ) : (
                            <div className="hidden md:block" ref={userMenuRef}>
                                <div className="relative">
                                    <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-3 hover:bg-white/20 px-2 py-1 rounded-lg">
                                        {getUserImageUrl(auth.user, auth.user?.teacher) ? (
                                            <img
                                                src={getUserImageUrl(auth.user, auth.user?.teacher)}
                                                alt={auth.user.name}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : null}
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${getUserImageUrl(auth.user, auth.user?.teacher) ? 'hidden' : ''}`}
                                            style={{
                                                background: `linear-gradient(135deg, ${getColorFromName(auth.user.name).split(', ')[0]}, ${getColorFromName(auth.user.name).split(', ')[1]})`,
                                            }}
                                        >
                                            {getInitials(auth.user.name)}
                                        </div>
                                        <div className="">
                                            <div className="text-sm font-semibold text-white">{auth.user.name}</div>
                                            <div className="text-xs text-white/80">
                                                {auth.user.role === 'admin' && 'إدارة'}
                                                {auth.user.role === 'teacher' && 'معلم'}
                                                {auth.user.role === 'student' && 'طالب'}
                                                {auth.user.role === 'school' && 'مدرسة'}
                                                {auth.user.role === 'educational_institution' && 'مؤسسة تعليمية'}
                                            </div>
                                        </div>
                                    </button>
                                    {userMenuOpen && (
                                        <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                                            <Link href={route('dashboard')} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">لوحة التحكم</Link>
                                            <button onClick={handleLogout} className="w-full  px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                                <FaSignOutAlt /> خروج
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-white hover:text-gray-100 hover:bg-white/20 transition"
                        >
                            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                        </button>
                    </div>

                    {isMobileMenuOpen && (
                        <div className="md:hidden border-t border-white/20 py-4">
                            <div className="flex flex-col space-y-4">
                                <Link
                                    href="/"
                                    className="text-white hover:text-gray-100 font-medium py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    الرئيسية
                                </Link>
                                <Link
                                    href="/projects"
                                    className="text-white hover:text-gray-100 font-medium py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    المشاريع
                                </Link>
                                <Link
                                    href="/challenges"
                                    className="text-white hover:text-gray-100 font-medium py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    التحديات
                                </Link>
                                <Link
                                    href="/publications"
                                    className="text-white hover:text-gray-100 font-medium py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    الإصدارات
                                </Link>
                                <Link
                                    href="/badges"
                                    className="text-white hover:text-gray-100 font-medium py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    الشارات
                                </Link>
                                <Link
                                    href="/about"
                                    className="text-white hover:text-gray-100 font-medium py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    عن إرث المبتكرين
                                </Link>

                                <div className="border-t border-white/20 pt-2">
                                    <Link
                                        href="/register"
                                        className="block bg-white hover:bg-gray-100 text-[#A3C042] px-6 py-3 rounded-lg font-semibold text-center transition duration-300 shadow-md"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        انضم للمنصة
                                    </Link>
                                </div>

                                {auth?.user ? (
                                    <div className="">
                                        <Link
                                            href="/dashboard"
                                            className="flex items-center space-x-2 space-x-reverse text-white hover:text-gray-100 py-2"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <FaUser className="text-lg" />
                                            <span>لوحة التحكم</span>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="">
                                        <Link
                                            href="/login"
                                            className="block bg-legacy-blue hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-center transition duration-300 shadow-md"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span>تسجيل الدخول</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <footer className="bg-gradient-to-r from-[#A3C042] to-legacy-blue py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-white font-semibold">
                            جميع الحقوق محفوظة لإرث المبتكرين © 2025
                        </div>

                        <div className="flex items-center gap-8">
                            <Link href="/privacy" className="text-white hover:text-gray-100 transition duration-300 underline">
                                سياسة الخصوصية
                            </Link>
                            <Link href="/terms" className="text-white hover:text-gray-100 transition duration-300 underline">
                                الشروط والأحكام
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <a href="#" className="text-white hover:text-gray-100 transition duration-300">
                                <FaTwitter size={20} />
                            </a>
                            <a href="#" className="text-white hover:text-gray-100 transition duration-300">
                                <FaInstagram size={20} />
                            </a>
                            <a href="#" className="text-white hover:text-gray-100 transition duration-300">
                                <FaEnvelope size={20} />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    );
}
