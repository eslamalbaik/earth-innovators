import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useMemo, useState } from 'react';
import {
    FaUsers, FaSearch, FaProjectDiagram, FaStar, FaMedal, FaPlus, FaEdit, FaTrash,
} from 'react-icons/fa';
import { useTranslation } from '@/i18n';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import PhoneInput from '@/Components/PhoneInput';

export default function Index({ auth, students }) {
    const { t } = useTranslation();
    const { confirm } = useConfirmDialog();
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const studentRows = students?.data || [];

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

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post('/teacher/students', {
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
            name: student.name || '',
            email: student.email || '',
            phone: student.phone || '',
            password: '',
            year: student.year || '',
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!selectedStudent) return;

        editForm.put(`/teacher/students/${selectedStudent.id}`, {
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
            title: t('teacherStudentsPage.deleteConfirm.title'),
            message: t('teacherStudentsPage.deleteConfirm.message', { name: studentName }),
            confirmText: t('common.delete'),
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(`/teacher/students/${studentId}`, {
                preserveScroll: true,
            });
        }
    };

    const filteredStudents = useMemo(() => studentRows.filter((student) => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();

        return (
            student.name?.toLowerCase().includes(search) ||
            student.email?.toLowerCase().includes(search) ||
            (student.phone && student.phone.includes(search))
        );
    }), [searchTerm, studentRows]);

    return (
        <DashboardLayout header={t('teacherStudentsPage.title')}>
            <Head title={t('teacherStudentsPage.pageTitle', { appName: t('common.appName') })} />

            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <FaUsers className="text-[#A3C042]" />
                                {t('teacherStudentsPage.title')}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {t('teacherStudentsPage.totalStudents', { count: students?.total || 0 })}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[#A3C042] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
                        >
                            <FaPlus />
                            {t('teacherStudentsPage.actions.addNew')}
                        </button>
                    </div>

                    <div className="relative">
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('teacherStudentsPage.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('teacherStudentsPage.table.year')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('teacherStudentsPage.table.name')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('teacherStudentsPage.table.email')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('teacherStudentsPage.table.phone')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('teacherStudentsPage.table.points')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('teacherStudentsPage.table.projects')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('teacherStudentsPage.table.teacherProjects')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('teacherStudentsPage.table.badges')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? t('teacherStudentsPage.empty.search') : t('teacherStudentsPage.empty.default')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{student.year || '-'}</div>
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
                                                    {student.points || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <FaProjectDiagram />
                                                    {student.projects_count || 0} ({t('teacherStudentsPage.approvedProjectsCount', { count: student.approved_projects || 0 })})
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-[#A3C042]">
                                                    {student.teacher_projects_count || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <FaMedal className="text-orange-500" />
                                                    <span className="text-sm text-gray-600">{student.badges_count || 0}</span>
                                                    {student.badges && student.badges.length > 0 && (
                                                        <div className="flex -space-x-2">
                                                            {student.badges.slice(0, 3).map((badge) => (
                                                                <div
                                                                    key={badge.id}
                                                                    className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-xs"
                                                                    title={badge.name_ar || badge.name}
                                                                >
                                                                    {badge.icon || '🏅'}
                                                                </div>
                                                            ))}
                                                            {student.badges.length > 3 && (
                                                                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                                                                    +{student.badges.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(student)}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <FaEdit className="text-legacy-blue" />
                                                        {t('common.edit')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(student.id, student.name)}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <FaTrash />
                                                        {t('common.delete')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

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
                                            {t('teacherStudentsPage.paginationSummary', {
                                                from: students.from || 0,
                                                to: students.to || 0,
                                                total: students.total || 0,
                                            })}
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

            {/* Create */}
            <Modal show={showCreateModal} onClose={() => { setShowCreateModal(false); createForm.reset(); }} maxWidth="lg">
                <div className="p-6 border-b border-gray-200 font-bold text-gray-900">
                    {t('teacherStudentsPage.createModal.title')}
                </div>
                <form onSubmit={handleCreate} className="p-6 space-y-4">
                    <div>
                        <InputLabel value={t('common.name')} />
                        <TextInput
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={createForm.errors.name} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel value={t('common.email')} />
                        <TextInput
                            type="email"
                            value={createForm.data.email}
                            onChange={(e) => createForm.setData('email', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={createForm.errors.email} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel value={t('common.phone')} />
                        <PhoneInput
                            value={createForm.data.phone}
                            onChange={(val) => createForm.setData('phone', val)}
                        />
                        <InputError message={createForm.errors.phone} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel value={t('teacherStudentsPage.form.year')} />
                        <TextInput
                            value={createForm.data.year}
                            onChange={(e) => createForm.setData('year', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={createForm.errors.year} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel value={t('common.password')} />
                        <TextInput
                            type="password"
                            value={createForm.data.password}
                            onChange={(e) => createForm.setData('password', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={createForm.errors.password} className="mt-1" />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setShowCreateModal(false); createForm.reset(); }}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                            {t('common.cancel')}
                        </button>
                        <PrimaryButton disabled={createForm.processing}>
                            {createForm.processing ? t('common.processing') : t('common.create')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Edit */}
            <Modal show={showEditModal} onClose={() => { setShowEditModal(false); setSelectedStudent(null); editForm.reset(); }} maxWidth="lg">
                <div className="p-6 border-b border-gray-200 font-bold text-gray-900">
                    {t('teacherStudentsPage.editModal.title')}
                </div>
                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    <div>
                        <InputLabel value={t('common.name')} />
                        <TextInput
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={editForm.errors.name} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel value={t('common.email')} />
                        <TextInput
                            type="email"
                            value={editForm.data.email}
                            onChange={(e) => editForm.setData('email', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={editForm.errors.email} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel value={t('common.phone')} />
                        <PhoneInput
                            value={editForm.data.phone}
                            onChange={(val) => editForm.setData('phone', val)}
                        />
                        <InputError message={editForm.errors.phone} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel value={t('teacherStudentsPage.form.year')} />
                        <TextInput
                            value={editForm.data.year}
                            onChange={(e) => editForm.setData('year', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={editForm.errors.year} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel value={t('teacherStudentsPage.form.newPasswordOptional')} />
                        <TextInput
                            type="password"
                            value={editForm.data.password}
                            onChange={(e) => editForm.setData('password', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={editForm.errors.password} className="mt-1" />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setShowEditModal(false); setSelectedStudent(null); editForm.reset(); }}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                            {t('common.cancel')}
                        </button>
                        <PrimaryButton disabled={editForm.processing}>
                            {editForm.processing ? t('common.processing') : t('common.save')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
