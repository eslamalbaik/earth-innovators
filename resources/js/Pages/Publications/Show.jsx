import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '../../Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { FaArrowLeft, FaHeart, FaFileAlt, FaCalendar, FaBuilding, FaEye } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { getPublicationImageUrl, getPublicationFileUrl } from '../../utils/imageUtils';

export default function PublicationShow({ auth, publication, isLiked: initialIsLiked }) {
    const [isLiked, setIsLiked] = useState(initialIsLiked || false);
    const [likesCount, setLikesCount] = useState(publication?.likes_count || 0);

    const toggleLike = async () => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        try {
            const response = await axios.post(`/publications/${publication.id}/like`);
            if (response.data.success) {
                setIsLiked(response.data.liked);
                setLikesCount(response.data.likes_count);
            }
        } catch (error) {
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${d.getFullYear()} ${months[d.getMonth()]}`;
    };

    const coverImage = getPublicationImageUrl(publication?.cover_image);

    const PublicationContent = () => {
    if (!publication) {
        return (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <p className="text-sm text-gray-500">الإصدار غير موجود</p>
                </div>
        );
    }

    return (
            <div className="space-y-4">
                    {/* Cover Image */}
                    {publication.cover_image && (
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                            <img
                                src={coverImage}
                                alt={publication.title}
                            className="w-full h-auto"
                                onError={(e) => {
                                    e.target.src = '/images/default-publication.jpg';
                                }}
                                loading="lazy"
                            />
                        </div>
                    )}

                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                    <h1 className="text-lg font-extrabold text-gray-900">
                            {publication.title}
                            {publication.issue_number && (
                                <span className="text-gray-600"> - العدد {publication.issue_number}</span>
                            )}
                        </h1>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                            {publication.publish_date && (
                            <div className="flex items-center gap-1">
                                <FaCalendar className="text-[10px]" />
                                    {formatDate(publication.publish_date)}
                                </div>
                            )}
                            {(publication.publisher_name || publication.school?.name) && (
                            <div className="flex items-center gap-1">
                                <FaBuilding className="text-[10px]" />
                                    {publication.publisher_name || publication.school?.name}
                                </div>
                            )}
                            {publication.views !== undefined && (
                            <div className="flex items-center gap-1">
                                <FaEye className="text-[10px]" />
                                {publication.views}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                            {publication.file && (
                                <a
                                    href={getPublicationFileUrl(publication.file) || '#'}
                                    download
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#A3C042] text-white rounded-xl hover:bg-[#93b03a] transition font-bold text-sm"
                                >
                                    <FaFileAlt />
                                    تحميل PDF
                                </a>
                            )}
                            <button
                            type="button"
                                onClick={toggleLike}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition text-sm font-semibold ${
                                    isLiked
                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <FaHeart className={isLiked ? 'fill-current' : ''} />
                            <span>({likesCount})</span>
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    {publication.description && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <h2 className="text-sm font-bold text-gray-900 mb-2">الوصف</h2>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                {publication.description}
                            </p>
                        </div>
                    )}

                    {/* Content */}
                    {publication.content && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                        <h2 className="text-sm font-bold text-gray-900 mb-3">المحتوى</h2>
                            <div
                            className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: publication.content }}
                            />
                        </div>
                    )}
                </div>
        );
    };

    if (!publication) {
        return (
            <div dir="rtl" className="min-h-screen bg-gray-50">
                <Head title="الإصدار غير موجود - إرث المبتكرين" />
                <div className="block md:hidden">
                    <MobileAppLayout
                        auth={auth}
                        title="إرث المبتكرين"
                        activeNav="explore"
                        unreadCount={auth?.unreadCount || 0}
                        onNotifications={() => router.visit('/notifications')}
                        onBack={() => router.visit('/publications')}
                    >
                        <PublicationContent />
                    </MobileAppLayout>
                </div>
                <div className="hidden md:block">
                    <MobileTopBar
                        title="إرث المبتكرين"
                        unreadCount={auth?.unreadCount || 0}
                        onNotifications={() => router.visit('/notifications')}
                        onBack={() => router.visit('/publications')}
                        reverseOrder={false}
                    />
                    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                        <div className="mx-auto w-full max-w-3xl">
                            <PublicationContent />
                        </div>
                    </main>
                    <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
                </div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title={`${publication.title} - إرث المبتكرين`} />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="إرث المبتكرين"
                    activeNav="explore"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/publications')}
                >
                    <PublicationContent />
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="إرث المبتكرين"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/publications')}
                    reverseOrder={false}
                />
                    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                        <div className="mx-auto w-full max-w-3xl">
                            <PublicationContent />
                        </div>
                    </main>
                <MobileBottomNav active="explore" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}

