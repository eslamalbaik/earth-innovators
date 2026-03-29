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
import { useTranslation } from '@/i18n';

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
    kpis = {},
    workflow = {},
    usersByRole = {},
    publishedProjects = [],
    recentPayments = [],
    subscriptions = [],
    paymentStats = {},
    subscriptionStats = {},
    chartData,
    selectedYear = new Date().getFullYear(),
    availableYears = [],
    engagementData = null,
    notifications = null,
    unread_count = 0
}) {
    const { t, language } = useTranslation();
    const isArabic = language === 'ar';
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
    const formatCurrency = (amount) => new Intl.NumberFormat(isArabic ? 'ar-AE' : 'en-US', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
    }).format(amount || 0);

    const getStatusBadge = (status) => {
        const statusMap = {
            active: { bg: 'bg-green-100', text: 'text-green-800', label: t('common.active') },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('common.pending') },
            expired: { bg: 'bg-red-100', text: 'text-red-800', label: t('common.expired') },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: t('common.cancelled') },
            completed: { bg: 'bg-green-100', text: 'text-green-800', label: t('common.completed') },
            failed: { bg: 'bg-red-100', text: 'text-red-800', label: t('common.failed') },
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
            setError(t('adminDashboardPage.invalidYear'));
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
                setError(t('adminDashboardPage.invalidDataFromServer'));
            }
        } catch (error) {
            let errorMsg = t('adminDashboardPage.fetchError');

            if (error.response) {
                if (error.response.status === 404) {
                    errorMsg = t('adminDashboardPage.routeNotFound');
                } else if (error.response.status === 500) {
                    errorMsg = t('adminDashboardPage.serverError');
                } else if (error.response.data && error.response.data.error) {
                    errorMsg = error.response.data.error;
                }
            } else if (error.request) {
                errorMsg = t('adminDashboardPage.noServerConnection');
            } else {
                errorMsg = error.message || t('adminDashboardPage.unknownError');
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
                    label: t('adminDashboardPage.projectsChartLabel'),
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
                    label: t('adminDashboardPage.usersChartLabel'),
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

    const maxProjects = Math.max(...(chartDataState?.projects || [0]));
    const maxUsers = Math.max(...(chartDataState?.users || [0]));
    const chartMaxValue = Math.max(maxProjects, maxUsers, 40);
    const yAxisMax = Math.ceil(chartMaxValue / 40) * 40;
    const yStepSize = Math.max(10, Math.ceil(yAxisMax / 4));

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
                text: t('adminDashboardPage.platformActivityTitle', { year: currentYear }),
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
                rtl: isArabic,
            },
        },
        scales: {
            x: {
                reverse: isArabic,
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
                max: yAxisMax,
                grid: {
                    display: false,
                },
                border: {
                    display: true,
                    color: '#E5E7EB',
                },
                ticks: {
                    stepSize: yStepSize,
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
    }), [currentYear, yAxisMax, yStepSize]);

    return (
        <DashboardLayout header={t('dashboard.adminDashboard')}>
            <Head title={t('adminDashboardPage.pageTitle')} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-2">{t('adminDashboardPage.totalProjects')}</p>
                            <p className="text-3xl font-bold text-gray-900">{kpis.total_projects || 0}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-2xl">
                            <FaBookOpen className="text-2xl text-blue-600" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                        <span className="text-gray-600">{t('adminDashboardPage.publishedProjects')}: <span className="font-semibold text-gray-900">{kpis.published_projects || 0}</span></span>
                        <span className="text-gray-600">{t('adminDashboardPage.pendingReview')}: <span className="font-semibold text-gray-900">{kpis.pending_projects || 0}</span></span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-2">{t('adminDashboardPage.totalUsers')}</p>
                            <p className="text-3xl font-bold text-gray-900">{kpis.total_users || 0}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-2xl">
                            <FaUsers className="text-2xl text-purple-600" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                        <span className="text-gray-600">{t('adminDashboardPage.educationalInstitutions')}: <span className="font-semibold text-gray-900">{usersByRole.schools || 0}</span></span>
                        <span className="text-gray-600">{t('adminDashboardPage.students')}: <span className="font-semibold text-gray-900">{usersByRole.students || 0}</span></span>
                        <span className="text-gray-600">{t('adminDashboardPage.teachers')}: <span className="font-semibold text-gray-900">{usersByRole.teachers || 0}</span></span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-2">{t('adminDashboardPage.totalRevenue')}</p>
                            <p className="text-3xl font-bold text-gray-900">{formatCurrency(kpis.total_revenue || 0)}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-2xl">
                            <FaChartLine className="text-2xl text-green-600" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm pt-3 border-t border-gray-100">
                        <FaChartLine className="me-1 text-gray-400" />
                        <span className="text-gray-600">{t('adminDashboardPage.subscriptionRevenue')}: <span className="font-semibold text-gray-900">{formatCurrency(kpis.subscription_revenue || 0)}</span></span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-2">{t('adminDashboardPage.activeSubscriptions')}</p>
                            <p className="text-3xl font-bold text-gray-900">{kpis.active_subscriptions || 0}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-2xl">
                            <FaCreditCard className="text-2xl text-orange-600" />
                        </div>
                    </div>
                    <div className="flex items-center text-sm pt-3 border-t border-gray-100">
                        <span className="text-gray-600">{t('adminDashboardPage.totalSubscriptionsSummary', { count: kpis.total_subscriptions || 0 })}</span>
                    </div>
                </div>
            </div>
            <div className="">
                <div className="mb-8">
                    <UserEngagementCard
                        listItems={engagementData?.listItems || []}
                        chartData={engagementData?.chartData || []}
                        trendPercentage={engagementData?.trendPercentage || "+0%"}
                    />
                </div>

                <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{t('adminDashboardPage.workflowTitle')}</h3>
                            <p className="text-sm text-gray-600">{t('adminDashboardPage.workflowSubtitle')}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/admin/projects" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:border-[#A3C042]/40">
                                {t('adminDashboardPage.openProjects')}
                            </Link>
                            <Link href="/admin/publications" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:border-[#A3C042]/40">
                                {t('adminDashboardPage.openPublications')}
                            </Link>
                            <Link href="/admin/certificates" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:border-[#A3C042]/40">
                                {t('adminDashboardPage.openCertificates')}
                            </Link>
                            <Link href="/admin/challenge-suggestions" className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 hover:border-[#A3C042]/40">
                                {t('adminDashboardPage.openChallengeSuggestions')}
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-3 lg:grid-cols-6">
                        <Link href="/admin/projects" className="rounded-xl border border-gray-200 bg-white p-3 transition hover:border-[#A3C042]/40">
                            <div className="text-gray-500">{t('adminDashboardPage.workflow.pendingProjects')}</div>
                            <div className="font-bold text-gray-900">{workflow.pending_projects || 0}</div>
                        </Link>
                        <Link href="/admin/publications" className="rounded-xl border border-gray-200 bg-white p-3 transition hover:border-[#A3C042]/40">
                            <div className="text-gray-500">{t('adminDashboardPage.workflow.pendingPublications')}</div>
                            <div className="font-bold text-gray-900">{workflow.pending_publications || 0}</div>
                        </Link>
                        <Link href="/admin/certificates" className="rounded-xl border border-gray-200 bg-white p-3 transition hover:border-[#A3C042]/40">
                            <div className="text-gray-500">{t('adminDashboardPage.workflow.pendingCertificates')}</div>
                            <div className="font-bold text-gray-900">{workflow.pending_certificates || 0}</div>
                        </Link>
                        <Link href="/admin/store-reward-requests" className="rounded-xl border border-gray-200 bg-white p-3 transition hover:border-[#A3C042]/40">
                            <div className="text-gray-500">{t('adminDashboardPage.workflow.pendingRewardRequests')}</div>
                            <div className="font-bold text-gray-900">{workflow.pending_reward_requests || 0}</div>
                        </Link>
                        <Link href="/admin/payments" className="rounded-xl border border-gray-200 bg-white p-3 transition hover:border-[#A3C042]/40">
                            <div className="text-gray-500">{t('adminDashboardPage.workflow.pendingPayments')}</div>
                            <div className="font-bold text-gray-900">{workflow.pending_payments || 0}</div>
                        </Link>
                        <Link href="/admin/challenge-suggestions" className="rounded-xl border border-gray-200 bg-white p-3 transition hover:border-[#A3C042]/40">
                            <div className="text-gray-500">{t('adminDashboardPage.workflow.pendingChallengeSuggestions')}</div>
                            <div className="font-bold text-gray-900">{workflow.pending_challenge_suggestions || 0}</div>
                        </Link>
                    </div>
                </div>

                {/* KPIs Cards - Modern SaaS Style */}


            {/* Analytical Reports Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8" dir={isArabic ? 'rtl' : 'ltr'}>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('adminDashboardPage.analyticsReportsTitle')}</h2>
                        <p className="text-gray-600 text-sm">{t('adminDashboardPage.analyticsReportsSubtitle')}</p>
                    </div>
                    {availableYears && availableYears.length > 0 && (
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-3">
                                <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                                    {t('adminDashboardPage.yearLabel')}:
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
                            {t('adminDashboardPage.noData')}
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">{t('adminDashboardPage.publishedProjectsTitle')}</h3>
                    <Link
                        href={route('admin.projects.index')}
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                        {t('common.viewAll')}
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">{t('adminDashboardPage.projectColumn')}</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">{t('adminDashboardPage.studentColumn')}</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">{t('adminDashboardPage.schoolColumn')}</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">{t('adminDashboardPage.teacherColumn')}</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">{t('adminDashboardPage.viewsColumn')}</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">{t('adminDashboardPage.likesColumn')}</th>
                                <th className=" py-3 px-4 text-sm font-semibold text-gray-700">{t('adminDashboardPage.publishDateColumn')}</th>
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
                                        {t('adminDashboardPage.noPublishedProjects')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">{t('adminDashboardPage.recentPaymentsTitle')}</h3>
                        <Link
                            href="/admin/payments"
                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                        >
                            {t('common.viewAll')}
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
                                {t('adminDashboardPage.noPayments')}
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminDashboardPage.paymentsTotalRevenue')}</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(paymentStats.total_revenue || 0)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminDashboardPage.paymentsCompleted')}</p>
                            <p className="text-lg font-bold text-blue-600">{paymentStats.completed_payments || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminDashboardPage.paymentsPending')}</p>
                            <p className="text-lg font-bold text-yellow-600">{paymentStats.pending_payments || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">{t('adminDashboardPage.subscriptionRequestsTitle')}</h3>
                        <Link
                            href={route('admin.packages.index')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                        >
                            {t('common.viewAll')}
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
                                {t('adminDashboardPage.noSubscriptions')}
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminDashboardPage.subscriptionsTotal')}</p>
                            <p className="text-lg font-bold text-blue-600">{subscriptionStats.total_subscriptions || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminDashboardPage.subscriptionsActive')}</p>
                            <p className="text-lg font-bold text-green-600">{subscriptionStats.active_subscriptions || 0}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminDashboardPage.subscriptionsRevenue')}</p>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(subscriptionStats.subscription_revenue || 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900">{t('notifications.title')}</h3>
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
                                {t('notifications.markAllRead')}
                            </button>
                        )}
                        <Link
                            href={route('notifications.index')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                        >
                            {t('notifications.viewAll')}
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
                                                        {data.title || t('notifications.newNotification')}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                                                        {data.message || t('notifications.newNotificationMessage')}
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
                                                        title={t('notifications.markAsRead')}
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
                            <p className="text-sm">{t('notifications.noNotifications')}</p>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </DashboardLayout>
    );
}
