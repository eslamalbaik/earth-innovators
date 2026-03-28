import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { FaCheck, FaBox, FaRocket, FaStar, FaCrown, FaUser, FaChalkboardTeacher, FaSchool } from 'react-icons/fa';
import SectionTitle from '../SectionTitle';
import CustomizePackageModal from '../Modals/CustomizePackageModal';
import { useTranslation } from '@/i18n';

const normalizeText = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const resolvePackageAudience = (pkg) => {
    const values = [pkg?.name_ar, pkg?.name].map(normalizeText).filter(Boolean);

    if (values.some((value) => value.includes('student') || value.includes('\u0627\u0644\u0637\u0627\u0644\u0628'))) {
        return 'student';
    }

    if (values.some((value) => value.includes('teacher') || value.includes('\u0627\u0644\u0645\u062f\u0631\u0633'))) {
        return 'teacher';
    }

    if (values.some((value) => value.includes('school') || value.includes('\u0627\u0644\u0645\u062f\u0631\u0633\u0629'))) {
        return 'school';
    }

    return null;
};

const getLocalizedValue = (pkg, language, arabicField, englishField) => {
    if (language === 'ar') {
        return pkg?.[arabicField] || pkg?.[englishField] || '';
    }

    return pkg?.[englishField] || pkg?.[arabicField] || '';
};

