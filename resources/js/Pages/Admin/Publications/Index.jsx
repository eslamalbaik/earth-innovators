import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    FaSearch,
    FaFilter,
    FaEye,
    FaTrash,
    FaBook,
    FaCalendar,
    FaPlus,
} from 'react-icons/fa';
import { getPublicationImageUrl } from '@/utils/imageUtils';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';

export default function AdminPublicationsIndex({ publications = { data: [], links: [] }, stats = { total: 0, approved: 0, pending: 0, rejected: 0 }, filters = {} }) {
    const { confirm } = useConfirmDialog();
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [type, setType] = useState(filters?.type || '');

    const handleFilter = () => {
        router.get(route('admin.publications.index'), {
            search: search || undefined,
            status: status || undefined,
            type: type || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = async (publication) => {
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: `هل أنت متأكد من حذف المقال "${publication.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(route('admin.publications.destroy', publication.id), {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'معتمد' },
            'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'قيد المراجعة' },
            'rejected': { bg: 'bg-red-100', text: 'text-red-800', label: 'مرفوض' },
        };
        const statusConfig = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
            </span>
        );
    };

    const getTypeLabel = (type) => {
        const labels = {
            magazine: 'مجلة',
            booklet: 'كتيب',
            report: 'تقرير',
            article: 'مقال',
            study: 'دراسة',
            news: 'اخبار',
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
        <DashboardLayout header="إدارة المقالات">
            <Head title="إدارة المقالات" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">إجمالي المقالات</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">معتمدة</p>
                    <p className="text-3xl font-bold text-green-600">{stats.approved || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">قيد المراجعة</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">مرفوضة</p>
                    <p className="text-3xl font-bold text-red-600">{stats.rejected || 0}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">البحث والتصفية</h2>
                    <Link
                        href={route('admin.publications.create')}
                        className="px-6 py-2 bg-[#A3C042] hover:bg-[#8CA635] text-white font-semibold rounded-lg flex items-center gap-2"
                    >
                        <FaPlus />
                        إضافة مقال جديد
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث عن مقال..."
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">الكل</option>
                            <option value="approved">معتمد</option>
                            <option value="pending">قيد المراجعة</option>
                            <option value="rejected">مرفوض</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">الكل</option>
                            <option value="magazine">مجلة</option>
                            <option value="booklet">كتيب</option>
                            <option value="report">تقرير</option>
                            <option value="article">مقال</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleFilter}
                            className="w-full bg-[#A3C042] hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaFilter />
                            تصفية
                        </button>
                    </div>
                </div>
            </div>

            {/* Publications List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {publications && publications.data && publications.data.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {publications.data.map((publication) => {
                            const coverImage = getPublicationImageUrl(publication.cover_image);

                            return (
                                <div key={publication.id} className="p-6 hover:bg-gray-50 transition">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Image */}
                                        <div className="md:w-32 flex-shrink-0">
                                            {coverImage ? (
                                                <img
                                                    src={coverImage}
                                                    alt={publication.title}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <FaBook className="text-4xl text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <Link
                                                        href={route('admin.publications.show', publication.id)}
                                                        className="text-lg font-bold text-blue-600 hover:text-blue-800 mb-1 block"
                                                    >
                                                        {publication.title}
                                                        {publication.issue_number && (
                                                            <span className="text-gray-600"> - العدد {publication.issue_number}</span>
                                                        )}
                                                    </Link>
                                                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                            {getTypeLabel(publication.type)}
                                                        </span>
                                                        {publication.created_at && (
                                                            <div className="flex items-center gap-1">
                                                                <FaCalendar className="text-xs" />
                                                                {formatDate(publication.created_at)}
                                                            </div>
                                                        )}
                                                        {publication.author && (
                                                            <span className="text-gray-600">
                                                                المؤلف: {publication.author.name}
                                                            </span>
                                                        )}
                                                        {publication.school && (
                                                            <span className="text-gray-600">
                                                                المدرسة: {publication.school.name}
                                                            </span>
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
                                                    href={route('admin.publications.show', publication.id)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition"
                                                    title="عرض التفاصيل"
                                                >
                                                    <FaEye />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(publication)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition"
                                                    title="حذف"
                                                >
                                                    <FaTrash />
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
                        <p className="text-gray-500 text-lg">لا توجد مقالات</p>
                    </div>
                )}

                {/* Pagination */}
                {publications && publications.links && publications.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                عرض {publications.from} إلى {publications.to} من {publications.total} مقال
                            </div>
                            <div className="flex gap-2">
                                {publications.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${link.active
                                            ? 'bg-[#A3C042] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

