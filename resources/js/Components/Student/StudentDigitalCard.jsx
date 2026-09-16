import { Link } from '@inertiajs/react';
import { FaIdCard, FaGift } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

/**
 * Digital rewards card on the student's own profile page — requirement 7.1.
 * Points balance is read straight from the same `stats.points` the rest of
 * the profile page uses (already computed fresh on every page load from
 * `user.points`), so there is nothing to keep "in sync" separately.
 */
export default function StudentDigitalCard({ name, membershipNumber, points = 0 }) {
    const { t } = useTranslation();

    return (
        <Link
            href="/store-membership"
            className="block rounded-3xl p-5 text-white shadow-md bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden"
        >
            <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -right-4 w-32 h-32 rounded-full bg-white/10" />

            <div className="relative flex items-center justify-between mb-4">
                <FaIdCard className="text-2xl opacity-90" />
                <span className="text-[11px] font-semibold opacity-80">{t('studentDigitalCard.title')}</span>
            </div>

            <div className="relative">
                <div className="text-lg font-black tracking-wide">{name}</div>
                <div className="text-xs opacity-75 mt-0.5 font-mono">{membershipNumber || '—'}</div>
            </div>

            <div className="relative flex items-center justify-between mt-5">
                <div className="flex items-center gap-1.5">
                    <FaGift className="text-sm opacity-90" />
                    <span className="text-2xl font-black">{points}</span>
                    <span className="text-xs opacity-80">{t('common.points')}</span>
                </div>
                <span className="text-[11px] font-semibold underline underline-offset-2">
                    {t('studentDigitalCard.viewRewards')}
                </span>
            </div>
        </Link>
    );
}
