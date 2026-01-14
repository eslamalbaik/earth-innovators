import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { FaChartLine, FaPlusCircle, FaMinusCircle, FaGift, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';

const typeLabels = {
    earned: 'مكتسبة',
    bonus: 'مكافأة',
    redeemed: 'مستبدلة',
    penalty: 'خصم',
};

const typeColors = {
    earned: 'bg-green-100 text-green-800 border-green-200',
    bonus: 'bg-blue-100 text-blue-800 border-blue-200',
    redeemed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    penalty: 'bg-red-100 text-red-800 border-red-200',
};

export default function StudentPoints({ auth, summary, points, filters }) {
    const currentType = filters?.type || '';
    const list = points?.data || [];
    const user = auth?.user;
    const isAuthed = !!user;

    const stats = useMemo(() => {
        return {
            current: summary?.current ?? 0,
            earned: summary?.earned ?? 0,
            bonus: summary?.bonus ?? 0,
            redeemed: summary?.redeemed ?? 0,
            penalty: summary?.penalty ?? 0,
        };
    }, [summary]);

    const applyType = (type) => {
        router.get('/student/points', type ? { type } : {}, { preserveState: true, preserveScroll: true });
    };

    const PointsContent = ({ isDesktop = false }) => (
        <div className={`space-y-4 ${isDesktop ? 'md:space-y-6' : ''}`}>
            {/* Summary Cards */}
            <div className={`grid gap-3 ${isDesktop ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2'}`}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">رصيدي الحالي</div>
                            <div className={`font-extrabold text-gray-900 mt-1 ${isDesktop ? 'text-2xl' : 'text-xl'}`}>{stats.current}</div>
                        </div>
                        <div className={`rounded-xl bg-purple-100 flex items-center justify-center ${isDesktop ? 'w-10 h-10' : 'w-8 h-8'}`}>
                            <FaChartLine className={`text-purple-700 ${isDesktop ? 'text-lg' : 'text-sm'}`} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">نقاط مكتسبة</div>
                            <div className={`font-extrabold text-green-700 mt-1 ${isDesktop ? 'text-2xl' : 'text-xl'}`}>{stats.earned}</div>
                        </div>
                        <div className={`rounded-xl bg-green-100 flex items-center justify-center ${isDesktop ? 'w-10 h-10' : 'w-8 h-8'}`}>
                            <FaPlusCircle className={`text-green-700 ${isDesktop ? 'text-lg' : 'text-sm'}`} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">مكافآت</div>
                            <div className={`font-extrabold text-blue-700 mt-1 ${isDesktop ? 'text-2xl' : 'text-xl'}`}>{stats.bonus}</div>
                        </div>
                        <div className={`rounded-xl bg-blue-100 flex items-center justify-center ${isDesktop ? 'w-10 h-10' : 'w-8 h-8'}`}>
                            <FaGift className={`text-blue-700 ${isDesktop ? 'text-lg' : 'text-sm'}`} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">مستبدلة</div>
                            <div className={`font-extrabold text-yellow-700 mt-1 ${isDesktop ? 'text-2xl' : 'text-xl'}`}>{stats.redeemed}</div>
                        </div>
                        <div className={`rounded-xl bg-yellow-100 flex items-center justify-center ${isDesktop ? 'w-10 h-10' : 'w-8 h-8'}`}>
                            <FaMinusCircle className={`text-yellow-700 ${isDesktop ? 'text-lg' : 'text-sm'}`} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs text-gray-500">خصومات</div>
                            <div className={`font-extrabold text-red-700 mt-1 ${isDesktop ? 'text-2xl' : 'text-xl'}`}>{stats.penalty}</div>
                        </div>
                        <div className={`rounded-xl bg-red-100 flex items-center justify-center ${isDesktop ? 'w-10 h-10' : 'w-8 h-8'}`}>
                            <FaExclamationTriangle className={`text-red-700 ${isDesktop ? 'text-lg' : 'text-sm'}`} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 text-gray-700">
                        <FaFilter className="text-sm" />
                        <span className="text-xs font-bold">فلترة:</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => applyType('')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                            !currentType ? 'bg-[#A3C042] text-white border-[#A3C042]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                    >
                        الكل
                    </button>

                    {['earned', 'bonus', 'redeemed', 'penalty'].map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => applyType(t)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                                currentType === t ? 'bg-[#A3C042] text-white border-[#A3C042]' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            {typeLabels[t]}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`border-b border-gray-100 flex items-center justify-between ${isDesktop ? 'p-4' : 'p-3'}`}>
                    <div className={`font-extrabold text-gray-900 ${isDesktop ? 'text-sm' : 'text-xs'}`}>سجل النقاط</div>
                    <Link
                        href="/store-membership"
                        className={`font-bold text-[#A3C042] hover:text-[#93b03a] transition ${isDesktop ? 'text-sm' : 'text-xs'}`}
                    >
                        بطاقة عضوية المتجر
                    </Link>
                </div>

                {list.length === 0 ? (
                    <div className={`text-center ${isDesktop ? 'p-10' : 'p-6'}`}>
                        <FaChartLine className={`mx-auto text-gray-200 mb-4 ${isDesktop ? 'text-5xl' : 'text-4xl'}`} />
                        <div className={`text-gray-700 font-bold ${isDesktop ? 'text-base' : 'text-sm'}`}>لا يوجد سجل نقاط حالياً</div>
                        <div className={`text-gray-500 mt-1 ${isDesktop ? 'text-sm' : 'text-xs'}`}>ستظهر هنا عمليات كسب/استبدال النقاط عندما تبدأ نشاطك.</div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {list.map((row) => {
                            const color = typeColors[row.type] || 'bg-gray-100 text-gray-800 border-gray-200';
                            return (
                                <div key={row.id} className={`flex items-center justify-between gap-4 ${isDesktop ? 'p-4' : 'p-3'}`}>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-bold text-gray-900 truncate ${isDesktop ? 'text-sm' : 'text-xs'}`}>
                                            {row.description || '—'}
                                        </div>
                                        <div className={`text-gray-500 mt-1 ${isDesktop ? 'text-xs' : 'text-[10px]'}`}>
                                            {row.created_at || '—'} • {row.source || '—'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`px-2 py-1 rounded-full font-bold border ${color} ${isDesktop ? 'text-xs' : 'text-[10px]'}`}>
                                            {typeLabels[row.type] || row.type}
                                        </span>
                                        <div className={`font-extrabold ${row.points >= 0 ? 'text-green-700' : 'text-red-700'} ${isDesktop ? 'text-lg' : 'text-base'}`}>
                                            {row.points >= 0 ? `+${row.points}` : row.points}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {points?.links?.length > 3 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {points.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                className={`px-2 py-1.5 rounded-xl font-semibold transition ${
                                    link.active ? 'bg-[#A3C042] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} ${isDesktop ? 'text-sm' : 'text-xs'}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div dir="rtl" className="min-h-screen bg-gray-50">
            <Head title="النقاط - إرث المبتكرين" />

            {/* Mobile View */}
            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title="النقاط"
                    activeNav="profile"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/profile')}
                >
                    <PointsContent isDesktop={false} />
                </MobileAppLayout>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <MobileTopBar
                    title="النقاط"
                    unreadCount={auth?.unreadCount || 0}
                    onNotifications={() => router.visit('/notifications')}
                    onBack={() => router.visit('/student/profile')}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                    <div className="mx-auto w-full max-w-4xl">
                        <PointsContent isDesktop={true} />
                    </div>
                </main>
                <MobileBottomNav active="profile" role={user?.role} isAuthed={isAuthed} user={user} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}


