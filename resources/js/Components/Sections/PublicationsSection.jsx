import { Link } from '@inertiajs/react';
import { FaBook, FaFileAlt, FaHeart, FaArrowLeft, FaNewspaper } from 'react-icons/fa';
import { getPublicationImageUrl } from '../../utils/imageUtils';

export default function PublicationsSection({
    title = "الإصدارات",
    subtitle = "اكتشف محتوى مبتكر من الطلاب والمعلمين: مجلات، كتيبات وتقارير تعرض إبداع مؤسسات تعليميةنا.",
    publications = [],
    viewAllLink = "/publications",
    compact = false
}) {
    const getTypeLabel = (type) => {
        const labels = {
            magazine: 'مجلة',
            booklet: 'كتيب',
            report: 'تقرير',
        };
        return labels[type] || type;
    };

    const getTypeIcon = (type) => {
        if (type === 'magazine') return FaBook;
        return FaFileAlt;
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return `${d.getFullYear()} ${months[d.getMonth()]}`;
    };

    if (!publications || publications.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A3C042]/20 to-[#8CA635]/20 rounded-xl flex items-center justify-center">
                        <FaNewspaper className="text-[#A3C042] text-xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
                </div>
                <Link
                    href={viewAllLink}
                    className="flex items-center gap-2 text-sm md:text-base text-gray-600 hover:text-[#A3C042] transition font-semibold"
                >
                    <span className="hidden md:inline">عرض الكل</span>
                    <FaArrowLeft className="text-xs" />
                </Link>
            </div>

            <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
                {subtitle}
            </p>

            {/* Publications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {publications.slice(0, 2).map((publication) => {
                    const TypeIcon = getTypeIcon(publication.type);
                    const coverImage = getPublicationImageUrl(publication.cover_image);

                    return (
                        <div key={publication.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                            {/* Image with tags */}
                            <div className="relative">
                                <img
                                    src={coverImage}
                                    alt={publication.title}
                                    className="w-full h-48 md:h-64 object-cover"
                                />
                                <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                    جديد
                                </div>
                                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-gray-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                                    <TypeIcon className="text-xs" />
                                    {getTypeLabel(publication.type)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 md:p-6">
                                {/* Title */}
                                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                    {publication.title}
                                    {publication.issue_number && (
                                        <span className="text-gray-600 font-normal"> - العدد {publication.issue_number}</span>
                                    )}
                                </h3>

                                {/* Meta info */}
                                <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600 mb-3">
                                    {publication.publish_date && (
                                        <div className="flex items-center gap-1">
                                            <span>{formatDate(publication.publish_date)}</span>
                                        </div>
                                    )}
                                    {(publication.publisher_name || publication.school?.name) && (
                                        <>
                                            {publication.publish_date && <span className="text-gray-400">•</span>}
                                            <div>
                                                {publication.publisher_name || publication.school?.name}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Description */}
                                {publication.description && (
                                    <p className="text-sm md:text-base text-gray-700 mb-4 line-clamp-2 leading-relaxed">
                                        {publication.description}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                        {publication.file && (
                                            <a
                                                href={`/storage/${publication.file}`}
                                                download
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs md:text-sm font-semibold"
                                            >
                                                <FaFileAlt className="text-xs" />
                                                تحميل
                                            </a>
                                        )}
                                        {publication.content && (
                                            <Link
                                                href={`/publications/${publication.id}`}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A3C042]/10 text-[#A3C042] rounded-lg hover:bg-[#A3C042]/20 transition text-xs md:text-sm font-semibold"
                                            >
                                                <FaBook className="text-xs" />
                                                قراءة
                                            </Link>
                                        )}
                                    </div>
                                    {publication.likes_count !== undefined && (
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <FaHeart className="text-red-500 text-sm" />
                                            <span className="text-xs md:text-sm font-semibold">{publication.likes_count}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-6">
                <Link
                    href={viewAllLink}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#A3C042] to-[#8CA635] text-white rounded-xl hover:opacity-90 transition shadow-lg font-bold text-sm md:text-base"
                >
                    عرض جميع الإصدارات
                    <FaArrowLeft className="text-xs" />
                </Link>
            </div>
        </div>
    );
}
