import { Head, Link, router } from '@inertiajs/react';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useMemo, useState } from 'react';
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
import { useFlashNotifications } from '@/Hooks/useFlashNotifications';
import { toHijriDate } from '@/utils/dateUtils';
import { useTranslation } from '@/i18n';

export default function PackagesIndex({ auth, packages = [], userPackage = null, trialStatus = null, membershipSummary = null }) {
    const isStudent = auth?.user?.role === 'student';
    const isTeacher = auth?.user?.role === 'teacher';
    const isSchoolManaged = !!membershipSummary?.is_school_owned;
    const showInstitutionInvite = isTeacher && !isSchoolManaged;
    const { showSuccess, showError } = useToast();
    const { t, language } = useTranslation();
    const [subscribingPackageId, setSubscribingPackageId] = useState(null);
    useFlashNotifications();
    const hasPendingSubscription = userPackage?.status === 'pending';

    const roleLabel = useMemo(() => {
        const role = auth?.user?.role;
        const labels = {
            student: t('packagesIndexPage.roles.student'),
            teacher: t('packagesIndexPage.roles.teacher'),
            school: t('packagesIndexPage.roles.school'),
            educational_institution: t('packagesIndexPage.roles.educationalInstitution'),
        };

        return labels[role] || t('packagesIndexPage.roles.general');
    }, [auth?.user?.role, t]);

    const IconMap = {
        monthly: FaBox,
        quarterly: FaRocket,
        yearly: FaStar,
        lifetime: FaCrown
    };

    const getDurationLabel = (durationType, durationMonths) => {
        const labels = {
            monthly: t('packagesIndexPage.duration.monthly'),
            quarterly: t('packagesIndexPage.duration.quarterly'),
            yearly: t('packagesIndexPage.duration.yearly'),
            lifetime: t('packagesIndexPage.duration.lifetime'),
        };
        return labels[durationType] || t('packagesIndexPage.duration.months', { count: durationMonths });
    };

    const getPackageName = (pkg) => pkg?.name_ar || pkg?.name;

    const handleSubscribe = async (packageId) => {
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        if (userPackage && userPackage.status === 'active') {
            showError(t('packagesIndexPage.errors.activeSubscriptionExists'));
            return;
        }

        if (isSchoolManaged) {
            showError(t('packagesIndexPage.errors.managedBySchool'));
            return;
        }

        setSubscribingPackageId(packageId);
        try {
            router.post(`/packages/${packageId}/subscribe`, {}, {
                preserveScroll: true,
                onError: (errors) => {
                    setSubscribingPackageId(null);
                    const errorMessage = errors.error || Object.values(errors)[0] || t('packagesIndexPage.errors.subscribeFailed');
                    showError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
                },
                onFinish: () => {
                    setSubscribingPackageId(null);
                },
            });
        } catch (error) {
            setSubscribingPackageId(null);
            showError(t('packagesIndexPage.errors.subscribeFailed'));
        }
    };

    const PackagesContent = ({ isDesktop = false }) => {
        if (isStudent) {
            return (
                <div className={isDesktop ? "p-24 text-center" : "p-12 text-center"}>
                    <img src="/images/subscription-managed-by-school.svg" alt="اشتراك الطالب مُدار من المدرسة" style={{maxWidth: 280, margin: '0 auto 24px auto'}} />
                    <h2 className={isDesktop ? "text-2xl font-bold mb-4" : "text-lg font-bold mb-3"}>حسابك كطالب مُدار من قبل مدرستك مباشرة</h2>
                    <p className={isDesktop ? "text-lg text-gray-600" : "text-base text-gray-600"}>لا يحتاج الطالب إلى أي اشتراك أو تفعيل باقة؛ جميع الخدمات فعّالة تلقائياً ضمن اشتراك المدرسة/المؤسسة.</p>
                </div>
            );
        }

        return (
            <div className={isDesktop ? "space-y-8" : "space-y-6"}>
                {/* Header */}
                <div className={isDesktop ? "text-center mb-8" : "text-center mb-6"}>
                    <h1 className={isDesktop ? "text-3xl font-extrabold text-gray-900 mb-3" : "text-xl font-extrabold text-gray-900 mb-2"}>
                        {t('packagesIndexPage.title')}
                    </h1>
                    <p className={isDesktop ? "text-lg text-gray-600 max-w-2xl mx-auto" : "text-sm text-gray-600"}>
                        {t('packagesIndexPage.subtitle')}
                    </p>
                </div>

                {/* School-managed alert */}
                {isSchoolManaged && (
                    <div className={`bg-amber-50 rounded-2xl border border-amber-200 ${isDesktop ? 'p-6' : 'p-4'}`}>
                        <div className="flex items-start gap-3">
                            <FaInfoCircle className={`text-amber-600 ${isDesktop ? 'text-xl' : 'text-base'} mt-0.5 flex-shrink-0`} />
                            <div>
                                <p className={`font-semibold text-amber-900 ${isDesktop ? 'text-base mb-2' : 'text-sm mb-1'}`}>
                                    {t('packagesIndexPage.schoolManaged.title')}
                                </p>
                                <p className={`text-amber-800 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                    {t('packagesIndexPage.schoolManaged.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Institution invite */}
                {showInstitutionInvite && (
                    <div className={`bg-emerald-50 rounded-2xl border border-emerald-200 ${isDesktop ? 'p-6' : 'p-4'}`}>
                        <div className="flex items-start gap-3">
                            <FaRocket className={`text-emerald-600 ${isDesktop ? 'text-xl' : 'text-base'} mt-0.5 flex-shrink-0`} />
                            <div className="flex-1">
                                <p className={`font-semibold text-emerald-900 ${isDesktop ? 'text-base mb-2' : 'text-sm mb-2'}`}>
                                    {t('packagesIndexPage.institutionInvite.title')}
                                </p>
                                <p className={`text-emerald-800 mb-3 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                    {t('packagesIndexPage.institutionInvite.description')}
                                </p>
                                <Link href="/educational-institution/invite" className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                                    {t('packagesIndexPage.institutionInvite.cta')}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Current subscription status */}
                {userPackage && userPackage.status === 'active' && (
                    <div className={`bg-green-50 rounded-2xl border border-green-200 ${isDesktop ? 'p-6' : 'p-4'}`}>
                        <div className="flex items-start gap-3">
                            <FaCheckCircle className={`text-green-600 ${isDesktop ? 'text-xl' : 'text-base'} mt-0.5 flex-shrink-0`} />
                            <div className="flex-1">
                                <p className={`font-semibold text-green-900 ${isDesktop ? 'text-base mb-1' : 'text-sm mb-1'}`}>
                                    {t('packagesIndexPage.currentSubscription.title')}
                                </p>
                                <p className={`text-green-800 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                    {t('packagesIndexPage.currentSubscription.description', { package: getPackageName(userPackage.package) })}
                                </p>
                                {userPackage.expires_at && (
                                    <p className={`text-green-700 mt-1 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                        {t('packagesIndexPage.currentSubscription.expiresAt', { date: toHijriDate(userPackage.expires_at) })}
                                    </p>
                                )}
                                {!isSchoolManaged && (
                                    <Link href="/my-subscriptions" className={`inline-block mt-3 text-green-700 underline ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                        {t('packagesIndexPage.currentSubscription.viewDetails')}
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Trial info */}
                {trialStatus && trialStatus.is_active && (
                    <div className={`bg-purple-50 rounded-2xl border border-purple-200 ${isDesktop ? 'p-6' : 'p-4'}`}>
                        <div className="flex items-start gap-3">
                            <FaGift className={`text-purple-600 ${isDesktop ? 'text-xl' : 'text-base'} mt-0.5 flex-shrink-0`} />
                            <div className="flex-1">
                                <p className={`font-semibold text-purple-900 ${isDesktop ? 'text-base mb-1' : 'text-sm mb-1'}`}>
                                    {t('packagesIndexPage.trial.title')}
                                </p>
                                <p className={`text-purple-800 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                    {t('packagesIndexPage.trial.description', { daysLeft: trialStatus.days_remaining })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending subscription */}
                {hasPendingSubscription && (
                    <div className={`bg-orange-50 rounded-2xl border border-orange-200 ${isDesktop ? 'p-6' : 'p-4'}`}>
                        <div className="flex items-start gap-3">
                            <FaSpinner className={`text-orange-600 ${isDesktop ? 'text-xl' : 'text-base'} mt-0.5 flex-shrink-0`} />
                            <div className="flex-1">
                                <p className={`font-semibold text-orange-900 ${isDesktop ? 'text-base mb-1' : 'text-sm mb-1'}`}>
                                    {t('packagesIndexPage.pendingSubscription.title')}
                                </p>
                                <p className={`text-orange-800 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                    {t('packagesIndexPage.pendingSubscription.description')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Packages Grid */}
                {packages.length > 0 && (
                    <div className={`grid gap-6 ${isDesktop ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 gap-4'}`}>
                        {packages.map((pkg) => {
                            const Icon = IconMap[pkg.duration_type] || FaBox;
                            const isPopular = pkg.duration_type === 'yearly';
                            const isCurrentPackage = userPackage && userPackage.package_id === pkg.id;

                            return (
                                <div key={pkg.id} className={`rounded-2xl border ${isPopular ? 'border-purple-300 shadow-lg' : 'border-gray-200'} overflow-hidden bg-white transition-all hover:shadow-md ${isCurrentPackage ? 'ring-2 ring-green-500' : ''}`}>
                                    {isPopular && (
                                        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-center">
                                            <span className="text-xs font-semibold text-white">{t('packagesIndexPage.badges.mostPopular')}</span>
                                        </div>
                                    )}
                                    <div className={`p-5 ${isPopular ? '' : ''}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`rounded-xl p-3 ${isPopular ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                                <Icon className={`w-5 h-5 ${isPopular ? 'text-purple-600' : 'text-gray-600'}`} />
                                            </div>
                                            {isCurrentPackage && (
                                                <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    {t('packagesIndexPage.badges.current')}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className={`font-bold text-gray-900 mb-1 ${isDesktop ? 'text-lg' : 'text-base'}`}>
                                            {getPackageName(pkg)}
                                        </h3>
                                        <p className={`text-gray-500 mb-3 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                            {getDurationLabel(pkg.duration_type, pkg.duration_months)}
                                        </p>
                                        <div className="mb-4">
                                            <span className={`font-extrabold text-gray-900 ${isDesktop ? 'text-3xl' : 'text-2xl'}`}>
                                                {pkg.price === 0 ? t('packagesIndexPage.pricing.free') : `${pkg.price} ${t('packagesIndexPage.pricing.currency')}`}
                                            </span>
                                        </div>
                                        {pkg.features && pkg.features.length > 0 && (
                                            <ul className={`space-y-2 mb-5 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                {pkg.features.slice(0, 4).map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-2">
                                                        <FaCheck className="text-green-500 mt-0.5 flex-shrink-0 text-xs" />
                                                        <span className="text-gray-600">{feature}</span>
                                                    </li>
                                                ))}
                                                {pkg.features.length > 4 && (
                                                    <li className={`text-gray-500 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                        +{pkg.features.length - 4} {t('packagesIndexPage.features.more')}
                                                    </li>
                                                )}
                                            </ul>
                                        )}
                                        {!isCurrentPackage && !isSchoolManaged && (
                                            <button
                                                onClick={() => handleSubscribe(pkg.id)}
                                                disabled={subscribingPackageId === pkg.id}
                                                className={`w-full rounded-lg px-4 py-2.5 font-medium transition-colors ${
                                                    pkg.price === 0
                                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                                        : 'bg-gray-900 text-white hover:bg-gray-800'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {subscribingPackageId === pkg.id ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <FaSpinner className="animate-spin" />
                                                        {t('packagesIndexPage.actions.processing')}
                                                    </span>
                                                ) : pkg.price === 0 ? (
                                                    t('packagesIndexPage.actions.activateFree')
                                                ) : (
                                                    t('packagesIndexPage.actions.subscribe')
                                                )}
                                            </button>
                                        )}
                                        {isCurrentPackage && (
                                            <div className="text-center text-sm text-gray-500 py-2">
                                                {t('packagesIndexPage.status.active')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Free plan section */}
                <div className={`bg-gray-50 rounded-2xl border border-gray-200 ${isDesktop ? 'p-8' : 'p-5'}`}>
                    <div className="text-center">
                        <FaAward className={`mx-auto mb-3 ${isDesktop ? 'text-4xl' : 'text-2xl'} text-gray-400`} />
                        <h3 className={`font-bold text-gray-900 mb-2 ${isDesktop ? 'text-xl' : 'text-base'}`}>
                            {t('packagesIndexPage.freePlan.title')}
                        </h3>
                        <p className={`text-gray-600 mb-4 ${isDesktop ? 'text-base max-w-lg mx-auto' : 'text-sm'}`}>
                            {t('packagesIndexPage.freePlan.description')}
                        </p>
                        <div className={`flex items-center justify-center gap-2 text-sm ${isDesktop ? 'text-base' : 'text-sm'} text-gray-500`}>
                            <FaInfinity className="text-gray-400" />
                            <span>{t('packagesIndexPage.freePlan.foreverFree')}</span>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                {auth?.user && !isStudent && (
                    <div className={`bg-blue-50 rounded-2xl border border-blue-200 ${isDesktop ? 'p-6' : 'p-4'}`}>
                        <div className="flex items-start gap-2">
                            <FaInfoCircle className={`text-blue-600 ${isDesktop ? 'text-base' : 'text-sm'} mt-0.5 flex-shrink-0`} />
                            <div className={`${isDesktop ? 'text-sm' : 'text-xs'} text-blue-800`}>
                                <p className="font-semibold mb-1">{t('packagesIndexPage.info.title')}:</p>
                                <ul className={`${isDesktop ? 'space-y-2' : 'space-y-1'} list-disc list-inside`}>
                                    <li>{t('packagesIndexPage.info.items.cancelAnytime')}</li>
                                    <li>{t('packagesIndexPage.info.items.autoRenew')}</li>
                                    <li>{t('packagesIndexPage.info.items.viewAllFromMySubscriptions')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('packagesIndexPage.pageTitle', { appName: t('common.appName') })} />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('packagesIndexPage.navTitle')}
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
                    title={t('packagesIndexPage.navTitle')}
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
