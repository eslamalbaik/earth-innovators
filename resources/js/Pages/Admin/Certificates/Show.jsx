import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaArrowRight, FaCheck, FaTimes, FaDownload, FaQrcode } from 'react-icons/fa';

export default function AdminCertificatesShow({ certificate }) {
    const typeLabels = {
        student: 'طالب',
        teacher: 'معلم',
        school: 'مدرسة',
        achievement: 'إنجاز',
        membership: 'عضوية',
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <DashboardLayout header="تفاصيل الشهادة">
            <Head title={`شهادة ${certificate.title_ar}`} />

            <div className="mb-6">
                <Link
                    href={route('admin.certificates.index')}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                    <FaArrowRight className="transform rotate-180" />
                    العودة إلى قائمة الشهادات
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Certificate Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">معلومات الشهادة</h2>
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                certificate.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {certificate.is_active ? (
                                    <span className="flex items-center gap-2">
                                        <FaCheck className="text-xs" />
                                        نشطة
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <FaTimes className="text-xs" />
                                        غير نشطة
                                    </span>
                                )}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">رقم الشهادة</p>
                                <p className="font-mono text-lg font-bold text-gray-900">{certificate.certificate_number}</p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">نوع الشهادة</p>
                                <p className="text-lg font-medium text-gray-900">{typeLabels[certificate.type] || certificate.type}</p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">العنوان (إنجليزي)</p>
                                <p className="text-lg font-medium text-gray-900">{certificate.title}</p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">العنوان (عربي)</p>
                                <p className="text-lg font-medium text-gray-900">{certificate.title_ar}</p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">تاريخ الإصدار</p>
                                <p className="text-lg font-medium text-gray-900">{formatDate(certificate.issue_date)}</p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">تاريخ الانتهاء</p>
                                <p className="text-lg font-medium text-gray-900">{formatDate(certificate.expiry_date)}</p>
                            </div>
                        </div>

                        {(certificate.description || certificate.description_ar) && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-2">الوصف (إنجليزي)</p>
                                    <p className="text-gray-900">{certificate.description || '-'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-2">الوصف (عربي)</p>
                                    <p className="text-gray-900">{certificate.description_ar || '-'}</p>
                                </div>
                            </div>
                        )}

                        {certificate.template && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500 mb-1">القالب</p>
                                <p className="text-gray-900">{certificate.template}</p>
                            </div>
                        )}
                    </div>

                    {/* User & Issuer Info */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">المستخدم والمُصدر</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-600 mb-2">حامل الشهادة</p>
                                <p className="text-lg font-medium text-gray-900">{certificate.user?.name || '-'}</p>
                                <p className="text-sm text-gray-600">{certificate.user?.email || '-'}</p>
                                <p className="text-xs text-gray-500 mt-1">الدور: {certificate.user?.role || '-'}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-600 mb-2">مُصدر الشهادة</p>
                                <p className="text-lg font-medium text-gray-900">{certificate.issuer?.name || '-'}</p>
                                <p className="text-sm text-gray-500 mt-1">التاريخ: {formatDate(certificate.created_at)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">الإجراءات</h3>
                        <div className="space-y-3">
                            <Link
                                href={route('admin.certificates.edit', certificate.id)}
                                className="w-full px-4 py-2 bg-[#A3C042] text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                تعديل الشهادة
                            </Link>
                            <button
                                onClick={() => window.location.href = route('admin.certificates.download', certificate.id)}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                <FaDownload />
                                تحميل PDF
                            </button>
                            <Link
                                href={route('admin.certificates.index')}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                            >
                                <FaArrowRight className="transform rotate-180" />
                                العودة للقائمة
                            </Link>
                        </div>
                    </div>

                    {/* QR Code */}
                    {certificate.qr_code && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FaQrcode />
                                رمز QR
                            </h3>
                            <div className="flex justify-center">
                                <img 
                                    src={`/storage/${certificate.qr_code}`} 
                                    alt="QR Code" 
                                    className="w-48 h-48 border rounded-lg"
                                />
                            </div>
                            <p className="text-center text-sm text-gray-500 mt-4">
                                امسح للتحقق من الشهادة
                            </p>
                        </div>
                    )}

                    {/* File Info */}
                    {certificate.file_path && (
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">ملف PDF</h3>
                            <p className="text-sm text-gray-600 break-all">{certificate.file_path}</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}