import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { FaBars, FaUser, FaCog, FaSignOutAlt, FaHome, FaUsers, FaBook, FaCalendar, FaChartBar, FaFileAlt, FaTrophy, FaCreditCard } from 'react-icons/fa';

export default function AdminLayout({ children, title = 'لوحة الإدارة' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'لوحة التحكم', href: '/admin/dashboard', icon: FaHome },
        { name: 'المعلمين', href: '/admin/teachers', icon: FaUsers },
        { name: 'طلبات الانضمام', href: '/admin/teacher-applications', icon: FaFileAlt },
        { name: 'الطلاب', href: '/admin/students', icon: FaUsers },
        { name: 'الحجوزات', href: '/admin/bookings', icon: FaCalendar },
        { name: 'التقييمات', href: '/admin/reviews', icon: FaBook },
        { name: 'المواد', href: '/admin/subjects', icon: FaBook },
        { name: 'التحديات', href: '/admin/challenges', icon: FaTrophy },
        { name: 'الاشتراكات', href: '/admin/subscriptions', icon: FaCreditCard },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={title} />
            <div className={`fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'
                } lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">لوحة الإدارة</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-500 hover:text-gray-700"
                    >
                        <FaBars />
                    </button>
                </div>

                <nav className="mt-6 px-3">
                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition duration-200"
                                >
                                    <Icon className="ml-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                                    {item.name}
                                </a>
                            );
                        })}
                    </div>
                </nav>
            </div>

            <div className="lg:pr-64">
                <div className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700"
                        >
                            <FaBars />
                        </button>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                                    <FaUser className="h-5 w-5" />
                                    <span className="text-sm font-medium">المدير</span>
                                </button>
                            </div>

                            <div className="flex items-center space-x-2">
                                <a
                                    href="/admin/settings"
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaCog className="h-5 w-5" />
                                </a>
                                <a
                                    href="/logout"
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaSignOutAlt className="h-5 w-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <main className="p-6">
                    {children}
                </main>
            </div>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
