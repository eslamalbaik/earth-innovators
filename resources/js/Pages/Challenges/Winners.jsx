import { Head, router } from '@inertiajs/react';
import { FaTrophy, FaArrowLeft } from 'react-icons/fa';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';

export default function Winners({ auth, winners = [] }) {
    const getAvatarUrl = (avatar) => {
        if (!avatar) return '/images/hero.png';
        if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
        if (avatar.startsWith('/storage/')) return avatar;
        return `/storage/${avatar}`;
    };

    const WinnersContent = () => (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                    <FaTrophy className="text-yellow-500 text-xl" />
                    <h1 className="text-lg font-extrabold text-gray-900">الفائزون في التحديات</h1>
                </div>
                <p className="text-sm text-gray-600">
                    قائمة بجميع الفائزين في التحديات المختلفة
                </p>
            </div>

            {/* Winners List */}
            {winners.length > 0 ? (
                <div className="space-y-4">
                    {winners.map((winner, index) => (
                        <div
                            key={winner.id || index}
                            className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition"
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <img
                                            src={getAvatarUrl(winner.avatar)}
                                            alt={winner.name}
                                            className="w-16 h-16 rounded-full object-cover border-2 border-yellow-200"
                                            onError={(e) => {
                                                e.target.src = '/images/hero.png';
                                            }}
                                        />
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                                            <FaTrophy className="text-white text-xs" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-base font-bold text-gray-900">{winner.name}</h3>
                                        {index < 3 && (
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                                                #{index + 1}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{winner.project}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-gray-500">{winner.date}</span>
                                        {winner.rating > 0 && (
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-300">
                                                {winner.rating.toFixed(1)} ⭐
                                            </span>
                                        )}
                                        {winner.points > 0 && (
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold border bg-blue-100 text-blue-700 border-blue-300">
                                                {winner.points} نقطة
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <FaTrophy className="text-gray-400 text-4xl" />
                    </div>
                    <p className="text-gray-400 text-sm mb-2">لا توجد فائزين حالياً</p>
                </div>
            )}

            {/* Back Button */}
            <button
                type="button"
                onClick={() => router.visit('/challenges')}
                className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition"
            >
                <span className="text-sm font-semibold text-gray-700">العودة إلى التحديات</span>
                <FaArrowLeft className="text-gray-400" />
            </button>
        </div>
    );

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="الفائزون - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileTopBar
                    title="الفائزون"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/challenges')}
                />
                <main className="px-4 pb-24 pt-4">
                    <WinnersContent />
                </main>
                <MobileBottomNav active="challenges" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="الفائزون"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/challenges')}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <WinnersContent />
                    </div>
                </main>
                <MobileBottomNav active="challenges" role={auth?.user?.role} isAuthed={!!auth?.user} user={auth?.user} />
            </div>
        </div>
    );
}

