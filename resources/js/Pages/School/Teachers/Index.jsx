import { Head, Link, router, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import {
    FaChalkboardTeacher, FaPlus, FaEdit, FaTrash, FaSearch,
    FaTimes, FaEnvelope, FaPhone, FaIdCard, FaStar
} from 'react-icons/fa';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { useConfirmDialog } from '@/Contexts/ConfirmContext';
import { useTranslation } from '@/i18n';
import PhoneInput from '@/Components/PhoneInput';

export default function Index({ auth, teachers, availableTeachers = [] }) {
    const { t, language } = useTranslation();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [createMode, setCreateMode] = useState('existing');
    const { confirm } = useConfirmDialog();

    const createForm = useForm({
        existing_teacher_id: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createForm.post('/school/teachers', {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateModal(false);
                createForm.reset();
            },
        });
    };

    const closeCreateModal = () => {
        setShowCreateModal(false);
        setCreateMode('existing');
        createForm.reset();
    };

    const handleEdit = (teacher) => {
        setSelectedTeacher(teacher);
        editForm.setData({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone || '',
            password: '',
            password_confirmation: '',
        });
        setShowEditModal(true);
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.put(`/school/teachers/${selectedTeacher.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedTeacher(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = async (teacherId, teacherName) => {
        const confirmed = await confirm({
            title: 'إزالة المعلم',
            message: `هل أنت متأكد من إزالة المعلم "${teacherName}" من المدرسة؟ سيظل حساب المعلم موجوداً لكنه لن يكون مرتبطاً بمدرستك.`,
            confirmText: 'إزالة',
            cancelText: t('common.cancel'),
            variant: 'danger',
        });

        if (confirmed) {
            router.delete(`/school/teachers/${teacherId}`, {
                preserveScroll: true,
            });
        }
    };

    const filteredTeachers = teachers.data.filter(teacher => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            teacher.name.toLowerCase().includes(search) ||
            teacher.email.toLowerCase().includes(search) ||
            (teacher.phone && teacher.phone.includes(search)) ||
            (teacher.membership_number && teacher.membership_number.toLowerCase().includes(search))
        );
    });

    return (
        <DashboardLayout header="إدارة المعلمين">
            <Head title={`إدارة المعلمين | ${t('common.appName')}`} />

            <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="space-y-6">
                {/* رأس الصفحة */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <FaChalkboardTeacher className="text-[#A3C042]" />
                                إدارة المعلمين
                            </h2>
                            <p className="text-gray-600 mt-1">إجمالي المعلمين: {teachers.total}</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-[#A3C042] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition flex items-center gap-2"
                        >
                            <FaPlus />
                            إضافة معلم
                        </button>
                    </div>

                    {/* البحث */}
                    <div className="relative">
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو البريد الإلكتروني أو رقم الهاتف..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full ps-10 pe-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A3C042] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* جدول المعلمين */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-[#A3C042]/10 to-blue-50">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        رقم العضوية
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.name')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.email')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.phone')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.points')}
                                    </th>
                                    <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        {t('common.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTeachers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            {searchTerm ? 'لا توجد نتائج للبحث' : 'لم يتم إضافة معلمين بعد'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTeachers.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-[#A3C042]">
                                                    {teacher.membership_number || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-[#A3C042]/20 flex items-center justify-center">
                                                        <FaChalkboardTeacher className="text-[#A3C042] text-sm" />
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <FaEnvelope className="text-gray-400 text-xs" />
                                                    {teacher.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                                    <FaPhone className="text-gray-400 text-xs" />
                                                    <span dir="ltr">{teacher.phone || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-sm font-semibold text-purple-600">
                                                    <FaStar />
                                                    {teacher.points}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEdit(teacher)}
                                                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                                                        title={t('common.edit')}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(teacher.id, teacher.name)}
                                                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                                                        title="إزالة من المدرسة"
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
                    {teachers.links && teachers.links.length > 3 && (
                        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            عرض {teachers.from} إلى {teachers.to} من أصل {teachers.total} معلم
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {teachers.links.map((link, index) => (
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

            {/* Modal إضافة معلم */}
            <Modal show={showCreateModal} onClose={closeCreateModal}>
                <form onSubmit={handleCreate} className="p-6" autoComplete="off">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">إضافة معلم للمدرسة</h3>
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setCreateMode('existing');
                                    createForm.clearErrors();
                                }}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition ${createMode === 'existing' ? 'bg-white text-[#A3C042] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                اختيار معلم موجود
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setCreateMode('new');
                                    createForm.setData('existing_teacher_id', '');
                                    createForm.clearErrors();
                                }}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition ${createMode === 'new' ? 'bg-white text-[#A3C042] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                            >
                                إنشاء معلم جديد
                            </button>
                        </div>

                        {createMode === 'existing' && (
                            <div>
                                <InputLabel htmlFor="existing_teacher_id" value="المعلم الموجود" />
                                <select
                                    id="existing_teacher_id"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042]"
                                    value={createForm.data.existing_teacher_id}
                                    onChange={(e) => createForm.setData('existing_teacher_id', e.target.value)}
                                    required={createMode === 'existing'}
                                >
                                    <option value="">اختر معلماً من النظام...</option>
                                    {availableTeachers.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name} - {teacher.email}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={createForm.errors.existing_teacher_id} className="mt-2" />
                                {availableTeachers.length === 0 && (
                                    <p className="mt-2 text-sm text-gray-500">لا يوجد معلمون متاحون للربط حاليًا. يمكنك إنشاء معلم جديد.</p>
                                )}
                            </div>
                        )}

                        {createMode === 'new' && (
                            <>
                                <div>
                                    <InputLabel htmlFor="teacher_name" value={t('common.name')} />
                                    <TextInput
                                        id="teacher_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        autoComplete="off"
                                        required
                                    />
                                    <InputError message={createForm.errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="teacher_email" value={t('common.email')} />
                                    <TextInput
                                        id="teacher_email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        autoComplete="email"
                                        required
                                    />
                                    <InputError message={createForm.errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="teacher_phone" value={`${t('common.phone')} (اختياري)`} />
                                    <PhoneInput
                                        id="teacher_phone"
                                        name="phone"
                                        value={createForm.data.phone}
                                        onChange={(full) => createForm.setData('phone', full)}
                                        error={createForm.errors.phone}
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="teacher_password" value={t('common.password')} />
                                    <TextInput
                                        id="teacher_password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <InputError message={createForm.errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="teacher_password_confirmation" value="تأكيد كلمة المرور" />
                                    <TextInput
                                        id="teacher_password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={createForm.data.password_confirmation}
                                        onChange={(e) => createForm.setData('password_confirmation', e.target.value)}
                                        autoComplete="new-password"
                                        required
                                    />
                                    <InputError message={createForm.errors.password_confirmation} className="mt-2" />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={closeCreateModal}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            {t('common.cancel')}
                        </button>
                        <PrimaryButton type="submit" disabled={createForm.processing}>
                            {createMode === 'existing' ? 'ربط المعلم' : t('common.add')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal تعديل معلم */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                <form onSubmit={handleUpdate} className="p-6" autoComplete="off">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">تعديل بيانات المعلم</h3>
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
                            <InputLabel htmlFor="edit_teacher_name" value={t('common.name')} />
                            <TextInput
                                id="edit_teacher_name"
                                type="text"
                                className="mt-1 block w-full"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                autoComplete="off"
                                required
                            />
                            <InputError message={editForm.errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_teacher_email" value={t('common.email')} />
                            <TextInput
                                id="edit_teacher_email"
                                type="email"
                                className="mt-1 block w-full"
                                value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)}
                                autoComplete="email"
                                required
                            />
                            <InputError message={editForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_teacher_phone" value={`${t('common.phone')} (اختياري)`} />
                            <PhoneInput
                                id="edit_teacher_phone"
                                name="phone"
                                value={editForm.data.phone}
                                onChange={(full) => editForm.setData('phone', full)}
                                error={editForm.errors.phone}
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="edit_teacher_password" value="كلمة مرور جديدة (اتركها فارغة إذا لا تريد التغيير)" />
                            <TextInput
                                id="edit_teacher_password"
                                type="password"
                                className="mt-1 block w-full"
                                value={editForm.data.password}
                                onChange={(e) => editForm.setData('password', e.target.value)}
                                autoComplete="new-password"
                            />
                            <InputError message={editForm.errors.password} className="mt-2" />
                        </div>

                        {editForm.data.password && (
                            <div>
                                <InputLabel htmlFor="edit_teacher_password_confirmation" value="تأكيد كلمة المرور الجديدة" />
                                <TextInput
                                    id="edit_teacher_password_confirmation"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={editForm.data.password_confirmation}
                                    onChange={(e) => editForm.setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                />
                                <InputError message={editForm.errors.password_confirmation} className="mt-2" />
                            </div>
                        )}
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
                            {t('common.save')}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}
