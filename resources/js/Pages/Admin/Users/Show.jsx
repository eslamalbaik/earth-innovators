import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    FaArrowRight, 
    FaEdit, 
    FaTrash, 
    FaUser, 
    FaEnvelope, 
    FaPhone, 
    FaSchool, 
    FaStar,
    FaCalendar,
    FaCheckCircle,
    FaBookOpen,
    FaFileAlt,
    FaAward,
    FaTrophy,
    FaEye,
    FaHeart,
    FaFlag
} from 'react-icons/fa';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function UsersShow({ user, contributions, auth }) {
    const { confirm } = useConfirmDialog();

    const handleDelete = async () => {
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: `هل أنت متأكد من حذف المستخدم "${user.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    const getRoleBadge = (role) => {
        const roleMap = {
            'admin': { bg: 'bg-red-100', text: 'text-red-800', label: 'أدمن' },
            'teacher': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'معلم' },
            'student': { bg: 'bg-green-100', text: 'text-green-800', label: 'طالب' },
            'school': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مدرسة' },
        };
        const roleConfig = roleMap[role] || { bg: 'bg-gray-100', text: 'text-gray-800', label: role };
        return (
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${roleConfig.bg} ${roleConfig.text}`}>
                {roleConfig.label}
            </span>
        );
    };

    return (
        <DashboardLayout header="تفاصيل المستخدم" auth={auth}>
            <Head title={`${user.name} - تفاصيل المستخدم`} />

            <div className="mb-6">
                <Link
                    href={route('admin.users.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة المستخدمين
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* User Info Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                    {user.image ? (
                                        <img src={user.image} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                                    ) : (
                                        <FaUser className="text-4xl text-blue-600" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h1>
                                    {getRoleBadge(user.role)}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={route('admin.users.edit', user.id)}
                                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg flex items-center gap-2"
                                >
                                    <FaEdit />
                                    تعديل
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center gap-2"
                                >
                                    <FaTrash />
                                    حذف
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FaEnvelope className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                                    <p className="font-semibold text-gray-900">{user.email}</p>
                                </div>
                            </div>

                            {user.phone && (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FaPhone className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">الهاتف</p>
                                        <p className="font-semibold text-gray-900">{user.phone}</p>
                                    </div>
                                </div>
                            )}

                            {(user.school || user.school_id) && (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <FaSchool className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">المدرسة</p>
                                        <p className="font-semibold text-gray-900">
                                            {user.school?.name || 'غير محدد'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {user.role === 'student' && (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <FaStar className="text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">النقاط</p>
                                        <p className="font-semibold text-gray-900">{user.points || 0}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contributions Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">المساهمات والإنجازات</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Projects */}
                            {contributions?.projects && contributions.projects.total > 0 && (
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <FaBookOpen className="text-blue-600 text-xl" />
                                            <h3 className="font-semibold text-gray-900">المشاريع</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">الإجمالي:</span>
                                            <span className="font-bold text-gray-900">{contributions.projects.total}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">معتمدة:</span>
                                            <span className="font-semibold text-green-600">{contributions.projects.approved}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">قيد المراجعة:</span>
                                            <span className="font-semibold text-yellow-600">{contributions.projects.pending}</span>
                                        </div>
                                        {contributions.projects.rejected > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">مرفوضة:</span>
                                                <span className="font-semibold text-red-600">{contributions.projects.rejected}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Publications */}
                            {contributions?.publications && contributions.publications.total > 0 && (
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <FaFileAlt className="text-purple-600 text-xl" />
                                            <h3 className="font-semibold text-gray-900">المقالات</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">الإجمالي:</span>
                                            <span className="font-bold text-gray-900">{contributions.publications.total}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">معتمدة:</span>
                                            <span className="font-semibold text-green-600">{contributions.publications.approved}</span>
                                        </div>
                                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-purple-200">
                                            <div className="flex items-center gap-1">
                                                <FaEye className="text-purple-500" />
                                                <span className="text-sm text-gray-600">{contributions.publications.total_views || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaHeart className="text-red-500" />
                                                <span className="text-sm text-gray-600">{contributions.publications.total_likes || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Badges */}
                            {contributions?.badges && contributions.badges.total > 0 && (
                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <FaAward className="text-yellow-600 text-xl" />
                                            <h3 className="font-semibold text-gray-900">الشارات</h3>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <span className="text-2xl font-bold text-gray-900">{contributions.badges.total}</span>
                                        <span className="text-sm text-gray-600 mr-2">شارة</span>
                                    </div>
                                    {contributions.badges.list && contributions.badges.list.length > 0 && (
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {contributions.badges.list.slice(0, 5).map((badge) => (
                                                <div key={badge.id} className="flex items-center gap-2 text-sm">
                                                    <FaTrophy className="text-yellow-600" />
                                                    <span className="text-gray-700">{badge.badge.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Teacher Projects */}
                            {contributions?.teacher_projects && contributions.teacher_projects.total > 0 && (
                                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <FaBookOpen className="text-green-600 text-xl" />
                                            <h3 className="font-semibold text-gray-900">مشاريع المعلم</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">الإجمالي:</span>
                                            <span className="font-bold text-gray-900">{contributions.teacher_projects.total}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">معتمدة:</span>
                                            <span className="font-semibold text-green-600">{contributions.teacher_projects.approved}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Challenges */}
                            {contributions?.challenges && contributions.challenges.total > 0 && (
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <FaFlag className="text-orange-600 text-xl" />
                                            <h3 className="font-semibold text-gray-900">التحديات</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">الإجمالي:</span>
                                            <span className="font-bold text-gray-900">{contributions.challenges.total}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">نشطة:</span>
                                            <span className="font-semibold text-blue-600">{contributions.challenges.active}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">مكتملة:</span>
                                            <span className="font-semibold text-green-600">{contributions.challenges.completed}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Show message if no contributions */}
                        {(!contributions || 
                          (contributions.projects?.total === 0 && 
                           contributions.publications?.total === 0 && 
                           contributions.badges?.total === 0 && 
                           contributions.teacher_projects?.total === 0 && 
                           contributions.challenges?.total === 0)) && (
                            <div className="text-center py-8 text-gray-500">
                                <FaAward className="text-4xl text-gray-300 mx-auto mb-3" />
                                <p>لا توجد مساهمات حتى الآن</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Account Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات الحساب</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">تاريخ التسجيل</p>
                                <div className="flex items-center gap-2">
                                    <FaCalendar className="text-gray-400" />
                                    <p className="font-semibold text-gray-900">{user.created_at}</p>
                                </div>
                            </div>
                            {user.email_verified_at && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">البريد الإلكتروني</p>
                                    <div className="flex items-center gap-2">
                                        <FaCheckCircle className="text-green-500" />
                                        <p className="font-semibold text-green-600">مؤكد</p>
                                        <span className="text-xs text-gray-500">({user.email_verified_at})</span>
                                    </div>
                                </div>
                            )}
                            {!user.email_verified_at && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">البريد الإلكتروني</p>
                                    <div className="flex items-center gap-2">
                                        <FaCheckCircle className="text-gray-400" />
                                        <p className="font-semibold text-gray-600">غير مؤكد</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
                        <div className="space-y-3">
                            <Link
                                href={route('admin.users.edit', user.id)}
                                className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-center transition"
                            >
                                تعديل المستخدم
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="block w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                            >
                                حذف المستخدم
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

