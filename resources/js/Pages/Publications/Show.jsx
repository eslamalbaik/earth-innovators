import { Head, Link, router } from '@inertiajs/react';
import MainLayout from '../../Layouts/MainLayout';
import { FaArrowLeft, FaHeart, FaFileAlt, FaCalendar, FaBuilding, FaEye } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import axios from 'axios';

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
            console.error('Error toggling like:', error);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${d.getFullYear()} ${months[d.getMonth()]}`;
    };

    const getCoverImage = () => {
        if (!publication?.cover_image) {
            return '/images/default-publication.jpg';
        }
        
        // إذا كان URL كامل
        if (publication.cover_image.startsWith('http://') || publication.cover_image.startsWith('https://')) {
            return publication.cover_image;
        }
        
        // إذا كان يبدأ بـ /storage/ أو /images/
        if (publication.cover_image.startsWith('/storage/') || publication.cover_image.startsWith('/images/')) {
            return publication.cover_image;
        }
        
        // إذا كان يبدأ بـ storage/ بدون /
        if (publication.cover_image.startsWith('storage/')) {
            return '/' + publication.cover_image;
        }
        
        // افتراض أنه مسار نسبي في storage
        return `/storage/${publication.cover_image}`;
    };

    const coverImage = getCoverImage();

    if (!publication) {
        return (
            <MainLayout auth={auth}>
                <Head title="الإصدار غير موجود - إرث المبتكرين" />
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-gray-500">الإصدار غير موجود</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout auth={auth}>
            <Head title={`${publication.title} - إرث المبتكرين`} />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Link
                            href="/publications"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-legacy-green transition mb-4"
                        >
                            <FaArrowLeft />
                            <span>رجوع إلى الإصدارات</span>
                        </Link>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Cover Image */}
                    {publication.cover_image && (
                        <div className="mb-8">
                            <img
                                src={coverImage}
                                alt={publication.title}
                                className="w-full h-auto rounded-xl shadow-lg"
                                onError={(e) => {
                                    e.target.src = '/images/default-publication.jpg';
                                }}
                            />
                        </div>
                    )}

                    {/* Title and Meta */}
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {publication.title}
                            {publication.issue_number && (
                                <span className="text-gray-600"> - العدد {publication.issue_number}</span>
                            )}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
                            {publication.publish_date && (
                                <div className="flex items-center gap-2">
                                    <FaCalendar />
                                    {formatDate(publication.publish_date)}
                                </div>
                            )}
                            {(publication.publisher_name || publication.school?.name) && (
                                <div className="flex items-center gap-2">
                                    <FaBuilding />
                                    {publication.publisher_name || publication.school?.name}
                                </div>
                            )}
                            {publication.views !== undefined && (
                                <div className="flex items-center gap-2">
                                    <FaEye />
                                    {publication.views} مشاهدة
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                            {publication.file && (
                                <a
                                    href={`/storage/${publication.file}`}
                                    download
                                    className="flex items-center gap-2 px-6 py-3 bg-legacy-blue text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <FaFileAlt />
                                    تحميل PDF
                                </a>
                            )}
                            <button
                                onClick={toggleLike}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                                    isLiked
                                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <FaHeart className={isLiked ? 'fill-current' : ''} />
                                <span>إعجاب ({likesCount})</span>
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    {publication.description && (
                        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">الوصف</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {publication.description}
                            </p>
                        </div>
                    )}

                    {/* Content */}
                    {publication.content && (
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">المحتوى</h2>
                            <div
                                className="prose max-w-none text-gray-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: publication.content }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}

