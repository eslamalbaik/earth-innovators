import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaTrophy, FaPlus, FaCalendar, FaEye, FaEdit, FaTrash, FaUsers, FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import InnovationChallengeCard from '@/Components/Challenges/InnovationChallengeCard';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function TeacherChallengesIndex({ auth, challenges }) {
    const { confirm } = useConfirmDialog();
    const [processing, setProcessing] = useState(null);

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
            header="التحديات الابتكارية"
        >
            <Head title="التحديات الابتكارية - لوحة المعلم" />

            <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header with Actions - تصميم جديد */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    التحديات الابتكارية
                                </h1>
                                <p className="text-gray-600">
                                    إطلاق وإدارة مسابقات الابتكار بين الطلاب
                                </p>
                            </div>
                            <Link
                                href="/teacher/challenges/create"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3C042] text-white rounded-lg hover:bg-[#8CA635] transition-colors font-semibold shadow-md hover:shadow-lg"
                            >
                                <FaPlus />
                                إطلاق تحدي جديد
                            </Link>
                        </div>

                        {/* Navigation Tabs - شريط التصفية */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <button
                                onClick={() => router.get('/teacher/challenges', { status: '' }, { preserveState: true })}
                                className="px-4 py-2 rounded-lg font-medium transition-colors bg-[#A3C042] text-white"
                            >
                                الكل
                            </button>
                            <button
                                onClick={() => router.get('/teacher/challenges', { status: 'completed' }, { preserveState: true })}
                                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100"
                            >
                                مكتمل
                            </button>
                            <button
                                onClick={() => router.get('/teacher/challenges', { status: 'upcoming' }, { preserveState: true })}
                                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100"
                            >
                                قادم
                            </button>
                            <button
                                onClick={() => router.get('/teacher/challenges', { status: 'active' }, { preserveState: true })}
                                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white text-gray-700 hover:bg-gray-100"
                            >
                                نشط
                            </button>
                        </div>

                        {/* Search Bar */}
                        <form onSubmit={(e) => { e.preventDefault(); }} className="mb-6">
                            <div className="relative max-w-md">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="ابحث عن تحدي..."
                                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Challenges Grid - بطاقات التحديات */}
                    <div className="bg-white rounded-lg shadow">
                        {challenges.data && challenges.data.length > 0 ? (
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {challenges.data.map((challenge) => (
                                        <InnovationChallengeCard
                                            key={challenge.id}
                                            challenge={challenge}
                                            onEdit={(challenge) => router.visit(`/teacher/challenges/${challenge.id}/edit`)}
                                            onManageParticipants={(challenge) => {
                                                router.visit(`/teacher/challenges/${challenge.id}?tab=participants`);
                                            }}
                                            routePrefix="teacher.challenges"
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <FaTrophy className="mx-auto text-6xl text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg mb-4">لا توجد تحديات</p>
                                <Link
                                    href="/teacher/challenges/create"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#A3C042] text-white rounded-lg hover:opacity-90 transition"
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
                                            className={`px-4 py-2 rounded-lg ${link.active
                                                ? 'bg-[#A3C042] text-white'
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
                            href="/teacher/challenges/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-900 rounded-lg hover:bg-purple-50 transition-colors font-bold shadow-lg hover:shadow-xl"
                        >
                            <FaPlus />
                            إنشاء تحدي مخصص
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

