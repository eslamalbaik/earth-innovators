import { Link, usePage } from '@inertiajs/react';
import { FaClock, FaGem, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useState } from 'react';
import { useTranslation } from '@/i18n';

export default function TrialBanner() {
    const { t } = useTranslation();
    const { subscription } = usePage().props;
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || !subscription || subscription.status === 'none') return null;

    const { isTrial, isExpiring, isExpired, daysLeft, packageName } = subscription;

    // لا تُظهر شيئاً إذا الاشتراك نشط وأيامه كثيرة
    if (!isTrial && !isExpiring && !isExpired) return null;

    // تحديد لون وأيقونة الشريط حسب الحالة
    const config = isExpired
        ? {
            bg: 'bg-red-600',
            text: 'text-white',
            icon: <FaExclamationTriangle className="text-white text-sm flex-shrink-0" />,
            message: t('trialBanner.expired', { package: packageName }) || `انتهى اشتراكك في ${packageName}`,
            cta: t('trialBanner.renewNow') || 'جدّد الآن',
        }
        : isExpiring
        ? {
            bg: 'bg-amber-500',
            text: 'text-white',
            icon: <FaClock className="text-white text-sm flex-shrink-0" />,
            message: t('trialBanner.expiringSoon', { days: daysLeft, package: packageName })
                || `ينتهي اشتراكك في ${packageName} خلال ${daysLeft} يوم`,
            cta: t('trialBanner.renewNow') || 'جدّد الآن',
        }
        : isTrial
        ? {
            bg: 'bg-gradient-to-r from-[#A3C042] to-emerald-500',
            text: 'text-white',
            icon: <FaGem className="text-white text-sm flex-shrink-0" />,
            message: daysLeft !== null
                ? (t('trialBanner.trialActive', { days: daysLeft, package: packageName })
                    || `أنت في الفترة التجريبية لـ ${packageName} — تبقى ${daysLeft} يوم`)
                : (t('trialBanner.trialActiveNoDate', { package: packageName })
                    || `أنت في الفترة التجريبية لـ ${packageName}`),
            cta: t('trialBanner.upgradeNow') || 'اشترك الآن',
        }
        : null;

    if (!config) return null;

    return (
        <div className={`${config.bg} ${config.text} px-4 py-2 flex items-center justify-between gap-3 text-sm font-medium`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {config.icon}
                <span className="truncate">{config.message}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
                <Link
                    href="/packages"
                    className="bg-white/20 hover:bg-white/30 transition rounded-lg px-3 py-1 text-xs font-bold whitespace-nowrap border border-white/30"
                >
                    {config.cta}
                </Link>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1 rounded hover:bg-white/20 transition"
                    aria-label="إغلاق"
                >
                    <FaTimes className="text-xs" />
                </button>
            </div>
        </div>
    );
}
