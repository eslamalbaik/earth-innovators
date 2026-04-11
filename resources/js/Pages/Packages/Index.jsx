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
    const { showSuccess, showError } = useToast();
    const { t, language } = useTranslation();
    const [subscribingPackageId, setSubscribingPackageId] = useState(null);
    useFlashNotifications();
    const hasPendingSubscription = userPackage?.status === 'pending';
    const isSchoolManaged = !!membershipSummary?.is_school_owned;

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

    const PackagesContent = ({ isDesktop = false }) => (
        <div className={isDesktop ? "space-y-6" : "space-y-4"}>
            {/* Header */}
            <div className={isDesktop ? "mb-6 text-center" : "mb-4"}>
                <h1 className={isDesktop ? "text-3xl font-extrabold text-gray-900 mb-3" : "text-lg font-extrabold text-gray-900 mb-2"}>
                    {t('packagesIndexPage.title')}
                </h1>
                <p className={isDesktop ? "text-lg text-gray-600 max-w-2xl mx-auto" : "text-sm text-gray-600"}>
                    {t('packagesIndexPage.subtitle')}
                </p>
                {auth?.user && (
                    <p className={isDesktop ? "mt-2 text-sm text-gray-500" : "mt-1 text-xs text-gray-500"}>
                        {t('packagesIndexPage.personalizedFor', { role: roleLabel })}
                    </p>
                )}
            </div>

            {auth?.user && membershipSummary?.is_school_owned && membershipSummary?.subscription && (
                <div className={`rounded-2xl border border-blue-200 bg-blue-50 ${isDesktop ? 'p-6 mb-6' : 'p-4 mb-4'}`}>
                    <h3 className={`${isDesktop ? 'text-base' : 'text-sm'} font-bold text-blue-900`}>
                        {t('packagesIndexPage.management.schoolManagedTitle')}
                    </h3>
                    <p className={`${isDesktop ? 'text-sm' : 'text-xs'} mt-2 text-blue-800`}>
                        {t('packagesIndexPage.management.schoolManagedDescription', {
                            school: membershipSummary.owner_name,
                            package: membershipSummary.subscription.package_name,
                        })}
                    </p>
                </div>
            )}

            {auth?.user && membershipSummary?.needs_renewal && membershipSummary?.latest_subscription && (
                <div className={`rounded-2xl border border-red-200 bg-red-50 ${isDesktop ? 'p-6 mb-6' : 'p-4 mb-4'}`}>
                    <h3 className={`${isDesktop ? 'text-base' : 'text-sm'} font-bold text-red-900`}>
                        {t('packagesIndexPage.membershipAlerts.renewalTitle')}
                    </h3>
                    <p className={`${isDesktop ? 'text-sm' : 'text-xs'} mt-2 text-red-800`}>
                        {t('packagesIndexPage.membershipAlerts.renewalDescription', {
                            package: membershipSummary.latest_subscription.package_name,
                            date: toHijriDate(membershipSummary.latest_subscription.end_date),
                        })}
                    </p>
                </div>
            )}

            {auth?.user && !membershipSummary?.subscription && !membershipSummary?.pending_subscription && membershipSummary?.trial_available && !membershipSummary?.is_school_owned && (
                <div className={`rounded-2xl border border-emerald-200 bg-emerald-50 ${isDesktop ? 'p-6 mb-6' : 'p-4 mb-4'}`}>
                    <h3 className={`${isDesktop ? 'text-base' : 'text-sm'} font-bold text-emerald-900`}>
                        {t('packagesIndexPage.membershipAlerts.trialTitle')}
                    </h3>
                    <p className={`${isDesktop ? 'text-sm' : 'text-xs'} mt-2 text-emerald-800`}>
                        {t('packagesIndexPage.membershipAlerts.trialDescription')}
                    </p>
                </div>
            )}

            {/* Current Subscription Card */}
            {auth?.user && userPackage && userPackage.status === 'active' && (
                <div className={`bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl ${isDesktop ? 'p-6 mb-6' : 'p-4 mb-4'}`}>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className={`${isDesktop ? 'text-base' : 'text-sm'} font-bold text-green-900 mb-1 flex items-center gap-2`}>
                                <FaCheckCircle className="text-green-600" />
                                {t('packagesIndexPage.currentPackage.title')}
                            </h3>
                            <p className={`${isDesktop ? 'text-base' : 'text-sm'} text-green-800 mb-1`}>
                                {getPackageName(userPackage.package)}
                            </p>
                            <p className={`${isDesktop ? 'text-sm' : 'text-xs'} text-green-700`}>
                                {userPackage.is_trial
                                    ? t('packagesIndexPage.currentPackage.trialEndsAt', { date: toHijriDate(userPackage.end_date) })
                                    : `${t('packagesIndexPage.currentPackage.endsAt')}: ${toHijriDate(userPackage.end_date)}`}
                            </p>
                        </div>
                        <span className={`px-3 py-1 bg-[#A3C042] text-white ${isDesktop ? 'text-sm' : 'text-xs'} font-semibold rounded-full`}>
                            {userPackage.is_trial ? t('packagesIndexPage.badges.trial') : t('packagesIndexPage.currentPackage.active')}
                        </span>
                    </div>
                    <Link
                        href="/my-subscriptions"
                        className={`${isDesktop ? 'text-sm' : 'text-xs'} text-green-700 hover:text-green-900 font-medium`}
                    >
                        {t('packagesIndexPage.currentPackage.viewAll')}
                    </Link>
                </div>
            )}

            {/* Pending Subscription Card */}
            {auth?.user && userPackage && userPackage.status === 'pending' && (
                <div className={`bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl ${isDesktop ? 'p-6 mb-6' : 'p-4 mb-4'}`}>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className={`${isDesktop ? 'text-base' : 'text-sm'} font-bold text-yellow-900 mb-1 flex items-center gap-2`}>
                                <FaSpinner className="text-yellow-600 animate-spin" />
                                {t('packagesIndexPage.pending.title')}
                            </h3>
                            <p className={`${isDesktop ? 'text-sm' : 'text-xs'} text-yellow-800`}>
                                {t('packagesIndexPage.pending.subtitle')}
                            </p>
                            <p className={`${isDesktop ? 'text-xs' : 'text-[11px]'} text-yellow-700 mt-2`}>
                                {t('packagesIndexPage.pending.packageName', { name: getPackageName(userPackage.package) })}
                            </p>
                        </div>
                        <span className={`px-3 py-1 bg-yellow-200 text-yellow-800 ${isDesktop ? 'text-sm' : 'text-xs'} font-semibold rounded-full`}>
                            {t('packagesIndexPage.pending.badge')}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/my-subscriptions"
                            className={`${isDesktop ? 'text-sm' : 'text-xs'} text-yellow-800 hover:text-yellow-900 font-medium`}
                        >
                            {t('packagesIndexPage.pending.viewAll')}
                        </Link>
                        <button
                            type="button"
                            onClick={() => router.reload({ only: ['packages', 'userPackage'] })}
                            className={`${isDesktop ? 'text-sm' : 'text-xs'} text-yellow-800 hover:text-yellow-900 font-medium`}
                        >
                            {t('packagesIndexPage.pending.refresh')}
                        </button>
                    </div>
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
                        const hasPending = userPackage?.package_id === pkg.id && hasPendingSubscription;
                        const isTrialUsed = pkg.is_trial && trialStatus?.used && !isCurrentPackage && !hasPending;
                        const isSubscribing = subscribingPackageId === pkg.id;
                        const disableSubscription = isSubscribing || isCurrentPackage || hasPendingSubscription || isTrialUsed || isSchoolManaged;

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
                                    <div className="absolute top-0 end-0 start-0 bg-gradient-to-r from-[#A3C042] to-[#8CA635] text-white text-center py-1.5 font-bold text-xs">
                                        {t('packagesIndexPage.badges.mostPopular')}
                                    </div>
                                )}
                                {isCurrentPackage && (
                                    <div className="absolute top-0 end-0 start-0 bg-[#A3C042] text-white text-center py-1.5 font-bold text-xs">
                                        {t('packagesIndexPage.badges.currentPackage')}
                                    </div>
                                )}
                                {pkg.is_trial && !isCurrentPackage && (
                                    <div className="absolute start-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                                        {t('packagesIndexPage.badges.trial')}
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
                                            {getPackageName(pkg)}
                                        </h3>
                                        <div className="mb-2">
                                            {pkg.is_trial ? (
                                                <span className={`${isDesktop ? 'text-3xl' : 'text-2xl'} font-bold text-emerald-600`}>
                                                    {t('packagesIndexPage.badges.freeTrial')}
                                                </span>
                                            ) : (
                                                <>
                                                    <span className={`${isDesktop ? 'text-4xl' : 'text-3xl'} font-bold text-gray-900`}>{pkg.price}</span>
                                                    <span className={`text-gray-600 ${isDesktop ? 'text-base' : 'text-sm'}`}> {pkg.currency}</span>
                                                </>
                                            )}
                                            <span className={`text-gray-500 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                {' / '}
                                                {pkg.is_trial
                                                    ? t('packagesIndexPage.duration.trialDays', { count: pkg.trial_days || 14 })
                                                    : getDurationLabel(pkg.duration_type, pkg.duration_months)}
                                            </span>
                                        </div>
                                        {pkg.description_ar || pkg.description ? (
                                            <p className={`${isDesktop ? 'text-sm' : 'text-xs'} text-gray-600`}>
                                                {pkg.description_ar || pkg.description}
                                            </p>
                                        ) : null}
                                    </div>

                                    {/* Features */}
                                    <div className="border-t border-gray-200 pt-4 mb-4">
                                        <h4 className={`font-semibold text-gray-900 mb-3 ${isDesktop ? 'text-base' : 'text-sm'}`}>{t('packagesIndexPage.features.title')}:</h4>
                                        <ul className={`${isDesktop ? 'space-y-3' : 'space-y-2'}`}>
                                            {pkg.projects_limit !== null ? (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaCheck className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.projectsLimit', { count: pkg.projects_limit })}</span>
                                                </li>
                                            ) : (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaInfinity className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.unlimitedProjects')}</span>
                                                </li>
                                            )}
                                            {pkg.challenges_limit !== null ? (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaCheck className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.challengesLimit', { count: pkg.challenges_limit })}</span>
                                                </li>
                                            ) : (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaInfinity className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.unlimitedChallenges')}</span>
                                                </li>
                                            )}
                                            {pkg.points_bonus > 0 && (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaGift className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.pointsBonus', { count: pkg.points_bonus })}</span>
                                                </li>
                                            )}
                                            {pkg.badge_access && (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaAward className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.badgesAccess')}</span>
                                                </li>
                                            )}
                                            {pkg.certificate_access && (
                                                <li className={`flex items-center gap-2 ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                                    <FaTrophy className={`text-[#A3C042] flex-shrink-0 ${isDesktop ? 'text-sm' : 'text-xs'}`} />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.certificatesAccess')}</span>
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
                                            disabled={disableSubscription}
                                            className={`w-full text-center ${isDesktop ? 'px-6 py-4' : 'px-4 py-3'} rounded-xl font-semibold ${isDesktop ? 'text-base' : 'text-sm'} transition ${isCurrentPackage
                                                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                            : isTrialUsed
                                                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                                : isSchoolManaged
                                                    ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                                                : hasPendingSubscription
                                                    ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                                                    : pkg.is_trial
                                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                    : isPopular
                                                        ? 'bg-gradient-to-r from-[#A3C042] to-[#8CA635] text-white hover:shadow-lg'
                                                        : 'bg-[#A3C042] text-white hover:bg-[#8CA635]'
                                                } ${isSubscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {isSubscribing ? (
                                                <>
                                                    <FaSpinner className="animate-spin inline me-2" />
                                                    {t('packagesIndexPage.actions.processing')}
                                                </>
                                            ) : isCurrentPackage ? (
                                                t('packagesIndexPage.badges.currentPackage')
                                            ) : isTrialUsed ? (
                                                t('packagesIndexPage.actions.trialUsed')
                                            ) : isSchoolManaged ? (
                                                t('packagesIndexPage.actions.managedBySchool')
                                            ) : hasPendingSubscription ? (
                                                t('packagesIndexPage.actions.subscriptionPending')
                                            ) : pkg.is_trial ? (
                                                <>
                                                    <FaGift className="inline me-2" />
                                                    {t('packagesIndexPage.actions.activateTrial')}
                                                </>
                                            ) : (
                                                <>
                                                    <FaCreditCard className="inline me-2" />
                                                    {userPackage?.package_id === pkg.id ? t('packagesIndexPage.actions.renew') : t('packagesIndexPage.actions.subscribeNow')}
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
                                            {t('packagesIndexPage.actions.registerToSubscribe')}
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
                    <p className="text-sm text-gray-500">{t('packagesIndexPage.empty')}</p>
                </div>
            )}

            {/* Info Section */}
            {auth?.user && (
                <div className={`bg-blue-50 rounded-2xl border border-blue-200 ${isDesktop ? 'p-6 mt-6' : 'p-4 mt-4'}`}>
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
