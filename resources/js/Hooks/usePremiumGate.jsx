import { useCallback, useState } from 'react';
import PremiumFeatureModal from '@/Components/Modals/PremiumFeatureModal';

/**
 * usePremiumGate
 *
 * Helps gate premium-only actions behind a modal.
 *
 * Usage:
 *   const { gate, canAccess, premiumModal } = usePremiumGate(membershipSummary, { featureName: 'Certificates' });
 *   return (<>{premiumModal}<button onClick={() => gate(() => doPaidAction())} /></>);
 */
export function usePremiumGate(
    membershipSummary = null,
    { featureName = null, benefits = [], requiredAccessKey = null } = {}
) {
    const [isOpen, setIsOpen] = useState(false);

    // Allow access if:
    // - user has an active subscription (trial or paid), OR
    // - membership is owned/managed by the school.
    const baseAccess = Boolean(
        membershipSummary?.subscription ||
        membershipSummary?.is_school_owned
    );

    // Some features require an explicit entitlement flag (e.g. certificate_access).
    const canAccess = requiredAccessKey
        ? Boolean(baseAccess && membershipSummary?.[requiredAccessKey])
        : baseAccess;

    const gate = useCallback((fn) => {
        if (canAccess) {
            return fn?.();
        }

        setIsOpen(true);
        return undefined;
    }, [canAccess]);

    const premiumModal = (
        <PremiumFeatureModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            featureName={featureName}
            benefits={benefits}
        />
    );

    return {
        gate,
        canAccess,
        premiumModal,
        openPremium: () => setIsOpen(true),
        closePremium: () => setIsOpen(false),
    };
}

export default usePremiumGate;

