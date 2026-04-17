import { Link } from '@inertiajs/react';
import { useTranslation } from '@/i18n';
import { FaCrown, FaTimes, FaArrowRight, FaCheckCircle } from 'react-icons/fa';

/**
 * PremiumFeatureModal
 * نافذة منبثقة تظهر عند محاولة الوصول لميزة مدفوعة.
 * الاستخدام:
 *   const [showPremium, setShowPremium] = useState(false);
 *   <PremiumFeatureModal isOpen={showPremium} onClose={() => setShowPremium(false)} featureName="الشهادات" />
 */
export default function PremiumFeatureModal({ isOpen, onClose, featureName = null, benefits = [] }) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    const defaultBenefits = [
        t('premiumGate.benefit1'),
        t('premiumGate.benefit2'),
        t('premiumGate.benefit3'),
        t('premiumGate.benefit4'),
    ];

    const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits;

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="premium-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
                {/* Header gradient */}
                <div className="bg-gradient-to-r from-[#A3C042] to-[#6ea832] px-6 py-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3">
                        <FaCrown className="text-3xl text-white" />
                    </div>
                    <h2 id="premium-modal-title" className="text-xl font-extrabold text-white">
                        {featureName
                            ? t('premiumGate.featureLockedWithName', { feature: featureName })
                            : t('premiumGate.featureLocked')}
                    </h2>
                    <p className="mt-1 text-sm text-white/80">
                        {t('premiumGate.subscribeToUnlock')}
                    </p>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                        {t('premiumGate.whatYouGet')}
                    </p>
                    <ul className="space-y-2 mb-5">
                        {displayBenefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <FaCheckCircle className="text-[#A3C042] flex-shrink-0 mt-0.5" />
                                {benefit}
                            </li>
                        ))}
                    </ul>

                    <div className="flex gap-3">
                        <Link
                            href="/packages"
                            onClick={onClose}
                            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#A3C042] to-[#8CA635] text-white rounded-xl px-4 py-3 font-bold text-sm hover:shadow-lg transition"
                        >
                            {t('premiumGate.viewPackages')}
                            <FaArrowRight className="text-xs" />
                        </Link>
                        <button
                            onClick={onClose}
                            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 end-4 text-white/70 hover:text-white transition"
                    aria-label={t('common.close')}
                >
                    <FaTimes className="text-lg" />
                </button>
            </div>
        </div>
    );
}
