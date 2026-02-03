import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useState } from 'react';
import {
    FaCheck,
    FaStar,
    FaRocket,
    FaCrown,
    FaBox,
    FaCalendar,
    FaCheckCircle,
    FaTimesCircle,
    FaSpinner,
    FaCreditCard,
    FaGift,
    FaTrophy,
    FaAward,
    FaInfinity,
    FaInfoCircle
} from 'react-icons/fa';
import { useToast } from '@/Contexts/ToastContext';
import { toHijriDate } from '@/utils/dateUtils';

export default function PackagesIndex({ auth, packages = [], userPackage = null }) {
    const { showSuccess, showError } = useToast();
    const [subscribingPackageId, setSubscribingPackageId] = useState(null);

    const IconMap = {
        monthly: FaBox,
        quarterly: FaRocket,
        yearly: FaStar,
        lifetime: FaCrown
    };

    const getDurationLabel = (durationType, durationMonths) => {
        const labels = {
            monthly: 'شهري',
            quarterly: 'ربع سنوي',
            yearly: 'سنوي',
            lifetime: 'مدى الحياة'
        };
        return labels[durationType] || `${durationMonths} شهر`;
    };

    const handleSubscribe = async (packageId) => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        if (userPackage && userPackage.status === 'active') {
            showError('لديك اشتراك نشط بالفعل. يرجى إلغاء الاشتراك الحالي أولاً.');
            return;
        }

        setSubscribingPackageId(packageId);
        try {
            router.post(`/packages/${packageId}/subscribe`, {}, {
                preserveScroll: true,
                onError: (errors) => {
                    setSubscribingPackageId(null);
                    const errorMessage = errors.error || Object.values(errors)[0] || 'حدث خطأ أثناء الاشتراك';
                    showError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
                },
            });
        } catch (error) {
            setSubscribingPackageId(null);
            showError('حدث خطأ أثناء الاشتراك');
        }
    };

    const PackagesContent = ({ isDesktop = false }) => (
        <div className={isDesktop ? "space-y-6" : "space-y-4"}>
            {/* Header */}
            <div className={isDesktop ? "mb-6 text-center" : "mb-4"}>
                <h1 className={isDesktop ? "text-3xl font-extrabold text-gray-900 mb-3" : "text-lg font-extrabold text-gray-900 mb-2"}>
                    باقات الاشتراك
                </h1>
                <p className={isDesktop ? "text-lg text-gray-600 max-w-2xl mx-auto" : "text-sm text-gray-600"}>
                    اختر الباقة المناسبة لك واحصل على ميزات حصرية وإمكانيات متقدمة
                </p>
            </div>

            {/* Current Subscription Card */}
            {auth?.user && userPackage && userPackage.status === 'active' && (
                <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl ${isDesktop ? 'p-6 mb-6' : 'p-4 mb-4'}`}>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className={`${isDesktop ? 'text-base' : 'text-sm'} font-bold text-green-900 mb-1 flex items-center gap-2`}>
                                <FaCheckCircle className="text-green-600" />
                                باقتي الحالية
                            </h3>
                            <p className={`${isDesktop ? 'text-base' : 'text-sm'} text-green-800 mb-1`}>
                                {userPackage.package?.name_ar || userPackage.package?.name}
                            </p>
                            <p className={`${isDesktop ? 'text-sm' : 'text-xs'} text-green-700`}>
                                تنتهي في: {toHijriDate(userPackage.end_date)}
                            </p>
                        </div>
                        <span className={`px-3 py-1 bg-[#A3C042] text-white ${isDesktop ? 'text-sm' : 'text-xs'} font-semibold rounded-full`}>
                            نشطة
                        </span>
                    </div>
                    <Link
                        href="/my-subscriptions"
                        className={`${isDesktop ? 'text-sm' : 'text-xs'} text-green-700 hover:text-green-900 font-medium`}
                    >
                        عرض جميع الاشتراكات →
                    </Link>
                </div>
            )}

            {/* Packages Grid */}
            {packages.length > 0 ? (
                <div className={isDesktop ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {packages.map((pkg) => {
                        const Icon = IconMap[pkg.duration_type] || FaBox;
                        const features = pkg.features_ar || pkg.features || [];
                        const isPopular = pkg.is_popular;
                        const isCurrentPackage = userPackage?.package_id === pkg.id && userPackage?.status === 'active';
                        const isSubscribing = subscribingPackageId === pkg.id;

                        return (
                            <div
                                key={pkg.id}
                                className={`bg-white rounded-2xl border-2 overflow-hidden transition-all relative ${isPopular
                                    ? 'border-[#A3C042] shadow-lg'
                                    : isCurrentPackage
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-gray-200'
                                    }`}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#A3C042] to-[#8CA635] text-white text-center py-1.5 font-bold text-xs">
                                        ⭐ الأكثر شعبية
                                    </div>
                                )}
                                {isCurrentPackage && (
                                    <div className="absolute top-0 left-0 right-0 bg-[#A3C042] text-white text-center py-1.5 font-bold text-xs">
                                        ✓ باقتك الحالية
                                    </div>
                                )}
                                <div className={`${isDesktop ? 'p-6' : 'p-4'} ${isPopular || isCurrentPackage ? isDesktop ? 'pt-16' : 'pt-12' : ''}`}>
                                    {/* Package Header */}
                                    <div className="text-center mb-4">
                                        <div className={`inline-flex items-center justify-center ${isDesktop ? 'w-20 h-20' : 'w-14 h-14'} rounded-full mb-3 ${isPopular ? 'bg-gradient-to-br from-[#A3C042] to-[#8CA635]' : 'bg-gray-100'
                                            }`}>
                                            <Icon className={`${isDesktop ? 'text-4xl' : 'text-2xl'} ${isPopular ? 'text-white' : 'text-gray-600'}`} />
                                        </div>
                                        <h3 className={`${isDesktop ? 'text-xl' : 'text-base'} font-extrabold text-gray-900 mb-2`}>
                                            {pkg.name_ar || pkg.name}
                                        </h3>
                                        <div className="mb-2">
                                            <span className={`${isDesktop ? 'text-4xl' : 'text-3xl'} font-bold text-gray-900`}>{pkg.price}</span>
                                            <span className={`text-gray-600 ${isDesktop ? 'text-base' : 'text-sm'}`}> {pkg.currency}</span>
                                            {pkg.duration_type !== 'lifetime' && (
                                                <span className={`text-gray-500 ${isDesktop ? 'text-sm' : 'text-xs'}`}> / {getDurationLabel(pkg.duration_type, pkg.duration_months)}</span>
                                            )}
                                        </div>
                                        {pkg.description_ar || pkg.description ? (
                                            <p className={`${isDesktop ? 'text-sm' : 'text-xs'} text-gray-600`}>
                                                {pkg.description_ar || pkg.description}
                                            </p>
                                        ) : null}
                                    </div>

                                    {/* Features */}
                                    <div className="border-t border-gray-200 pt-4 mb-4">
                                        <h4 className={`font-semibold text-gray-900 mb-3 ${isDesktop ? 'text-base' : 'text-sm'}`}>الميزات:</h4>
                                        <ul className={`${isDesktop ? 'space-y-3' : 'space-y-2'}`}>
                                            {pkg.projects_limit !== null ? (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaCheck className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">حتى {pkg.projects_limit} مشروع</span>
                                                </li>
                                            ) : (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaInfinity className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">مشاريع غير محدودة</span>
                                                </li>
                                            )}
                                            {pkg.challenges_limit !== null ? (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaCheck className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">حتى {pkg.challenges_limit} تحدٍ</span>
                                                </li>
                                            ) : (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaInfinity className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">تحديات غير محدودة</span>
                                                </li>
                                            )}
                                            {pkg.points_bonus > 0 && (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaGift className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">{pkg.points_bonus} نقطة إضافية</span>
                                                </li>
                                            )}
                                            {pkg.badge_access && (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaAward className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">إمكانية الحصول على شارات</span>
                                                </li>
                                            )}
                                            {pkg.certificate_access && (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaTrophy className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">إمكانية الحصول على شهادات</span>
                                                </li>
                                            )}
                                            {features.map((feature, index) => (
                                                <li key={index} className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaCheck className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Subscribe Button */}
                                    {auth?.user ? (
                                        <button
                                            onClick={() => handleSubscribe(pkg.id)}
                                            disabled={isSubscribing || isCurrentPackage}
                                            className={`w-full text-center ${isDesktop ? 'px-6 py-4' : 'px-4 py-3'} rounded-xl font-semibold ${isDesktop ? 'text-base' : 'text-sm'} transition ${isCurrentPackage
                                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                : isPopular
                                                    ? 'bg-gradient-to-r from-[#A3C042] to-[#8CA635] text-white hover:shadow-lg'
                                                    : 'bg-[#A3C042] text-white hover:bg-[#8CA635]'
                                                } ${isSubscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isSubscribing ? (
                                                <>
                                                    <FaSpinner className="animate-spin inline ml-2" />
                                                    جاري المعالجة...
                                                </>
                                            ) : isCurrentPackage ? (
                                                'باقتك الحالية'
                                            ) : (
                                                <>
                                                    <FaCreditCard className="inline ml-2" />
                                                    {userPackage?.package_id === pkg.id ? 'تجديد الاشتراك' : 'اشترك الآن'}
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <Link
                                            href="/register"
                                            className={`block w-full text-center ${isDesktop ? 'px-6 py-4' : 'px-4 py-3'} rounded-xl font-semibold ${isDesktop ? 'text-base' : 'text-sm'} transition ${isPopular
                                                ? 'bg-gradient-to-r from-[#A3C042] to-[#8CA635] text-white hover:shadow-lg'
                                                : 'bg-[#A3C042] text-white hover:bg-[#8CA635]'
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
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <FaBox className="mx-auto text-4xl text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500">لا توجد باقات متاحة حالياً</p>
                </div>
            )}

            {/* Info Section */}
            {auth?.user && (
                <div className={`bg-blue-50 rounded-2xl border border-blue-200 ${isDesktop ? 'p-6 mt-6' : 'p-4 mt-4'}`}>
                    <div className="flex items-start gap-2">
                        <FaInfoCircle className={`text-blue-600 ${isDesktop ? 'text-base' : 'text-sm'} mt-0.5 flex-shrink-0`} />
                        <div className={`${isDesktop ? 'text-sm' : 'text-xs'} text-blue-800`}>
                            <p className="font-semibold mb-1">معلومات مهمة:</p>
                            <ul className={`${isDesktop ? 'space-y-2' : 'space-y-1'} list-disc list-inside`}>
                                <li>يمكنك إلغاء الاشتراك في أي وقت</li>
                                <li>سيتم تجديد الاشتراك تلقائياً عند انتهاء المدة</li>
                                <li>يمكنك عرض جميع اشتراكاتك من صفحة "اشتراكاتي"</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="الباقات - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="الباقات"
                    activeNav="packages"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                >
                    <PackagesContent />
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="الباقات"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/')}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-7xl px-6 pb-24 pt-6">
                    <PackagesContent isDesktop={true} />
                </main>
                <MobileBottomNav active="packages" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}
