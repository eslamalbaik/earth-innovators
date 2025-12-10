import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import {
    FaUsers, FaPlus, FaEdit, FaTrash, FaMedal, FaSearch,
    FaTimes, FaCheck, FaProjectDiagram, FaStar, FaAward
} from 'react-icons/fa';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function Index({ auth, students, availableBadges }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [showBadgesListModal, setShowBadgesListModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const createForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
    });

    const badgeForm = useForm({
        badge_id: '',
        reason: '',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post('/school/students', {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        editForm.setData({
            name: student.name,
            email: student.email,
            phone: student.phone || '',
            password: '',
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.put(`/school/students/${selectedStudent.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedStudent(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (studentId) => {
        if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
            router.delete(`/school/students/${studentId}`, {
                preserveScroll: true,
            });
        }
    };

    const handleAwardBadge = (student) => {
        setSelectedStudent(student);
        badgeForm.reset();
        setShowBadgeModal(true);
    };

    const handleSubmitBadge = (e) => {
        e.preventDefault();
        badgeForm.post(`/school/students/${selectedStudent.id}/award-badge`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowBadgeModal(false);
                setSelectedStudent(null);
                badgeForm.reset();
            },
        });
    };

    const handleViewBadges = (student) => {
        setSelectedStudent(student);
        setShowBadgesListModal(true);
    };

    const handleRemoveBadge = (badgeId) => {
        if (confirm('هل أنت متأكد من إزالة هذه الشارة؟')) {
            router.delete(`/school/students/${selectedStudent.id}/badges/${badgeId}`, {
                preserveScroll: true,
            });
        }
    };

    const filteredStudents = students.data.filter(student => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            student.name.toLowerCase().includes(search) ||
            student.email.toLowerCase().includes(search) ||
            (student.phone && student.phone.includes(search)) ||
            (student.membership_number && student.membership_number.toLowerCase().includes(search))
        );
    });

    return (
        <DashboardLayout header="إدارة الطلاب">
            <Head title="إدارة الطلاب - إرث المبتكرين" />

            <div className="space-y-6">
                {/* رأس الصفحة */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <FaUsers className="text-legacy-green" />
                                إدارة الطلاب
                            </h2>
                            <p className="text-gray-600 mt-1">إجمالي الطلاب: {students.total}</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-legacy-green to-legacy-blue text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
                        >
                            <FaPlus />
                            إضافة طالب جديد
                        </button>
                    </div>

                    {/* البحث */}
                    <div className="relative">
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث عن طالب (الاسم، البريد، الهاتف، رقم العضوية)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-legacy-green focus:border-transparent"
                        />
                    </div>
                </div>

                {/* جدول الطلاب */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        رقم العضوية
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        الاسم
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        البريد الإلكتروني
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        الهاتف
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        النقاط
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        المشاريع
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        الشارات
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? 'لا توجد نتائج للبحث' : 'لا يوجد طلاب مسجلين'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-legacy-green">
                                                    {student.membership_number || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{student.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{student.phone || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                                                    <FaStar />
                                                    {student.points}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <FaProjectDiagram />
                                                    {student.projects_count} ({student.approved_projects} معتمد)
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleViewBadges(student)}
                                                    className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
                                                >
                                                    <FaMedal />
                                                    {student.badges_count}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleAwardBadge(student)}
                                                        className="text-orange-600 hover:text-orange-900 p-2 rounded hover:bg-orange-50"
                                                        title="منح شارة"
                                                    >
                                                        <FaAward />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(student)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                                                        title="تعديل"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(student.id)}
                                                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                                                        title="حذف"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {students.links && students.links.length > 3 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {students.links[0].url && (
                                        <Link
                                            href={students.links[0].url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            السابق
                                        </Link>
                                    )}
                                    {students.links[students.links.length - 1].url && (
                                        <Link
                                            href={students.links[students.links.length - 1].url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            التالي
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            عرض <span className="font-medium">{students.from}</span> إلى{' '}
                                            <span className="font-medium">{students.to}</span> من{' '}
                                            <span className="font-medium">{students.total}</span> نتيجة
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {students.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-legacy-green border-legacy-green text-white'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal إضافة طالب */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <form onSubmit={handleCreate} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">إضافة طالب جديد</h3>
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name" value="الاسم" />
                            <TextInput
                                id="name"
                                type="text"
                                className="mt-1 block w-full"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="البريد الإلكتروني" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="phone" value="الهاتف (اختياري)" />
                            <TextInput
                                id="phone"
                                type="text"
                                className="mt-1 block w-full"
                                value={createForm.data.phone}
                                onChange={(e) => createForm.setData('phone', e.target.value)}
                            />
                            <InputError message={createForm.errors.phone} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="كلمة المرور" />
                            <TextInput
                                id="password"
                                type="password"
                                className="mt-1 block w-full"
                                value={createForm.data.password}
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                required
                            />
                            <InputError message={createForm.errors.password} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            إلغاء
                        </button>
                        <PrimaryButton type="submit" disabled={createForm.processing}>
                            إضافة
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal تعديل طالب */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                <form onSubmit={handleUpdate} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">تعديل بيانات الطالب</h3>
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="edit_name" value="الاسم" />
                            <TextInput
                                id="edit_name"
                                type="text"
                                className="mt-1 block w-full"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_email" value="البريد الإلكتروني" />
                            <TextInput
                                id="edit_email"
                                type="email"
                                className="mt-1 block w-full"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                required
                            />
                            <InputError message={editForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_phone" value="الهاتف (اختياري)" />
                            <TextInput
                                id="edit_phone"
                                type="text"
                                className="mt-1 block w-full"
                                value={editForm.data.phone}
                                onChange={(e) => editForm.setData('phone', e.target.value)}
                            />
                            <InputError message={editForm.errors.phone} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_password" value="كلمة المرور (اتركه فارغاً إذا لم ترد تغييره)" />
                            <TextInput
                                id="edit_password"
                                type="password"
                                className="mt-1 block w-full"
                                value={editForm.data.password}
                                onChange={(e) => editForm.setData('password', e.target.value)}
                            />
                            <InputError message={editForm.errors.password} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowEditModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            إلغاء
                        </button>
                        <PrimaryButton type="submit" disabled={editForm.processing}>
                            تحديث
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal منح شارة */}
            <Modal show={showBadgeModal} onClose={() => setShowBadgeModal(false)}>
                <form onSubmit={handleSubmitBadge} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            منح شارة للطالب: {selectedStudent?.name}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowBadgeModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="badge_id" value="الشارة" />
                            <select
                                id="badge_id"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                                value={badgeForm.data.badge_id}
                                onChange={(e) => badgeForm.setData('badge_id', e.target.value)}
                                required
                            >
                                <option value="">اختر شارة</option>
                                {availableBadges.map((badge) => (
                                    <option key={badge.id} value={badge.id}>
                                        {badge.name_ar || badge.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={badgeForm.errors.badge_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="reason" value="السبب (اختياري)" />
                            <textarea
                                id="reason"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-legacy-green focus:ring-legacy-green"
                                rows="3"
                                value={badgeForm.data.reason}
                                onChange={(e) => badgeForm.setData('reason', e.target.value)}
                            />
                            <InputError message={badgeForm.errors.reason} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowBadgeModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            إلغاء
                        </button>
                        <PrimaryButton type="submit" disabled={badgeForm.processing}>
                            منح الشارة
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal عرض الشارات */}
            <Modal show={showBadgesListModal} onClose={() => setShowBadgesListModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            شارات الطالب: {selectedStudent?.name}
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowBadgesListModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {selectedStudent?.badges && selectedStudent.badges.length > 0 ? (
                        <div className="space-y-3">
                            {selectedStudent.badges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        {badge.icon && (
                                            <div className="text-2xl">{badge.icon}</div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {badge.name_ar || badge.name}
                                            </p>
                                            {badge.pivot?.reason && (
                                                <p className="text-sm text-gray-600">{badge.pivot.reason}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveBadge(badge.id)}
                                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                                        title="إزالة الشارة"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">لا توجد شارات ممنوحة لهذا الطالب</p>
                    )}
                </div>
            </Modal>
        </DashboardLayout>
    );
}

