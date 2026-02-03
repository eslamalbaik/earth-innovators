import { Head } from '@inertiajs/react';
import { FaArrowRight, FaCheck, FaTimes, FaClock, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase, FaAward, FaMoneyBillWave } from 'react-icons/fa';
import AdminLayout from '../../Layouts/AdminLayout';

export default function TeacherApplicationDetails({ application }) {
    const teacher = application.teacher;
    const user = application.user;

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: FaClock, text: 'في الانتظار' },
            under_review: { color: 'bg-blue-100 text-blue-800', icon: FaClock, text: 'قيد المراجعة' },
            approved: { color: 'bg-green-100 text-green-800', icon: FaCheck, text: 'موافق عليه' },
            rejected: { color: 'bg-red-100 text-red-800', icon: FaTimes, text: 'مرفوض' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className="w-4 h-4" />
                {config.text}
            </span>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const parseJsonField = (field) => {
        try {
            return typeof field === 'string' ? JSON.parse(field) : field;
        } catch {
            return [];
        }
    };

    const subjects = parseJsonField(teacher?.subjects || '[]');
    const stages = parseJsonField(teacher?.stages || '[]');
    const certifications = parseJsonField(teacher?.certifications || '[]');
    const experiences = parseJsonField(teacher?.experiences || '[]');

    return (
        <AdminLayout>
            <Head title={`تفاصيل طلب الانضمام - ${teacher?.name}`} />

            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <a
                                href="/admin/teacher-applications"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <FaArrowRight className="rotate-180" />
                                العودة للقائمة
                            </a>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">تفاصيل طلب الانضمام</h1>
                        <p className="text-gray-600">مراجعة طلب الانضمام من {teacher?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(application.status)}
                        <div className="text-sm text-gray-500">
                            تم التقديم في {formatDate(application.submitted_at)}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaUser />
                                المعلومات الشخصية
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">الاسم الكامل</label>
                                    <p className="mt-1 text-sm text-gray-900">{teacher?.name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
                                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                                        <FaEnvelope className="w-4 h-4 text-gray-400" />
                                        {teacher?.email}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">رقم الجوال</label>
                                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                                        <FaPhone className="w-4 h-4 text-gray-400" />
                                        {teacher?.phone}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">المدينة</label>
                                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                                        <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                                        {teacher?.city}
                                    </p>
                                </div>
                            </div>
                            {teacher?.bio && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">النبذة الشخصية</label>
                                    <p className="mt-1 text-sm text-gray-900 leading-relaxed">{teacher.bio}</p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FaGraduationCap />
                                معلومات التدريس
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">سعر الحصة</label>
                                    <p className="mt-1 text-sm text-gray-900 flex items-center gap-1">
                                        <FaMoneyBillWave className="w-4 h-4 text-gray-400" />
                                        {teacher?.price_per_hour} ريال
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">سنوات الخبرة</label>
                                    <p className="mt-1 text-sm text-gray-900">{teacher?.experience_years} سنة</p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">المراحل الدراسية</label>
                                <div className="flex flex-wrap gap-2">
                                    {stages.map((stage, index) => (
                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {stage}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">المواد</label>
                                <div className="flex flex-wrap gap-2">
                                    {subjects.map((subject, index) => (
                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            {subject.name_ar}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {certifications.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaAward />
                                    الشهادات
                                </h2>
                                <div className="space-y-3">
                                    {certifications.map((cert, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                            <h3 className="font-medium text-gray-900">{cert.name}</h3>
                                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {experiences.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaBriefcase />
                                    الخبرات
                                </h2>
                                <div className="space-y-4">
                                    {experiences.map((exp, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-gray-900">{exp.title}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">{exp.employer}</p>
                                            <p className="text-sm text-gray-500 mb-2">
                                                {exp.start_date} - {exp.still_working ? 'حتى الآن' : exp.end_date}
                                            </p>
                                            {exp.description && (
                                                <p className="text-sm text-gray-700">{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">الصورة الشخصية</h3>
                            {teacher?.image ? (
                                <img
                                    src={teacher.image}
                                    alt={teacher.name}
                                    className="w-32 h-32 rounded-full mx-auto object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto flex items-center justify-center">
                                    <span className="text-2xl font-medium text-gray-600">
                                        {teacher?.name?.charAt(0)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {application.status === 'pending' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">الإجراءات</h3>
                                <div className="space-y-3">
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-[#8CA635] transition duration-200">
                                        <FaCheck />
                                        الموافقة على الطلب
                                    </button>
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-blue-700 transition duration-200">
                                        <FaClock />
                                        وضع قيد المراجعة
                                    </button>
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200">
                                        <FaTimes />
                                        رفض الطلب
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الطلب</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">رقم الطلب</label>
                                    <p className="text-sm text-gray-900">#{application.id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">تاريخ التقديم</label>
                                    <p className="text-sm text-gray-900">{formatDate(application.submitted_at)}</p>
                                </div>
                                {application.reviewed_at && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">تاريخ المراجعة</label>
                                        <p className="text-sm text-gray-900">{formatDate(application.reviewed_at)}</p>
                                    </div>
                                )}
                                {application.reviewer && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">تم المراجعة بواسطة</label>
                                        <p className="text-sm text-gray-900">{application.reviewer.name}</p>
                                    </div>
                                )}
                                {application.rejection_reason && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">سبب الرفض</label>
                                        <p className="text-sm text-gray-900">{application.rejection_reason}</p>
                                    </div>
                                )}
                                {application.notes && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ملاحظات</label>
                                        <p className="text-sm text-gray-900">{application.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
