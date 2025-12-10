import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
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
    FaTimes
} from 'react-icons/fa';

export default function UsersIndex({ users, stats, filters, auth, schools: initialSchools }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || 'all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToEdit, setUserToEdit] = useState(null);
    const [schools, setSchools] = useState(initialSchools || []);

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

    const { data: editData, setData: setEditData, put: updateUser, processing: editProcessing, errors: editErrors, reset: resetEditForm } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'student',
        school_id: '',
        points: 0,
    });

    const handleSearch = () => {
        router.get(route('admin.users.index'), {
            search: search || undefined,
            role: roleFilter !== 'all' ? roleFilter : undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(route('admin.users.destroy', userToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                },
            });
        }
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

    const getRoleBadge = (role) => {
        const roleMap = {
            'admin': { bg: 'bg-red-100', text: 'text-red-800', label: 'أدمن', icon: FaUser },
            'teacher': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'معلم', icon: FaChalkboardTeacher },
            'student': { bg: 'bg-green-100', text: 'text-green-800', label: 'طالب', icon: FaGraduationCap },
            'school': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'مدرسة', icon: FaSchool },
        };
        const roleConfig = roleMap[role] || { bg: 'bg-gray-100', text: 'text-gray-800', label: role, icon: FaUser };
        const Icon = roleConfig.icon;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleConfig.bg} ${roleConfig.text} flex items-center gap-1 w-fit`}>
                <Icon className="text-xs" />
                {roleConfig.label}
            </span>
        );
    };

    return (
        <DashboardLayout header="إدارة المستخدمين" auth={auth}>
            <Head title="إدارة المستخدمين" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي المستخدمين</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                        </div>
                        <FaUsers className="text-3xl text-gray-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">المدارس</p>
                            <p className="text-3xl font-bold text-blue-600">{stats?.schools || 0}</p>
                        </div>
                        <FaSchool className="text-3xl text-blue-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">الطلاب</p>
                            <p className="text-3xl font-bold text-green-600">{stats?.students || 0}</p>
                        </div>
                        <FaGraduationCap className="text-3xl text-green-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">المعلمون</p>
                            <p className="text-3xl font-bold text-purple-600">{stats?.teachers || 0}</p>
                        </div>
                        <FaChalkboardTeacher className="text-3xl text-purple-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">الأدمن</p>
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
                                    placeholder="ابحث بـ ID، الاسم، البريد الإلكتروني..."
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="md:w-48">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">جميع الأدوار</option>
                                <option value="admin">أدمن</option>
                                <option value="school">مدرسة</option>
                                <option value="teacher">معلم</option>
                                <option value="student">طالب</option>
                            </select>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                        >
                            <FaFilter />
                            بحث
                        </button>
                    </div>
                    <Link
                        href={route('admin.users.create')}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                    >
                        <FaPlus />
                        إضافة مستخدم جديد
                    </Link>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الاسم</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">البريد الإلكتروني</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الدور</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المدرسة</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">النقاط</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">تاريخ التسجيل</th>
                                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.data && users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
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
                                        <td className="py-4 px-6">{getRoleBadge(user.role)}</td>
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
                                                    title="عرض التفاصيل"
                                                >
                                                    <FaEye />
                                                </Link>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                                    title="تعديل"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
                                    <td colSpan="8" className="py-12 text-center text-gray-500">
                                        لا توجد مستخدمين
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
                                عرض {users.from} إلى {users.to} من {users.total} مستخدم
                            </div>
                            <div className="flex gap-2">
                                {users.links.map((link, index) => (
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
            {showEditModal && userToEdit && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">تعديل مستخدم</h3>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* الاسم */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الاسم <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {editErrors.name && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.name}</p>
                                    )}
                                </div>

                                {/* البريد الإلكتروني */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        البريد الإلكتروني <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData('email', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {editErrors.email && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.email}</p>
                                    )}
                                </div>

                                {/* الهاتف */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الهاتف
                                    </label>
                                    <input
                                        type="tel"
                                        value={editData.phone}
                                        onChange={(e) => setEditData('phone', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.phone ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {editErrors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.phone}</p>
                                    )}
                                </div>

                                {/* الدور */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الدور <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={editData.role}
                                        onChange={(e) => setEditData('role', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.role ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="student">طالب</option>
                                        <option value="teacher">معلم</option>
                                        <option value="school">مدرسة</option>
                                        <option value="admin">أدمن</option>
                                    </select>
                                    {editErrors.role && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.role}</p>
                                    )}
                                </div>

                                {/* المدرسة */}
                                {editData.role === 'student' && (
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
                                )}

                                {/* النقاط */}
                                {editData.role === 'student' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            النقاط
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editData.points}
                                            onChange={(e) => setEditData('points', parseInt(e.target.value) || 0)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                editErrors.points ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {editErrors.points && (
                                            <p className="mt-1 text-sm text-red-600">{editErrors.points}</p>
                                        )}
                                    </div>
                                )}

                                {/* كلمة المرور */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        كلمة المرور (اتركه فارغاً إذا لم تريد تغييره)
                                    </label>
                                    <input
                                        type="password"
                                        value={editData.password}
                                        onChange={(e) => setEditData('password', e.target.value)}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                            editErrors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    {editErrors.password && (
                                        <p className="mt-1 text-sm text-red-600">{editErrors.password}</p>
                                    )}
                                </div>

                                {/* تأكيد كلمة المرور */}
                                {editData.password && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            تأكيد كلمة المرور
                                        </label>
                                        <input
                                            type="password"
                                            value={editData.password_confirmation}
                                            onChange={(e) => setEditData('password_confirmation', e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                editErrors.password_confirmation ? 'border-red-500' : 'border-gray-300'
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

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">تأكيد الحذف</h3>
                        <p className="text-gray-700 mb-6">
                            هل أنت متأكد من حذف المستخدم <strong>{userToDelete?.name}</strong>؟
                            <br />
                            <span className="text-sm text-red-600">هذا الإجراء لا يمكن التراجع عنه.</span>
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
                            >
                                حذف
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
