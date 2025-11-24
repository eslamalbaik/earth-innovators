import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FaTimes, FaRedo } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function PaymentFailure({ payment }) {
    const [showToast, setShowToast] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowToast(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <DashboardLayout header="فشل الدفع">
            <Head title="فشل الدفع" />

            {showToast && (
                <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
                    <div className="bg-red-500 text-white rounded-lg shadow-lg p-4 flex items-center justify-between">
                        <p>فشل الدفع والحجز</p>
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
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FaTimes className="text-5xl text-red-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">فشل الدفع</h1>
                        <p className="text-gray-600">لم يتم إكمال عملية الدفع بنجاح.</p>
                    </div>

                    {payment.failure_reason && (
                        <div className="bg-red-50 border-r-4 border-red-500 p-4 mb-6 text-right rounded">
                            <p className="text-sm font-semibold text-red-900 mb-1">سبب الفشل:</p>
                            <p className="text-red-700">{payment.failure_reason}</p>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => router.visit(`/payment/${payment.booking_id}`)}
                            className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition"
                        >
                            <FaRedo />
                            إعادة المحاولة
                        </button>
                        <Link
                            href="/my-bookings"
                            className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition"
                        >
                            العودة إلى الحجوزات
                        </Link>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

