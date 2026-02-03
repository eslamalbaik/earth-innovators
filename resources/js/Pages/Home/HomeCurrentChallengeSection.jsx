import { FaCalendarAlt, FaUsers } from 'react-icons/fa';

function ChallengeCard({ onJoin }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative">
                <img
                    src="/images/subjects/image1.png"
                    alt="تحدي"
                    className="h-40 w-full object-cover"
                    loading="lazy"
                />
                <div className="absolute top-3 right-3 rounded-lg bg-[#A3C042]/20 border border-[#A3C042]/30 px-2 py-1 text-[11px] font-bold text-[#6b7f2c]">
                    8 نقاط
                </div>
            </div>

            <div className="p-4">
                <div className="text-sm font-extrabold text-gray-900">تحدي تصميم تطبيق للتعلم عن بعد</div>
                <div className="mt-1 text-xs text-gray-500">
                    صمم واجهة مستخدم لتطبيق يسهل عملية التعلم عن بعد ويحسن تفاعل الطلاب
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>ينتهي خلال 5 أيام</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaUsers className="text-gray-400" />
                        <span>34 مشارك</span>
                    </div>
                </div>

                <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>الحد الأدنى: 50</span>
                        <span />
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full w-3/5 bg-gradient-to-l from-[#A3C042] to-legacy-blue rounded-full" />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onJoin}
                    className="mt-4 w-full rounded-xl bg-[#A3C042] py-2 text-sm font-bold text-white hover:bg-[#8CA635] transition"
                >
                    شارك الآن
                </button>
            </div>
        </div>
    );
}

export default function HomeCurrentChallengeSection({ onViewAll, onJoin }) {
    return (
        <section>
            <div className="flex items-center justify-between px-1">
                <div className="text-sm font-bold text-gray-900">التحدي الحالي</div>
                <button
                    type="button"
                    onClick={onViewAll}
                    className="text-xs font-semibold text-[#A3C042] hover:text-[#8CA635]"
                >
                    عرض الكل
                </button>
            </div>

            <div className="mt-3 space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                <ChallengeCard onJoin={onJoin} />
                <ChallengeCard onJoin={onJoin} />
            </div>
        </section>
    );
}


