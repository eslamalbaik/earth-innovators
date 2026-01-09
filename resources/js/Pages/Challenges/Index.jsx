import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { useState } from 'react';
import { FaSearch, FaTrophy, FaEye, FaUser, FaCalendar, FaGraduationCap, FaUsers, FaClock } from 'react-icons/fa';
import { toHijriDate } from '@/utils/dateUtils';
import ChallengeCard from '../../Components/Challenges/ChallengeCard';

export default function ChallengesIndex({ auth, challenges, userRole }) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [challengeType, setChallengeType] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/challenges', { search, category, challenge_type: challengeType }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const categories = [
        { value: '', label: 'جميع الفئات' },
        { value: 'science', label: 'علوم' },
        { value: 'technology', label: 'تقنية' },
        { value: 'engineering', label: 'هندسة' },
        { value: 'mathematics', label: 'رياضيات' },
        { value: 'arts', label: 'فنون' },
        { value: 'other', label: 'أخرى' },
    ];

    const challengeTypes = [
        { value: '', label: 'جميع الأنواع' },
        { value: '60_seconds', label: 'تحدّي 60 ثانية' },
        { value: 'mental_math', label: 'حلها بدون قلم' },
        { value: 'conversions', label: 'تحدّي التحويلات' },
        { value: 'team_fastest', label: 'تحدّي الفريق الأسرع' },
        { value: 'build_problem', label: 'ابنِ مسألة' },
        { value: 'custom', label: 'تحدّي مخصص' },
    ];

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

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    return (
        <MainLayout auth={auth}>
            <Head title="التحديات النشطة" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">التحديات النشطة</h1>
                    <p className="text-gray-600">استعرض التحديات النشطة من المؤسسات تعليمية والمعلمين وشارك فيها</p>
                </div>

                {/* البحث والفلترة */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="ابحث عن تحدّي..."
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="md:w-48">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="md:w-48">
                            <select
                                value={challengeType}
                                onChange={(e) => setChallengeType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                {challengeTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            بحث
                        </button>
                    </form>
                </div>

                {/* قائمة التحديات */}
                {challenges.data && challenges.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {challenges.data.map((challenge) => (
                            <ChallengeCard
                                key={challenge.id}
                                challenge={challenge}
                                user={auth?.user}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <FaTrophy className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد تحديات نشطة حالياً</p>
                    </div>
                )}

                {/* Pagination */}
                {challenges.links && challenges.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-2">
                            {challenges.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-4 py-2 rounded-lg ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                            ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

