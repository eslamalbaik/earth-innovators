import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';

export default function PackagesIndex({ packages, userPackage, auth }) {
    const handleSubscribe = (packageId) => {
        if (!auth?.user) {
            router.visit(route('login'));
            return;
        }
        router.post(route('packages.subscribe', packageId));
    };

    const getDurationLabel = (durationType, durationMonths) => {
        const labels = {
            monthly: 'شهرياً',
            quarterly: 'ربع سنوي',
            yearly: 'سنوياً',
            lifetime: 'مدى الحياة',
        };
        return labels[durationType] || `${durationMonths} شهر`;
    };

    const formatPrice = (price, currency) => {
        return `${price} ${currency}`;
    };

    return (
        <>
            <Head title="الباقات والاشتراكات" />
            
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-blue-600 hover:text-blue-700">
                                ← الرئيسية
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-800">الباقات والاشتراكات</h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <>
                                    {userPackage && (
                                        <Link
                                            href={route('packages.my-subscriptions')}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                        >
                                            اشتراكاتي
                                        </Link>
                                    )}
                                    <span className="text-gray-600">مرحباً، {auth.user.name}</span>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-blue-600 hover:text-blue-700 font-semibold"
                                    >
                                        تسجيل الدخول
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                    >
                                        التسجيل
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Alert if user has active subscription */}
                    {userPackage && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg
                                    className="w-5 h-5 text-green-600 ml-3"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <div>
                                    <p className="text-green-800 font-semibold">
                                        لديك اشتراك نشط حالياً في باقة: {userPackage.package.name_ar}
                                    </p>
                                    <p className="text-green-700 text-sm mt-1">
                                        ينتهي في: {userPackage.end_date}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Packages Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className={`bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 ${
                                    pkg.is_popular ? 'ring-2 ring-yellow-400' : ''
                                }`}
                            >
                                {/* Popular Badge */}
                                {pkg.is_popular && (
                                    <div className="bg-yellow-400 text-center py-2">
                                        <span className="text-gray-800 font-bold text-sm">
                                            ⭐ الأكثر شعبية
                                        </span>
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Package Name */}
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                                        {pkg.name_ar}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm text-center mb-4 h-12">
                                        {pkg.description_ar}
                                    </p>

                                    {/* Price */}
                                    <div className="text-center mb-4">
                                        <div className="text-4xl font-bold text-blue-600">
                                            {pkg.price}
                                            <span className="text-xl text-gray-600 mr-2">
                                                {pkg.currency}
                                            </span>
                                        </div>
                                        <div className="text-gray-500 text-sm mt-1">
                                            {getDurationLabel(pkg.duration_type, pkg.duration_months)}
                                        </div>
                                    </div>

                                    {/* Bonus Points */}
                                    {pkg.points_bonus > 0 && (
                                        <div className="bg-purple-50 rounded-lg p-3 mb-4">
                                            <p className="text-purple-700 text-sm text-center font-semibold">
                                                🎁 +{pkg.points_bonus} نقطة إضافية
                                            </p>
                                        </div>
                                    )}

                                    {/* Features */}
                                    <div className="space-y-2 mb-6">
                                        {pkg.features_ar &&
                                            pkg.features_ar.slice(0, 5).map((feature, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start "
                                                >
                                                    <svg
                                                        className="w-5 h-5 text-green-500 ml-2 flex-shrink-0 mt-0.5"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span className="text-gray-700 text-sm">
                                                        {feature}
                                                    </span>
                                                </div>
                                            ))}
                                        {pkg.features_ar && pkg.features_ar.length > 5 && (
                                            <p className="text-blue-600 text-xs text-center mt-2">
                                                +{pkg.features_ar.length - 5} مزايا أخرى
                                            </p>
                                        )}
                                    </div>

                                    {/* Subscribe Button */}
                                    <button
                                        onClick={() => handleSubscribe(pkg.id)}
                                        disabled={userPackage && userPackage.status === 'active'}
                                        className={`w-full py-3 rounded-lg font-bold transition-colors ${
                                            userPackage && userPackage.status === 'active'
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {userPackage && userPackage.status === 'active'
                                            ? 'لديك اشتراك نشط'
                                            : 'اشترك الآن'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Info Section */}
                    <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                            لماذا تختار باقاتنا؟
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="text-center">
                                <div className="text-4xl mb-3">🔒</div>
                                <h4 className="font-bold text-gray-800 mb-2">دفع آمن</h4>
                                <p className="text-gray-600 text-sm">
                                    نستخدم بوابة دفع زينة الآمنة لحماية معلوماتك المالية
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl mb-3">⚡</div>
                                <h4 className="font-bold text-gray-800 mb-2">تفعيل فوري</h4>
                                <p className="text-gray-600 text-sm">
                                    يتم تفعيل اشتراكك فوراً بعد إتمام عملية الدفع
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl mb-3">💎</div>
                                <h4 className="font-bold text-gray-800 mb-2">مزايا حصرية</h4>
                                <p className="text-gray-600 text-sm">
                                    احصل على مزايا ونقاط إضافية مع كل اشتراك
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

