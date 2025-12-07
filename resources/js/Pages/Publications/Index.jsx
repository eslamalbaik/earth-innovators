import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { FaBook, FaFileAlt, FaCalendar, FaBuilding, FaHeart, FaArrowLeft, FaSearch, FaDownload, FaNewspaper } from 'react-icons/fa';
import { useState } from 'react';
import axios from 'axios';
import { getPublicationImageUrl } from '../../utils/imageUtils';

export default function PublicationsIndex({ auth, publications, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedType, setSelectedType] = useState(filters?.type || '');
    const [likedPublications, setLikedPublications] = useState(new Set());

    const handleSearch = () => {
        router.get('/publications', {
            search: searchTerm || undefined,
            type: selectedType || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const toggleLike = async (publication) => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        try {
            const response = await axios.post(`/publications/${publication.id}/like`);
            if (response.data.success) {
                // تحديث حالة الإعجاب محلياً
                if (response.data.liked) {
                    setLikedPublications(prev => new Set(prev).add(publication.id));
                    publication.likes_count = response.data.likes_count;
                } else {
                    setLikedPublications(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(publication.id);
                        return newSet;
                    });
                    publication.likes_count = response.data.likes_count;
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const getTypeLabel = (type) => {
        const labels = {
            magazine: 'مجلة',
            booklet: 'كتيب',
            report: 'تقرير',
            article: 'مقال',
        };
        return labels[type] || type;
    };

    const getTypeIcon = (type) => {
        if (type === 'magazine') return FaNewspaper;
        if (type === 'booklet') return FaBook;
        if (type === 'article') return FaFileAlt;
        return FaFileAlt;
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    // تجميع الإصدارات حسب النوع
    const magazines = publications.data?.filter(p => p.type === 'magazine') || [];
    const booklets = publications.data?.filter(p => p.type === 'booklet') || [];
    const reports = publications.data?.filter(p => p.type === 'report') || [];
    const articles = publications.data?.filter(p => p.type === 'article') || [];

    const renderPublicationCard = (publication) => {
        const TypeIcon = getTypeIcon(publication.type);
        const isLiked = publication.is_liked || likedPublications.has(publication.id);

        // Use utility function for consistent image URL handling
        const coverImage = getPublicationImageUrl(publication.cover_image);

        // تحديد لون البادج حسب النوع
        const getBadgeColor = (type) => {
            if (type === 'magazine') return 'bg-blue-50 border-blue-200 text-blue-800';
            if (type === 'booklet') return 'bg-amber-50 border-amber-200 text-amber-800';
            if (type === 'article') return 'bg-green-50 border-green-200 text-green-800';
            return 'bg-gray-50 border-gray-200 text-gray-800';
        };

        return (
            <div key={publication.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                {/* Image with tags */}
                <div className="relative">
                    <img
                        src={coverImage}
                        alt={publication.title}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                            console.error('Failed to load publication image:', coverImage);
                            e.target.src = '/images/default-publication.jpg';
                        }}
                        loading="lazy"
                    />
                    {/* New tag */}
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        جديد
                    </div>
                    {/* Type badge */}
                    <div className={`absolute top-3 left-3 ${getBadgeColor(publication.type)} px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-2 border`}>
                        <TypeIcon className="text-xs" />
                        {getTypeLabel(publication.type)}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-legacy-green mb-3">
                        {publication.title}
                        {publication.issue_number && (
                            <span className="text-gray-600"> - العدد {publication.issue_number}</span>
                        )}
                    </h3>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        {publication.publish_date && (
                            <div className="flex items-center gap-2">
                                <FaCalendar className="text-xs" />
                                {formatDate(publication.publish_date)}
                            </div>
                        )}
                        {(publication.publisher_name || publication.school?.name) && (
                            <div className="flex items-center gap-2">
                                <FaBuilding className="text-xs" />
                                {publication.publisher_name || publication.school?.name}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {publication.description && (
                        <p className="text-gray-700 mb-6 line-clamp-3 leading-relaxed">
                            {publication.description}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {publication.file && (
                                <a
                                    href={publication.file.startsWith('http') || publication.file.startsWith('/storage/') || publication.file.startsWith('/images/')
                                        ? publication.file
                                        : `/storage/${publication.file}`}
                                    download
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition border border-blue-200"
                                >
                                    <FaDownload className="text-sm" />
                                    <span className="text-sm font-medium">تحميل</span>
                                </a>
                            )}
                            {publication.content && (
                                <Link
                                    href={`/publications/${publication.id}`}
                                    className="flex items-center gap-2 px-4 py-2 bg-legacy-green/10 text-legacy-green rounded-lg hover:bg-legacy-green/20 transition border border-legacy-green/20"
                                >
                                    <FaBook className="text-sm" />
                                    <span className="text-sm font-medium">قراءة</span>
                                </Link>
                            )}
                        </div>
                        <button
                            onClick={() => toggleLike(publication)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                                isLiked
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={isLiked ? 'إزالة الإعجاب' : 'إعجاب'}
                        >
                            <FaHeart className={isLiked ? 'fill-current' : ''} />
                            <span className="text-sm">{publication.likes_count || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <MainLayout auth={auth}>
            <Head title="الإصدارات - إرث المبتكرين" />

            <div className="min-h-screen bg-gray-50" dir="rtl">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/"
                                    className="text-gray-600 hover:text-legacy-green transition"
                                >
                                    <FaArrowLeft className="text-xl" />
                                </Link>
                                <h1 className="text-3xl font-bold text-legacy-green">الإصدارات</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="البحث عن الإصدارات..."
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legacy-green focus:border-legacy-green"
                                />
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            </div>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legacy-green focus:border-legacy-green"
                            >
                                <option value="">جميع الأنواع</option>
                                <option value="magazine">مجلة</option>
                                <option value="booklet">كتيب</option>
                                <option value="report">تقرير</option>
                            </select>
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2 bg-gradient-to-r from-legacy-green to-legacy-blue text-white rounded-lg hover:opacity-90 transition"
                            >
                                بحث
                            </button>
                        </div>
                    </div>
                </div>

                {/* Green Promotional Banner */}
                <div className="bg-gradient-to-r from-legacy-green/20 to-legacy-green/10 border-b border-legacy-green/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <p className="text-legacy-green text-center md:text-right text-lg leading-relaxed">
                            اكتشف محتوى مبتكر من الطلاب والمعلمين: مجلات، كتيبات وتقارير تعرض إبداع مدارسنا.
                            <span className="block mt-2 font-semibold">"اقرأ، تعلم، واستلهم من تجارب المبدعين حولك!"</span>
                        </p>
                    </div>
                </div>

                {/* Publications Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {publications.data && publications.data.length > 0 ? (
                        <>
                            {/* Magazines Section */}
                            {magazines.length > 0 && (
                                <div className="mb-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <FaNewspaper className="text-2xl text-gray-700" />
                                        <h2 className="text-2xl font-bold text-gray-900">مجلة إرث المبتكرين</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {magazines.map(renderPublicationCard)}
                                    </div>
                                </div>
                            )}

                            {/* Booklets Section */}
                            {booklets.length > 0 && (
                                <div className="mb-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <FaBook className="text-2xl text-gray-700" />
                                        <h2 className="text-2xl font-bold text-gray-900">كتيبات إبداعية</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {booklets.map(renderPublicationCard)}
                                    </div>
                                </div>
                            )}

                            {/* Reports Section */}
                            {reports.length > 0 && (
                                <div className="mb-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <FaFileAlt className="text-2xl text-gray-700" />
                                        <h2 className="text-2xl font-bold text-gray-900">تقارير</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {reports.map(renderPublicationCard)}
                                    </div>
                                </div>
                            )}

                            {/* Articles Section */}
                            {articles.length > 0 && (
                                <div className="mb-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <FaFileAlt className="text-2xl text-gray-700" />
                                        <h2 className="text-2xl font-bold text-gray-900">مقالات</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {articles.map(renderPublicationCard)}
                                    </div>
                                </div>
                            )}

                            {/* If no specific type matches, show all */}
                            {magazines.length === 0 && booklets.length === 0 && reports.length === 0 && articles.length === 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {publications.data.map(renderPublicationCard)}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">لا توجد إصدارات متاحة حالياً</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {publications.links && publications.links.length > 3 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex gap-2">
                                {publications.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg ${
                                            link.active
                                                ? 'bg-gradient-to-r from-legacy-green to-legacy-blue text-white'
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
        </MainLayout>
    );
}
