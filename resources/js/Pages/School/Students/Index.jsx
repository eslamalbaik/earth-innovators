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
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';
import PhoneInput from '@/Components/PhoneInput';

export default function Index({ auth, students, availableBadges }) {
    const { t, language } = useTranslation();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBadgeModal, setShowBadgeModal] = useState(false);
    const [showBadgesListModal, setShowBadgesListModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { confirm } = useConfirmDialog();

    const createForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        year: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        year: '',
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
            year: student.year || '',
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

    const handleDelete = async (studentId, studentName) => {
        const confirmed = await confirm({
            title: t('schoolStudentsIndexPage.deleteConfirm.title'),
            message: t('schoolStudentsIndexPage.deleteConfirm.message', { name: studentName }),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
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

    const handleRemoveBadge = async (badgeId, badgeName) => {
        const confirmed = await confirm({
            title: t('schoolStudentsIndexPage.removeBadgeConfirm.title'),
            message: t('schoolStudentsIndexPage.removeBadgeConfirm.message', { name: badgeName }),
            confirmText: t('schoolStudentsIndexPage.actions.remove'),
            cancelText: t('common.cancel'),
            variant: 'warning',
        });

        if (confirmed) {
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
        <DashboardLayout header={t('schoolStudentsIndexPage.title')}>
            <Head title={t('schoolStudentsIndexPage.pageTitle', { appName: t('common.appName') })} />

            <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
                {/* رأس الصفحة */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <FaUsers className="text-[#A3C042]" />
                                {t('schoolStudentsIndexPage.title')}
                            </h2>
                            <p className="text-gray-600 mt-1">{t('schoolStudentsIndexPage.totalStudents', { count: students.total })}</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[#A3C042] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
                        >
                            <FaPlus />
                            {t('schoolStudentsIndexPage.actions.addNew')}
                        </button>
                    </div>

                    {/* البحث */}
                    <div className="relative">
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('schoolStudentsIndexPage.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* جدول الطلاب */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10">
                                <tr>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('schoolStudentsIndexPage.table.membershipNumber')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('schoolStudentsIndexPage.table.year')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.name')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.email')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('schoolStudentsIndexPage.table.phone')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.points')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.projects')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.badges')}
                                    </th>
                                    <th className="px-6 py-3  text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? t('schoolStudentsIndexPage.empty.search') : t('schoolStudentsIndexPage.empty.default')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-[#A3C042]">
                                                    {student.membership_number || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-700">
                                                    {student.year || '-'}
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
                                                    {t('schoolStudentsIndexPage.projectsCount', { total: student.projects_count, approved: student.approved_projects })}
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
                                                        title={t('schoolStudentsIndexPage.actions.awardBadge')}
                                                    >
                                                        <FaAward />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(student)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                                                        title={t('common.edit')}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(student.id, student.name)}
                                                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                                                        title={t('common.delete')}
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
                                            {t('common.previous')}
                                        </Link>
                                    )}
                                    {students.links[students.links.length - 1].url && (
                                        <Link
                                            href={students.links[students.links.length - 1].url}
                                            className="me-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            {t('common.next')}
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            {t('schoolStudentsIndexPage.pagination.showing', { from: students.from, to: students.to, total: students.total })}
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {students.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${link.active
                                                        ? 'z-10 bg-[#A3C042] border-[#A3C042] text-white'
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
                        <h3 className="text-lg font-bold text-gray-900">{t('schoolStudentsIndexPage.modals.create.title')}</h3>
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
                            <InputLabel htmlFor="name" value={t('common.name')} />
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
                            <InputLabel htmlFor="email" value={t('common.email')} />
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
                            <InputLabel htmlFor="phone" value={t('schoolStudentsIndexPage.form.phoneOptional')} />
                            <PhoneInput
                                id="phone"
                                name="phone"
                                value={createForm.data.phone}
                                onChange={(full) => createForm.setData('phone', full)}
                                error={createForm.errors.phone}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value={t('common.password')} />
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

                        <div>
                            <InputLabel htmlFor="year" value={t('schoolStudentsIndexPage.form.year')} />
                            <TextInput
                                id="year"
                                type="number"
                                className="mt-1 block w-full"
                                value={createForm.data.year}
                                onChange={(e) => createForm.setData('year', e.target.value)}
                                placeholder={t('schoolStudentsIndexPage.form.yearPlaceholder')}
                            />
                            <InputError message={createForm.errors.year} className="mt-2" />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={() => setShowCreateModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <PrimaryButton type="submit" disabled={createForm.processing}>
                            {t('common.add')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal تعديل طالب */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                <form onSubmit={handleUpdate} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">{t('schoolStudentsIndexPage.modals.edit.title')}</h3>
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
                            <InputLabel htmlFor="edit_name" value={t('common.name')} />
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
                            <InputLabel htmlFor="edit_email" value={t('common.email')} />
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
                            <InputLabel htmlFor="edit_phone" value={t('schoolStudentsIndexPage.form.phoneOptional')} />
                            <PhoneInput
                                id="edit_phone"
                                name="phone"
                                value={editForm.data.phone}
                                onChange={(full) => editForm.setData('phone', full)}
                                error={editForm.errors.phone}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_year" value={t('schoolStudentsIndexPage.form.year')} />
                            <TextInput
                                id="edit_year"
                                type="number"
                                className="mt-1 block w-full"
                                value={editForm.data.year}
                                onChange={(e) => editForm.setData('year', e.target.value)}
                                placeholder={t('schoolStudentsIndexPage.form.yearPlaceholder')}
                            />
                            <InputError message={editForm.errors.year} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_password" value={t('schoolStudentsIndexPage.form.passwordOptionalHint')} />
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
                            {t('common.cancel')}
                        </button>
                        <PrimaryButton type="submit" disabled={editForm.processing}>
                            {t('schoolStudentsIndexPage.actions.update')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal منح شارة */}
            <Modal show={showBadgeModal} onClose={() => setShowBadgeModal(false)}>
                <form onSubmit={handleSubmitBadge} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            {t('schoolStudentsIndexPage.modals.awardBadge.title', { name: selectedStudent?.name })}
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
                            <InputLabel htmlFor="badge_id" value={t('common.badges')} />
                            <select
                                id="badge_id"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                value={badgeForm.data.badge_id}
                                onChange={(e) => badgeForm.setData('badge_id', e.target.value)}
                                required
                            >
                                <option value="">{t('schoolStudentsIndexPage.form.selectBadge')}</option>
                                {availableBadges.map((badge) => (
                                    <option key={badge.id} value={badge.id}>
                                        {badge.name_ar || badge.name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={badgeForm.errors.badge_id} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="reason" value={t('schoolStudentsIndexPage.form.reasonOptional')} />
                            <textarea
                                id="reason"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
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
                            {t('common.cancel')}
                        </button>
                        <PrimaryButton type="submit" disabled={badgeForm.processing}>
                            {t('schoolStudentsIndexPage.actions.awardBadge')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal عرض الشارات */}
            <Modal show={showBadgesListModal} onClose={() => setShowBadgesListModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                            {t('schoolStudentsIndexPage.modals.badgesList.title', { name: selectedStudent?.name })}
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
                                        onClick={() => handleRemoveBadge(badge.id, badge.name_ar || badge.name)}
                                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                                        title={t('schoolStudentsIndexPage.actions.removeBadge')}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">{t('schoolStudentsIndexPage.badgesList.empty')}</p>
                    )}
                </div>
            </Modal>
        </DashboardLayout>
    );
}

