import { Head, router, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { useState } from 'react';
import {
    FaFilePdf, FaDownload, FaSearch, FaUser, FaIdCard,
    FaCalendarAlt, FaGraduationCap, FaEdit, FaTimes, FaCheck
} from 'react-icons/fa';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';
import { useToast } from '@/Contexts/ToastContext';

export default function Index({ auth, students, description }) {
    const { showSuccess, showError } = useToast();
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFormat, setDateFormat] = useState('Y-m-d');

    const [formData, setFormData] = useState({
        student_name: '',
        student_id: '',
        membership_number: '',
        course_name: 'شهادة إتمام',
        subject: '',
        grade: '',
        date: new Date().toISOString().split('T')[0],
        signature: '',
        issued_by: auth.user?.name || '',
    });

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setFormData({
            student_name: student.name,
            student_id: student.id.toString(),
            membership_number: student.membership_number || '',
            course_name: 'شهادة إتمام',
            subject: '',
            grade: '',
            date: new Date().toISOString().split('T')[0],
            signature: '',
            issued_by: auth.user?.name || '',
        });
        setShowGenerateModal(true);
    };

    const handlePreview = () => {
        setPreviewData({ ...formData, date_format: dateFormat });
        setShowPreviewModal(true);
    };

    const handleGenerate = async () => {
        if (!selectedStudent) return;

        setGenerating(true);
        try {
            const response = await axios.post('/api/certificates/generate', {
                student_id: selectedStudent.id,
                overrides: {
                    student_name: formData.student_name,
                    student_id: formData.student_id,
                    membership_number: formData.membership_number,
                    course_name: formData.course_name,
                    subject: formData.subject,
                    grade: formData.grade,
                    signature: formData.signature,
                    issued_by: formData.issued_by,
                },
                date_format: dateFormat,
            });

            if (response.data.success) {
                showSuccess('تم إنشاء الشهادة بنجاح');
                setShowGenerateModal(false);
                setSelectedStudent(null);
                
                // Download the certificate
                if (response.data.certificate.storage_url) {
                    window.open(response.data.certificate.storage_url, '_blank');
                } else if (response.data.certificate.download_url) {
                    window.open(response.data.certificate.download_url, '_blank');
                }
                
                // Refresh the page to update student list
                router.reload();
            } else {
                showError(response.data.message || 'حدث خطأ أثناء إنشاء الشهادة');
            }
        } catch (error) {
            showError(error.response?.data?.message || 'حدث خطأ أثناء إنشاء الشهادة');
        } finally {
            setGenerating(false);
        }
    };

    const formatDatePreview = (dateString, format) => {
        const date = new Date(dateString);
        if (format === 'long') {
            const months = [
                'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
            ];
            return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
        } else if (format === 'short') {
            return date.toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } else {
            return date.toISOString().split('T')[0];
        }
    };

    const filteredStudents = students?.data?.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.membership_number?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <DashboardLayout header="إدارة الشهادات">
            <Head title="الشهادات" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Description */}
                    {description && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-blue-800">{description}</p>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="bg-white rounded-lg shadow mb-6 p-4">
                        <div className="relative">
                            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ابحث عن طالب..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Students List */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الاسم
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            رقم العضوية
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            البريد الإلكتروني
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            عدد الشهادات
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            الإجراءات
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                                لا توجد طلاب
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <FaUser className="ml-2 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {student.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.membership_number || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {student.certificates_count || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => handleSelectStudent(student)}
                                                        className="text-blue-600 hover:text-blue-900 flex items-center"
                                                    >
                                                        <FaFilePdf className="ml-1" />
                                                        إنشاء شهادة
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {students?.links && (
                            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        {students.links.prev && (
                                            <button
                                                onClick={() => router.visit(students.links.prev.url)}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                السابق
                                            </button>
                                        )}
                                        {students.links.next && (
                                            <button
                                                onClick={() => router.visit(students.links.next.url)}
                                                className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                التالي
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Generate Certificate Modal */}
            <Modal show={showGenerateModal} onClose={() => setShowGenerateModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">إنشاء شهادة للطالب: {selectedStudent?.name}</h3>
                        <button
                            onClick={() => setShowGenerateModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="student_name" value="اسم الطالب" />
                            <TextInput
                                id="student_name"
                                type="text"
                                value={formData.student_name}
                                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="membership_number" value="رقم العضوية" />
                            <TextInput
                                id="membership_number"
                                type="text"
                                value={formData.membership_number}
                                onChange={(e) => setFormData({ ...formData, membership_number: e.target.value })}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="course_name" value="اسم الدورة/المادة" />
                            <TextInput
                                id="course_name"
                                type="text"
                                value={formData.course_name}
                                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="subject" value="المادة (اختياري)" />
                            <TextInput
                                id="subject"
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="grade" value="الدرجة (اختياري)" />
                            <TextInput
                                id="grade"
                                type="text"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                                className="mt-1 block w-full"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="date_format" value="تنسيق التاريخ" />
                            <select
                                id="date_format"
                                value={dateFormat}
                                onChange={(e) => setDateFormat(e.target.value)}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="Y-m-d">2025-12-09</option>
                                <option value="d-m-Y">09-12-2025</option>
                                <option value="short">09/12/2025</option>
                                <option value="long">9 ديسمبر 2025</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                            <button
                                type="button"
                                onClick={() => setShowGenerateModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={handlePreview}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                معاينة
                            </button>
                            <PrimaryButton
                                onClick={handleGenerate}
                                disabled={generating}
                            >
                                {generating ? 'جاري الإنشاء...' : 'إنشاء وتحميل'}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Preview Modal */}
            <Modal show={showPreviewModal} onClose={() => setShowPreviewModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">معاينة بيانات الشهادة</h3>
                        <button
                            onClick={() => setShowPreviewModal(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {previewData && (
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                            <div><strong>اسم الطالب:</strong> {previewData.student_name}</div>
                            <div><strong>رقم العضوية:</strong> {previewData.membership_number}</div>
                            <div><strong>اسم الدورة:</strong> {previewData.course_name}</div>
                            {previewData.subject && <div><strong>المادة:</strong> {previewData.subject}</div>}
                            {previewData.grade && <div><strong>الدرجة:</strong> {previewData.grade}</div>}
                            <div><strong>التاريخ:</strong> {formatDatePreview(previewData.date, previewData.date_format)}</div>
                            <div><strong>صادر عن:</strong> {previewData.issued_by}</div>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setShowPreviewModal(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}

