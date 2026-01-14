import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FaTrophy, FaPlus, FaCalendar, FaEye, FaEdit, FaTrash, FaUsers, FaCheckCircle, FaTimes, FaTable, FaTh, FaSearch, FaUser, FaStar, FaClock, FaArrowLeft } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import ChallengeTable from '@/Components/Challenges/ChallengeTable';
import ChallengeCardGrid from '@/Components/Challenges/ChallengeCardGrid';
import ModernChallengeTable from '@/Components/Challenges/ModernChallengeTable';
import ModernChallengeCardGrid from '@/Components/Challenges/ModernChallengeCard';
import InnovationChallengeCard from '@/Components/Challenges/InnovationChallengeCard';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function SchoolChallengesIndex({ auth, challenges, stats, filters, submissions = null, selectedChallenge = null }) {
    const { flash } = usePage().props;
    const { confirm } = useConfirmDialog();
    const [processing, setProcessing] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [activeTab, setActiveTab] = useState(selectedChallenge ? 'submissions' : 'challenges');
    const [submissionStatusFilter, setSubmissionStatusFilter] = useState(filters?.submission_status || '');

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        const url = typeof route !== 'undefined' 
            ? route('school.challenges.index')
            : '/school/challenges';
        router.get(url, {
            status: status || undefined,
        }, {
            preserveState: true,
        });
    };

    const handleDelete = async (challengeId) => {
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: 'هل أنت متأكد من حذف هذا التحدي؟ هذا الإجراء لا يمكن التراجع عنه.',
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger',
        });

        if (confirmed) {
            setProcessing(challengeId);
            const url = typeof route !== 'undefined'
                ? route('school.challenges.destroy', challengeId)
                : `/school/challenges/${challengeId}`;
            router.delete(url, {
                preserveScroll: true,
                onFinish: () => setProcessing(null),
            });
        }
    };

    const handleView = (challenge) => {
        router.visit(`/challenges/${challenge.id}`);
    };

    const handleEdit = (challenge) => {
        const url = typeof route !== 'undefined'
            ? route('school.challenges.edit', challenge.id)
            : `/school/challenges/${challenge.id}/edit`;
        router.visit(url);
    };

    const handleViewSubmissions = (challenge) => {
        const url = typeof route !== 'undefined'
            ? route('school.challenges.index')
            : '/school/challenges';
        router.get(url, {
            challenge_id: challenge.id,
        }, {
            preserveState: false,
            preserveScroll: false,
        });
    };

    const handleSubmissionStatusFilter = (status) => {
        setSubmissionStatusFilter(status);
        if (selectedChallenge) {
            const url = typeof route !== 'undefined'
                ? route('school.challenge-submissions.index')
                : '/school/challenge-submissions';
            router.get(url, {
                challenge_id: selectedChallenge.id,
                status: status || undefined,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const getSubmissionStatusBadge = (status) => {
        const badges = {
            submitted: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'مُسلم', icon: FaClock },
            reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'تم المراجعة', icon: FaCheckCircle },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'مقبول', icon: FaCheckCircle },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'مرفوض', icon: FaTimes },
        };
        return badges[status] || badges.submitted;
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

    useEffect(() => {
        if (flash?.success) {
            setToastMessage(flash.success);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        }
        if (flash?.error) {
            setToastMessage(flash.error);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
        }
    }, [flash]);

    // Set active tab based on selectedChallenge
    useEffect(() => {
        if (selectedChallenge) {
            setActiveTab('submissions');
        } else {
            setActiveTab('challenges');
        }
    }, [selectedChallenge]);

    const getStatusBadge = (status) => {
        const badges = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'مسودة', border: 'border-gray-300' },
            active: { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط', border: 'border-green-300' },
            completed: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'منتهي', border: 'border-gray-300' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'ملغي', border: 'border-red-300' },
            upcoming: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'قادم', border: 'border-blue-300' },
        };
        const badge = badges[status] || badges.draft;
        return (
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
                {badge.label}
            </span>
        );
    };

    const challengesData = challenges?.data || [];
    const hasChallenges = challengesData.length > 0;

    return (
        <DashboardLayout
            auth={auth}
            header="التحديات الابتكارية"
        >
            <Head title="التحديات الابتكارية - لوحة المدرسة" />

            <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-gray-600 text-sm font-medium">إجمالي التحديات</div>
                                <FaTrophy className="text-gray-400 text-lg" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{stats?.total || 0}</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-gray-600 text-sm font-medium">نشط</div>
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            </div>
                            <div className="text-3xl font-bold text-green-600">{stats?.active || 0}</div>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-gray-600 text-sm font-medium">مسودة</div>
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            </div>
                            <div className="text-3xl font-bold text-gray-600">{stats?.draft || 0}</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-gray-600 text-sm font-medium">مكتمل</div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            </div>
                            <div className="text-3xl font-bold text-blue-600">{stats?.completed || 0}</div>
                        </div>
                    </div>

                    {/* Header with Actions - تصميم جديد */}
                    <div className="mb-8">
                        {/* Tabs */}
                        <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
                            <button
                                onClick={() => {
                                    setActiveTab('challenges');
                                    router.get(typeof route !== 'undefined' ? route('school.challenges.index') : '/school/challenges', {}, {
                                        preserveState: false,
                                        preserveScroll: false,
                                    });
                                }}
                                className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                    activeTab === 'challenges'
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                التحديات
                            </button>
                            {selectedChallenge && (
                                <button
                                    onClick={() => setActiveTab('submissions')}
                                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                                        activeTab === 'submissions'
                                            ? 'border-green-600 text-green-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    تسليمات: {selectedChallenge.title}
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {activeTab === 'submissions' && selectedChallenge ? `تسليمات: ${selectedChallenge.title}` : 'التحديات الابتكارية'}
                                </h1>
                                <p className="text-gray-600">
                                    {activeTab === 'submissions' ? 'عرض وتقييم تسليمات الطلاب لهذا التحدي' : 'إطلاق وإدارة مسابقات الابتكار بين الطلاب'}
                                </p>
                            </div>
                            {activeTab === 'challenges' && (
                                <Link
                                    href={typeof route !== 'undefined' ? route('school.challenges.create') : '/school/challenges/create'}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                                >
                                    <FaPlus />
                                    إطلاق تحدي جديد
                                </Link>
                            )}
                            {activeTab === 'submissions' && selectedChallenge && (
                                <button
                                    onClick={() => {
                                        setActiveTab('challenges');
                                        router.get(typeof route !== 'undefined' ? route('school.challenges.index') : '/school/challenges', {}, {
                                            preserveState: false,
                                            preserveScroll: false,
                                        });
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                                >
                                    <FaArrowLeft />
                                    العودة إلى التحديات
                                </button>
                            )}
                        </div>

                        {/* Navigation Tabs - شريط التصفية */}
                        {activeTab === 'challenges' && (
                            <>
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <button
                                        onClick={() => handleStatusFilter('')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            !selectedStatus
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        الكل
                                    </button>
                                    <button
                                        onClick={() => handleStatusFilter('completed')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            selectedStatus === 'completed'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        مكتمل
                                    </button>
                                    <button
                                        onClick={() => handleStatusFilter('upcoming')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            selectedStatus === 'upcoming'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        قادم
                                    </button>
                                    <button
                                        onClick={() => handleStatusFilter('active')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            selectedStatus === 'active'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        نشط
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <form onSubmit={(e) => { e.preventDefault(); handleStatusFilter(selectedStatus); }} className="mb-6">
                                    <div className="relative max-w-md">
                                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="ابحث عن تحدي..."
                                            className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Content based on active tab */}
                    {activeTab === 'challenges' ? (
                        <>
                            {/* Challenges Grid - بطاقات التحديات */}
                            {hasChallenges ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {challengesData.map((challenge) => (
                                    <InnovationChallengeCard
                                        key={challenge.id}
                                        challenge={{
                                            ...challenge,
                                            school_name: challenge.school?.name || 'مدرستك',
                                            creator_name: challenge.creator?.name || '',
                                            challenge_type_label: getChallengeTypeLabel(challenge.challenge_type),
                                        }}
                                        onEdit={handleEdit}
                                    onManageParticipants={(challenge) => {
                                        handleViewSubmissions(challenge);
                                    }}
                                        routePrefix="challenges"
                                    />
                                ))}
                            </div>
                            
                            {/* Pagination */}
                            {challenges?.links && challenges.links.length > 3 && (
                                <div className="mt-8 flex items-center justify-center">
                                    <div className="flex gap-2">
                                        {challenges.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-green-600 text-white shadow-sm'
                                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <FaTrophy className="text-4xl text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد تحديات</h3>
                                <p className="text-gray-500 mb-6">
                                    ابدأ بإنشاء تحدٍ جديد لإشراك طلابك في أنشطة تعليمية ممتعة ومبتكرة
                                </p>
                                <Link
                                    href={typeof route !== 'undefined' ? route('school.challenges.create') : '/school/challenges/create'}
                                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all shadow-lg hover:shadow-xl font-bold text-base transform hover:scale-105"
                                >
                                    <FaPlus className="text-lg" />
                                    <span>إنشاء تحدي</span>
                                </Link>
                            </div>
                        </div>
                    )}
                        </>
                    ) : activeTab === 'submissions' && selectedChallenge ? (
                        <>
                            {/* Submissions Section */}
                            {/* Filters */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleSubmissionStatusFilter('')}
                                        className={`px-4 py-2 rounded-lg transition ${
                                            !submissionStatusFilter
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        الكل
                                    </button>
                                    <button
                                        onClick={() => handleSubmissionStatusFilter('submitted')}
                                        className={`px-4 py-2 rounded-lg transition ${
                                            submissionStatusFilter === 'submitted'
                                                ? 'bg-yellow-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        مُسلم
                                    </button>
                                    <button
                                        onClick={() => handleSubmissionStatusFilter('reviewed')}
                                        className={`px-4 py-2 rounded-lg transition ${
                                            submissionStatusFilter === 'reviewed'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        تم المراجعة
                                    </button>
                                    <button
                                        onClick={() => handleSubmissionStatusFilter('approved')}
                                        className={`px-4 py-2 rounded-lg transition ${
                                            submissionStatusFilter === 'approved'
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        مقبول
                                    </button>
                                    <button
                                        onClick={() => handleSubmissionStatusFilter('rejected')}
                                        className={`px-4 py-2 rounded-lg transition ${
                                            submissionStatusFilter === 'rejected'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        مرفوض
                                    </button>
                                </div>
                            </div>

                            {/* Submissions List */}
                            {submissions?.data && submissions.data.length > 0 ? (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        الطالب
                                                    </th>
                                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        تاريخ التقديم
                                                    </th>
                                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        الحالة
                                                    </th>
                                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        التقييم
                                                    </th>
                                                    <th className="px-6 py-3  text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        الإجراءات
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {submissions.data.map((submission) => {
                                                    const statusBadge = getSubmissionStatusBadge(submission.status);
                                                    const StatusIcon = statusBadge.icon;
                                                    return (
                                                        <tr key={submission.id} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <FaUser className="text-gray-400 mr-2" />
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {submission.student?.name || 'غير معروف'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <div className="flex items-center gap-1">
                                                                    <FaCalendar className="text-xs" />
                                                                    {formatDate(submission.submitted_at)}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 ${statusBadge.bg} ${statusBadge.text} text-xs font-medium rounded flex items-center gap-1 w-fit`}>
                                                                    <StatusIcon className="text-xs" />
                                                                    {statusBadge.label}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {submission.rating ? (
                                                                    <div className="flex items-center gap-1">
                                                                        <FaStar className="text-yellow-500" />
                                                                        {submission.rating} / 10
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <Link
                                                                    href={typeof route !== 'undefined' ? route('school.challenge-submissions.show', submission.id) : `/school/challenge-submissions/${submission.id}`}
                                                                    className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                                                                >
                                                                    <FaEye />
                                                                    عرض
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                    <FaTrophy className="mx-auto text-6xl text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg">لا توجد تسليمات لهذا التحدي</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {submissions?.links && submissions.links.length > 3 && (
                                <div className="mt-6 flex justify-center">
                                    <div className="flex gap-2">
                                        {submissions.links.map((link, index) => (
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
                        </>
                    ) : null}
                </div>
            </div>

            {/* Bottom Banner - Banner سفلي */}
            <div className="mt-8 bg-purple-900 text-white p-6 rounded-xl shadow-2xl" dir="rtl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Right Side - أيقونة كأس */}
                    <div className="hidden md:flex items-center justify-center">
                        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                            <FaTrophy className="text-4xl text-white" />
                        </div>
                    </div>

                    {/* Center - النص */}
                    <div className="flex-1 text-center md:">
                        <h3 className="text-2xl font-bold mb-2">قم بتحفيز طلابك اليوم!</h3>
                        <p className="text-purple-100 text-sm md:text-base">
                            أفادت الدراسات أن المسابقات الودية تزيد من معدل إنتاجية الابتكار بنسبة 40%. اختر موضوعًا شيقًا وابدأ التحدي الآن.
                        </p>
                    </div>

                    {/* Left Side - زر إنشاء تحدي */}
                    <div className="flex-shrink-0">
                            <Link
                                href={typeof route !== 'undefined' ? route('school.challenges.create') : '/school/challenges/create'}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-900 rounded-lg hover:bg-purple-50 transition-colors font-bold shadow-lg hover:shadow-xl"
                            >
                                <FaPlus />
                                إنشاء تحدي مخصص
                            </Link>
                    </div>
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 left-4 right-4 md:left-4 md:right-auto md:w-96 z-50 animate-slide-up">
                    <div className="bg-green-500 text-white rounded-lg shadow-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FaCheckCircle className="text-xl" />
                            <p className="font-medium">{toastMessage}</p>
                        </div>
                        <button
                            onClick={() => setShowToast(false)}
                            className="ml-4 text-white hover:text-gray-200 transition"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
