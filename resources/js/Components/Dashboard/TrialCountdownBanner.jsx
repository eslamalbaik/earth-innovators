import { Link } from '@inertiajs/react';
import { useTranslation } from '@/i18n';
import { FaGift, FaClock, FaExclamationTriangle, FaArrowRight } from 'react-icons/fa';

/**
 * Shows a membership banner on dashboards (student/teacher/school):
 * - Active trial with countdown/progress
 * - Expiring soon (<= 7 days)
 * - Expired / needs renewal
 */
export default function TrialCountdownBanner({ membershipSummary = null }) {
    const { t } = useTranslation();

    if (!membershipSummary) return null;

    const { subscription, is_expiring_soon, needs_renewal, trial_available, is_school_owned } = membershipSummary;

    // If the membership is owned/managed by the school, don't show billing CTAs here.
    if (is_school_owned) return null;

    // Active trial
    if (subscription?.is_trial && !is_expiring_soon) {
        const daysLeft = subscription.days_remaining ?? 0;
        const totalDays = subscription.trial_days ?? 14;
        const progressPct = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));

        return (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-500 p-2.5 text-white">
                            <FaGift className="text-base" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-900">
                                {t('trialBanner.trialActive', { package: subscription.package_name })}
                            </p>
                            <p className="mt-0.5 text-xs text-emerald-700">
                                {t('trialBanner.daysRemaining', { count: daysLeft })} {' - '}
                                {t('trialBanner.endsAt', { date: subscription.end_date })}
                            </p>
                            <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-emerald-200">
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <Link
                        href="/packages"
                        className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                    >
                        {t('trialBanner.upgradeNow')}
                        <FaArrowRight className="text-[10px]" />
                    </Link>
                </div>
            </div>
        );
    }

    // Expiring soon (<= 7 days)
    if (is_expiring_soon && subscription) {
        const daysLeft = subscription.days_remaining ?? 0;

        return (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-amber-500 p-2.5 text-white">
                            <FaClock className="text-base" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-900">{t('trialBanner.expiringSoon')}</p>
                            <p className="mt-0.5 text-xs text-amber-700">
                                {daysLeft === 0
                                    ? t('trialBanner.expiresToday')
                                    : t('trialBanner.daysRemaining', { count: daysLeft })}
                                {' - '}
                                {subscription.package_name}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/packages"
                        className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-50"
                    >
                        {t('trialBanner.renewNow')}
                        <FaArrowRight className="text-[10px]" />
                    </Link>
                </div>
            </div>
        );
    }

    // Expired
    if (needs_renewal) {
        return (
            <div className="mb-5 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-red-500 p-2.5 text-white">
                            <FaExclamationTriangle className="text-base" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-red-900">{t('trialBanner.subscriptionExpired')}</p>
                            <p className="mt-0.5 text-xs text-red-700">{t('trialBanner.renewToAccessFeatures')}</p>
                        </div>
                    </div>
                    <Link
                        href="/packages"
                        className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
                    >
                        {t('trialBanner.subscribeNow')}
                        <FaArrowRight className="text-[10px]" />
                    </Link>
                </div>
            </div>
        );
    }

    // Trial available (not used yet)
    if (trial_available && !subscription) {
        return (
            <div className="mb-5 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-500 p-2.5 text-white">
                            <FaGift className="text-base" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-900">{t('trialBanner.trialAvailable')}</p>
                            <p className="mt-0.5 text-xs text-blue-700">{t('trialBanner.trialAvailableDesc')}</p>
                        </div>
                    </div>
                    <Link
                        href="/packages"
                        className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-4 py-2 text-xs font-semibold text-blue-800 transition hover:bg-blue-50"
                    >
                        {t('trialBanner.activateTrial')}
                        <FaArrowRight className="text-[10px]" />
                    </Link>
                </div>
            </div>
        );
    }

    return null;
}

