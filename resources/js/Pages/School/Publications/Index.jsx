import DashboardLayout from '../../../Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaBook, FaPlus, FaCalendar, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useState } from 'react';
import { getPublicationImageUrl } from '../../../utils/imageUtils';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function SchoolPublicationsIndex({ auth, publications, stats, filters }) {
    const { confirm } = useConfirmDialog();
    const [processing, setProcessing] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(filters?.status || '');

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        router.get('/school/publications', {
            status: status || undefined,
        }, {
            preserveState: true,
        });
    };

    const handleDelete = async (publicationId, publicationTitle) => {
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: `هل أنت متأكد من حذف المقال "${publicationTitle}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger',
        });

        if (confirmed) {
            setProcessing(publicationId);
            router.delete(`/school/publications/${publicationId}`, {
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
            article: 'مقال',
        };
        return labels[type] || type;
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'معلق' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'معتمد' },
            rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'مرفوض' },
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <DashboardLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">مقالات المدرسة</h2>}
        >
            <Head title="مقالات المدرسة - لوحة المدرسة" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-gray-600 text-sm mb-1">إجمالي المقالات</div>
                            <div className="text-2xl font-bold text-gray-900">{stats?.total || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-gray-600 text-sm mb-1">معلق</div>
                            <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-gray-600 text-sm mb-1">معتمد</div>
                            <div className="text-2xl font-bold text-green-600">{stats?.approved || 0}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="text-gray-600 text-sm mb-1">مرفوض</div>
                            <div className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded-lg shadow mb-6 p-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <Link
                                href="/school/publications/create"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-legacy-green to-legacy-blue text-white rounded-lg hover:opacity-90 transition"
                            >
                                <FaPlus />
                                إنشاء مقال جديد
                            </Link>

                            {/* Filters */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleStatusFilter('')}
                                    className={`px-4 py-2 rounded-lg transition ${
                                        !selectedStatus
                                            ? 'bg-gradient-to-r from-legacy-green to-legacy-blue text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    الكل
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('pending')}
                                    className={`px-4 py-2 rounded-lg transition ${
                                        selectedStatus === 'pending'
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    معلق
                                </button>
                                <button
                                    onClick={() => handleStatusFilter('approved')}
                                    className={`px-4 py-2 rounded-lg transition ${
                                        selectedStatus === 'approved'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    معتمد
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Publications List */}
                    <div className="bg-white rounded-lg shadow">
                        {publications.data && publications.data.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {publications.data.map((publication) => {
                                    const coverImage = getPublicationImageUrl(publication.cover_image);

                                    return (
                                        <div key={publication.id} className="p-6 hover:bg-gray-50 transition">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Image */}
                                                <div className="md:w-32 flex-shrink-0">
                                                    <img
                                                        src={coverImage}
                                                        alt={publication.title}
                                                        className="w-full h-32 object-cover rounded-lg"
                                                    />
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                                                                {publication.title}
                                                                {publication.issue_number && (
                                                                    <span className="text-gray-600"> - العدد {publication.issue_number}</span>
                                                                )}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                                <span className="px-2 py-1 bg-legacy-green/10 text-legacy-green rounded">
                                                                    {getTypeLabel(publication.type)}
                                                                </span>
                                                                {publication.created_at && (
                                                                    <div className="flex items-center gap-1">
                                                                        <FaCalendar className="text-xs" />
                                                                        {formatDate(publication.created_at)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {getStatusBadge(publication.status)}
                                                    </div>

                                                    {publication.description && (
                                                        <p className="text-gray-700 mb-4 line-clamp-2">
                                                            {publication.description}
                                                        </p>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={`/publications/${publication.id}`}
                                                            target="_blank"
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
                                                        >
                                                            <FaEye />
                                                            عرض
                                                        </Link>
                                                        {publication.author_id === auth.user.id && (
                                                            <Link
                                                                href={`/school/publications/${publication.id}/edit`}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-legacy-blue/10 text-legacy-blue rounded hover:bg-legacy-blue/20 transition text-sm"
                                                            >
                                                                <FaEdit />
                                                                تعديل
                                                            </Link>
                                                        )}
                                                        {publication.author_id === auth.user.id && (
                                                            <button
                                                                onClick={() => handleDelete(publication.id, publication.title)}
                                                                disabled={processing === publication.id}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition text-sm disabled:opacity-50"
                                                            >
                                                                <FaTrash />
                                                                حذف
                                                            </button>
                                                        )}
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
                                <p className="text-gray-500 text-lg mb-4">لا توجد مقالات</p>
                                <Link
                                    href="/school/publications/create"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-legacy-green to-legacy-blue text-white rounded-lg hover:opacity-90 transition"
                                >
                                    <FaPlus />
                                    إنشاء مقال جديد
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {publications.links && publications.links.length > 3 && (
                            <div className="p-6 border-t border-gray-200 flex justify-center">
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
        </DashboardLayout>
    );
}

