import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useCallback, useMemo } from 'react';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { 
    FaSearch, 
    FaFilter, 
    FaEye, 
    FaEdit, 
    FaTrash, 
    FaPlus,
    FaSave,
    FaTimes
} from 'react-icons/fa';

export default function AdminProjectsIndex({ projects, stats, filters, users, schools, teachers }) {
    const { confirm } = useConfirmDialog();
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [category, setCategory] = useState(filters?.category || '');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState(null);
    const [isLoadingProject, setIsLoadingProject] = useState(false);
    
    // PERFORMANCE: Optimistic UI state for instant feedback
    const [optimisticProjects, setOptimisticProjects] = useState(null);
    const [deletingIds, setDeletingIds] = useState(new Set());

    const { data: editData, setData: setEditData, put: updateProject, processing: editProcessing, errors: editErrors, reset: resetEditForm } = useForm({
        title: '',
        description: '',
        category: '',
        school_id: '',
        for_all_schools: false,
        status: 'pending',
        files: [],
        images: [],
    });

    const { data: createData, setData: setCreateData, post: createProject, processing: createProcessing, errors: createErrors, reset: resetCreateForm } = useForm({
        title: '',
        description: '',
        category: 'other',
        school_id: '',
        for_all_schools: false,
        status: 'pending',
        files: [],
        images: [],
    });

    /**
     * PERFORMANCE OPTIMIZED: Filter with partial reload
     * Only refreshes projects and filters, preserving other component state
     */
    const handleFilter = useCallback(() => {
        router.get(route('admin.projects.index'), {
            search: search || undefined,
            status: status || undefined,
            category: category || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['projects', 'filters'], // PARTIAL RELOAD: Only refresh projects and filters
        });
    }, [search, status, category]);

    /**
     * PERFORMANCE OPTIMIZED: Memoized edit handler
     * Uses project data directly when available instead of fetching
     */
    const handleEdit = useCallback(async (project) => {
        setIsLoadingProject(true);
        setProjectToEdit(project);
        try {
            // PERFORMANCE: Try to use existing data first, only fetch if needed
            if (project.title && project.description) {
                // Use existing project data
                setEditData({
                    title: project.title || '',
                    description: project.description || '',
                    category: project.category || '',
                    school_id: project.school_id || '',
                    for_all_schools: !project.school_id,
                    status: project.status || 'pending',
                    files: project.files || [],
                    images: project.images || [],
                });
                setShowEditModal(true);
                setIsLoadingProject(false);
                return;
            }
            
            // Only fetch if data is missing
            const response = await fetch(route('admin.projects.edit', project.id));
            const data = await response.json();
            setEditData({
                title: data.project.title || '',
                description: data.project.description || '',
                category: data.project.category || '',
                school_id: data.project.school_id || '',
                for_all_schools: !data.project.school_id,
                status: data.project.status || 'pending',
                files: data.project.files || [],
                images: data.project.images || [],
            });
            setShowEditModal(true);
        } catch (error) {
            alert('حدث خطأ أثناء تحميل بيانات المشروع');
        } finally {
            setIsLoadingProject(false);
        }
    }, [setEditData]);

    const handleEditSubmit = useCallback((e) => {
        e.preventDefault();
        if (!projectToEdit) return;
        
        updateProject(route('admin.projects.update', projectToEdit.id), {
            preserveState: true,
            preserveScroll: true,
            only: ['projects', 'stats'], // PARTIAL RELOAD: Only refresh projects and stats
            onSuccess: () => {
                setShowEditModal(false);
                setProjectToEdit(null);
                resetEditForm();
            },
        });
    }, [projectToEdit, updateProject, resetEditForm]);

    /**
     * PERFORMANCE OPTIMIZED: Create submit with partial reload
     */
    const handleCreateSubmit = useCallback((e) => {
        e.preventDefault();
        createProject(route('admin.projects.store'), {
            preserveState: true,
            preserveScroll: true,
            only: ['projects', 'stats'], // PARTIAL RELOAD
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreateForm();
            },
        });
    }, [createProject, resetCreateForm]);

    /**
     * PERFORMANCE: Memoized modal close handlers
     */
    const closeEditModal = useCallback(() => {
        setShowEditModal(false);
        setProjectToEdit(null);
        resetEditForm();
    }, [resetEditForm]);

    const closeCreateModal = useCallback(() => {
        setShowCreateModal(false);
        resetCreateForm();
    }, [resetCreateForm]);

    /**
     * PERFORMANCE OPTIMIZED: Optimistic delete with instant UI feedback
     * Removes item from UI immediately, then syncs with server
     */
    const handleDelete = useCallback(async (project) => {
        const confirmed = await confirm({
            title: 'تأكيد الحذف',
            message: `هل أنت متأكد من حذف المشروع "${project.title}"؟ هذا الإجراء لا يمكن التراجع عنه.`,
            confirmText: 'حذف',
            cancelText: 'إلغاء',
            variant: 'danger',
        });

        if (!confirmed) {
            return;
        }

        // INSTANT UI UPDATE: Remove from local state immediately
        const projectsData = projects?.data || [];
        setOptimisticProjects(projectsData.filter(p => p.id !== project.id));
        setDeletingIds(prev => new Set([...prev, project.id]));

        // Server sync: Use partial reload to only refresh projects and stats
        router.delete(route('admin.projects.destroy', project.id), {
            preserveState: true,
            preserveScroll: true,
            only: ['projects', 'stats'], // PARTIAL RELOAD: Only refresh these props
            onSuccess: () => {
                setDeletingIds(prev => {
                    const next = new Set(prev);
                    next.delete(project.id);
                    return next;
                });
                setOptimisticProjects(null);
            },
            onError: () => {
                // Revert optimistic update on error
                setOptimisticProjects(null);
                setDeletingIds(prev => {
                    const next = new Set(prev);
                    next.delete(project.id);
                    return next;
                });
            },
        });
    }, [projects, confirm]);

    /**
     * PERFORMANCE: Memoize status badge helper to prevent recreation on each render
     */
    const getStatusBadge = useCallback((status) => {
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
    }, []);

    /**
     * PERFORMANCE: Use optimistic state if available, otherwise use server data
     * This provides instant UI feedback while server processes the request
     */
    const projectsData = useMemo(() => {
        if (optimisticProjects !== null) {
            return optimisticProjects;
        }
        return projects?.data || [];
    }, [optimisticProjects, projects]);

    return (
        <DashboardLayout header="إدارة المشاريع">
            <Head title="إدارة المشاريع" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">إجمالي المشاريع</p>
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

            {/* Filters and Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">البحث والتصفية</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center gap-2"
                    >
                        <FaPlus />
                        إضافة مشروع جديد
                    </button>
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
                                placeholder="ابحث عن مشروع..."
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="الفئة..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
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

            {/* Projects Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">المشروع</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">الناشر</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">المؤسسة التعليمية</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">الحالة</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">تاريخ الإنشاء</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {projectsData && projectsData.length > 0 ? (
                                projectsData.map((project) => {
                                    const isDeleting = deletingIds.has(project.id);
                                    return (
                                    <tr 
                                        key={project.id} 
                                        className={`hover:bg-gray-50 transition-colors ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                                    >
                                        <td className="py-4 px-6">
                                            <div>
                                                <Link
                                                    href={route('admin.projects.show', project.id)}
                                                    className="font-semibold text-blue-600 hover:text-blue-800"
                                                >
                                                    {project.title}
                                                </Link>
                                                {project.category && (
                                                    <p className="text-sm text-gray-500 mt-1">{project.category}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{project.student_name}</p>
                                                <p className="text-xs text-gray-500">{project.student_email}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-700">{project.school_name}</td>
                                        <td className="py-4 px-6">{getStatusBadge(project.status)}</td>
                                        <td className="py-4 px-6 text-sm text-gray-700">{project.created_at}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('admin.projects.show', project.id)}
                                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition"
                                                    title="عرض التفاصيل"
                                                >
                                                    <FaEye />
                                                </Link>
                                                <button
                                                    onClick={() => handleEdit(project)}
                                                    disabled={isLoadingProject}
                                                    className="text-yellow-600 hover:text-yellow-800 p-2 rounded-lg hover:bg-yellow-50 transition disabled:opacity-50"
                                                    title="تعديل"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project)}
                                                    disabled={isDeleting}
                                                    className={`text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    title={isDeleting ? 'جاري الحذف...' : 'حذف'}
                                                >
                                                    {isDeleting ? (
                                                        <span className="animate-spin text-xs">⏳</span>
                                                    ) : (
                                                        <FaTrash />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-gray-500">
                                        لا توجد مشاريع
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {projects.links && projects.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                عرض {projects.from} إلى {projects.to} من {projects.total} مشروع
                            </div>
                            <div className="flex gap-2">
                                {projects.links.map((link, index) => (
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
            {showEditModal && projectToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">تعديل مشروع</h3>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات المشروع</h2>

                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* العنوان */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        العنوان <span className="text-red-500">*</span>
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

                                {/* الوصف */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الوصف <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={editData.description}
                                        onChange={(e) => setEditData('description', e.target.value)}
                                        rows="4"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {editErrors.description && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.description}</p>
                                    )}
                                </div>

                                {/* الفئة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الفئة
                                    </label>
                                    <select
                                        value={editData.category}
                                        onChange={(e) => setEditData('category', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.category ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">اختر فئة</option>
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

                                {/* الحالة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الحالة <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editData.status}
                                        onChange={(e) => setEditData('status', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.status ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="pending">قيد المراجعة</option>
                                        <option value="approved">معتمد</option>
                                        <option value="rejected">مرفوض</option>
                                    </select>
                                    {editErrors.status && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.status}</p>
                                    )}
                                </div>

                                {/* المؤسسة التعليمية */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        المؤسسة التعليمية
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editData.for_all_schools}
                                                onChange={(e) => {
                                                    setEditData('for_all_schools', e.target.checked);
                                                    if (e.target.checked) {
                                                        setEditData('school_id', '');
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">متاح لجميع المؤسسات التعليمية</span>
                                        </label>
                                        {!editData.for_all_schools && (
                                            <select
                                                value={editData.school_id}
                                                onChange={(e) => setEditData('school_id', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    editErrors.school_id ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            >
                                                <option value="">اختر مؤسسة تعليمية</option>
                                                {schools && schools.map((school) => (
                                                    <option key={school.id} value={school.id}>
                                                        {school.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {editData.for_all_schools && (
                                            <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                                                سيصبح هذا المشروع متاحاً لجميع طلاب جميع المؤسسات التعليمية
                                            </p>
                                        )}
                                        {!editData.for_all_schools && editData.school_id && (
                                            <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                                                سيصبح هذا المشروع متاحاً لجميع طلاب المؤسسة التعليمية المختارة
                                            </p>
                                        )}
                                    </div>
                                    {editErrors.school_id && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.school_id}</p>
                                    )}
                                    {editErrors.for_all_schools && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.for_all_schools}</p>
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
                                    {editProcessing ? 'جاري التحديث...' : 'تحديث'}
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

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">إضافة مشروع جديد</h3>
                            <button
                                onClick={closeCreateModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات المشروع</h2>

                        <form onSubmit={handleCreateSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* العنوان */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        العنوان <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={createData.title}
                                        onChange={(e) => setCreateData('title', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            createErrors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {createErrors.title && (
                                        <p className="mt-1 text-sm text-red-600">{createErrors.title}</p>
                                    )}
                                </div>

                                {/* الوصف */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الوصف <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={createData.description}
                                        onChange={(e) => setCreateData('description', e.target.value)}
                                        rows="4"
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            createErrors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {createErrors.description && (
                                        <p className="mt-1 text-sm text-red-600">{createErrors.description}</p>
                                    )}
                                </div>

                                {/* الفئة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الفئة
                                    </label>
                                    <select
                                        value={createData.category}
                                        onChange={(e) => setCreateData('category', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            createErrors.category ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="">اختر فئة</option>
                                        <option value="science">علوم</option>
                                        <option value="technology">تقنية</option>
                                        <option value="engineering">هندسة</option>
                                        <option value="mathematics">رياضيات</option>
                                        <option value="arts">فنون</option>
                                        <option value="other">أخرى</option>
                                    </select>
                                    {createErrors.category && (
                                        <p className="mt-1 text-sm text-red-600">{createErrors.category}</p>
                                    )}
                                </div>

                                {/* الحالة */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الحالة <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={createData.status}
                                        onChange={(e) => setCreateData('status', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            createErrors.status ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="pending">قيد المراجعة</option>
                                        <option value="approved">معتمد</option>
                                        <option value="rejected">مرفوض</option>
                                    </select>
                                    {createErrors.status && (
                                        <p className="mt-1 text-sm text-red-600">{createErrors.status}</p>
                                    )}
                                </div>

                                {/* المؤسسة التعليمية */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        المؤسسة التعليمية
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={createData.for_all_schools}
                                                onChange={(e) => {
                                                    setCreateData('for_all_schools', e.target.checked);
                                                    if (e.target.checked) {
                                                        setCreateData('school_id', '');
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">متاح لجميع المؤسسات التعليمية</span>
                                        </label>
                                        {!createData.for_all_schools && (
                                            <select
                                                value={createData.school_id}
                                                onChange={(e) => setCreateData('school_id', e.target.value)}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                    createErrors.school_id ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            >
                                                <option value="">اختر مؤسسة تعليمية</option>
                                                {schools && schools.map((school) => (
                                                    <option key={school.id} value={school.id}>
                                                        {school.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {createData.for_all_schools && (
                                            <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                                                سيصبح هذا المشروع متاحاً لجميع طلاب جميع المؤسسات التعليمية
                                            </p>
                                        )}
                                        {!createData.for_all_schools && createData.school_id && (
                                            <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                                                سيصبح هذا المشروع متاحاً لجميع طلاب المؤسسة التعليمية المختارة
                                            </p>
                                        )}
                                    </div>
                                    {createErrors.school_id && (
                                        <p className="mt-1 text-sm text-red-600">{createErrors.school_id}</p>
                                    )}
                                    {createErrors.for_all_schools && (
                                        <p className="mt-1 text-sm text-red-600">{createErrors.for_all_schools}</p>
                                    )}
                                </div>

                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={createProcessing}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaSave />
                                    {createProcessing ? 'جاري الحفظ...' : 'حفظ'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeCreateModal}
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

