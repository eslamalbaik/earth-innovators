import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '../../../Layouts/DashboardLayout';
import { useState } from 'react';
import { FaTrophy, FaCalendar, FaUsers, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

export default function StudentChallengesIndex({ auth, challenges, filters, message }) {
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        router.get('/student/challenges', {
            status: status || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const getChallengeTypeLabel = (type) => {
        const labels = {
            '60_seconds': 'تحدّي 60 ثانية',
            'mental_math': 'حلها بدون قلم',
            'conversions': 'تحدّي التحويلات',
            'team_fastest': 'تحدّي الفريق الأسرع',
            'build_problem': 'ابنِ مسألة',
            'custom': 'تحدّي مخصص',
        };
        return labels[type] || type;
    };

    const getStatusBadge = (challenge) => {
        const now = new Date();
        const startDate = new Date(challenge.start_date);
        const deadline = new Date(challenge.deadline);

        if (challenge.status === 'active' && startDate <= now && deadline >= now) {
            return { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط', icon: FaCheckCircle };
        } else if (challenge.status === 'active' && startDate > now) {
            return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'قادم', icon: FaClock };
        } else {
            return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'منتهي', icon: FaTimesCircle };
        }
    };

    const getSubmissionStatusBadge = (status) => {
        const badges = {
            submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'تم التقديم' },
            reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'قيد المراجعة' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'مقبول' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'مرفوض' },
        };
        return badges[status] || null;
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="التحديات" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">التحديات</h1>
                    <p className="text-gray-600">استعرض التحديات المتاحة من مدرستك وقدم حلولك</p>
                </div>

                {message && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <p className="text-yellow-800">{message}</p>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleStatusFilter('')}
                            className={`px-4 py-2 rounded-lg transition ${
                                !selectedStatus
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            الكل
                        </button>
                        <button
                            onClick={() => handleStatusFilter('active')}
                            className={`px-4 py-2 rounded-lg transition ${
                                selectedStatus === 'active'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            نشط
                        </button>
                        <button
                            onClick={() => handleStatusFilter('upcoming')}
                            className={`px-4 py-2 rounded-lg transition ${
                                selectedStatus === 'upcoming'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            قادم
                        </button>
                        <button
                            onClick={() => handleStatusFilter('finished')}
                            className={`px-4 py-2 rounded-lg transition ${
                                selectedStatus === 'finished'
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            منتهي
                        </button>
                    </div>
                </div>

                {/* Challenges List */}
                {challenges.data && challenges.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {challenges.data.map((challenge) => {
                            const statusBadge = getStatusBadge(challenge);
                            const StatusIcon = statusBadge.icon;
                            const submissionBadge = challenge.submission_status ? getSubmissionStatusBadge(challenge.submission_status) : null;

                            return (
                                <div
                                    key={challenge.id}
                                    onClick={() => router.visit(`/student/challenges/${challenge.id}`)}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-300 overflow-hidden group cursor-pointer"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <FaTrophy className="text-yellow-600 text-xl" />
                                                <span className={`px-2 py-1 ${statusBadge.bg} ${statusBadge.text} text-xs font-medium rounded flex items-center gap-1`}>
                                                    <StatusIcon className="text-xs" />
                                                    {statusBadge.label}
                                                </span>
                                            </div>
                                            {submissionBadge && (
                                                <span className={`px-2 py-1 ${submissionBadge.bg} ${submissionBadge.text} text-xs font-medium rounded`}>
                                                    {submissionBadge.label}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                                            {challenge.title}
                                        </h3>

                                        {challenge.objective && (
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {challenge.objective}
                                            </p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                {getChallengeTypeLabel(challenge.challenge_type)}
                                            </span>
                                            {challenge.points_reward > 0 && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
                                                    {challenge.points_reward} نقطة
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                                            <div className="flex items-center gap-1">
                                                <FaCalendar className="text-xs" />
                                                {formatDate(challenge.deadline)}
                                            </div>
                                            {challenge.max_participants && (
                                                <div className="flex items-center gap-1">
                                                    <FaUsers className="text-xs" />
                                                    {challenge.current_participants || 0} / {challenge.max_participants}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaTrophy className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد تحديات متاحة حالياً</p>
                    </div>
                )}

                {/* Pagination */}
                {challenges.links && challenges.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-2">
                            {challenges.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 rounded-lg ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