export default function PackagesSection({ packages = [] }) {
    const { t, language } = useTranslation();
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);

    const iconMap = {
        monthly: FaBox,
        quarterly: FaRocket,
        yearly: FaStar,
        lifetime: FaCrown,
    };

    const roleIconMap = {
        student: FaUser,
        teacher: FaChalkboardTeacher,
        school: FaSchool,
    };

    const mainPackages = packages.filter((pkg) => ['student', 'teacher', 'school'].includes(resolvePackageAudience(pkg)));

    return (
        <section className="bg-gradient-to-r from-[#A3C042]/5 to-legacy-blue/5 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center">
                    <SectionTitle
                        text={t('packagesSection.title')}
                        size="2xl"
                        align="center"
                        className="pb-2"
                    />
                    <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-800">
                        {t('packagesSection.subtitle')}
                    </p>
                </div>

                <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                    {mainPackages.map((pkg) => {
                        const audience = resolvePackageAudience(pkg);
                        const Icon = roleIconMap[audience] || iconMap[pkg.duration_type] || FaBox;
                        const features = language === 'ar'
                            ? (pkg.features_ar || pkg.features || [])
                            : (pkg.features || pkg.features_ar || []);
                        const isPopular = pkg.is_popular;
                        const isFree = Number(pkg.price) === 0;
                        const packageName = getLocalizedValue(pkg, language, 'name_ar', 'name');
                        const packageDescription = getLocalizedValue(pkg, language, 'description_ar', 'description');

                        return (
                            <div
                                key={pkg.id}
                                className={`relative overflow-hidden rounded-xl border-2 bg-white shadow-lg transition-all ${
                                    isPopular
                                        ? 'scale-105 border-[#A3C042] shadow-[#A3C042]/20'
                                        : 'border-gray-200 hover:border-[#A3C042]/50'
                                }`}
                            >
                                {isPopular && (
                                    <div className="absolute inset-x-0 top-0 bg-[#A3C042] py-2 text-center text-sm font-bold text-white">
                                        {t('packagesIndexPage.badges.mostPopular')}
                                    </div>
                                )}
                                {isFree && (
                                    <div className="absolute start-0 top-0 rounded-bl-lg bg-green-500 px-3 py-1 text-xs font-bold text-white">
                                        {t('packagesSection.freeBadge')}
                                    </div>
                                )}
                                <div className={`p-8 ${isPopular ? 'pt-12' : ''}`}>
                                    <div className="mb-6 text-center">
                                        <div className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full ${
                                            isPopular ? 'bg-gradient-to-br from-[#A3C042] to-legacy-blue' : 'bg-gray-100'
                                        }`}>
                                            <Icon className={`text-3xl ${isPopular ? 'text-white' : 'text-gray-600'}`} />
                                        </div>
                                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                                            {packageName}
                                        </h3>
                                        <div className="mb-4">
                                            {isFree ? (
                                                <span className="text-4xl font-bold text-[#A3C042]">{t('packagesSection.freeBadge')}</span>
                                            ) : (
                                                <>
                                                    <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                                                    <span className="text-gray-600"> {pkg.currency}</span>
                                                    {pkg.duration_type !== 'lifetime' && (
                                                        <span className="text-sm text-gray-500"> / {t(`packagesPage.duration.${pkg.duration_type}`)}</span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {packageDescription}
                                        </p>
                                    </div>

                                    <div className="mb-6 border-t border-gray-200 pt-6">
                                        <h4 className="mb-4 font-semibold text-gray-900">{t('packagesIndexPage.features.title')}:</h4>
                                        <ul className="space-y-3">
                                            {pkg.projects_limit !== null ? (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="flex-shrink-0 text-[#A3C042]" />
                                                    <span className="text-sm text-gray-700">{t('packagesIndexPage.features.projectsLimit', { count: pkg.projects_limit })}</span>
                                                </li>
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="flex-shrink-0 text-[#A3C042]" />
                                                    <span className="text-sm text-gray-700">{t('packagesIndexPage.features.unlimitedProjects')}</span>
                                                </li>
                                            )}
                                            {pkg.challenges_limit !== null ? (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="flex-shrink-0 text-[#A3C042]" />
                                                    <span className="text-sm text-gray-700">{t('packagesIndexPage.features.challengesLimit', { count: pkg.challenges_limit })}</span>
                                                </li>
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="flex-shrink-0 text-[#A3C042]" />
                                                    <span className="text-sm text-gray-700">{t('packagesIndexPage.features.unlimitedChallenges')}</span>
                                                </li>
                                            )}
                                            {pkg.points_bonus > 0 && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="flex-shrink-0 text-[#A3C042]" />
                                                    <span className="text-sm text-gray-700">{t('packagesIndexPage.features.pointsBonus', { count: pkg.points_bonus })}</span>
                                                </li>
                                            )}
                                            {pkg.badge_access && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="flex-shrink-0 text-[#A3C042]" />
                                                    <span className="text-sm text-gray-700">{t('packagesIndexPage.features.badgesAccess')}</span>
                                                </li>
                                            )}
                                            {pkg.certificate_access && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="flex-shrink-0 text-[#A3C042]" />
                                                    <span className="text-sm text-gray-700">{t('packagesIndexPage.features.certificatesAccess')}</span>
                                                </li>
                                            )}
                                            {features.slice(0, 3).map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <FaCheck className="flex-shrink-0 text-[#A3C042]" />
                                                    <span className="text-sm text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <Link
                                        href="/packages"
                                        className={`block w-full rounded-lg px-6 py-3 text-center font-semibold transition ${
                                            isPopular
                                                ? 'bg-[#A3C042] text-white hover:shadow-lg'
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        }`}
                                    >
                                        {isFree ? t('packagesSection.actions.getNow') : t('packagesIndexPage.actions.subscribeNow')}
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center">
                    <button
                        onClick={() => setShowCustomizeModal(true)}
                        className="rounded-xl bg-[#A3C042] px-8 py-4 text-lg font-bold text-white shadow-lg transition duration-300 hover:scale-105 hover:from-primary-600 hover:to-blue-700"
                    >
                        {t('packagesSection.customizeButton')}
                    </button>
                    <p className="mt-4 text-sm text-gray-600">
                        {t('packagesSection.customizeHelp')}
                    </p>
                </div>

                {showCustomizeModal && (
                    <CustomizePackageModal onClose={() => setShowCustomizeModal(false)} />
                )}
            </div>
        </section>
    );
}
