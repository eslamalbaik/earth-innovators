import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaArrowRight, FaEdit, FaTrophy, FaUser, FaCalendar, FaFlag, FaClock, FaUsers, FaCoins, FaUserPlus, FaExclamationCircle, FaStar, FaCheckCircle, FaFile } from 'react-icons/fa';

export default function AdminChallengesShow({ challenge }) {
    const getStatusBadge = (status) => {
        const statusMap = {
            'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط' },
            'draft': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'مسودة' },
            'completed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مكتمل' },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'ملغي' },
        };
        const statusConfig = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
            </span>
        );
    };

    const getCategoryLabel = (category) => {
        const categoryMap = {
            'science': 'علوم',
            'technology': 'تقنية',
            'engineering': 'هندسة',
            'mathematics': 'رياضيات',
            'arts': 'فنون',
            'other': 'أخرى',
        };
        return categoryMap[category] || category;
    };

    const getChallengeTypeLabel = (type) => {
        const typeMap = {
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
        return typeMap[type] || type;
    };

    const getAgeGroupLabel = (ageGroup) => {
        const ageGroupMap = {
            '6-9': '6-9 سنوات',
            '10-13': '10-13 سنة',
            '14-17': '14-17 سنة',
            '18+': '18+ سنة',
        };
        return ageGroupMap[ageGroup] || ageGroup;
    };

    const getDifficultyLabel = (difficulty) => {
        const difficultyMap = {
            'easy': 'سهل',
            'medium': 'متوسط',
            'hard': 'صعب',
        };
        return difficultyMap[difficulty] || difficulty;
    };

    const getDifficultyColor = (difficulty) => {
        const colorMap = {
            'easy': { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-500' },
            'medium': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'text-yellow-500' },
            'hard': { bg: 'bg-red-100', text: 'text-red-800', icon: 'text-red-500' },
        };
        return colorMap[difficulty] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'text-gray-500' };
    };

    return (
        <DashboardLayout header="تفاصيل التحدي">
            <Head title={challenge.title} />

            <div className="mb-6">
                <Link
                    href={route('admin.challenges.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة التحديات
                </Link>
            </div>

            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{challenge.title}</h1>
                        {getStatusBadge(challenge.status)}
                    </div>
                    <div className="flex gap-2">
                        {challenge.school_id && (
                            <Link
                                href={route('admin.challenges.assign-students', challenge.id)}
                                className="bg-[#A3C042] hover:bg-[#8CA635] text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                            >
                                <FaUserPlus />
                                تعيين طلاب
                            </Link>
                        )}
                        <Link
                            href={route('admin.challenge-submissions.index', challenge.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                        >
                            <FaFile />
                            التسليمات
                        </Link>
                        <Link
                            href={route('admin.challenges.edit', challenge.id)}
                            className="bg-[#A3C042] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                        >
                            <FaEdit />
                            تعديل
                        </Link>
                    </div>
                </div>

                {challenge.objective && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-gray-700"><strong>الهدف:</strong> {challenge.objective}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">وصف التحدي</h2>
                        <div className="prose max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap">{challenge.description}</p>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">كيفية التنفيذ</h2>
                        <div className="prose max-w-none">
                            <p className="text-gray-700 whitespace-pre-wrap">{challenge.instructions}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Challenge Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات التحدي</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaFlag className="text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-600">نوع التحدي</p>
                                    <p className="font-semibold text-gray-900">{challenge.challenge_type_label}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaFlag className="text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-600">الفئة</p>
                                    <p className="font-semibold text-gray-900">{getCategoryLabel(challenge.category)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaUser className="text-purple-500" />
                                <div>
                                    <p className="text-sm text-gray-600">الفئة العمرية</p>
                                    <p className="font-semibold text-gray-900">{getAgeGroupLabel(challenge.age_group)}</p>
                                </div>
                            </div>

                            {challenge.difficulty && (
                                <div className="flex items-center gap-3">
                                    <FaStar className={getDifficultyColor(challenge.difficulty).icon} />
                                    <div>
                                        <p className="text-sm text-gray-600">مستوى الصعوبة</p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(challenge.difficulty).bg} ${getDifficultyColor(challenge.difficulty).text}`}>
                                            {getDifficultyLabel(challenge.difficulty)}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {challenge.school && (
                                <div className="flex items-center gap-3">
                                    <FaTrophy className="text-yellow-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">المدرسة</p>
                                        <p className="font-semibold text-gray-900">{challenge.school.name}</p>
                                        {challenge.school.email && (
                                            <p className="text-xs text-gray-500">{challenge.school.email}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {challenge.creator && (
                                <div className="flex items-center gap-3">
                                    <FaUser className="text-indigo-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">المنشئ</p>
                                        <p className="font-semibold text-gray-900">{challenge.creator.name}</p>
                                        {challenge.creator.email && (
                                            <p className="text-xs text-gray-500">{challenge.creator.email}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">التواريخ</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaCalendar className="text-green-500" />
                                <div>
                                    <p className="text-sm text-gray-600">تاريخ البدء</p>
                                    <p className="font-semibold text-gray-900">{new Date(challenge.start_date).toLocaleString('en-US')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <FaClock className="text-red-500" />
                                <div>
                                    <p className="text-sm text-gray-600">تاريخ الانتهاء</p>
                                    <p className="font-semibold text-gray-900">{new Date(challenge.deadline).toLocaleString('en-US')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">الإحصائيات</h2>
                        <div className="space-y-4">
                            {challenge.points_reward > 0 && (
                                <div className="flex items-center gap-3">
                                    <FaCoins className="text-yellow-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">نقاط المكافأة</p>
                                        <p className="font-semibold text-gray-900">{challenge.points_reward} نقطة</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <FaUsers className="text-blue-500" />
                                <div>
                                    <p className="text-sm text-gray-600">المشاركون</p>
                                    <p className="font-semibold text-gray-900">
                                        {challenge.current_participants || 0}
                                        {challenge.max_participants ? ` / ${challenge.max_participants}` : ' / غير محدود'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Students */}
                    {challenge.school_id && challenge.assigned_students && challenge.assigned_students.length > 0 && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">الطلاب المعينون</h2>
                                <Link
                                    href={route('admin.challenges.assign-students', challenge.id)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                                >
                                    تعديل
                                </Link>
                            </div>
                            <div className="space-y-2">
                                {challenge.assigned_students.map((student) => {
                                    const getTypeIcon = (type) => {
                                        switch (type) {
                                            case 'mandatory':
                                                return <FaExclamationCircle className="text-red-500" />;
                                            case 'favorite':
                                                return <FaStar className="text-yellow-500" />;
                                            default:
                                                return <FaCheckCircle className="text-green-500" />;
                                        }
                                    };
                                    const getTypeLabel = (type) => {
                                        switch (type) {
                                            case 'mandatory':
                                                return 'إلزامي';
                                            case 'favorite':
                                                return 'مفضل';
                                            default:
                                                return 'اختياري';
                                        }
                                    };
                                    const getTypeColor = (type) => {
                                        switch (type) {
                                            case 'mandatory':
                                                return 'bg-red-100 text-red-800';
                                            case 'favorite':
                                                return 'bg-yellow-100 text-yellow-800';
                                            default:
                                                return 'bg-green-100 text-green-800';
                                        }
                                    };

                                    return (
                                        <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <FaUser className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">{student.name}</span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getTypeColor(student.participation_type)}`}>
                                                {getTypeIcon(student.participation_type)}
                                                {getTypeLabel(student.participation_type)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Timestamps */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات إضافية</h2>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p><strong>تاريخ الإنشاء:</strong> {challenge.created_at}</p>
                            <p><strong>آخر تحديث:</strong> {challenge.updated_at}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
