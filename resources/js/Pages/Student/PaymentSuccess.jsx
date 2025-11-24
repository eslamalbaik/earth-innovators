import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { FaCheckCircle, FaDownload, FaPrint, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function PaymentSuccess({ payment }) {
    const [showToast, setShowToast] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowToast(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <DashboardLayout header="تم الدفع بنجاح">
            <Head title="تم الدفع بنجاح" />

            {showToast && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
                    <div className="bg-green-500 text-white rounded-lg shadow-lg p-4 flex items-center justify-between">
                        <p>تم الدفع والحجز بنجاح!</p>
                        <button
                            onClick={() => setShowToast(false)}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="mb-6">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaCheckCircle className="text-5xl text-green-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">تم الدفع بنجاح!</h1>
                        <p className="text-gray-600">شكراً لك على الدفع. تم استلام طلبك بنجاح.</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">تفاصيل الدفع</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">رقم المعاملة:</span>
                                <span className="font-semibold">{payment.transaction_id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">المبلغ:</span>
                                <span className="font-semibold">{payment.amount} {payment.currency}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">تاريخ الدفع:</span>
                                <span className="font-semibold">
                                    {new Date(payment.paid_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">المعلم:</span>
                                <span className="font-semibold">{payment.booking.teacher_name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                        >
                            <FaPrint />
                            طباعة
                        </button>
                        <Link
                            href="/my-bookings"
                            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition"
                        >
                            العودة إلى الحجوزات
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

