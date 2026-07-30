import { useTranslation } from '@/i18n';

// Innovation domains showcase. Images are supplied by the site owner and dropped
// into public/images with the filenames below; until then each card falls back
// to the hero illustration so nothing renders broken.
const ITEMS = [
    { key: 'cities', img: '/images/city.jpeg', ar: 'المدن الذكية والمستدامة', en: 'Smart & Sustainable Cities' },
    { key: 'robotics', img: '/images/robot.jfif', ar: 'الروبوتات والأتمتة', en: 'Robotics & Automation' },
    { key: 'ai', img: '/images/ai.jpg', ar: 'الذكاء الاصطناعي', en: 'Artificial Intelligence' },
    { key: 'space', img: '/images/space.jpg', ar: 'استكشاف الفضاء', en: 'Space Exploration' },
];

const FALLBACK_IMAGE = '/images/hero.png';

export default function WhatCanYouMakeSection() {
    const { language } = useTranslation();
    const isAr = language === 'ar';

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
                    {isAr ? 'ماذا يمكنك أن تصنع؟' : 'What Can You Create?'}
                </h2>
                <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#A3C042] to-[#8CA635]" />
                <p className="mx-auto mt-3 max-w-xl text-sm text-gray-600 md:text-base">
                    {isAr
                        ? 'مجالات إبداعية بلا حدود — اختر شغفك وابدأ رحلتك في الابتكار'
                        : 'Boundless fields of innovation — pick your passion and start creating'}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
                {ITEMS.map((item) => (
                    <div
                        key={item.key}
                        className="group relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-100"
                    >
                        <img
                            src={item.img}
                            alt={isAr ? item.ar : item.en}
                            onError={(event) => { event.target.src = FALLBACK_IMAGE; }}
                            loading="lazy"
                            className="h-44 w-full object-cover transition duration-500 group-hover:scale-105 md:h-52"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4">
                            <span className="inline-block rounded-full bg-[#A3C042] px-3 py-1.5 text-xs font-bold text-white shadow-md">
                                {isAr ? item.ar : item.en}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
