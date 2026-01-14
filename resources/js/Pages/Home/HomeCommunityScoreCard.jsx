import { FaHeart } from 'react-icons/fa';

export default function HomeCommunityScoreCard({ percent = 35, points = 0 }) {
    const clamped = Math.max(0, Math.min(100, Number(percent) || 0));

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
                <div className="text-3xl font-extrabold text-gray-900">{clamped}%</div>

                <div className="flex-1 px-4 text-center">
                    <div className="text-sm font-bold text-gray-900">إرث في الإبداع المجتمعي</div>
                    <div className="mt-1 text-xs text-gray-500">{points} من 100 نقطة</div>
                </div>

                <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#A3C042] to-legacy-blue flex items-center justify-center shadow-sm">
                        <FaHeart className="text-white text-lg" />
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-l from-[#A3C042] via-[#f472b6] to-[#60a5fa]"
                        style={{ width: `${clamped}%` }}
                    />
                </div>

                <div className="mt-2 grid grid-cols-4 text-[10px] text-gray-400">
                    <div className="">0-20</div>
                    <div className="text-center">21-50</div>
                    <div className="text-center">51-80</div>
                    <div className="text-left">81-100</div>
                </div>
            </div>
        </section>
    );
}


