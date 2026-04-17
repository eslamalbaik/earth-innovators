import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import { useOptimisticCRUD } from '@/Hooks/useOptimisticCRUD';
import { useTranslation } from '@/i18n';
import {
    FaSearch,
    FaFilter,
    FaEye,
    FaEdit,
    FaTrash,
    FaPlus,
    FaUser,
    FaUsers,
    FaChalkboardTeacher,
    FaGraduationCap,
    FaSchool,
    FaSave,
    FaTimes,
    FaFileExcel,
    FaCheckSquare,
    FaSquare
} from 'react-icons/fa';
import PhoneInput from '@/Components/PhoneInput';

export default function UsersIndex({ users, stats, filters, auth, schools: initialSchools }) {
    const { t, language } = useTranslation();
    const [search, setSearch] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || 'all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [schools, setSchools] = useState(initialSchools || []);

    const { data: editData, setData: setEditData, put: updateUser, processing: editProcessing, errors: editErrors, reset: resetEditForm } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'student',
        school_id: '',
        points: 0,
        account_type: 'regular',
        membership_type: '',
    });

    // PERFORMANCE: Use optimistic CRUD hook for instant UI feedback
    const { items: optimizedUsers, handleDelete: optimisticDelete, isDeleting } = useOptimisticCRUD(
        users?.data || [],
        'users',
        ['stats'] // Also reload stats on delete
    );

    // Fetch schools if not provided
    useEffect(() => {
        if (!schools || schools.length === 0) {
            router.get(route('admin.users.create'), {}, {
                preserveState: true,
                only: ['schools'],
                onSuccess: (page) => {
                    if (page.props.schools) {
                        setSchools(page.props.schools);
                    }
                }
            });
        }
    }, []);

    // Update selectAll when selectedUsers changes
    useEffect(() => {
        if (optimizedUsers && optimizedUsers.length > 0) {
            const allUserIds = optimizedUsers.map(user => user.id);
            setSelectAll(allUserIds.length > 0 && allUserIds.every(id => selectedUsers.includes(id)));
        }
    }, [selectedUsers, optimizedUsers]);

    /**
     * PERFORMANCE OPTIMIZED: Filter with partial reload
     */
    const handleSearch = useCallback(() => {
        router.get(route('admin.users.index'), {
            search: search || undefined,
            role: roleFilter !== 'all' ? roleFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['users', 'filters'], // PARTIAL RELOAD: Only refresh users and filters
        });
    }, [search, roleFilter]);

    const handleDelete = useCallback((user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    }, []);

    /**
     * PERFORMANCE OPTIMIZED: Optimistic delete with partial reload
     */
    const confirmDelete = useCallback(() => {
        if (userToDelete) {
            optimisticDelete(
                userToDelete.id,
                route('admin.users.destroy', userToDelete.id),
                {
                    confirmMessage: false, // Already confirmed via modal
                    onSuccess: () => {
                        setShowDeleteModal(false);
                        setUserToDelete(null);
                        setSelectedUsers([]);
                    },
                }
            );
        }
    }, [userToDelete, optimisticDelete]);

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
    };

    const handleSelectAll = useCallback(() => {
        if (selectAll) {
            setSelectedUsers([]);
            setSelectAll(false);
        } else {
            const allUserIds = optimizedUsers.map(user => user.id);
            setSelectedUsers(allUserIds);
            setSelectAll(true);
        }
    }, [selectAll, optimizedUsers]);

    const handleBulkDelete = () => {
        if (selectedUsers.length === 0) {
            alert(t('adminUsersIndexPage.alerts.selectAtLeastOneToDelete'));
            return;
        }
        setShowBulkDeleteModal(true);
    };

    /**
     * PERFORMANCE OPTIMIZED: Bulk delete with partial reload
     */
    const confirmBulkDelete = useCallback(() => {
        if (selectedUsers.length > 0) {
            router.post(route('admin.users.bulk-delete'), {
                user_ids: selectedUsers
            }, {
                preserveState: true,
                preserveScroll: true,
                only: ['users', 'stats'], // PARTIAL RELOAD
                onSuccess: () => {
                    setShowBulkDeleteModal(false);
                    setSelectedUsers([]);
                    setSelectAll(false);
                },
            });
        }
    }, [selectedUsers]);

    const handleExportExcel = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (roleFilter !== 'all') params.append('role', roleFilter);

        window.location.href = route('admin.users.export') + (params.toString() ? '?' + params.toString() : '');
    };

    const handleEdit = (user) => {
        setUserToEdit(user);
        setEditData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '',
            password_confirmation: '',
            role: user.role || 'student',
            school_id: user.school_id || '',
            points: user.points || 0,
            account_type: user.account_type || 'regular',
            membership_type: user.membership_type || '',
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        updateUser(route('admin.users.update', userToEdit.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                setUserToEdit(null);
                resetEditForm();
            },
        });
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setUserToEdit(null);
        resetEditForm();
    };

    const getRoleBadge = (role, accountType) => {
        const roleMap = {
            admin: { bg: 'bg-red-100', text: 'text-red-800', label: t('adminUsersIndexPage.roles.admin'), icon: FaUser },
            teacher: { bg: 'bg-purple-100', text: 'text-purple-800', label: t('adminUsersIndexPage.roles.teacher'), icon: FaChalkboardTeacher },
            student: { bg: 'bg-green-100', text: 'text-green-800', label: t('adminUsersIndexPage.roles.student'), icon: FaGraduationCap },
            school: { bg: 'bg-blue-100', text: 'text-blue-800', label: t('adminUsersIndexPage.roles.school'), icon: FaSchool },
            educational_institution: { bg: 'bg-cyan-100', text: 'text-cyan-800', label: t('adminUsersIndexPage.roles.educationalInstitution'), icon: FaSchool },
            system_supervisor: { bg: 'bg-orange-100', text: 'text-orange-800', label: t('adminUsersIndexPage.roles.systemSupervisor'), icon: FaUser },
            school_support_coordinator: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: t('adminUsersIndexPage.roles.schoolSupportCoordinator'), icon: FaUser },
        };
        const roleConfig = roleMap[role] || { bg: 'bg-gray-100', text: 'text-gray-800', label: role, icon: FaUser };
        const Icon = roleConfig.icon;
        return (
            <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleConfig.bg} ${roleConfig.text} flex items-center gap-1 w-fit`}>
                    <Icon className="text-xs" />
                    {roleConfig.label}
                </span>
                {accountType === 'project' && (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        {t('adminUsersIndexPage.accountTypes.projectBadge')}
                    </span>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout header={t('adminUsersIndexPage.title')} auth={auth}>
            <Head title={t('adminUsersIndexPage.pageTitle', { appName: t('common.appName') })} />

            <div dir={language === 'ar' ? 'rtl' : 'ltr'}>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminUsersIndexPage.stats.totalUsers')}</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                        </div>
                        <FaUsers className="text-3xl text-gray-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminUsersIndexPage.stats.educationalInstitutions')}</p>
                            <p className="text-3xl font-bold text-blue-600">{stats?.schools || 0}</p>
                        </div>
                        <FaSchool className="text-3xl text-blue-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminUsersIndexPage.stats.students')}</p>
                            <p className="text-3xl font-bold text-green-600">{stats?.students || 0}</p>
                        </div>
                        <FaGraduationCap className="text-3xl text-green-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminUsersIndexPage.stats.teachers')}</p>
                            <p className="text-3xl font-bold text-purple-600">{stats?.teachers || 0}</p>
                        </div>
                        <FaChalkboardTeacher className="text-3xl text-purple-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">{t('adminUsersIndexPage.stats.admins')}</p>
                            <p className="text-3xl font-bold text-red-600">{stats?.admins || 0}</p>
                        </div>
                        <FaUser className="text-3xl text-red-400" />
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder={t('adminUsersIndexPage.searchPlaceholder')}
                                    className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="md:w-48">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">{t('adminUsersIndexPage.roleFilter.all')}</option>
                                <option value="admin">{t('adminUsersIndexPage.roles.admin')}</option>
                                <option value="school">{t('adminUsersIndexPage.roles.school')}</option>
                                <option value="educational_institution">{t('adminUsersIndexPage.roles.educationalInstitution')}</option>
                                <option value="teacher">{t('adminUsersIndexPage.roles.teacher')}</option>
                                <option value="student">{t('adminUsersIndexPage.roles.student')}</option>
                                <option value="system_supervisor">{t('adminUsersIndexPage.roles.systemSupervisor')}</option>
                                <option value="school_support_coordinator">{t('adminUsersIndexPage.roles.schoolSupportCoordinator')}</option>
                            </select>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-[#A3C042] hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaFilter />
                            {t('common.search')}
                        </button>
                    </div>
                    <div className="flex gap-3">
                        {selectedUsers.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                            >
                                <FaTrash />
                                {t('adminUsersIndexPage.actions.deleteSelected', { count: selectedUsers.length })}
                            </button>
                        )}
                        <button
                            onClick={handleExportExcel}
                            className="px-6 py-2 bg-[#A3C042] hover:bg-[#8CA635] text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaFileExcel />
                            {t('adminUsersIndexPage.actions.exportExcel')}
                        </button>
                        <Link
                            href={route('admin.users.create')}
                            className="px-6 py-2 bg-[#A3C042] hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaPlus />
                            {t('adminUsersIndexPage.actions.addNew')}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700 w-12">
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-gray-600 hover:text-gray-900"
                                        title={selectAll ? t('adminUsersIndexPage.table.unselectAll') : t('adminUsersIndexPage.table.selectAll')}
                                    >
                                        {selectAll ? <FaCheckSquare className="text-lg" /> : <FaSquare className="text-lg" />}
                                    </button>
                                </th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('common.name')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('common.email')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminUsersIndexPage.table.role')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminUsersIndexPage.table.school')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminUsersIndexPage.table.points')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('adminUsersIndexPage.table.registeredAt')}</th>
                                <th className=" py-4 px-6 text-sm font-semibold text-gray-700">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {optimizedUsers && optimizedUsers.length > 0 ? (
                                optimizedUsers.map((user) => {
                                    const deleting = isDeleting(user.id);
                                    return (
                                        <tr
                                            key={user.id}
                                            className={`hover:bg-gray-50 ${selectedUsers.includes(user.id) ? 'bg-blue-50' : ''} ${deleting ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            <td className="py-4 px-6">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={() => handleSelectUser(user.id)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-900">#{user.id}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <FaUser className="text-blue-600" />
                                                    </div>
                                                    <span className="font-medium text-gray-900">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{user.email}</td>
                                            <td className="py-4 px-6">{getRoleBadge(user.role, user.account_type)}</td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{user.school_name}</td>
                                            <td className="py-4 px-6">
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                    {user.points || 0}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-700">{user.created_at}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('admin.users.show', user.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title={t('common.viewDetails')}
                                                    >
                                                        <FaEye />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                                        title={t('common.edit')}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        disabled={deleting}
                                                        className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title={deleting ? t('adminUsersIndexPage.deleting') : t('common.delete')}
                                                    >
                                                        {deleting ? (
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
                                    <td colSpan="9" className="py-12 text-center text-gray-500">
                                        {t('adminUsersIndexPage.empty')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.links && users.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {t('adminUsersIndexPage.paginationSummary', { from: users.from, to: users.to, total: users.total })}
                            </div>
                            <div className="flex gap-2">
                                {users.links.map((link, index) => (
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

            {/* Edit Modal */}
            {showEditModal && userToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">{t('adminUsersIndexPage.editModal.title')}</h3>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('common.name')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    {editErrors.name && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('common.email')} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData('email', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    />
                                    {editErrors.email && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.email}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('common.phone')}
                                    </label>
                                    <PhoneInput
                                        id="phone"
                                        name="phone"
                                        value={editData.phone}
                                        onChange={(full) => setEditData('phone', full)}
                                        error={editErrors.phone}
                                    />
                                </div>

                                {/* Account Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('adminUsersIndexPage.editModal.accountTypeLabel')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editData.account_type}
                                        onChange={(e) => setEditData('account_type', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.account_type ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    >
                                        <option value="regular">{t('adminUsersIndexPage.accountTypes.regular')}</option>
                                        <option value="project">{t('adminUsersIndexPage.accountTypes.project')}</option>
                                    </select>
                                    {editErrors.account_type && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.account_type}</p>
                                    )}
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('adminUsersIndexPage.editModal.roleLabel')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editData.role}
                                        onChange={(e) => setEditData('role', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.role ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        required
                                    >
                                        <option value="student">{t('adminUsersIndexPage.roles.student')}</option>
                                        <option value="teacher">{t('adminUsersIndexPage.roles.teacher')}</option>
                                        <option value="school">{t('adminUsersIndexPage.roles.school')}</option>
                                        <option value="educational_institution">{t('adminUsersIndexPage.roles.educationalInstitution')}</option>
                                        <option value="admin">{t('adminUsersIndexPage.roles.admin')}</option>
                                        {editData.account_type === 'project' && (
                                            <>
                                                <option value="system_supervisor">{t('adminUsersIndexPage.roles.systemSupervisor')}</option>
                                                <option value="school_support_coordinator">{t('adminUsersIndexPage.roles.schoolSupportCoordinator')}</option>
                                            </>
                                        )}
                                    </select>
                                    {editErrors.role && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.role}</p>
                                    )}
                                </div>

                                {/* Membership Type */}
                                {editData.account_type === 'regular' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminUsersIndexPage.editModal.membershipTypeLabel')}
                                        </label>
                                        <select
                                            value={editData.membership_type}
                                            onChange={(e) => setEditData('membership_type', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.membership_type ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">{t('adminUsersIndexPage.membershipTypes.none')}</option>
                                            <option value="basic">{t('adminUsersIndexPage.membershipTypes.basic')}</option>
                                            <option value="subscription">{t('adminUsersIndexPage.membershipTypes.subscription')}</option>
                                        </select>
                                        {editErrors.membership_type && (
                                            <p className="mt-1 text-sm text-red-600">{editErrors.membership_type}</p>
                                        )}
                                    </div>
                                )}

                                {/* School */}
                                {editData.role === 'student' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('adminUsersIndexPage.editModal.schoolLabel')}
                                        </label>
                                        <select
                                            value={editData.school_id}
                                            onChange={(e) => setEditData('school_id', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.school_id ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">{t('adminUsersIndexPage.editModal.selectSchool')}</option>
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
                                )}

                                {/* Points */}
                                {editData.role === 'student' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('adminUsersIndexPage.editModal.pointsLabel')}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editData.points}
                                            onChange={(e) => setEditData('points', parseInt(e.target.value) || 0)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.points ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {editErrors.points && (
                                            <p className="mt-1 text-sm text-red-600">{editErrors.points}</p>
                                        )}
                                    </div>
                                )}

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('adminUsersIndexPage.editModal.passwordHint')}
                                    </label>
                                    <input
                                        type="password"
                                        value={editData.password}
                                        onChange={(e) => setEditData('password', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.password ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {editErrors.password && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.password}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                {editData.password && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('adminUsersIndexPage.editModal.passwordConfirmLabel')}
                                        </label>
                                        <input
                                            type="password"
                                            value={editData.password_confirmation}
                                            onChange={(e) => setEditData('password_confirmation', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${editErrors.password_confirmation ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {editErrors.password_confirmation && (
                                            <p className="mt-1 text-sm text-red-600">{editErrors.password_confirmation}</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-6 py-2 bg-[#A3C042] hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                                >
                                    <FaSave />
                                    {editProcessing ? t('adminUsersIndexPage.editModal.saving') : t('adminUsersIndexPage.editModal.update')}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg flex items-center gap-2"
                                >
                                    <FaTimes />
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('adminUsersIndexPage.deleteConfirm.title')}</h3>
                        <p className="text-gray-700 mb-6">
                            {t('adminUsersIndexPage.deleteConfirm.message', { name: userToDelete?.name || '' })}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                            >
                                {t('common.delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('adminUsersIndexPage.bulkDeleteConfirm.title')}</h3>
                        <p className="text-gray-700 mb-6">
                            {t('adminUsersIndexPage.bulkDeleteConfirm.message', { count: selectedUsers.length })}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowBulkDeleteModal(false);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={confirmBulkDelete}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                            >
                                {t('adminUsersIndexPage.actions.deleteSelectedOnly')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </DashboardLayout>
    );
}
