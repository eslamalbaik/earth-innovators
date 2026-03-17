import { Head, Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';
import { FaCheck, FaStar, FaRocket, FaCrown, FaBox } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function Packages({ auth, packages = [], userPackage = null }) {
    const { t } = useTranslation();
    const IconMap = {
        monthly: FaBox,
        quarterly: FaRocket,
        yearly: FaStar,
        lifetime: FaCrown
    };

    return (
        <MainLayout auth={auth}>
            <Head title={t('packagesIndexPage.pageTitle', { appName: t('common.appName') })} />

            <div className="bg-[#A3C042] py-16 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <FaBox className="mx-auto text-6xl mb-4 opacity-90" />
                        <h1 className="text-4xl font-bold mb-4">{t('packagesIndexPage.title')}</h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto">
                            {t('packagesIndexPage.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {auth?.user && userPackage && (
                    <div className="mb-8 bg-gradient-to-r from-[#A3C042]/10 to-legacy-blue/10 rounded-xl p-6 border-2 border-[#A3C042]/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('packagesIndexPage.currentPackage.title')}</h2>
                                <p className="text-gray-600">
                                    {userPackage.package?.name_ar || userPackage.package?.name} -
                                    {t('packagesIndexPage.currentPackage.endsAt')} {new Date(userPackage.end_date).toLocaleDateString('en-US')}
                                </p>
                            </div>
                            <div className={`px-4 py-2 rounded-lg font-semibold ${userPackage.status === 'active' ? 'bg-green-100 text-green-700' :
                                    userPackage.status === 'expired' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {userPackage.status === 'active'
                                    ? t('packagesPage.status.active')
                                    : userPackage.status === 'expired'
                                        ? t('packagesPage.status.expired')
                                        : t('packagesPage.status.cancelled')}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {packages.map((pkg) => {
                        const Icon = IconMap[pkg.duration_type] || FaBox;
                        const features = pkg.features_ar || pkg.features || [];
                        const isPopular = pkg.is_popular;

                        return (
                            <div
                                key={pkg.id}
                                className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all relative ${isPopular
                                        ? 'border-[#A3C042] shadow-[#A3C042]/20 transform scale-105'
                                        : 'border-gray-200 hover:border-[#A3C042]/50'
                                    }`}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 end-0 start-0 bg-[#A3C042] text-white text-center py-2 font-bold text-sm">
                                        {t('packagesIndexPage.badges.mostPopular')}
                                    </div>
                                )}
                                <div className={`p-8 ${isPopular ? 'pt-12' : ''}`}>
                                    <div className="text-center mb-6">
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isPopular ? 'bg-gradient-to-br from-[#A3C042] to-legacy-blue' : 'bg-gray-100'
                                            }`}>
                                            <Icon className={`text-3xl ${isPopular ? 'text-white' : 'text-gray-600'}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {pkg.name_ar || pkg.name}
                                        </h3>
                                        <div className="mb-4">
                                            <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                                            <span className="text-gray-600"> {pkg.currency}</span>
                                            {pkg.duration_type !== 'lifetime' && (
                                                <span className="text-gray-500 text-sm"> / {t(`packagesPage.duration.${pkg.duration_type}`)}</span>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm">
                                            {pkg.description_ar || pkg.description}
                                        </p>
                                    </div>

                                    <div className="border-t border-gray-200 pt-6 mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-4">{t('packagesIndexPage.features.title')}:</h4>
                                        <ul className="space-y-3">
                                            {pkg.projects_limit !== null ? (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.projectsLimit', { count: pkg.projects_limit })}</span>
                                                </li>
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.unlimitedProjects')}</span>
                                                </li>
                                            )}
                                            {pkg.challenges_limit !== null ? (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.challengesLimit', { count: pkg.challenges_limit })}</span>
                                                </li>
                                            ) : (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.unlimitedChallenges')}</span>
                                                </li>
                                            )}
                                            {pkg.points_bonus > 0 && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.pointsBonus', { count: pkg.points_bonus })}</span>
                                                </li>
                                            )}
                                            {pkg.badge_access && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.badgesAccess')}</span>
                                                </li>
                                            )}
                                            {pkg.certificate_access && (
                                                <li className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700">{t('packagesIndexPage.features.certificatesAccess')}</span>
                                                </li>
                                            )}
                                            {features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2">
                                                    <FaCheck className="text-[#A3C042] flex-shrink-0" />
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {auth?.user ? (
                                        <Link
                                            href={`/packages/${pkg.id}/subscribe`}
                                            className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition ${isPopular
                                                    ? 'bg-[#A3C042] text-white hover:shadow-lg'
                                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                }`}
                                        >
                                            {userPackage?.package_id === pkg.id ? t('packagesIndexPage.actions.renew') : t('packagesIndexPage.actions.subscribeNow')}
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/register"
                                            className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition ${isPopular
                                                    ? 'bg-[#A3C042] text-white hover:shadow-lg'
                                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                }`}
                                        >
                                            {t('packagesIndexPage.actions.registerToSubscribe')}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {packages.length === 0 && (
                    <div className="text-center py-12">
                        <FaBox className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">{t('packagesIndexPage.empty')}</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

