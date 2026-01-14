import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '../../Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
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
            <div key={publication.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition">
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
                <div className="p-4">
                    {/* Title */}
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
                        {publication.title}
                        {publication.issue_number && (
                            <span className="text-gray-600"> - العدد {publication.issue_number}</span>
                        )}
                    </h3>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-2">
                        {publication.publish_date && (
                            <div className="flex items-center gap-1">
                                <FaCalendar className="text-[10px]" />
                                {formatDate(publication.publish_date)}
                            </div>
                        )}
                        {(publication.publisher_name || publication.school?.name) && (
                            <div className="flex items-center gap-1">
                                <FaBuilding className="text-[10px]" />
                                <span className="line-clamp-1">{publication.publisher_name || publication.school?.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {publication.description && (
                        <p className="text-xs text-gray-700 mb-3 line-clamp-2 leading-relaxed">
                            {publication.description}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {publication.file && (
                                <a
                                    href={publication.file.startsWith('http') || publication.file.startsWith('/storage/') || publication.file.startsWith('/images/')
                                        ? publication.file
                                        : `/storage/${publication.file}`}
                                    download
                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition border border-blue-200 text-xs font-semibold"
                                >
                                    <FaDownload className="text-xs" />
                                    <span>تحميل</span>
                                </a>
                            )}
                            {publication.content && (
                                <Link
                                    href={`/publications/${publication.id}`}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-[#A3C042]/10 text-[#A3C042] rounded-xl hover:bg-[#A3C042]/20 transition border border-[#A3C042]/20 text-xs font-semibold"
                                >
                                    <FaBook className="text-xs" />
                                    <span>قراءة</span>
                                </Link>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => toggleLike(publication)}
                            className={`flex items-center gap-1 px-2 py-1.5 rounded-xl transition text-xs ${isLiked
                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            title={isLiked ? 'إزالة الإعجاب' : 'إعجاب'}
                        >
                            <FaHeart className={isLiked ? 'fill-current' : ''} />
                            <span>{publication.likes_count || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const PublicationsContent = () => (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="البحث عن الإصدارات..."
                            className="w-full h-10 pr-10 pl-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30 focus:border-[#A3C042]"
                        />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    </div>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#A3C042]/30 focus:border-[#A3C042]"
                    >
                        <option value="">جميع الأنواع</option>
                        <option value="magazine">مجلة</option>
                        <option value="booklet">كتيب</option>
                        <option value="report">تقرير</option>
                    </select>
                    <button
                        type="button"
                        onClick={handleSearch}
                        className="h-10 px-4 bg-[#A3C042] text-white rounded-xl hover:bg-[#93b03a] transition font-bold text-sm"
                    >
                        بحث
                    </button>
                </div>
            </div>

            {/* Publications Content */}
            <div>
                {publications.data && publications.data.length > 0 ? (
                    <>
                        {/* Magazines Section */}
                        {magazines.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaNewspaper className="text-lg text-gray-700" />
                                    <h2 className="text-lg font-bold text-gray-900">مجلة إرث المبتكرين</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {magazines.map(renderPublicationCard)}
                                </div>
                            </div>
                        )}

                        {/* Booklets Section */}
                        {booklets.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaBook className="text-lg text-gray-700" />
                                    <h2 className="text-lg font-bold text-gray-900">كتيبات إبداعية</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {booklets.map(renderPublicationCard)}
                                </div>
                            </div>
                        )}

                        {/* Reports Section */}
                        {reports.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaFileAlt className="text-lg text-gray-700" />
                                    <h2 className="text-lg font-bold text-gray-900">تقارير</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {reports.map(renderPublicationCard)}
                                </div>
                            </div>
                        )}

                        {/* Articles Section */}
                        {articles.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <FaFileAlt className="text-lg text-gray-700" />
                                    <h2 className="text-lg font-bold text-gray-900">مقالات</h2>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {articles.map(renderPublicationCard)}
                                </div>
                            </div>
                        )}

                        {/* If no specific type matches, show all */}
                        {magazines.length === 0 && booklets.length === 0 && reports.length === 0 && articles.length === 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {publications.data.map(renderPublicationCard)}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <p className="text-sm text-gray-500">لا توجد إصدارات متاحة حالياً</p>
                    </div>
                )}

                {/* Pagination */}
                {publications.links && publications.links.length > 3 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-3">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {publications.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${link.active
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="الإصدارات - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="إرث المبتكرين"
                    activeNav="explore"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                >
                    <PublicationsContent />
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="إرث المبتكرين"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                    reverseOrder={false}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <PublicationsContent />
                    </div>
                </main>
                <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}
