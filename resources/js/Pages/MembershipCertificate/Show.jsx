import { Head, router } from '@inertiajs/react';
import { FaDownload, FaCertificate, FaCheckCircle, FaTimesCircle, FaTrophy } from 'react-icons/fa';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import { useTranslation } from '@/i18n';
import { useToast } from '@/Contexts/ToastContext';
import { downloadFile } from '@/utils/downloadFile';
import { usePremiumGate } from '@/Hooks/usePremiumGate';

export default function MembershipCertificateShow({ auth, certificate, eligibility, user, membershipSummary = null }) {
    const { t, language } = useTranslation();
    const { showError } = useToast();
    const { gate, premiumModal } = usePremiumGate(membershipSummary, {
        featureName: t('common.certificates'),
        requiredAccessKey: 'certificate_access',
    });
    const isAuthed = !!auth?.user;
    const currentUser = auth?.user;

    const handleDownload = async () => {
        gate(async () => {
            if (!certificate?.download_url) {
                return;
            }

            try {
                await downloadFile(
                    certificate.download_url,
                    `certificate_${certificate.certificate_number || user?.membership_number || 'membership'}.pdf`
                );
            } catch (error) {
                showError(t('errors.somethingWentWrong'));
            }
        });
    };

    const handleCheckEligibility = async () => {
        try {
            const response = await fetch('/membership-certificates/check-eligibility', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });
            const data = await response.json();
            if (data.success) {
                router.reload();
            }
        } catch (error) {
        }
    };

    const getProgressWidth = (criterion) => {
        if (typeof criterion.required !== 'number') {
            return criterion.eligible ? 100 : 0;
        }

        return Math.min(100, (criterion.current / criterion.required) * 100);
    };

    const getEligibilityCriteria = () => {
        if (user?.role === 'student') {
            return [
                {
                    label: t('membershipCertificatePage.criteria.points'),
                    current: eligibility?.points || 0,
                    required: eligibility?.points_required || 50,
                    eligible: eligibility?.points_eligible || false,
                },
                {
                    label: t('membershipCertificatePage.criteria.approvedProjects'),
                    current: eligibility?.approved_projects || 0,
                    required: eligibility?.projects_required || 3,
                    eligible: eligibility?.projects_eligible || false,
                },
                {
                    label: t('membershipCertificatePage.criteria.completedChallenges'),
                    current: eligibility?.challenges_participated || 0,
                    required: eligibility?.challenges_required || 1,
                    eligible: eligibility?.challenges_eligible || false,
                },
                {
                    label: t('membershipCertificatePage.criteria.membershipDurationDays'),
                    current: eligibility?.account_age_days || 0,
                    required: eligibility?.account_age_required || 30,
                    eligible: eligibility?.account_age_eligible || false,
                },
            ];
        } else if (user?.role === 'teacher') {
            return [
                {
                    label: t('membershipCertificatePage.criteria.points'),
                    current: eligibility?.points || 0,
                    required: eligibility?.points_required || 100,
                    eligible: eligibility?.points_eligible || false,
                },
                {
                    label: t('membershipCertificatePage.criteria.approvedProjects'),
                    current: eligibility?.approved_projects || 0,
                    required: eligibility?.projects_required || 10,
                    eligible: eligibility?.projects_eligible || false,
                },
                {
                    label: t('membershipCertificatePage.criteria.rating'),
                    current: eligibility?.rating || 0,
                    required: eligibility?.rating_required || 4.0,
                    eligible: eligibility?.rating_eligible || false,
                },
                {
                    label: t('membershipCertificatePage.criteria.membershipDurationDays'),
                    current: eligibility?.account_age_days || 0,
                    required: eligibility?.account_age_required || 60,
                    eligible: eligibility?.account_age_eligible || false,
                },
            ];
        } else if (user?.role === 'school') {
            return [
                {
                    label: t('membershipCertificatePage.criteria.studentCount'),
                    current: eligibility?.students_count || 0,
                    required: eligibility?.students_required || 20,
                    eligible: eligibility?.students_eligible || false,
                },
                {
                    label: t('membershipCertificatePage.criteria.approvedProjects'),
                    current: eligibility?.approved_projects || 0,
                    required: eligibility?.projects_required || 50,
                    eligible: eligibility?.projects_eligible || false,
                },
                {
                    label: t('membershipCertificatePage.criteria.ranking'),
                    current: eligibility?.rank || 0,
                    required: t('membershipCertificatePage.criteria.topRankRequirement', {
                        count: Math.ceil((eligibility?.total_schools || 1) / 2),
                    }),
                    eligible: eligibility?.ranking_eligible || false,
                },
                {
                    label: t('membershipCertificatePage.criteria.membershipDurationDays'),
                    current: eligibility?.account_age_days || 0,
                    required: eligibility?.account_age_required || 90,
                    eligible: eligibility?.account_age_eligible || false,
                },
            ];
        }
        return [];
    };

    const criteria = getEligibilityCriteria();

    return (
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">
            <Head title={t('membershipCertificatePage.pageTitle', { appName: t('common.appName') })} />
            {premiumModal}

            <div className="block md:hidden">
                <MobileAppLayout
                    auth={auth}
                    title={t('membershipCertificatePage.title')}
                    activeNav="profile"
                    onBack={() => router.visit('/')}
                >
                    <div className="space-y-4">
                        {certificate ? (
                            <>
                                <div className="bg-gradient-to-br from-[#A3C042] to-[#8CA635] rounded-2xl p-6 text-white text-center shadow-lg">
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FaCertificate className="text-4xl" />
                                    </div>
                                    <h2 className="text-xl font-bold mb-2">{certificate.title}</h2>
                                    <p className="text-sm opacity-90 mb-4">{certificate.description}</p>
                                    <div className="text-xs opacity-75">
                                        {t('membershipCertificatePage.certificateNumberLabel')}: {certificate.certificate_number}
                                    </div>
                                    <div className="text-xs opacity-75 mt-1">
                                        {t('membershipCertificatePage.issueDateLabel')}: {certificate.issue_date_formatted}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="w-full flex items-center justify-center gap-2 bg-[#A3C042] text-white rounded-xl py-3 font-bold hover:bg-[#8CA635] transition shadow-lg"
                                >
                                    <FaDownload />
                                    {t('membershipCertificatePage.downloadCertificate')}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <div className="text-center mb-6">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${eligibility?.eligible ? 'bg-green-100' : 'bg-yellow-100'
                                            }`}>
                                            {eligibility?.eligible ? (
                                                <FaCheckCircle className="text-green-500 text-2xl" />
                                            ) : (
                                                <FaTimesCircle className="text-yellow-500 text-2xl" />
                                            )}
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-2">
                                            {eligibility?.eligible ? t('membershipCertificatePage.eligibleTitle') : t('membershipCertificatePage.notEligibleTitle')}
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {eligibility?.eligible
                                                ? t('membershipCertificatePage.eligibleDescription')
                                                : t('membershipCertificatePage.notEligibleDescription')}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        {criteria.map((criterion, index) => (
                                            <div key={index} className="bg-gray-50 rounded-xl p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold text-gray-900">{criterion.label}</span>
                                                    {criterion.eligible ? (
                                                        <FaCheckCircle className="text-green-500" />
                                                    ) : (
                                                        <FaTimesCircle className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <span>{criterion.current}</span>
                                                    <span>/</span>
                                                    <span>{criterion.required}</span>
                                                </div>
                                                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${criterion.eligible ? 'bg-green-500' : 'bg-yellow-500'
                                                            }`}
                                                        style={{
                                                            width: `${getProgressWidth(criterion)}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleCheckEligibility}
                                        className="w-full mt-6 flex items-center justify-center gap-2 bg-[#A3C042] text-white rounded-xl py-3 font-bold hover:bg-[#8CA635] transition"
                                    >
                                        <FaTrophy />
                                        {t('membershipCertificatePage.checkEligibility')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </MobileAppLayout>
            </div>

            <div className="hidden md:block">
                <MobileTopBar
                    title={t('membershipCertificatePage.title')}
                    onBack={() => router.visit('/')}
                    reverseOrder={false}
                    auth={auth}
                />
                <main className="mx-auto w-full max-w-4xl px-4 pb-24 pt-4">
                    <div className="space-y-6">
                        {certificate ? (
                            <>
                                <div className="bg-gradient-to-br from-[#A3C042] to-[#8CA635] rounded-2xl p-8 text-white text-center shadow-lg">
                                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FaCertificate className="text-5xl" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-3">{certificate.title}</h2>
                                    <p className="text-base opacity-90 mb-6">{certificate.description}</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="opacity-75 mb-1">{t('membershipCertificatePage.certificateNumberLabel')}</div>
                                            <div className="font-bold">{certificate.certificate_number}</div>
                                        </div>
                                        <div>
                                            <div className="opacity-75 mb-1">{t('membershipCertificatePage.issueDateLabel')}</div>
                                            <div className="font-bold">{certificate.issue_date_formatted}</div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleDownload}
                                    className="w-full flex items-center justify-center gap-2 bg-[#A3C042] text-white rounded-xl py-4 font-bold hover:bg-[#8CA635] transition shadow-lg text-lg"
                                >
                                    <FaDownload />
                                    {t('membershipCertificatePage.downloadCertificate')}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="bg-white rounded-2xl border border-gray-100 p-8">
                                    <div className="text-center mb-8">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${eligibility?.eligible ? 'bg-green-100' : 'bg-yellow-100'
                                            }`}>
                                            {eligibility?.eligible ? (
                                                <FaCheckCircle className="text-green-500 text-3xl" />
                                            ) : (
                                                <FaTimesCircle className="text-yellow-500 text-3xl" />
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                            {eligibility?.eligible ? t('membershipCertificatePage.eligibleTitle') : t('membershipCertificatePage.notEligibleTitle')}
                                        </h2>
                                        <p className="text-base text-gray-600">
                                            {eligibility?.eligible
                                                ? t('membershipCertificatePage.eligibleDescription')
                                                : t('membershipCertificatePage.notEligibleDescription')}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        {criteria.map((criterion, index) => (
                                            <div key={index} className="bg-gray-50 rounded-xl p-5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-base font-bold text-gray-900">{criterion.label}</span>
                                                    {criterion.eligible ? (
                                                        <FaCheckCircle className="text-green-500 text-lg" />
                                                    ) : (
                                                        <FaTimesCircle className="text-gray-400 text-lg" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                    <span className="font-bold">{criterion.current}</span>
                                                    <span>/</span>
                                                    <span>{criterion.required}</span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${criterion.eligible ? 'bg-green-500' : 'bg-yellow-500'
                                                            }`}
                                                        style={{
                                                            width: `${getProgressWidth(criterion)}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleCheckEligibility}
                                        className="w-full flex items-center justify-center gap-2 bg-[#A3C042] text-white rounded-xl py-4 font-bold hover:bg-[#8CA635] transition text-lg"
                                    >
                                        <FaTrophy />
                                        {t('membershipCertificatePage.checkEligibility')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </main>
                <MobileBottomNav active="profile" role={currentUser?.role} isAuthed={isAuthed} user={currentUser} />
                <DesktopFooter auth={auth} />
            </div>
        </div>
    );
}

