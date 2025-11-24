import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FaCog,
    FaChevronRight,
    FaStar,
    FaMedal,
    FaTrophy,
    FaFlag,
    FaHeart,
    FaCircle,
    FaUserFriends,
    FaProjectDiagram,
    FaAward,
    FaChartLine,
} from 'react-icons/fa';
import { getUserImageUrl, getInitials, getColorFromName } from '@/utils/imageUtils';

export default function StudentProfile({ auth, stats = {}, badges = [], projects = [], activities = [] }) {
    const user = auth.user;

    // Default stats if not provided
    const displayStats = {
        points: stats.points || user?.points || 128,
        projects: stats.projects || stats.totalProjects || 12,
        badges: stats.badges || stats.totalBadges || 5,
        friends: stats.friends || 3,
    };

    // Default badges if not provided
    const displayBadges = badges.length > 0 ? badges : [
        { id: 1, name_ar: 'المركز الثالث', icon: '3', color: 'purple', glow: true },
        { id: 2, name_ar: 'مشروع مميز', icon: 'medal', color: 'green' },
        { id: 3, name_ar: 'تحدي النجوم', icon: 'star', color: 'blue', glow: true },
    ];

    // Default projects if not provided
    const displayProjects = projects.length > 0 ? projects : [
        {
            id: 1,
            title: 'مشروع الابتكار',
            status: 'approved',
            flags: 5,
            hearts: 12,
        },
        {
            id: 2,
            title: 'مشروع الابتكار',
            status: 'pending',
            flags: 5,
            hearts: 12,
        },
    ];

    // Default activities if not provided
    const displayActivities = activities.length > 0 ? activities : [
        { id: 1, text: 'مشاركة في تحدي الابتكار', time: 'منذ 3 أيام', color: 'blue' },
        { id: 2, text: 'حصلت على شارة المبتكر', time: 'منذ أسبوع', color: 'orange' },
        { id: 3, text: 'رفعت مشروع جديد', time: 'منذ أسبوعين', color: 'green' },
    ];

    const getUserImage = () => {
        if (user?.image) {
            if (user.image.startsWith('http://') || user.image.startsWith('https://')) {
                return user.image;
            }
            if (user.image.startsWith('/storage/')) {
                return user.image;
            }
            return `/storage/${user.image}`;
        }
        return null;
    };

    const getBadgeIcon = (badge) => {
        if (badge.icon === '3') {
            return <span className="text-6xl font-bold text-yellow-300 drop-shadow-lg">3</span>;
        }
        if (badge.icon === 'medal') {
            return <FaMedal className="text-5xl text-white drop-shadow-lg" />;
        }
        if (badge.icon === 'star') {
            return <FaStar className="text-5xl text-white drop-shadow-lg animate-pulse" />;
        }
        return <FaAward className="text-5xl text-white drop-shadow-lg" />;
    };

    const getBadgeBgColor = (color) => {
        switch (color) {
            case 'purple':
                return 'bg-gradient-to-br from-purple-500 to-purple-700';
            case 'green':
                return 'bg-gradient-to-br from-green-500 to-green-700';
            case 'blue':
                return 'bg-gradient-to-br from-blue-500 to-blue-700';
            default:
                return 'bg-gradient-to-br from-gray-500 to-gray-700';
        }
    };

    const getActivityColor = (color) => {
        switch (color) {
            case 'blue':
                return 'bg-blue-500';
            case 'orange':
                return 'bg-orange-500';
            case 'green':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <DashboardLayout header="">
            <Head title="الملف الشخصي - إرث المبتكرين" />

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Top Navigation Bar */}
                <div className="bg-white rounded-3xl shadow-lg p-5 flex items-center justify-between border border-gray-100">
                    <Link
                        href="/profile"
                        className="p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <FaCog className="text-2xl text-gray-700" />
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                        الملف الشخصي
                    </h1>
                    <div className="w-10"></div> {/* Spacer for centering */}
                </div>

                {/* User Section */}
                <div className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden border border-gray-100">
                    {/* Vibrant gradient background */}
                    <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-purple-200 via-blue-200 to-green-200 rounded-full -mr-36 -mt-36 opacity-40 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-br from-green-200 via-blue-200 to-purple-200 rounded-full -ml-28 -mb-28 opacity-40 blur-3xl"></div>

                    <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-36 h-36 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-green-500 p-1.5 shadow-2xl">
                                {getUserImage() ? (
                                    <img
                                        src={getUserImage()}
                                        alt={user?.name || 'User'}
                                        className="w-full h-full object-cover rounded-full"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            const fallback = e.target.nextElementSibling;
                                            if (fallback) fallback.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div
                                    className={`w-full h-full rounded-full flex items-center justify-center text-white text-5xl font-bold ${getUserImage() ? 'hidden' : ''}`}
                                    style={{
                                        background: `linear-gradient(135deg, ${getColorFromName(user?.name || 'User')})`
                                    }}
                                >
                                    {getInitials(user?.name || 'User')}
                                </div>
                            </div>
                            {/* Online/Active Badge */}
                            <div className="absolute bottom-3 right-3 w-7 h-7 bg-green-500 border-4 border-white rounded-full shadow-xl ring-2 ring-green-200"></div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center md:text-right">
                            <h2 className="text-4xl font-bold text-gray-900 mb-3">
                                {user?.name || 'سارة محمد'}
                            </h2>
                            <div className="inline-block relative">
                                <div className="absolute bottom-0 right-0 left-0 h-1.5 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full opacity-70"></div>
                                <p className="text-xl text-gray-700 relative z-10 font-medium">مدرسة الحسن</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Points - Highlighted (highest number) */}
                    <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-3xl p-6 shadow-xl transform hover:scale-105 transition-all overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
                        <div className="relative text-center">
                            <div className="text-5xl font-bold text-white mb-2 drop-shadow-lg">{displayStats.points}</div>
                            <div className="text-white/95 font-semibold text-lg">النقاط</div>
                        </div>
                    </div>

                    {/* Projects */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-gray-900 mb-2">{displayStats.projects}</div>
                            <div className="text-gray-700 font-semibold text-lg">المشاريع</div>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-gray-900 mb-2">{displayStats.badges}</div>
                            <div className="text-gray-700 font-semibold text-lg">الشارات</div>
                        </div>
                    </div>

                    {/* Friends */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100">
                        <div className="text-center">
                            <div className="text-5xl font-bold text-gray-900 mb-2">{displayStats.friends}</div>
                            <div className="text-gray-700 font-semibold text-lg">الأصدقاء</div>
                        </div>
                    </div>
                </div>

                {/* Badges Section */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">شاراتي</h3>
                        <Link href="/student/badges" className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-2 transition-colors">
                            عرض الكل
                            <FaChevronRight className="text-xs" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {displayBadges.map((badge) => {
                            const glowRingClass = badge.glow 
                                ? badge.color === 'purple' ? 'ring-4 ring-purple-300 ring-opacity-60' 
                                : badge.color === 'blue' ? 'ring-4 ring-blue-300 ring-opacity-60'
                                : 'ring-4 ring-green-300 ring-opacity-60'
                                : '';
                            
                            return (
                                <div
                                    key={badge.id}
                                    className={`${getBadgeBgColor(badge.color)} rounded-3xl p-8 text-center shadow-2xl transform hover:scale-105 transition-all relative overflow-hidden ${glowRingClass}`}
                                >
                                    {badge.glow && (
                                        <>
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
                                        </>
                                    )}
                                    <div className="relative mb-4 flex justify-center">
                                        {getBadgeIcon(badge)}
                                    </div>
                                    <div className="relative text-white font-bold text-xl drop-shadow-md">{badge.name_ar || badge.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Projects Section */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">مشاريعي</h3>
                        <Link href="/student/projects" className="text-green-600 hover:text-green-700 font-semibold text-sm flex items-center gap-2 transition-colors">
                            عرض الكل
                            <FaChevronRight className="text-xs" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {displayProjects.map((project, index) => (
                            <div
                                key={project.id || index}
                                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-200"
                            >
                                <h4 className="text-xl font-bold text-gray-900 mb-4">{project.title}</h4>
                                <div className="flex items-center gap-5 mb-4">
                                    <div className="flex items-center gap-2 text-orange-500">
                                        <FaFlag className="text-lg" />
                                        <span className="text-base font-bold">{project.flags || 5}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-red-500">
                                        <FaHeart className="text-lg" />
                                        <span className="text-base font-bold">{project.hearts || 12}</span>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <span
                                        className={`px-5 py-2 rounded-full text-sm font-bold ${
                                            project.status === 'approved'
                                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                                : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                                        }`}
                                    >
                                        {project.status === 'approved' ? 'تمت المراجعة' : 'قيد المراجعة'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activities Section */}
                <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">نشاطاتي</h3>
                    <div className="space-y-5">
                        {displayActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                                <div className={`${getActivityColor(activity.color)} w-4 h-4 rounded-full mt-2 flex-shrink-0 shadow-md`}></div>
                                <div className="flex-1">
                                    <p className="text-gray-900 font-semibold text-lg">{activity.text}</p>
                                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

