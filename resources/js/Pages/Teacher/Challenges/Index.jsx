import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaTrophy, FaPlus, FaCalendar, FaEye, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import { useState } from 'react';

export default function TeacherChallengesIndex({ auth, challenges }) {
    const [processing, setProcessing] = useState(null);

    const handleDelete = (challengeId) => {
        if (confirm('هل أنت متأكد من حذف هذا التحدي؟')) {
            setProcessing(challengeId);
            router.delete(`/teacher/challenges/${challengeId}`, {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            });
        }
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

    const getCategoryLabel = (category) => {
        const labels = {
            science: 'علوم',
            technology: 'تقنية',
            engineering: 'هندسة',
            mathematics: 'رياضيات',
            arts: 'فنون',
            other: 'أخرى',
        };
        return labels[category] || category;
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'مسودة' },
            active: { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مكتمل' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'ملغي' },
        };
        const badge = badges[status] || badges.draft;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <DashboardLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">تحدياتي</h2>}
        >
            <Head title="تحدياتي - لوحة المعلم" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow mb-6 p-4">
                        <Link
                            href="/teacher/challenges/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-legacy-green to-legacy-blue text-white rounded-lg hover:opacity-90 transition"
                        >
                            <FaPlus />
                            إنشاء تحدّي جديد
                        </Link>
                    </div>

                    {/* Challenges List */}
                    <div className="bg-white rounded-lg shadow">
                        {challenges.data && challenges.data.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {challenges.data.map((challenge) => (
                                    <div key={challenge.id} className="p-6 hover:bg-gray-50 transition">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                                    {challenge.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                                                    <span className="px-2 py-1 bg-legacy-green/10 text-legacy-green rounded">
                                                        {getChallengeTypeLabel(challenge.challenge_type)}
                                                    </span>
                                                    <span className="px-2 py-1 bg-legacy-blue/10 text-legacy-blue rounded">
                                                        {getCategoryLabel(challenge.category)}
                                                    </span>
                                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                                        {challenge.age_group}
                                                    </span>
                                                    {challenge.start_date && (
                                                        <div className="flex items-center gap-1">
                                                            <FaCalendar className="text-xs" />
                                                            {formatDate(challenge.start_date)}
                                                        </div>
                                                    )}
                                                    {challenge.max_participants && (
                                                        <div className="flex items-center gap-1">
                                                            <FaUsers className="text-xs" />
                                                            {challenge.current_participants || 0} / {challenge.max_participants}
                                                        </div>
                                                    )}
                                                </div>
                                                {challenge.objective && (
                                                    <p className="text-gray-700 mb-2">
                                                        <span className="font-semibold">الهدف:</span> {challenge.objective}
                                                    </p>
                                                )}
                                                {challenge.description && (
                                                    <p className="text-gray-600 mb-2 line-clamp-2">
                                                        {challenge.description}
                                                    </p>
                                                )}
                                                {challenge.points_reward > 0 && (
                                                    <p className="text-legacy-green font-semibold">
                                                        نقاط المكافأة: {challenge.points_reward}
                                                    </p>
                                                )}
                                            </div>
                                            {getStatusBadge(challenge.status)}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/teacher/challenges/${challenge.id}`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
                                            >
                                                <FaEye />
                                                عرض
                                            </Link>
                                            <Link
                                                href={`/teacher/challenges/${challenge.id}/edit`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-legacy-blue/10 text-legacy-blue rounded hover:bg-legacy-blue/20 transition text-sm"
                                            >
                                                <FaEdit />
                                                تعديل
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(challenge.id)}
                                                disabled={processing === challenge.id}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm disabled:opacity-50"
                                            >
                                                <FaTrash />
                                                حذف
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FaTrophy className="mx-auto text-6xl text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg mb-4">لا توجد تحديات</p>
                                <Link
                                    href="/teacher/challenges/create"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-legacy-green to-legacy-blue text-white rounded-lg hover:opacity-90 transition"
                                >
                                    <FaPlus />
                                    إنشاء تحدّي جديد
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {challenges.links && challenges.links.length > 3 && (
                            <div className="p-6 border-t border-gray-200 flex justify-center">
                                <div className="flex gap-2">
                                    {challenges.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-4 py-2 rounded-lg ${
                                                link.active
                                                    ? 'bg-gradient-to-r from-legacy-green to-legacy-blue text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

