import { useState } from 'react';
import { Link } from '@inertiajs/react';
import SectionTitle from '../SectionTitle';
import { FaCheck, FaBox, FaRocket, FaStar, FaCrown, FaUser, FaChalkboardTeacher, FaSchool } from 'react-icons/fa';
import CustomizePackageModal from '../Modals/CustomizePackageModal';

export default function PackagesSection({ packages = [] }) {
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);

    const IconMap = {
        monthly: FaBox,
        quarterly: FaRocket,
        yearly: FaStar,
        lifetime: FaCrown
    };

    const RoleIconMap = {
        'باقة الطالب': FaUser,
        'باقة المدرس': FaChalkboardTeacher,
        'باقة المدرسة': FaSchool,
    };

    // Filter to show only the 3 main packages (Student, Teacher, School)
    const mainPackages = packages.filter(pkg => 
        ['باقة الطالب', 'باقة المدرس', 'باقة المدرسة'].includes(pkg.name_ar)
    );

    return (
        <section className="py-16 bg-gradient-to-r from-[#A3C042]/5 to-legacy-blue/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <SectionTitle
                        text="باقات الاشتراك"
                        size="2xl"
                        align="center"
                        className="pb-2"
                    />
                    <p className="text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed mt-4">
                        اختر الباقة المناسبة لك واحصل على ميزات حصرية وإمكانيات متقدمة
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {mainPackages.map((pkg) => {
                        const Icon = RoleIconMap[pkg.name_ar] || IconMap[pkg.duration_type] || FaBox;
                        const features = pkg.features_ar || pkg.features || [];
                        const isPopular = pkg.is_popular;
                        const isFree = pkg.price === 0;

                        return (
                            <div
                                key={pkg.id}
                                className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all relative ${
                                    isPopular
                                        ? 'border-[#A3C042] shadow-[#A3C042]/20 transform scale-105'
                                        : 'border-gray-200 hover:border-[#A3C042]/50'
                                }`}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#A3C042] to-legacy-blue text-white text-center py-2 font-bold text-sm">
                                        ⭐ الأكثر شعبية
                                    </div>
                                )}
                                {isFree && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg font-bold text-xs">
                                        مجاني
                                    </div>
                                )}
                                <div className={`p-8 ${isPopular ? 'pt-12' : ''}`}>
                                    <div className="text-center mb-6">
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                                            isPopular ? 'bg-gradient-to-br from-[#A3C042] to-legacy-blue' : 'bg-gray-100'
                                        }`}>
                                            <Icon className={`text-3xl ${isPopular ? 'text-white' : 'text-gray-600'}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {pkg.name_ar || pkg.name}
                                        </h3>
                                        <div className="mb-4">
                                            {isFree ? (
                                                <span className="text-4xl font-bold text-[#A3C042]">مجاني</span>
                                            ) : (
                                                <>
                                                    <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                                                    <span className="text-gray-600"> {pkg.currency}</span>
                                                    {pkg.duration_type !== 'lifetime' && (
                                                        <span className="text-gray-500 text-sm"> / {pkg.duration_type === 'monthly' ? 'شهر' : pkg.duration_type === 'quarterly' ? 'ربع سنوي' : 'سنة'}</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            {pkg.description_ar || pkg.description}
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6 mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-4">الميزات:</h4>
                                        <ul className="space-y-3">
                                            {pkg.projects_limit !== null ? (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">حتى {pkg.projects_limit} مشروع</span>
                                                </li>
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">مشاريع غير محدودة</span>
                                                </li>
                                            )}
                                            {pkg.challenges_limit !== null ? (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">حتى {pkg.challenges_limit} تحدٍ</span>
                                                </li>
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">تحديات غير محدودة</span>
                                                </li>
                                            )}
                                            {pkg.points_bonus > 0 && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">{pkg.points_bonus} نقطة إضافية</span>
                                                </li>
                                            )}
                                            {pkg.badge_access && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">إمكانية الحصول على شارات</span>
                                                </li>
                                            )}
                                            {pkg.certificate_access && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">إمكانية الحصول على شهادات</span>
                                                </li>
                                            )}
                                            {features.slice(0, 3).map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700 text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Link
                                        href="/packages"
                                        className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition ${
                                            isPopular
                                                ? 'bg-gradient-to-r from-[#A3C042] to-legacy-blue text-white hover:shadow-lg'
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        }`}
                                    >
                                        {isFree ? 'احصل عليها الآن' : 'اشترك الآن'}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Customize Package Button */}
                <div className="text-center">
                    <button
                        onClick={() => setShowCustomizeModal(true)}
                        className="bg-gradient-to-r from-[#A3C042] to-legacy-blue hover:from-primary-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition duration-300 transform hover:scale-105 shadow-lg"
                    >
                        تخصيص باقة
                    </button>
                    <p className="text-gray-600 mt-4 text-sm">
                        هل تحتاج إلى باقة مخصصة؟ تواصل معنا لإنشاء باقة تناسب احتياجاتك
                    </p>
                </div>

                {showCustomizeModal && (
                    <CustomizePackageModal
                        onClose={() => setShowCustomizeModal(false)}
                    />
                )}
            </div>
        </section>
    );
}

