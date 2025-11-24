import { Link } from '@inertiajs/react';
import SectionTitle from '../SectionTitle';
import { FaBook, FaFileAlt, FaHeart, FaArrowLeft } from 'react-icons/fa';

export default function PublicationsSection({
    title = "الإصدارات",
    subtitle = "اكتشف محتوى مبتكر من الطلاب والمعلمين: مجلات، كتيبات وتقارير تعرض إبداع مدارسنا.",
    publications = [],
    viewAllLink = "/publications"
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
        <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <SectionTitle
                            text={title}
                            size="2xl"
                            align="start"
                            className="mb-0"
                        />
                    </div>
                    <Link
                        href={viewAllLink}
                        className="flex items-center gap-2 text-gray-600 hover:text-legacy-green transition"
                    >
                        <span className="hidden md:inline">عرض الكل</span>
                        <FaArrowLeft />
                    </Link>
                </div>

                <p className="text-gray-700 mb-8 text-lg">
                    {subtitle}
                </p>

                {/* Green Info Banner */}
                <div className="bg-legacy-green/10 rounded-xl p-6 mb-8 border border-legacy-green/20">
                    <p className="text-legacy-green text-center md:text-right leading-relaxed">
                        اكتشف محتوى مبتكر من الطلاب والمعلمين: مجلات، كتيبات وتقارير تعرض إبداع مدارسنا.
                        <span className="block mt-2">اقرأ، تعلم، واستلهم من تجارب المبدعين حولك</span>
                    </p>
                </div>

                {/* Publications Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {publications.slice(0, 2).map((publication) => {
                        const TypeIcon = getTypeIcon(publication.type);
                        const coverImage = publication.cover_image 
                            ? (publication.cover_image.startsWith('http') 
                                ? publication.cover_image 
                                : `/storage/${publication.cover_image}`)
                            : '/images/default-publication.jpg';

                        return (
                            <div key={publication.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                                {/* Image with tags */}
                                <div className="relative">
                                    <img
                                        src={coverImage}
                                        alt={publication.title}
                                        className="w-full h-64 object-cover"
                                    />
                                    <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        جديد
                                    </div>
                                    <div className="absolute top-3 left-3 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                                        <TypeIcon className="text-xs" />
                                        {getTypeLabel(publication.type)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-purple-600 mb-3">
                                        {publication.title}
                                        {publication.issue_number && (
                                            <span className="text-gray-600"> - العدد {publication.issue_number}</span>
                                        )}
                                    </h3>

                                    {/* Meta info */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                        {publication.publish_date && (
                                            <div>
                                                {formatDate(publication.publish_date)}
                                            </div>
                                        )}
                                        {(publication.publisher_name || publication.school?.name) && (
                                            <div>
                                                {publication.publisher_name || publication.school?.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {publication.description && (
                                        <p className="text-gray-700 mb-6 line-clamp-3">
                                            {publication.description}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            {publication.file && (
                                                <a
                                                    href={`/storage/${publication.file}`}
                                                    download
                                                    className="flex items-center gap-2 px-4 py-2 bg-legacy-blue/10 text-legacy-blue rounded-lg hover:bg-legacy-blue/20 transition"
                                                >
                                                    <FaFileAlt />
                                                    تحميل
                                                </a>
                                            )}
                                            {publication.content && (
                                                <Link
                                                    href={`/publications/${publication.id}`}
                                                    className="flex items-center gap-2 px-4 py-2 bg-legacy-green/10 text-legacy-green rounded-lg hover:bg-legacy-green/20 transition"
                                                >
                                                    <FaBook />
                                                    قراءة
                                                </Link>
                                            )}
                                        </div>
                                        {publication.likes_count !== undefined && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FaHeart className="text-red-500" />
                                                <span>{publication.likes_count}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* View All Button */}
                <div className="text-center mt-8">
                    <Link
                        href={viewAllLink}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-legacy-green to-legacy-blue text-white rounded-lg hover:opacity-90 transition"
                    >
                        عرض جميع الإصدارات
                        <FaArrowLeft />
                    </Link>
                </div>
            </div>
        </section>
    );
}

