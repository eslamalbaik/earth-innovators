import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import {
    FaUsers,
    FaBookOpen,
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
    FaHeart,
    FaBell,
    FaCheck,
    FaMedal,
    FaAward
} from 'react-icons/fa';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import UserEngagementCard from '@/Components/Dashboard/UserEngagementCard';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function AdminDashboard({
    auth,
    kpis,
    usersByRole,
    publishedProjects,
    recentPayments,
    subscriptions,
    paymentStats,
    subscriptionStats,
    chartData,
    selectedYear = new Date().getFullYear(),
    availableYears = [],
    engagementData = null,
    notifications = null,
    unread_count = 0
}) {
    const [currentYear, setCurrentYear] = useState(selectedYear);
    const [loading, setLoading] = useState(false);
    const [chartDataState, setChartDataState] = useState(chartData || null);
    const [error, setError] = useState(null);

    const handleMarkAsRead = useCallback((notificationId) => {
        router.post(`/notifications/${notificationId}/read`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['notifications', 'unread_count'] });
            },
        });
    }, []);

    const handleMarkAllAsRead = useCallback(() => {
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['notifications', 'unread_count'] });
            },
        });
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'badge_awarded':
                return <FaMedal className="text-xl text-orange-500" />;
            case 'project_evaluated':
                return <FaCheckCircle className="text-xl text-green-500" />;
            default:
                return <FaBell className="text-xl text-blue-500" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'badge_awarded':
                return 'bg-orange-50 border-orange-200';
            case 'project_evaluated':
                return 'bg-green-50 border-green-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    // Initialize chart data from props on mount
    useEffect(() => {
        if (chartData) {
            setChartDataState(chartData);
            if (chartData.year) {
                setCurrentYear(chartData.year);
            }
        }
    }, []); // Only run on mount
    const formatCurrency = (amount) => {
        const formatted = new Intl.NumberFormat('ar-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 0,
        }).format(amount || 0);
        // Ensure RTL formatting: "0 د.إ."
        return formatted;
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
            <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
            </span>
        );
    };

    const handleYearChange = useCallback(async (year) => {
        const yearInt = parseInt(year);
        if (isNaN(yearInt)) {
            setError('سنة غير صحيحة');
            return;
        }

        setCurrentYear(yearInt);
        setLoading(true);
        setError(null);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (token) {
                axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
            }

            // Use the route helper or construct URL manually
            const url = typeof route !== 'undefined'
                ? route('admin.dashboard.chart-data')
                : '/admin/dashboard/chart-data';

            const response = await axios.get(url, {
                params: { year: yearInt },
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });

            if (response.data && response.data.labels) {
                setChartDataState(response.data);
                setError(null);
            } else {
                const errorMsg = 'بيانات غير صحيحة من الخادم';
                setError(errorMsg);
            }
        } catch (error) {
            let errorMsg = 'حدث خطأ أثناء جلب البيانات';

            if (error.response) {
                if (error.response.status === 404) {
                    errorMsg = 'المسار غير موجود';
                } else if (error.response.status === 500) {
                    errorMsg = 'خطأ في الخادم';
                } else if (error.response.data && error.response.data.error) {
                    errorMsg = error.response.data.error;
                }
            } else if (error.request) {
                errorMsg = 'لا يوجد اتصال بالخادم';
            } else {
                errorMsg = error.message || 'خطأ غير معروف';
            }

            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const chartConfig = useMemo(() => {
        if (!chartDataState) {
            return null;
        }

        // Create gradient functions for backgroundColor
        const createProjectsGradient = (ctx, chartArea) => {
            if (!chartArea) return 'rgba(34, 197, 94, 0.2)';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
            gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.15)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
            return gradient;
        };

        const createUsersGradient = (ctx, chartArea) => {
            if (!chartArea) return 'rgba(59, 130, 246, 0.2)';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
            gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
            gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
            return gradient;
        };

        return {
            labels: chartDataState.labels || [],
            datasets: [
                {
                    label: 'المشاريع',
                    data: chartDataState.projects || [],
                    borderColor: 'rgb(34, 197, 94)', // Green
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) return 'rgba(34, 197, 94, 0.2)';
                        return createProjectsGradient(ctx, chartArea);
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    borderWidth: 2,
                },
                {
                    label: 'المستخدمون',
                    data: chartDataState.users || [],
                    borderColor: 'rgb(59, 130, 246)', // Blue
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const { ctx, chartArea } = chart;
                        if (!chartArea) return 'rgba(59, 130, 246, 0.2)';
                        return createUsersGradient(ctx, chartArea);
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    borderWidth: 2,
                },
            ],
        };
    }, [chartDataState]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'start',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 15,
                    font: {
                        size: 14,
                        family: "'Cairo', sans-serif",
                    },
                    color: '#374151',
                },
            },
            title: {
                display: true,
                text: `نشاط المنصة (${currentYear})`,
                position: 'top',
                align: 'start',
                font: {
                    size: 18,
                    weight: 'bold',
                    family: "'Cairo', sans-serif",
                },
                color: '#111827',
                padding: {
                    bottom: 20,
                },
            },
            tooltip: {
                enabled: true,
                rtl: true,
            },
        },
        scales: {
            x: {
                reverse: true, // RTL: Start from right (January) to left (December)
                grid: {
                    display: false,
                },
                border: {
                    display: true,
                    color: '#E5E7EB',
                },
                ticks: {
                    font: {
                        size: 12,
                        family: "'Cairo', sans-serif",
                    },
                    color: '#6B7280',
                },
            },
            y: {
                beginAtZero: true,
                max: 160,
                grid: {
                    display: false,
                },
                border: {
                    display: true,
                    color: '#E5E7EB',
                },
                ticks: {
                    stepSize: 40,
                    font: {
                        size: 12,
                        family: "'Cairo', sans-serif",
                    },
                    color: '#6B7280',
                },
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    }), [currentYear]);

    return (
        <DashboardLayout header="لوحة التحكم">
            <Head title="لوحة التحكم" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* إجمالي المشاريع */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-2">إجمالي المشاريع</p>
                            <p className="text-3xl font-bold text-gray-900">{kpis.total_projects || 0}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-2xl">
                            <FaBookOpen className="text-2xl text-blue-600" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                        <span className="text-gray-600">منشور: <span className="font-semibold text-gray-900">{kpis.published_projects || 0}</span></span>
                        <span className="text-gray-600">قيد المراجعة: <span className="font-semibold text-gray-900">{kpis.pending_projects || 0}</span></span>
                    </div>
                </div>

                {/* إجمالي المستخدمين */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-2">إجمالي المستخدمين</p>
                            <p className="text-3xl font-bold text-gray-900">{kpis.total_users || 0}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-2xl">
                            <FaUsers className="text-2xl text-purple-600" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                        <span className="text-gray-600">مؤسسات تعليمية: <span className="font-semibold text-gray-900">{usersByRole.schools || 0}</span></span>
                        <span className="text-gray-600">طلاب: <span className="font-semibold text-gray-900">{usersByRole.students || 0}</span></span>
                        <span className="text-gray-600">معلمين: <span className="font-semibold text-gray-900">{usersByRole.teachers || 0}</span></span>
                    </div>
                </div>

                {/* إجمالي الإيرادات */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-2">إجمالي الإيرادات</p>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(kpis.total_revenue || 0)}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-2xl">
                            <FaChartLine className="text-2xl text-green-600" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm pt-3 border-t border-gray-100">
                        <FaChartLine className="ml-1 text-gray-400" />
                        <span className="text-gray-600">من الاشتراكات: <span className="font-semibold text-gray-900">{formatCurrency(kpis.subscription_revenue || 0)}</span></span>
                    </div>
                </div>

                {/* الاشتراكات النشطة */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-2">الاشتراكات النشطة</p>
                            <p className="text-3xl font-bold text-gray-900">{kpis.active_subscriptions || 0}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-2xl">
                            <FaCreditCard className="text-2xl text-orange-600" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm pt-3 border-t border-gray-100">
                        <span className="text-gray-600">من إجمالي: <span className="font-semibold text-gray-900">{kpis.total_subscriptions || 0}</span> اشتراك</span>
                    </div>
                </div>
            </div>
            <div className="">
                {/* مؤشر تفاعل الطلاب - في الأعلى */}
                <div className="mb-8">
                    <UserEngagementCard
                        listItems={engagementData?.listItems || []}
                        chartData={engagementData?.chartData || []}
                        trendPercentage={engagementData?.trendPercentage || "+0%"}
                    />
                </div>

                {/* KPIs Cards - Modern SaaS Style */}


            {/* Analytical Reports Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8" dir="rtl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">التقارير التحليلية</h2>
                        <p className="text-gray-600 text-sm">نظرة شاملة على أداء المنصة والنمو الابتكاري</p>
                    </div>
                    {availableYears && availableYears.length > 0 && (
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-3">
                                <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                                    السنة:
                                </label>
                                <select
                                    id="year-select"
                                    value={currentYear}
                                    onChange={(e) => {
                                        const newYear = parseInt(e.target.value);
                                        if (newYear !== currentYear) {
                                            handleYearChange(newYear);
                                        }
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {availableYears.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                {loading && (
                                    <div className="flex items-center text-blue-600">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            {error && (
                                <div className="text-red-600 text-xs bg-red-50 px-3 py-1 rounded border border-red-200">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="h-[500px] w-full">
                    {chartConfig ? (
                        <Line
                            data={chartConfig}
                            options={chartOptions}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            لا توجد بيانات متاحة
                        </div>
                    )}
                </div>
            </div>

            {/* المشاريع المنشورة */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">المشاريع المنشورة</h3>
                    <Link
                        href={route('admin.projects.index')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                        عرض الكل
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">المشروع</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">الطالب</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">المدرسة</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">المعلم</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">المشاهدات</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">الإعجابات</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">تاريخ النشر</th>
                            </tr>
                        </thead>
                        <tbody>
                            {publishedProjects && publishedProjects.length > 0 ? (
                                publishedProjects.map((project) => (
                                    <tr key={project.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                                        <td className="py-3 px-4">
                                            <Link
                                                href={route('admin.projects.show', project.id)}
                                                className="text-blue-600 hover:text-blue-700 font-medium"
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">المدفوعات الأخيرة</h3>
                        <Link
                            href={route('payments.index')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                        >
                            عرض الكل
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentPayments && recentPayments.length > 0 ? (
                            recentPayments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition">
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
                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي الإيرادات</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(paymentStats.total_revenue || 0)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">مكتملة</p>
                            <p className="text-lg font-bold text-blue-600">{paymentStats.completed_payments || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">قيد الانتظار</p>
                            <p className="text-lg font-bold text-yellow-600">{paymentStats.pending_payments || 0}</p>
                        </div>
                    </div>
                </div>

                {/* طلبات الاشتراك */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">طلبات الاشتراك</h3>
                        <Link
                            href={route('admin.packages.index')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                        >
                            عرض الكل
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {subscriptions && subscriptions.length > 0 ? (
                            subscriptions.map((subscription) => (
                                <div key={subscription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition">
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
                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي الاشتراكات</p>
                            <p className="text-lg font-bold text-blue-600">{subscriptionStats.total_subscriptions || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">نشطة</p>
                            <p className="text-lg font-bold text-green-600">{subscriptionStats.active_subscriptions || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إيرادات الاشتراكات</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(subscriptionStats.subscription_revenue || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* صندوق الإشعارات */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">الإشعارات</h3>
                        {unread_count > 0 && (
                            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {unread_count}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {unread_count > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
                            >
                                <FaCheckCircle />
                                تحديد الكل كمقروء
                            </button>
                        )}
                        <Link
                            href={route('notifications.index')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                        >
                            عرض الكل
                        </Link>
                    </div>
                </div>
                <div className="space-y-3">
                    {notifications?.data && notifications.data.length > 0 ? (
                        notifications.data.slice(0, 5).map((notification) => {
                            const data = notification.data || {};
                            const isRead = notification.read_at !== null;

                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-xl border transition ${
                                        !isRead
                                            ? getNotificationColor(notification.type) + ' border-l-4 border-l-orange-500'
                                            : 'bg-gray-50 border-gray-100'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`text-sm font-semibold mb-1 ${
                                                        !isRead ? 'text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                        {data.title || 'إشعار جديد'}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                                                        {data.message || 'لديك إشعار جديد'}
                                                    </p>
                                                    {data.badge_name && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="text-lg">{data.badge_icon || '🏅'}</span>
                                                            <span className="text-xs font-medium text-gray-700">
                                                                {data.badge_name}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {notification.created_at_human || notification.created_at}
                                                    </p>
                                                </div>
                                                {!isRead && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="flex-shrink-0 text-gray-400 hover:text-green-600 transition p-1.5 rounded-lg hover:bg-white"
                                                        title="تحديد كمقروء"
                                                    >
                                                        <FaCheck className="text-sm" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <FaBell className="mx-auto text-4xl text-gray-300 mb-3" />
                            <p className="text-sm">لا توجد إشعارات</p>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </DashboardLayout>
    );
}

