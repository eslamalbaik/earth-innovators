import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FaArrowLeft,
    FaTrophy,
    FaCalendar,
    FaUsers,
    FaEdit,
    FaFileAlt,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaAward
} from 'react-icons/fa';

export default function SchoolChallengeShow({ auth, challenge }) {
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const getChallengeTypeLabel = (type) => {
        const labels = {
            'cognitive': 'تحدّي معرفي',
            'applied': 'تحدّي تطبيقي/مهاري',
            'creative': 'تحدّي إبداعي',
            'artistic_creative': 'تحدّي إبداعي فني',
            'collaborative': 'تحدّي تعاوني',
            'analytical': 'تحدّي تحليلي/استقصائي',
            'technological': 'تحدّي تكنولوجي',
            'behavioral': 'تحدّي سلوكي/قيمي',
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

    const getDifficultyLabel = (difficulty) => {
        const labels = {
            easy: 'سهل',
            medium: 'متوسط',
            hard: 'صعب',
        };
        return labels[difficulty] || difficulty;
    };

    const getDifficultyColor = (difficulty) => {
        const colors = {
            easy: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            hard: 'bg-red-100 text-red-800',
        };
        return colors[difficulty] || 'bg-gray-100 text-gray-800';
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'مسودة', icon: FaClock },
            active: { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط', icon: FaCheckCircle },
            completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مكتمل', icon: FaCheckCircle },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'ملغي', icon: FaTimesCircle },
        };
        const badge = badges[status] || badges.draft;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                <Icon className="text-xs" />
                {badge.label}
            </span>
        );
    };

    return (
        <DashboardLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">تفاصيل التحدي</h2>}
        >
            <Head title={`${challenge?.title || 'التحدي'} - لوحة المدرسة`} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href="/school/challenges"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                        >
                            <FaArrowLeft />
                            العودة إلى قائمة التحديات
                        </Link>
                    </div>

                    {/* Challenge Info Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <FaTrophy className="text-yellow-600 text-3xl" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        {challenge?.title}
                                    </h1>
                                    {getStatusBadge(challenge?.status)}
                                </div>
                            </div>
                            <Link
                                href={`/school/challenges/${challenge?.id}/edit`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-legacy-blue/10 text-legacy-blue rounded-lg hover:bg-legacy-blue/20 transition"
                            >
                                <FaEdit />
                                تعديل
                            </Link>
                        </div>

                        {/* Challenge Meta */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="font-semibold">نوع التحدي:</span>
                                <span className="px-2 py-1 bg-[#A3C042]/10 text-[#A3C042] rounded">
                                    {getChallengeTypeLabel(challenge?.challenge_type)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <span className="font-semibold">الفئة:</span>
                                <span className="px-2 py-1 bg-legacy-blue/10 text-legacy-blue rounded">
                                    {getCategoryLabel(challenge?.category)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaCalendar className="text-sm" />
                                <span className="font-semibold">تاريخ البدء:</span>
                                <span>{formatDate(challenge?.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <FaCalendar className="text-sm" />
                                <span className="font-semibold">تاريخ الانتهاء:</span>
                                <span>{formatDate(challenge?.deadline)}</span>
                            </div>
                            {challenge?.max_participants && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaUsers className="text-sm" />
                                    <span className="font-semibold">المشاركون:</span>
                                    <span>{challenge?.current_participants || 0} / {challenge?.max_participants}</span>
                                </div>
                            )}
                            {challenge?.points_reward > 0 && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FaAward className="text-sm" />
                                    <span className="font-semibold">نقاط المكافأة:</span>
                                    <span className="text-[#A3C042] font-bold">{challenge?.points_reward}</span>
                                </div>
                            )}
                            {challenge?.difficulty && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span className="font-semibold">مستوى الصعوبة:</span>
                                    <span className={`px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty)}`}>
                                        {getDifficultyLabel(challenge.difficulty)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Objective */}
                        {challenge?.objective && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">الهدف من التحدي</h3>
                                <p className="text-gray-700 leading-relaxed">{challenge.objective}</p>
                            </div>
                        )}

                        {/* Description */}
                        {challenge?.description && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">وصف التحدي</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{challenge.description}</p>
                            </div>
                        )}

                        {/* Instructions */}
                        {challenge?.instructions && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">كيفية التنفيذ</h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{challenge.instructions}</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">الإجراءات</h3>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={`/school/challenge-submissions?challenge_id=${challenge?.id}`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3C042] text-white rounded-lg hover:opacity-90 transition"
                            >
                                <FaFileAlt />
                                عرض التسليمات
                            </Link>
                            <Link
                                href={`/school/challenges/${challenge?.id}/edit`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                            >
                                <FaEdit />
                                تعديل التحدي
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

