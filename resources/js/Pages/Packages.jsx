import { Head, Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import { FaCheck, FaStar, FaRocket, FaCrown, FaBox } from 'react-icons/fa';

export default function Packages({ auth, packages = [], userPackage = null }) {
    const IconMap = {
        monthly: FaBox,
        quarterly: FaRocket,
        yearly: FaStar,
        lifetime: FaCrown
    };

    return (
        <MainLayout auth={auth}>
            <Head title="الباقات - إرث المبتكرين" />

            <div className="bg-gradient-to-r from-legacy-green to-legacy-blue py-16 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <FaBox className="mx-auto text-6xl mb-4 opacity-90" />
                        <h1 className="text-4xl font-bold mb-4">باقات الاشتراك</h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            اختر الباقة المناسبة لك واحصل على ميزات حصرية وإمكانيات متقدمة
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {auth?.user && userPackage && (
                    <div className="mb-8 bg-gradient-to-r from-legacy-green/10 to-legacy-blue/10 rounded-xl p-6 border-2 border-legacy-green/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">باقتي الحالية</h2>
                                <p className="text-gray-600">
                                    {userPackage.package?.name_ar || userPackage.package?.name} - 
                                    تنتهي في {new Date(userPackage.end_date).toLocaleDateString('ar-SA')}
                                </p>
                            </div>
                            <div className={`px-4 py-2 rounded-lg font-semibold ${
                                userPackage.status === 'active' ? 'bg-green-100 text-green-700' :
                                userPackage.status === 'expired' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                {userPackage.status === 'active' ? 'نشطة' : userPackage.status === 'expired' ? 'منتهية' : 'ملغاة'}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg) => {
                        const Icon = IconMap[pkg.duration_type] || FaBox;
                        const features = pkg.features_ar || pkg.features || [];
                        const isPopular = pkg.is_popular;

                        return (
                            <div
                                key={pkg.id}
                                className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all relative ${
                                    isPopular
                                        ? 'border-legacy-green shadow-legacy-green/20 transform scale-105'
                                        : 'border-gray-200 hover:border-legacy-green/50'
                                }`}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-legacy-green to-legacy-blue text-white text-center py-2 font-bold text-sm">
                                        ⭐ الأكثر شعبية
                                    </div>
                                )}
                                <div className={`p-8 ${isPopular ? 'pt-12' : ''}`}>
                                    <div className="text-center mb-6">
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                                            isPopular ? 'bg-gradient-to-br from-legacy-green to-legacy-blue' : 'bg-gray-100'
                                        }`}>
                                            <Icon className={`text-3xl ${isPopular ? 'text-white' : 'text-gray-600'}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {pkg.name_ar || pkg.name}
                                        </h3>
                                        <div className="mb-4">
                                            <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                                            <span className="text-gray-600"> {pkg.currency}</span>
                                            {pkg.duration_type !== 'lifetime' && (
                                                <span className="text-gray-500 text-sm"> / {pkg.duration_type === 'monthly' ? 'شهر' : pkg.duration_type === 'quarterly' ? 'ربع سنوي' : 'سنة'}</span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            {pkg.description_ar || pkg.description}
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6 mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-4">الميزات:</h4>
                                        <ul className="space-y-3">
                                            {pkg.projects_limit !== null ? (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-legacy-green flex-shrink-0" />
                                                    <span className="text-gray-700">حتى {pkg.projects_limit} مشروع</span>
                                                </li>
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-legacy-green flex-shrink-0" />
                                                    <span className="text-gray-700">مشاريع غير محدودة</span>
                                                </li>
                                            )}
                                            {pkg.challenges_limit !== null ? (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-legacy-green flex-shrink-0" />
                                                    <span className="text-gray-700">حتى {pkg.challenges_limit} تحدٍ</span>
                                                </li>
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-legacy-green flex-shrink-0" />
                                                    <span className="text-gray-700">تحديات غير محدودة</span>
                                                </li>
                                            )}
                                            {pkg.points_bonus > 0 && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-legacy-green flex-shrink-0" />
                                                    <span className="text-gray-700">{pkg.points_bonus} نقطة إضافية</span>
                                                </li>
                                            )}
                                            {pkg.badge_access && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-legacy-green flex-shrink-0" />
                                                    <span className="text-gray-700">إمكانية الحصول على شارات</span>
                                                </li>
                                            )}
                                            {pkg.certificate_access && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-legacy-green flex-shrink-0" />
                                                    <span className="text-gray-700">إمكانية الحصول على شهادات</span>
                                                </li>
                                            )}
                                            {features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <FaCheck className="text-legacy-green flex-shrink-0" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {auth?.user ? (
                                        <Link
                                            href={`/packages/${pkg.id}/subscribe`}
                                            className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition ${
                                                isPopular
                                                    ? 'bg-gradient-to-r from-legacy-green to-legacy-blue text-white hover:shadow-lg'
                                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                            }`}
                                        >
                                            {userPackage?.package_id === pkg.id ? 'تجديد الاشتراك' : 'اشترك الآن'}
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/register"
                                            className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition ${
                                                isPopular
                                                    ? 'bg-gradient-to-r from-legacy-green to-legacy-blue text-white hover:shadow-lg'
                                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                            }`}
                                        >
                                            سجل للاشتراك
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {packages.length === 0 && (
                    <div className="text-center py-12">
                        <FaBox className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد باقات متاحة حالياً</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

