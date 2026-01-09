import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FaUsers, FaEdit, FaTrash, FaCheck, FaTimes, FaPlus, FaSearch, FaCalendar, FaDownload, FaUpload } from 'react-icons/fa';

const formatSubjects = (subjects, subjectsRelation) => {
    if (Array.isArray(subjectsRelation) && subjectsRelation.length > 0) {
        return subjectsRelation
            .map((subject) => subject?.name_ar || subject?.name_en || subject?.name)
            .filter(Boolean)
            .join(', ');
    }

    if (Array.isArray(subjects)) {
        return subjects.join(', ');
    }

    if (typeof subjects === 'string') {
        try {
            const parsed = JSON.parse(subjects);
            if (Array.isArray(parsed)) {
                return parsed.join(', ');
            }
        } catch (error) {
            // ignore invalid JSON
        }
        return subjects;
    }

    if (subjects !== null && subjects !== undefined) {
        return String(subjects);
    }

    return '-';
};

const getTeacherInitial = (teacher) => {
    const nameSources = [
        teacher?.name_ar,
        teacher?.name_en,
        teacher?.name,
        teacher?.user?.name,
    ];

    for (const name of nameSources) {
        if (typeof name === 'string' && name.trim().length > 0) {
            return name.trim().charAt(0).toUpperCase();
        }
    }

    return '?';
};

const buildImageUrl = (path) => {
    if (!path || typeof path !== 'string') {
        return null;
    }

    const trimmed = path.trim();
    if (!trimmed) {
        return null;
    }

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    if (trimmed.startsWith('data:image')) {
        return trimmed;
    }

    if (trimmed.startsWith('/')) {
        return trimmed;
    }

    if (trimmed.startsWith('storage/')) {
        return `/${trimmed}`;
    }

    if (trimmed.startsWith('public/')) {
        return `/storage/${trimmed.replace(/^public\//, '')}`;
    }

    return `/storage/${trimmed}`;
};

const getTeacherImage = (teacher) => {
    const sources = [
        teacher?.image,
        teacher?.profile_image,
        teacher?.avatar,
        teacher?.avatar_url,
        teacher?.photo_url,
        teacher?.user?.profile_photo_url,
        teacher?.user?.avatar,
        teacher?.user?.image,
    ];

    for (const source of sources) {
        const url = buildImageUrl(source);
        if (url) {
            return url;
        }
    }

    return null;
};

