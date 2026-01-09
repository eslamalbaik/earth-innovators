import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { FaPlus, FaSearch, FaTrophy } from 'react-icons/fa';
import InnovationChallengeCard from '@/Components/Challenges/InnovationChallengeCard';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

/**
 * صفحة التحديات الابتكارية - لوحة تحكم Admin
 * تصميم مطابق للصورة المرفقة:
 * - عنوان رئيسي مع زر "إطلاق تحدي جديد"
 * - شريط تصفية (مكتمل، قادم، نشط، الكل) مع بحث
 * - بطاقات التحديات في grid (عمودين)
 * - Banner سفلي ثابت
 */
export default function AdminInnovationChallengesIndex({ challenges, stats, filters }) {
    const { confirm } = useConfirmDialog();
    const [search, setSearch] = useState(filters?.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || 'active');

    // معالجة التصفية
    const handleStatusFilter = useCallback((status) => {
        setSelectedStatus(status);
        router.get(route('admin.challenges.index'), {
            status: status || undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['challenges', 'filters'],
        });
    }, [search]);

    // معالجة البحث
    const handleSearch = useCallback((e) => {
        e.preventDefault();
        router.get(route('admin.challenges.index'), {
            status: selectedStatus || undefined,
            search: search || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            only: ['challenges', 'filters'],
        });
    }, [search, selectedStatus]);

    // معالجة تعديل التحدي
    const handleEdit = useCallback((challenge) => {
        router.visit(route('admin.challenges.edit', challenge.id));
    }, []);

    // معالجة إدارة المشاركين
    const handleManageParticipants = useCallback((challenge) => {
        router.visit(route('admin.challenges.show', challenge.id) + '?tab=participants');
    }, []);

    // تصفية التحديات حسب الحالة المحددة
    const challengesData = (challenges?.data || []).filter(challenge => {
        if (!selectedStatus) return true;
        return challenge.status === selectedStatus;
    });
    const hasChallenges = challengesData.length > 0;

    return (
        <DashboardLayout header="التحديات الابتكارية">
            <Head title="التحديات الابتكارية" />
            
            <div className="min-h-screen bg-gray-50 pb-32" dir="rtl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header Section */}
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
                                href={route('admin.challenges.create')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                            >
                                <FaPlus />
                                إطلاق تحدي جديد
                            </Link>
                        </div>

                        {/* Navigation Tabs - شريط التصفية */}
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
                        <form onSubmit={handleSearch} className="mb-6">
                            <div className="relative max-w-md">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ابحث عن تحدي..."
                                    className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Challenges Grid - بطاقات التحديات */}
                    {hasChallenges ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {challengesData.map((challenge) => (
                                <InnovationChallengeCard
                                    key={challenge.id}
                                    challenge={challenge}
                                    onEdit={handleEdit}
                                    onManageParticipants={handleManageParticipants}
                                    routePrefix="admin.challenges"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <FaTrophy className="text-4xl text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد تحديات</h3>
                                <p className="text-gray-500 mb-6">
                                    ابدأ بإنشاء تحدٍ جديد لإشراك الطلاب في أنشطة تعليمية ممتعة
                                </p>
                                <Link
                                    href={route('admin.challenges.create')}
                                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl font-bold"
                                >
                                    <FaPlus />
                                    <span>إنشاء تحدي</span>
                                </Link>
                            </div>
                        </div>
                    )}

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
                    <div className="flex-1 text-center md:text-right">
                        <h3 className="text-2xl font-bold mb-2">قم بتحفيز طلابك اليوم!</h3>
                        <p className="text-purple-100 text-sm md:text-base">
                            أفادت الدراسات أن المسابقات الودية تزيد من معدل إنتاجية الابتكار بنسبة 40%. اختر موضوعًا شيقًا وابدأ التحدي الآن.
                        </p>
                    </div>

                    {/* Left Side - زر إنشاء تحدي */}
                    <div className="flex-shrink-0">
                        <Link
                            href={route('admin.challenges.create')}
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

