import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head } from '@inertiajs/react';
import { FaTrophy, FaMedal, FaCrown, FaStar, FaUsers, FaProjectDiagram } from 'react-icons/fa';

export default function SchoolRanking({ schoolsRanking = [], currentSchoolRank, badges = [], earnedBadges = [] }) {
    const getRankIcon = (rank) => {
        if (rank === 1) return <FaCrown className="text-yellow-500 text-3xl" />;
        if (rank === 2) return <FaMedal className="text-gray-400 text-3xl" />;
        if (rank === 3) return <FaMedal className="text-orange-400 text-3xl" />;
        return <span className="text-2xl font-bold text-gray-600">#{rank}</span>;
    };

    return (
        <DashboardLayout header="الترتيب والشارات">
            <Head title="الترتيب والشارات - إرث المبتكرين" />

            {currentSchoolRank && (
                <div className="bg-gradient-to-r from-legacy-green to-legacy-blue rounded-xl shadow-lg p-8 mb-8 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">ترتيب مدرستك</h2>
                            <div className="flex items-center gap-6 mt-4">
                                <div className="bg-white/20 rounded-lg px-6 py-3 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <FaTrophy className="text-yellow-300 text-2xl" />
                                        <div>
                                            <p className="text-sm opacity-90">الترتيب</p>
                                            <p className="text-3xl font-bold">{currentSchoolRank.rank}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/20 rounded-lg px-6 py-3 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <FaStar className="text-yellow-300 text-2xl" />
                                        <div>
                                            <p className="text-sm opacity-90">إجمالي النقاط</p>
                                            <p className="text-3xl font-bold">{currentSchoolRank.total_points.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/20 rounded-lg px-6 py-3 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <FaUsers className="text-white text-2xl" />
                                        <div>
                                            <p className="text-sm opacity-90">عدد الطلاب</p>
                                            <p className="text-3xl font-bold">{currentSchoolRank.total_students}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/20 rounded-lg px-6 py-3 backdrop-blur-sm">
                                    <div className="flex items-center gap-3">
                                        <FaProjectDiagram className="text-white text-2xl" />
                                        <div>
                                            <p className="text-sm opacity-90">المشاريع</p>
                                            <p className="text-3xl font-bold">{currentSchoolRank.projects_count}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ترتيب المدارس */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FaTrophy className="text-legacy-green" />
                            ترتيب المدارس
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {schoolsRanking.map((school, index) => (
                                <div
                                    key={school.id}
                                    className={`border rounded-lg p-4 transition ${
                                        school.is_current_school
                                            ? 'border-legacy-green bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10 shadow-md'
                                            : 'border-gray-200 hover:shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 flex items-center justify-center">
                                                {getRankIcon(school.rank)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg text-gray-900">{school.name}</h4>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <FaStar className="text-yellow-500" />
                                                        {school.total_points.toLocaleString()} نقطة
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaUsers />
                                                        {school.total_students} طالب
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaProjectDiagram />
                                                        {school.projects_count} مشروع
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {school.is_current_school && (
                                            <span className="bg-legacy-green text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                مدرستك
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* الشارات المكتسبة */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FaMedal className="text-legacy-green" />
                            الشارات المكتسبة
                        </h3>
                    </div>
                    <div className="p-6">
                        {earnedBadges && earnedBadges.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {earnedBadges.map((badgeData, index) => (
                                    <div key={badgeData.badge.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-legacy-green to-legacy-blue rounded-full flex items-center justify-center text-white">
                                                <FaMedal className="text-2xl" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{badgeData.badge.name_ar || badgeData.badge.name}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{badgeData.badge.description_ar || badgeData.badge.description}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span>{badgeData.count} شارة</span>
                                                    <span>•</span>
                                                    <span>{badgeData.students} طالب</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FaMedal className="text-6xl text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">لا توجد شارات مكتسبة بعد</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