export default function Teachers({ teachers, auth, cities = [], filters = {} }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [teacherToDelete, setTeacherToDelete] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [city, setCity] = useState(filters.city || '');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const handleDelete = (teacher) => {
        setTeacherToDelete(teacher);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        if (teacherToDelete) {
            router.delete(`/admin/teachers/${teacherToDelete.id}`, {
                onSuccess: () => {
                    setShowDeleteConfirm(false);
                    setTeacherToDelete(null);
                },
            });
        }
    };

    const handleVerify = (id) => {
        router.post(`/admin/teachers/${id}/verify`);
    };

    const handleActivate = (id) => {
        router.post(`/admin/teachers/${id}/activate`);
    };

    const handleManageAvailabilities = (teacherId) => {
        router.get(`/admin/teachers/${teacherId}/availabilities`);
    };

    const handleExportCSV = () => {
        // استخدام window.location لتحميل الملف مباشرة
        window.location.href = '/admin/teachers/export';
    };

    const handleImportCSV = () => {
        // This will trigger a file input dialog
        document.getElementById('csv-import-input').click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            router.post('/admin/teachers/import', formData, {
                forceFormData: true,
            });
        }
    };

    const applyFilters = () => {
        const params = {};
        if (search) params.search = search;
        if (status) params.status = status;
        if (city) params.city = city;

        router.get('/admin/teachers', params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        // Debounce البحث
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            applyFilters();
        }, 500);

        setSearchTimeout(timeout);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handleCityChange = (e) => {
        setCity(e.target.value);
    };

    useEffect(() => {
        // تطبيق الفلاتر عند تغيير status أو city
        if (status !== filters.status || city !== filters.city) {
            applyFilters();
        }
    }, [status, city]);

    useEffect(() => {
        // تنظيف timeout عند unmount
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    return (
        <DashboardLayout header="إدارة المعلمين">
            <Head title="إدارة المعلمين" />
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">إدارة المعلمين</h1>
                    <p className="text-gray-600 mt-1">إدارة جميع المعلمين في المنصة</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-3 rounded-lg flex items-center gap-2 transition"
                    >
                        <FaDownload />
                        تصدير EXCEL
                    </button>
                    <Link
                        href="/admin/teachers/create"
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition"
                    >
                        <FaPlus />
                        إضافة معلم
                    </Link>
                </div>
                <input
                    id="csv-import-input"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="البحث عن معلم..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={handleStatusChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="">جميع الحالات</option>
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                    </select>
                    <select
                        value={city}
                        onChange={handleCityChange}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400"
                    >
                        <option value="">جميع المدن</option>
                        {cities.map((cityName) => (
                            <option key={cityName} value={cityName}>
                                {cityName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                    المعلم
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                    المادة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                    المدينة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                    السعر
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                    التقييم
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                    الحالة
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {teachers?.data?.map((teacher) => (
                                <tr key={teacher.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold flex items-center justify-center">
                                                {getTeacherImage(teacher) ? (
                                                    <img
                                                        src={getTeacherImage(teacher)}
                                                        alt={teacher.name_ar || teacher.name_en || teacher.name || 'Teacher'}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{getTeacherInitial(teacher)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-gray-900">{teacher.name_ar}</p>
                                                    {teacher.is_verified && (
                                                        <FaCheck className="text-green-500 text-xs" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">{teacher.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {formatSubjects(teacher.subjects_display ?? teacher.subjects, teacher.subjects_relation)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{teacher.city}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-bold text-gray-900 flex items-center ">
                                            <p className="text-sm font-medium text-gray-900">{teacher.price_per_hour}</p>
                                            <img src="/images/aed-currency(black).svg" alt="currency" className="w-4 h-4" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm font-medium text-gray-900">
                                                {typeof teacher.rating === 'number'
                                                    ? teacher.rating.toFixed(1)
                                                    : parseFloat(teacher.rating || 0).toFixed(1)}
                                            </span>
                                            <span className="text-yellow-400 text-xs">★</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {teacher.is_active ? (
                                            <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                <FaCheck className="ml-1" />
                                                نشط
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                                <FaTimes className="ml-1" />
                                                غير نشط
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/teachers/${teacher.id}/edit`}
                                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                                                title="تعديل"
                                            >
                                                <FaEdit />
                                            </Link>
                                            <button
                                                onClick={() => handleManageAvailabilities(teacher.id)}
                                                className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded transition"
                                                title="إدارة المواعيد"
                                            >
                                                <FaCalendar />
                                            </button>
                                            {!teacher.is_verified && (
                                                <button
                                                    onClick={() => handleVerify(teacher.id)}
                                                    className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition"
                                                    title="توثيق"
                                                >
                                                    <FaCheck />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(teacher)}
                                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition"
                                                title="حذف"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {teachers?.links && teachers.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            عرض {teachers.from} إلى {teachers.to} من {teachers.total} معلم
                        </div>
                        <div className="flex gap-2">
                            {teachers.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${link.active
                                        ? 'bg-yellow-400 text-black'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showDeleteConfirm && teacherToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                <FaTrash className="text-2xl text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">تأكيد الحذف</h2>
                            <p className="text-gray-600 text-center mb-6">
                                هل أنت متأكد من حذف المعلم <strong>{teacherToDelete.name_ar || teacherToDelete.name}</strong>؟ لا يمكن التراجع عن هذه العملية.
                            </p>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition"
                                >
                                    حذف
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setTeacherToDelete(null);
                                    }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
