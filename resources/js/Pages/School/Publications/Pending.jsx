import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaBook, FaCalendar, FaBuilding, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import { useState } from 'react';

export default function SchoolPublicationsPending({ auth, publications }) {
    const [processing, setProcessing] = useState(null);

    const handleApprove = (publicationId) => {
        setProcessing(publicationId);
        router.post(`/school/publications/${publicationId}/approve`, {}, {
            preserveScroll: true,
            onFinish: () => setProcessing(null),
        });
    };

    const handleReject = (publicationId) => {
        if (confirm('هل أنت متأكد من رفض هذا المقال؟')) {
            setProcessing(publicationId);
            router.post(`/school/publications/${publicationId}/reject`, {}, {
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

    const getTypeLabel = (type) => {
        const labels = {
            magazine: 'مجلة',
            booklet: 'كتيب',
            report: 'تقرير',
        };
        return labels[type] || type;
    };

    return (
        <DashboardLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">مراجعة مقالات المجلة</h2>}
        >
            <Head title="مراجعة مقالات المجلة - لوحة المدرسة" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {publications.data && publications.data.length > 0 ? (
                                <div className="space-y-6">
                                    {publications.data.map((publication) => {
                                        const getCoverImage = () => {
                                            if (!publication.cover_image) {
                                                return '/images/default-publication.jpg';
                                            }
                                            
                                            if (publication.cover_image.startsWith('http://') || publication.cover_image.startsWith('https://')) {
                                                return publication.cover_image;
                                            }
                                            
                                            if (publication.cover_image.startsWith('/storage/') || publication.cover_image.startsWith('/images/')) {
                                                return publication.cover_image;
                                            }
                                            
                                            if (publication.cover_image.startsWith('storage/')) {
                                                return '/' + publication.cover_image;
                                            }
                                            
                                            return `/storage/${publication.cover_image}`;
                                        };
                                        
                                        const coverImage = getCoverImage();

                                        return (
                                            <div key={publication.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    {/* Image */}
                                                    <div className="md:w-48 flex-shrink-0">
                                                        <img
                                                            src={coverImage}
                                                            alt={publication.title}
                                                            className="w-full h-40 object-cover rounded-lg"
                                                        />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                                    {publication.title}
                                                                    {publication.issue_number && (
                                                                        <span className="text-gray-600"> - العدد {publication.issue_number}</span>
                                                                    )}
                                                                </h3>
                                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                                    <span className="px-3 py-1 bg-legacy-green/10 text-legacy-green rounded-full">
                                                                        {getTypeLabel(publication.type)}
                                                                    </span>
                                                                    {publication.author && (
                                                                        <div className="flex items-center gap-2">
                                                                            <span>المعلم:</span>
                                                                            <span className="font-semibold">{publication.author.name}</span>
                                                                        </div>
                                                                    )}
                                                                    {publication.created_at && (
                                                                        <div className="flex items-center gap-2">
                                                                            <FaCalendar className="text-xs" />
                                                                            {formatDate(publication.created_at)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Description */}
                                                        {publication.description && (
                                                            <p className="text-gray-700 mb-4 line-clamp-3">
                                                                {publication.description}
                                                            </p>
                                                        )}

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-3 mt-4">
                                                            <Link
                                                                href={`/school/publications/${publication.id}`}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                                                            >
                                                                <FaEye />
                                                                عرض التفاصيل
                                                            </Link>
                                                            <button
                                                                onClick={() => handleApprove(publication.id)}
                                                                disabled={processing === publication.id}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-legacy-green text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                                                            >
                                                                <FaCheck />
                                                                {processing === publication.id ? 'جاري...' : 'موافقة'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(publication.id)}
                                                                disabled={processing === publication.id}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                                                            >
                                                                <FaTimes />
                                                                {processing === publication.id ? 'جاري...' : 'رفض'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaBook className="mx-auto text-6xl text-gray-300 mb-4" />
                                    <p className="text-gray-500 text-lg">لا توجد مقالات معلقة للمراجعة</p>
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
                </div>
            </div>
        </DashboardLayout>
    );
}

