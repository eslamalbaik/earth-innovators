import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { FaGift, FaCheckCircle, FaTimes, FaClock, FaPaperPlane, FaCalendar } from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import { useToast } from '@/Contexts/ToastContext';
import { useTranslation } from '@/i18n';

export default function StoreMembership({ auth, user, currentBalance = 1190, redeemableItems = [] }) {
    const { showSuccess, showError } = useToast();
    const { t, language } = useTranslation();
    const [selectedItem, setSelectedItem] = useState(null);

    const defaultItems = [
        {
            id: 1,
            name: t('storeMembershipPage.items.digitalCard.name'),
            icon: '🃏',
            points: 1000,
            status: 'available',
            statusText: '',
        },
        {
            id: 2,
            name: t('storeMembershipPage.items.creativeTools.name'),
            icon: '🎨',
            points: 1500,
            status: 'insufficient',
            statusText: t('storeMembershipPage.itemStatuses.almostThere'),
        },
        {
            id: 3,
            name: t('storeMembershipPage.items.snackVoucher.name'),
            icon: '🍕',
            points: 800,
            status: 'available',
            statusText: '',
        },
        {
            id: 4,
            name: t('storeMembershipPage.items.workshopAccess.name'),
            icon: '🎫',
            points: 1200,
            status: 'pending',
            statusText: t('storeMembershipPage.itemStatuses.bookNow'),
        },
        {
            id: 5,
            name: t('storeMembershipPage.items.smartBox.name'),
            icon: '🎁',
            points: 900,
            status: 'ready',
            statusText: t('storeMembershipPage.itemStatuses.readyForTransfer'),
        },
    ];

    const items = redeemableItems.length > 0 ? redeemableItems : defaultItems;
    const balance = user?.points || currentBalance;

    const handleRedeem = () => {
        if (!selectedItem) {
            showError(t('storeMembershipPage.messages.selectGiftFirst'));
            return;
        }

        const item = items.find(i => i.id === selectedItem);
        if (!item) return;

        if (item.status === 'insufficient') {
            showError(t('storeMembershipPage.messages.insufficientGiftPoints'));
            return;
        }

        if (balance < item.points) {
            showError(t('storeMembershipPage.messages.insufficientBalance'));
            return;
        }

        showSuccess(t('storeMembershipPage.messages.redeemSuccess', { points: item.points }));
        setSelectedItem(null);
        router.reload();
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'available':
                return <FaCheckCircle className="text-green-500 text-sm" />;
            case 'insufficient':
                return <FaTimes className="text-red-500 text-sm" />;
            case 'pending':
                return <FaClock className="text-orange-500 text-sm" />;
            case 'ready':
                return <FaPaperPlane className="text-blue-500 text-sm" />;
            default:
                return null;
        }
    };

    const getStatusTextColor = (status) => {
        switch (status) {
            case 'insufficient':
                return 'text-red-600';
            case 'pending':
                return 'text-orange-600';
            case 'ready':
                return 'text-blue-600';
            default:
                return '';
        }
    };

    const StoreContent = ({ isDesktop = false }) => (
        <div className={`space-y-4 ${isDesktop ? 'lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0' : ''}`}>
            {/* Left Column - Desktop */}
            <div className={isDesktop ? 'space-y-4' : ''}>
                {/* Green Banner */}
                <div className="bg-gradient-to-r from-[#A3C042] to-[#8CA635] rounded-2xl p-4 text-white">
                    <div className="text-sm font-bold mb-1">{t('storeMembershipPage.banner.title')}</div>
                    <div className="text-xs opacity-90">{t('storeMembershipPage.banner.subtitle')}</div>
                </div>

                {/* Current Balance */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="text-xs text-gray-600 mb-2">{t('storeMembershipPage.currentBalanceTitle')}</div>
                    <div className="bg-green-50 rounded-xl p-3 mb-2">
                        <div className="text-base font-bold text-[#A3C042]">
                            {t('storeMembershipPage.currentBalanceValue', { points: balance })}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                        <FaCheckCircle className="text-green-500 text-[10px]" />
                        <span>{t('storeMembershipPage.redeemableStatus')}</span>
                    </div>
                </div>

                {/* Choose Your Gift */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FaGift className="text-[#A3C042] text-sm" />
                        <h3 className="text-sm font-extrabold text-gray-900">{t('storeMembershipPage.chooseGiftTitle')}</h3>
                    </div>
                    <div className="space-y-3">
                        {items.map((item) => {
                            const canSelect = item.status === 'available' || item.status === 'ready';
                            const isSelected = selectedItem === item.id;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => canSelect && setSelectedItem(item.id)}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition ${isSelected
                                            ? 'border-[#A3C042] bg-[#A3C042]/5'
                                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                        } ${canSelect ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="text-2xl">{item.icon}</div>
                                        <div className="flex-1">
                                            <div className="text-xs font-semibold text-gray-900">{item.name}</div>
                                            {item.statusText && (
                                                <div className={`text-[10px] font-semibold mt-1 ${getStatusTextColor(item.status)}`}>
                                                    {item.statusText}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-bold text-gray-700">{item.points}</div>
                                        {getStatusIcon(item.status)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Redeem Button */}
                <button
                    type="button"
                    onClick={handleRedeem}
                    className="w-full bg-[#A3C042] text-white rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#8CA635] transition"
                >
                    <FaGift />
                    {t('storeMembershipPage.redeemButton')}
                </button>
                <p className="text-[10px] text-gray-500 text-center">
                    {t('storeMembershipPage.redeemHint')}
                </p>
            </div>

            {/* Right Column - Desktop */}
            <div className={isDesktop ? 'space-y-4' : ''}>
                {/* Usage Rules */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <h3 className="text-sm font-extrabold text-gray-900 mb-3">{t('storeMembershipPage.rules.title')}</h3>
                    <div className="space-y-2 text-xs text-gray-700">
                        <div>• {t('storeMembershipPage.rules.rule1')}</div>
                        <div>• {t('storeMembershipPage.rules.rule2')}</div>
                        <div>• {t('storeMembershipPage.rules.rule3')}</div>
                    </div>
                </div>

                {/* Digital Win Card */}
                <div className="bg-gradient-to-r from-[#A3C042] to-[#8CA635] rounded-2xl p-4 text-white">
                    <div className="text-sm font-bold mb-3">{t('storeMembershipPage.sampleCard.title')}</div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-white/20 rounded-xl px-2 py-1">
                            <div className="text-xs font-bold">{t('storeMembershipPage.sampleCard.pointsLabel')}</div>
                        </div>
                    </div>
                    <div className="bg-white/20 rounded-xl p-3 mb-2">
                        <div className="text-xs font-mono font-bold">FVZ9-62YP-LK21</div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-2">
                        <span>{t('storeMembershipPage.sampleCard.codeLabel')}</span>
                        <div className="flex items-center gap-1">
                            <FaCalendar className="text-[10px]" />
                            <span>{t('storeMembershipPage.sampleCard.expiryDate')}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-3">
                        <span>{t('storeMembershipPage.sampleCard.validUntilLabel')}</span>
                    </div>
                    <p className="text-[10px] opacity-90">
                        {t('storeMembershipPage.sampleCard.description')}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('storeMembershipPage.pageTitle', { appName: t('common.appName') })} />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileTopBar
                    title={t('storeMembershipPage.title')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/achievements')}
                    reverseOrder={true}
                />
                <main className="px-4 pb-24 pt-4">
                    <StoreContent isDesktop={false} />
                </main>
                <MobileBottomNav active="profile" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title={t('storeMembershipPage.title')}
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/achievements')}
                    reverseOrder={true}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <StoreContent isDesktop={true} />
                    </div>
                </main>
                <MobileBottomNav active="profile" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}

