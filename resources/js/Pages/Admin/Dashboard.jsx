import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    FaUsers, 
    FaBookOpen, 
    FaDollarSign, 
    FaChartLine, 
    FaSchool, 
    FaGraduationCap, 
    FaChalkboardTeacher,
    FaFileAlt,
    FaCreditCard,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaEye,
    FaHeart
} from 'react-icons/fa';

export default function AdminDashboard({ 
    auth, 
    kpis, 
    usersByRole, 
    publishedProjects, 
    recentPayments, 
    subscriptions,
    paymentStats,
    subscriptionStats
}) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط' },
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'قيد الانتظار' },
            'expired': { bg: 'bg-red-100', text: 'text-red-800', label: 'منتهي' },
            'cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'ملغي' },
            'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'مكتمل' },
            'failed': { bg: 'bg-red-100', text: 'text-red-800', label: 'فاشل' },
        };

        const statusConfig = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
            </span>
        );
    };

    return (
        <DashboardLayout header="لوحة التحكم - أرث مبتكرين">
            <Head title="لوحة التحكم" />

            {/* KPIs Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* إجمالي المشاريع */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-blue-100 text-sm mb-1">إجمالي المشاريع</p>
                            <p className="text-3xl font-bold">{kpis.total_projects || 0}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FaBookOpen className="text-2xl" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-100">منشور: {kpis.published_projects || 0}</span>
                        <span className="text-blue-100">قيد المراجعة: {kpis.pending_projects || 0}</span>
                    </div>
                </div>

                {/* إجمالي المستخدمين */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-purple-100 text-sm mb-1">إجمالي المستخدمين</p>
                            <p className="text-3xl font-bold">{kpis.total_users || 0}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FaUsers className="text-2xl" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-purple-100">مدارس: {usersByRole.schools || 0}</span>
                        <span className="text-purple-100">طلاب: {usersByRole.students || 0}</span>
                        <span className="text-purple-100">معلمين: {usersByRole.teachers || 0}</span>
                    </div>
                </div>

                {/* إجمالي الإيرادات */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-green-100 text-sm mb-1">إجمالي الإيرادات</p>
                            <p className="text-3xl font-bold">{formatCurrency(kpis.total_revenue || 0)}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FaDollarSign className="text-2xl" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm">
                        <FaChartLine className="ml-1" />
                        <span>من الاشتراكات: {formatCurrency(kpis.subscription_revenue || 0)}</span>
                    </div>
                </div>

                {/* الاشتراكات النشطة */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-orange-100 text-sm mb-1">الاشتراكات النشطة</p>
                            <p className="text-3xl font-bold">{kpis.active_subscriptions || 0}</p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl">
                            <FaCreditCard className="text-2xl" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm">
                        <span>من إجمالي: {kpis.total_subscriptions || 0} اشتراك</span>
                    </div>
                </div>
            </div>

            {/* تفاصيل المستخدمين */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">المدارس</h3>
                        <FaSchool className="text-2xl text-blue-500" />
                    </div>
                    <p className="text-4xl font-bold text-blue-600 mb-2">{usersByRole.schools || 0}</p>
                    <p className="text-sm text-gray-600">مدرسة مسجلة</p>
                    <Link 
                        href={route('admin.users.index')} 
                        className="text-blue-600 hover:text-blue-800 text-sm mt-4 inline-block"
                    >
                        عرض التفاصيل →
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">الطلاب</h3>
                        <FaGraduationCap className="text-2xl text-green-500" />
                    </div>
                    <p className="text-4xl font-bold text-green-600 mb-2">{usersByRole.students || 0}</p>
                    <p className="text-sm text-gray-600">طالب مسجل</p>
                    <Link 
                        href={route('admin.students.index')} 
                        className="text-green-600 hover:text-green-800 text-sm mt-4 inline-block"
                    >
                        عرض التفاصيل →
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">المعلمون</h3>
                        <FaChalkboardTeacher className="text-2xl text-purple-500" />
                    </div>
                    <p className="text-4xl font-bold text-purple-600 mb-2">{usersByRole.teachers || 0}</p>
                    <p className="text-sm text-gray-600">معلم مسجل</p>
                    <Link 
                        href={route('admin.teachers.index')} 
                        className="text-purple-600 hover:text-purple-800 text-sm mt-4 inline-block"
                    >
                        عرض التفاصيل →
                    </Link>
                </div>
            </div>

            {/* المشاريع المنشورة */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">المشاريع المنشورة</h3>
                    <Link 
                        href={route('admin.projects.index')} 
                        className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                    >
                        عرض الكل →
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">المشروع</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">الطالب</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">المدرسة</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">المعلم</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">المشاهدات</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">الإعجابات</th>
                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">تاريخ النشر</th>
                            </tr>
                        </thead>
                        <tbody>
                            {publishedProjects && publishedProjects.length > 0 ? (
                                publishedProjects.map((project) => (
                                    <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <Link 
                                                href={route('admin.projects.show', project.id)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                {project.title}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{project.student_name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{project.school_name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{project.teacher_name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            <div className="flex items-center gap-1">
                                                <FaEye className="text-gray-400" />
                                                {project.views}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            <div className="flex items-center gap-1">
                                                <FaHeart className="text-red-400" />
                                                {project.likes}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{project.approved_at || project.created_at}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-gray-500">
                                        لا توجد مشاريع منشورة
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* المدفوعات والاشتراكات */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* المدفوعات الأخيرة */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">المدفوعات الأخيرة</h3>
                        <Link 
                            href={route('payments.index')} 
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                        >
                            عرض الكل →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentPayments && recentPayments.length > 0 ? (
                            recentPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{payment.user_name}</p>
                                        <p className="text-sm text-gray-600">{payment.payment_method}</p>
                                        <p className="text-xs text-gray-500 mt-1">{payment.paid_at}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                                        {getStatusBadge(payment.status)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                لا توجد مدفوعات
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(paymentStats.total_revenue || 0)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">مكتملة</p>
                            <p className="text-lg font-bold text-blue-600">{paymentStats.completed_payments || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">قيد الانتظار</p>
                            <p className="text-lg font-bold text-yellow-600">{paymentStats.pending_payments || 0}</p>
                        </div>
                    </div>
                </div>

                {/* طلبات الاشتراك */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">طلبات الاشتراك</h3>
                        <Link 
                            href={route('admin.packages.index')} 
                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                        >
                            عرض الكل →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {subscriptions && subscriptions.length > 0 ? (
                            subscriptions.map((subscription) => (
                                <div key={subscription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{subscription.user_name}</p>
                                        <p className="text-sm text-gray-600">{subscription.package_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {subscription.start_date} - {subscription.end_date}
                                        </p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-green-600">{formatCurrency(subscription.paid_amount)}</p>
                                        {getStatusBadge(subscription.status)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                لا توجد اشتراكات
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">إجمالي الاشتراكات</p>
                            <p className="text-lg font-bold text-blue-600">{subscriptionStats.total_subscriptions || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">نشطة</p>
                            <p className="text-lg font-bold text-green-600">{subscriptionStats.active_subscriptions || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">إيرادات الاشتراكات</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(subscriptionStats.subscription_revenue || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

