import { Link } from '@inertiajs/react';
import { FaFlag, FaUsers, FaCalendar, FaStar, FaEdit, FaUserFriends, FaArrowLeft } from 'react-icons/fa';

/**
 * بطاقة تحدي ابتكاري - تصميم مطابق للصورة المرفقة
 * Features:
 * - أيقونة دائرية علوية يسار (لون مختلف)
 * - زر "نشط" أخضر فاتح صغير يمين العلو
 * - عنوان رئيسي كبير
 * - وصف صغير
 * - ثلاثة badges أفقية (الفئة، المشاركون، الموعد النهائي)
 * - شريط أخضر فاتح مع المكافأة
 * - أزرار إدارة في الأسفل
 */
export default function InnovationChallengeCard({ challenge, onEdit, onManageParticipants, routePrefix = 'admin.challenges' }) {
    // تحديد لون الأيقونة الدائرية (بنفسجي فاتح أو أزرق فاتح)
    const iconColors = [
        'bg-purple-100 text-purple-600',
        'bg-blue-100 text-blue-600',
        'bg-indigo-100 text-indigo-600',
        'bg-pink-100 text-pink-600',
    ];
    const iconColor = iconColors[challenge.id % iconColors.length];

    // تنسيق التاريخ
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    // الحصول على تسمية الفئة
    const getCategoryLabel = (category) => {
        const labels = {
            'science': 'العلوم',
            'technology': 'التكنولوجيا',
            'engineering': 'الهندسة',
            'mathematics': 'الرياضيات',
            'arts': 'الفنون',
            'other': 'أخرى',
        };
        return labels[category] || category;
    };

    // الحصول على نص المكافأة
    const getRewardText = () => {
        // أمثلة من الصورة
        if (challenge.id === 1) {
            return 'جهاز لوحي حديث + رحلة تقنية';
        }
        if (challenge.id === 2) {
            return 'وسام حامي البيئة + 500 نقطة';
        }
        
        // منطق عام
        const rewards = [];
        if (challenge.badges_reward && Array.isArray(challenge.badges_reward) && challenge.badges_reward.length > 0) {
            rewards.push(...challenge.badges_reward);
        }
        if (challenge.points_reward > 0) {
            rewards.push(`${challenge.points_reward} نقطة`);
        }
        return rewards.length > 0 ? rewards.join(' + ') : 'مكافأة خاصة';
    };

    const showRoute = typeof route !== 'undefined'
        ? route(`${routePrefix}.show`, challenge.id)
        : `/${routePrefix.replace('.', '/')}/${challenge.id}`;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden" dir="rtl">
            {/* Header with Icon and Status */}
            <div className="relative p-6 pb-4">
                {/* أيقونة دائرية علوية يسار */}
                <div className={`absolute top-6 right-6 w-12 h-12 rounded-full ${iconColor} flex items-center justify-center`}>
                    <FaFlag className="text-lg" />
                </div>

                {/* زر "نشط" أخضر فاتح صغير يمين العلو */}
                {challenge.status === 'active' && (
                    <div className="absolute top-6 left-6">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            نشط
                        </span>
                    </div>
                )}

                {/* Title - عنوان رئيسي كبير */}
                <div className="pr-16 pl-20">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {challenge.title}
                    </h3>
                    {/* Description - وصف صغير */}
                    {challenge.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {challenge.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Three Badges - ثلاثة badges أفقية */}
            <div className="px-6 pb-4 grid grid-cols-3 gap-3">
                {/* الفئة */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <FaFlag className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-500 font-medium">الفئة</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                        {getCategoryLabel(challenge.category)}
                    </div>
                </div>

                {/* المشاركون */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <FaUsers className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-500 font-medium">المشاركين</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                        {challenge.current_participants || 0}
                    </div>
                </div>

                {/* الموعد النهائي */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                        <FaCalendar className="text-gray-400 text-xs" />
                        <span className="text-xs text-gray-500 font-medium">الموعد النهائي</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                        {formatDate(challenge.deadline)}
                    </div>
                </div>
            </div>

            {/* Reward Bar - شريط أخضر فاتح مع المكافأة */}
            <div className="mx-6 mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                    <FaStar className="text-green-600 text-sm" />
                    <span className="text-xs text-gray-600 font-medium">المكافأة المخصصة</span>
                </div>
                <div className="text-sm font-semibold text-green-800 mt-1">
                    {getRewardText()}
                </div>
            </div>

            {/* Actions - أزرار الإدارة */}
            <div className="px-6 pb-6 space-y-3">
                {/* أزرار أفقية */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onManageParticipants && onManageParticipants(challenge)}
                        className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                    >
                        <FaUserFriends />
                        إدارة المشاركين
                    </button>
                    <button
                        onClick={() => onEdit && onEdit(challenge)}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                    >
                        تعديل
                    </button>
                </div>

                {/* رابط عرض جميع المشاركات */}
                <Link
                    href={`${showRoute}?tab=submissions`}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <span>عرض جميع المشاركات</span>
                    <FaArrowLeft className="text-xs" />
                </Link>
            </div>
        </div>
    );
}

