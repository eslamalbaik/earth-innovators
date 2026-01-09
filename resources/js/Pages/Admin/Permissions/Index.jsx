import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import { 
    FaSearch, 
    FaFilter, 
    FaEdit, 
    FaTrash, 
    FaPlus,
    FaUser,
    FaShieldAlt,
    FaUserShield,
    FaUserTie,
} from 'react-icons/fa';

export default function PermissionsIndex({ adminUsers, stats, filters, auth }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || 'all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleSearch = useCallback(() => {
        router.get(route('admin.permissions.index'), {
            search: search || undefined,
            role: roleFilter !== 'all' ? roleFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['adminUsers', 'filters'],
        });
    }, [search, roleFilter]);

    const handleDelete = useCallback((user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    }, []);

    const confirmDelete = useCallback(() => {
        if (userToDelete) {
            router.delete(route('admin.permissions.destroy', userToDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                },
            });
        }
    }, [userToDelete]);

    const getRoleBadge = (role) => {
        const roleMap = {
            'admin': { bg: 'bg-red-100', text: 'text-red-800', label: 'مدير', icon: FaUser },
            'system_supervisor': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'مشرف النظام', icon: FaShieldAlt },
            'school_support_coordinator': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'منسق دعم المؤسسات تعليمية', icon: FaUserTie },
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
        <DashboardLayout header="إدارة الصلاحيات" auth={auth}>
            <Head title="إدارة الصلاحيات" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">إجمالي المستخدمين الإداريين</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.total_admin_users || 0}</p>
                        </div>
                        <FaUserShield className="text-3xl text-gray-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">مشرفو النظام</p>
                            <p className="text-3xl font-bold text-orange-600">{stats?.system_supervisors || 0}</p>
                        </div>
                        <FaShieldAlt className="text-3xl text-orange-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">منسقو دعم المؤسسات تعليمية</p>
                            <p className="text-3xl font-bold text-indigo-600">{stats?.school_support_coordinators || 0}</p>
                        </div>
                        <FaUserTie className="text-3xl text-indigo-400" />
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">المدراء</p>
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
                                    placeholder="ابحث بالاسم أو البريد الإلكتروني..."
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
                                <option value="admin">مدير</option>
                                <option value="system_supervisor">مشرف النظام</option>
                                <option value="school_support_coordinator">منسق دعم المؤسسات تعليمية</option>
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
                        href={route('admin.permissions.create')}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                    >
                        <FaPlus />
                        إضافة مستخدم إداري
                    </Link>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الاسم
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    البريد الإلكتروني
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الهاتف
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    نوع الصلاحية
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    تاريخ الإنشاء
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    الإجراءات
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {adminUsers?.data?.length > 0 ? (
                                adminUsers.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.phone || '—'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.created_at}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={route('admin.permissions.edit', user.id)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    <FaEdit className="text-lg" />
                                                </Link>
                                                {user.id !== auth.user.id && (
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <FaTrash className="text-lg" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        لا توجد بيانات
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {adminUsers?.links && adminUsers.links.length > 3 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            {adminUsers.links[0].url && (
                                <Link
                                    href={adminUsers.links[0].url}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    السابق
                                </Link>
                            )}
                            {adminUsers.links[adminUsers.links.length - 1].url && (
                                <Link
                                    href={adminUsers.links[adminUsers.links.length - 1].url}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    التالي
                                </Link>
                            )}
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    عرض <span className="font-medium">{adminUsers.from}</span> إلى{' '}
                                    <span className="font-medium">{adminUsers.to}</span> من{' '}
                                    <span className="font-medium">{adminUsers.total}</span> نتيجة
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    {adminUsers.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                link.active
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            } ${index === 0 ? 'rounded-r-md' : index === adminUsers.links.length - 1 ? 'rounded-l-md' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <FaTrash className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mt-5">تأكيد الحذف</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500">
                                    هل أنت متأكد من حذف المستخدم الإداري "{userToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
                                </p>
                            </div>
                            <div className="items-center px-4 py-3 flex gap-3 justify-center">
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    حذف
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setUserToDelete(null);
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
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

