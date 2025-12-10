import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaPlus, FaTrophy, FaSave, FaTimes } from 'react-icons/fa';

export default function AdminChallengesIndex({ challenges, stats, filters, schools = [] }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [category, setCategory] = useState(filters?.category || '');
    const [challengeType, setChallengeType] = useState(filters?.challenge_type || '');
    const [showEditModal, setShowEditModal] = useState(false);
    const [challengeToEdit, setChallengeToEdit] = useState(null);

    const { data: editData, setData: setEditData, put: updateChallenge, processing: editProcessing, errors: editErrors, reset: resetEditForm } = useForm({
        title: '',
        objective: '',
        description: '',
        instructions: '',
        challenge_type: '',
        category: '',
        age_group: '',
        school_id: '',
        start_date: '',
        deadline: '',
        status: 'draft',
        points_reward: 0,
        max_participants: null,
    });

    const handleFilter = () => {
        router.get(route('admin.challenges.index'), {
            search: search || undefined,
            status: status || undefined,
            category: category || undefined,
            challenge_type: challengeType || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (challengeId) => {
        if (confirm('هل أنت متأكد من حذف هذا التحدي؟')) {
            router.delete(route('admin.challenges.destroy', challengeId), {
                preserveScroll: true,
                onSuccess: () => {
                    // سيتم إعادة تحميل الصفحة تلقائياً
                },
            });
        }
    };

    const handleEdit = (challenge) => {
        setChallengeToEdit(challenge);
        // Convert dates to datetime-local format
        const startDate = new Date(challenge.start_date).toISOString().slice(0, 16);
        const deadlineDate = new Date(challenge.deadline).toISOString().slice(0, 16);

        setEditData({
            title: challenge.title || '',
            objective: challenge.objective || '',
            description: challenge.description || '',
            instructions: challenge.instructions || '',
            challenge_type: challenge.challenge_type || '',
            category: challenge.category || '',
            age_group: challenge.age_group || '',
            school_id: challenge.school_id || '',
            start_date: startDate,
            deadline: deadlineDate,
            status: challenge.status || 'draft',
            points_reward: challenge.points_reward || 0,
            max_participants: challenge.max_participants || null,
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        updateChallenge(route('admin.challenges.update', challengeToEdit.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                setChallengeToEdit(null);
                resetEditForm();
            },
        });
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setChallengeToEdit(null);
        resetEditForm();
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'active': { bg: 'bg-green-100', text: 'text-green-800', label: 'نشط' },
            'draft': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'مسودة' },
            'completed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مكتمل' },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'ملغي' },
        };
        const statusConfig = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
            </span>
        );
    };

    const getCategoryLabel = (category) => {
        const categoryMap = {
            'science': 'علوم',
            'technology': 'تقنية',
            'engineering': 'هندسة',
            'mathematics': 'رياضيات',
            'arts': 'فنون',
            'other': 'أخرى',
        };
        return categoryMap[category] || category;
    };

    const getAgeGroupLabel = (ageGroup) => {
        const ageGroupMap = {
            '6-9': '6-9 سنوات',
            '10-13': '10-13 سنة',
            '14-17': '14-17 سنة',
            '18+': '18+ سنة',
        };
        return ageGroupMap[ageGroup] || ageGroup;
    };

    return (
        <DashboardLayout header="إدارة التحديات">
            <Head title="إدارة التحديات" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">إجمالي التحديات</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">نشطة</p>
                    <p className="text-3xl font-bold text-green-600">{stats.active || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">مسودة</p>
                    <p className="text-3xl font-bold text-gray-600">{stats.draft || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">مكتملة</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.completed || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">ملغاة</p>
                    <p className="text-3xl font-bold text-red-600">{stats.cancelled || 0}</p>
                </div>
            </div>

            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">قائمة التحديات</h2>
                <Link
                    href={route('admin.challenges.create')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                >
                    <FaPlus />
                    إضافة تحدٍ جديد
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث عن تحدٍ..."
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
                            <option value="active">نشط</option>
                            <option value="draft">مسودة</option>
                            <option value="completed">مكتمل</option>
                            <option value="cancelled">ملغي</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">الكل</option>
                            <option value="science">علوم</option>
                            <option value="technology">تقنية</option>
                            <option value="engineering">هندسة</option>
                            <option value="mathematics">رياضيات</option>
                            <option value="arts">فنون</option>
                            <option value="other">أخرى</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">نوع التحدي</label>
                        <select
                            value={challengeType}
                            onChange={(e) => setChallengeType(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">الكل</option>
                            <option value="60_seconds">تحدّي 60 ثانية</option>
                            <option value="mental_math">حلها بدون قلم</option>
                            <option value="conversions">تحدّي التحويلات</option>
                            <option value="team_fastest">تحدّي الفريق الأسرع</option>
                            <option value="build_problem">ابنِ مسألة</option>
                            <option value="custom">تحدّي مخصص</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleFilter}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaFilter />
                            تصفية
                        </button>
                    </div>
                </div>
            </div>

            {/* Challenges Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">العنوان</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المدرسة</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">النوع</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الفئة</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الحالة</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">تاريخ الإنشاء</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {challenges.data && challenges.data.length > 0 ? (
                                challenges.data.map((challenge) => (
                                    <tr key={challenge.id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">
                                            <div>
                                                <Link
                                                    href={route('admin.challenges.show', challenge.id)}
                                                    className="font-semibold text-blue-600 hover:text-blue-800"
                                                >
                                                    {challenge.title}
                                                </Link>
                                                {challenge.objective && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{challenge.objective}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <FaTrophy className="text-yellow-500" />
                                                <span className="text-sm font-medium text-gray-900">{challenge.school_name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-gray-700">{challenge.challenge_type_label}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-gray-700">{getCategoryLabel(challenge.category)}</span>
                                            <p className="text-xs text-gray-500 mt-1">{getAgeGroupLabel(challenge.age_group)}</p>
                                        </td>
                                        <td className="py-4 px-6">{getStatusBadge(challenge.status)}</td>
                                        <td className="py-4 px-6 text-sm text-gray-700">{challenge.created_at}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('admin.challenges.show', challenge.id)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                                                    title="عرض التفاصيل"
                                                >
                                                    <FaEye />
                                                </Link>
                                                <button
                                                    onClick={() => handleEdit(challenge)}
                                                    className="text-yellow-600 hover:text-yellow-800 p-2 rounded-lg hover:bg-yellow-50"
                                                    title="تعديل"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(challenge.id)}
                                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                                                    title="حذف"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-gray-500">
                                        لا توجد تحديات
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {challenges.links && challenges.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                عرض {challenges.from} إلى {challenges.to} من {challenges.total} تحدٍ
                            </div>
                            <div className="flex gap-2">
                                {challenges.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
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

            {/* Edit Modal */}
            {showEditModal && challengeToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
                            <h3 className="text-2xl font-bold text-gray-900">تعديل التحدي</h3>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* العنوان */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        عنوان التحدي <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.title}
                                        onChange={(e) => setEditData('title', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {editErrors.title && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.title}</p>
                                    )}
                                </div>

                                {/* الهدف */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الهدف من التحدي <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={editData.objective}
                                        onChange={(e) => setEditData('objective', e.target.value)}
                                        rows={3}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.objective ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {editErrors.objective && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.objective}</p>
                                    )}
                                </div>

                                {/* الوصف */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        وصف التحدي <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={editData.description}
                                        onChange={(e) => setEditData('description', e.target.value)}
                                        rows={4}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {editErrors.description && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.description}</p>
                                    )}
                                </div>

                                {/* كيفية التنفيذ */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        كيفية التنفيذ <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={editData.instructions}
                                        onChange={(e) => setEditData('instructions', e.target.value)}
                                        rows={4}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.instructions ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {editErrors.instructions && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.instructions}</p>
                                    )}
                                </div>

                                {/* نوع التحدي */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        نوع التحدي <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editData.challenge_type}
                                        onChange={(e) => setEditData('challenge_type', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.challenge_type ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="">اختر نوع التحدي</option>
                                        <option value="60_seconds">تحدّي 60 ثانية</option>
                                        <option value="mental_math">حلها بدون قلم</option>
                                        <option value="conversions">تحدّي التحويلات</option>
                                        <option value="team_fastest">تحدّي الفريق الأسرع</option>
                                        <option value="build_problem">ابنِ مسألة</option>
                                        <option value="custom">تحدّي مخصص</option>
                                    </select>
                                    {editErrors.challenge_type && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.challenge_type}</p>
                                    )}
                                </div>

                                {/* الفئة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الفئة <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editData.category}
                                        onChange={(e) => setEditData('category', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.category ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="">اختر الفئة</option>
                                        <option value="science">علوم</option>
                                        <option value="technology">تقنية</option>
                                        <option value="engineering">هندسة</option>
                                        <option value="mathematics">رياضيات</option>
                                        <option value="arts">فنون</option>
                                        <option value="other">أخرى</option>
                                    </select>
                                    {editErrors.category && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.category}</p>
                                    )}
                                </div>

                                {/* الفئة العمرية */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الفئة العمرية <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editData.age_group}
                                        onChange={(e) => setEditData('age_group', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.age_group ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="">اختر الفئة العمرية</option>
                                        <option value="6-9">6-9 سنوات</option>
                                        <option value="10-13">10-13 سنة</option>
                                        <option value="14-17">14-17 سنة</option>
                                        <option value="18+">18+ سنة</option>
                                    </select>
                                    {editErrors.age_group && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.age_group}</p>
                                    )}
                                </div>

                                {/* المدرسة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        المدرسة
                                    </label>
                                    <select
                                        value={editData.school_id}
                                        onChange={(e) => setEditData('school_id', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.school_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">اختر مدرسة</option>
                                        {schools.map((school) => (
                                            <option key={school.id} value={school.id}>
                                                {school.name}
                                            </option>
                                        ))}
                                    </select>
                                    {editErrors.school_id && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.school_id}</p>
                                    )}
                                </div>

                                {/* تاريخ البدء */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        تاريخ البدء <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={editData.start_date}
                                        onChange={(e) => setEditData('start_date', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.start_date ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {editErrors.start_date && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.start_date}</p>
                                    )}
                                </div>

                                {/* تاريخ الانتهاء */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        تاريخ الانتهاء <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={editData.deadline}
                                        onChange={(e) => setEditData('deadline', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.deadline ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {editErrors.deadline && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.deadline}</p>
                                    )}
                                </div>

                                {/* الحالة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الحالة
                                    </label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData('status', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.status ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="draft">مسودة</option>
                                        <option value="active">نشط</option>
                                        <option value="completed">مكتمل</option>
                                        <option value="cancelled">ملغي</option>
                                    </select>
                                    {editErrors.status && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.status}</p>
                                    )}
                                </div>

                                {/* نقاط المكافأة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        نقاط المكافأة
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editData.points_reward}
                                        onChange={(e) => setEditData('points_reward', parseInt(e.target.value) || 0)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.points_reward ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {editErrors.points_reward && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.points_reward}</p>
                                    )}
                                </div>

                                {/* الحد الأقصى للمشاركين */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الحد الأقصى للمشاركين
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editData.max_participants || ''}
                                        onChange={(e) => setEditData('max_participants', e.target.value ? parseInt(e.target.value) : null)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.max_participants ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        placeholder="غير محدود"
                                    />
                                    {editErrors.max_participants && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.max_participants}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaSave />
                                    {editProcessing ? 'جاري التحديث...' : 'حفظ التغييرات'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg flex items-center gap-2"
                                >
                                    <FaTimes />
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
