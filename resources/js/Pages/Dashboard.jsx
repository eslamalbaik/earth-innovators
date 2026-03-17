import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/i18n';
import { FaUsers, FaBookOpen, FaStar, FaDollarSign, FaChartLine, FaCheckCircle, FaClock, FaCreditCard } from 'react-icons/fa';
import { FaGraduationCap } from 'react-icons/fa6';

export default function Dashboard({ auth, stats, recentBookings, upcomingSessions }) {
    const { t } = useTranslation();
    const user = auth.user;

    // Use stats from the database only
    const displayStats = stats || {
        totalTeachers: 0,
        totalBookings: 0,
        totalRevenue: 0,
        pendingBookings: 0,
        activeStudents: 0,
        avgRating: 0,
        completedBookings: 0,
        confirmedBookings: 0,
        approvedBookings: 0,
    };

    const statusLabels = {
        pending: t('bookings.pending'),
        approved: t('bookings.approved'),
        confirmed: t('bookings.confirmed'),
        rejected: t('bookings.rejected'),
        cancelled: t('bookings.cancelled'),
        completed: t('bookings.completed'),
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        confirmed: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        cancelled: 'bg-gray-100 text-gray-800',
        completed: 'bg-blue-100 text-blue-800',
    };

    const getStatusBadge = (status) => {
        const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800';
        const label = statusLabels[status] || status;

        return (
            <span className={`px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full ${colorClass}`}>
                {status === 'confirmed' || status === 'approved' ? <FaCheckCircle className="me-1" /> :
                    status === 'pending' ? <FaClock className="me-1" /> : null}
                {label}
            </span>
        );
    };

    const isStudent = user.role === 'student' || (!user.role || (user.role !== 'admin' && user.role !== 'teacher'));

    return (
        <DashboardLayout header={t('dashboard.dashboard')}>
            <Head title={t('dashboard.dashboard')} />

            {isStudent && (
                <>
                    <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg shadow-lg p-6 md:p-8 mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                    {t('common.welcomeBack')} {user.name}
                                </h1>
                                <p className="text-white text-base md:text-lg">{t('dashboard.trackBookings')}</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-full p-4 self-center md:self-auto">
                                <FaGraduationCap className="text-4xl md:text-6xl text-white" />
                            </div>
                        </div>
                    </div>

                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* Total Bookings */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">{t('dashboard.totalBookings')}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalBookings || 0}</p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <FaBookOpen className="text-blue-600 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">{t('dashboard.pendingBookings')}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingBookings || 0}</p>
                                    </div>
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <FaClock className="text-yellow-600 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">{t('dashboard.completedBookings')}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completedBookings || 0}</p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <FaCheckCircle className="text-green-600 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 text-sm font-medium">{t('dashboard.totalSpent')}</p>
                                        <div className="text-sm font-bold text-gray-900 flex items-center ">
                                            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalSpent?.toFixed(0) || 0}</p>
                                            <img src="/images/aed-currency(black).svg" alt={t('common.currencySymbol')} className="w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-full">
                                        <FaDollarSign className="text-purple-600 text-2xl" />
                                    </div>
                                </div>
                            </div>

                            {stats.totalPayments !== undefined && (
                                <>
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-300">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-gray-600 text-sm font-medium">{t('dashboard.totalPayments')}</p>
                                                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalPayments || 0}</p>
                                            </div>
                                            <div className="bg-indigo-100 p-3 rounded-full">
                                                <FaCreditCard className="text-indigo-600 text-2xl" />
                                            </div>
                                        </div>
                                    </div>
                                    {stats.pendingPayments !== undefined && (
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition duration-300">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-gray-600 text-sm font-medium">{t('dashboard.pendingPayments')}</p>
                                                    <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pendingPayments || 0}</p>
                                                </div>
                                                <div className="bg-yellow-100 p-3 rounded-full">
                                                    <FaClock className="text-yellow-600 text-2xl" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FaClock className="text-blue-600" />
                                    {t('dashboard.upcomingSessions')}
                                </h3>
                            </div>
                            <div className="p-6">
                                {upcomingSessions && upcomingSessions.length > 0 ? (
                                    <div className="space-y-4">
                                        {upcomingSessions.slice(0, 5).map((session, index) => (
                                            <div key={session.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{session.teacher_name}</p>
                                                    <p className="text-sm text-gray-600">{session.subject}</p>
                                                    <p className="text-xs text-gray-500">{session.date} {session.time && `- ${session.time}`}</p>
                                                </div>
                                                {getStatusBadge(session.status)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FaClock className="mx-auto text-4xl text-gray-300 mb-4" />
                                        <p className="text-gray-500">{t('dashboard.noUpcomingSessions')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <FaBookOpen className="text-yellow-600" />
                                    {t('dashboard.recentBookingsSummary')}
                                </h3>
                            </div>
                            <div className="p-6">
                                {stats && (
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                            <span className="text-gray-700">{t('dashboard.confirmedBookings')}</span>
                                            <span className="font-bold text-blue-600">{stats.confirmedBookings || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                                            <span className="text-gray-700">{t('dashboard.pendingBookings')}</span>
                                            <span className="font-bold text-yellow-600">{stats.pendingBookings || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <span className="text-gray-700">{t('dashboard.completedBookings')}</span>
                                            <span className="font-bold text-green-600">{stats.completedBookings || 0}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {(user.role === 'admin' || user.role === 'teacher') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {user.role === 'admin' && (
                        <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-blue-500 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{t('dashboard.teachers')}</p>
                                    <p className="text-2xl font-bold text-gray-900">{displayStats.totalTeachers || 0}</p>
                                </div>
                                <div className="p-4 bg-blue-100 rounded-2xl">
                                    <FaUsers className="text-2xl text-blue-600" />
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <FaChartLine className="me-1" />
                                <span>{t('dashboard.activeTeachers')}</span>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{t('dashboard.bookings')}</p>
                                <p className="text-2xl font-bold text-gray-900">{displayStats.totalBookings || 0}</p>
                            </div>
                            <div className="p-4 bg-yellow-100 rounded-2xl">
                                <FaBookOpen className="text-2xl text-yellow-600" />
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                            <FaChartLine className="me-1" />
                            <span>{t('dashboard.totalBookings')}</span>
                        </div>
                    </div>

                    {user.role === 'admin' && (
                        <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500 hover:shadow-xl transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">{t('dashboard.revenue')}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-2xl font-bold mt-1">{(displayStats.totalRevenue || 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-green-300 rounded-2xl">
                                    <img src="/images/aed-currency(white).svg" alt={t('common.currencySymbol')} className="w-7 h-7" />
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <FaChartLine className="me-1" />
                                <span>{t('dashboard.totalRevenue')}</span>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-purple-500 hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">{t('dashboard.avgRating')}</p>
                                <p className="text-2xl font-bold text-gray-900">{displayStats.avgRating || 0}/5</p>
                            </div>
                            <div className="p-4 bg-purple-100 rounded-2xl">
                                <FaStar className="text-2xl text-purple-600" />
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                            <FaChartLine className="me-1" />
                            <span>{t('dashboard.avgTeacherRating')}</span>
                        </div>
                    </div>
                </div>
            )}

            {isStudent && recentBookings && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">{t('dashboard.myRecentBookings')}</h3>
                        <Link
                            href="/my-bookings"
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            {t('common.viewAll')}
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('dashboard.teacher')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('dashboard.subject')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('dashboard.sessionCount')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('dashboard.price')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('dashboard.date')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('dashboard.status')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <FaBookOpen className="mx-auto text-4xl mb-4 text-gray-300" />
                                            <p>{t('dashboard.noBookings')}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{booking.teacher_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{booking.subject}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{t('dashboard.sessionsCount', { count: booking.sessions_count })}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center ">
                                                    <p className="text-gray-900 mt-2">{booking.total_price}</p>
                                                    <img src="/images/aed-currency(black).svg" alt={t('common.currencySymbol')} className="w-5 h-5" />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{booking.created_at}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(booking.status)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isStudent && (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-yellow-100">
                        <h3 className="text-xl font-bold text-gray-900">{t('dashboard.recentBookings')}</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('dashboard.student')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('dashboard.teacher')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('dashboard.subject')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('dashboard.date')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {t('dashboard.status')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(!recentBookings || recentBookings.length === 0) ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            <FaBookOpen className="mx-auto text-4xl mb-4 text-gray-300" />
                                            <p>{t('dashboard.noBookings')}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    recentBookings.map((booking) => (
                                        <tr key={booking.id || Math.random()} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{booking.student}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{booking.teacher}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{booking.subject}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{booking.date}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(booking.status)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
