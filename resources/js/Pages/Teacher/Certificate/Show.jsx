import { Head, Link, router } from '@inertiajs/react';
import { FaDownload, FaPrint, FaShare, FaCertificate, FaMedal } from 'react-icons/fa';
import { useRef } from 'react';
import { usePremiumGate } from '@/Hooks/usePremiumGate';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import { useTranslation } from '@/i18n';
import { useToast } from '@/Contexts/ToastContext';
import { downloadElementAsImage } from '@/utils/downloadElementAsImage';

export default function TeacherCertificateShow({ auth, user, stats, certificate, membershipSummary = null, school = null, latestApprovedCertificates = [] }) {
    const { t, language } = useTranslation();
    const { showError } = useToast();
    const { gate, premiumModal } = usePremiumGate(membershipSummary, {
        featureName: t('common.certificates'),
        requiredAccessKey: 'certificate_access',
    });
    const isAuthed = !!auth?.user;
    const currentUser = auth?.user;
    const certificateRef = useRef(null);

    const handleDownload = async () => {
        gate(async () => {
            try {
                await downloadElementAsImage(
                    certificateRef.current,
                    `certificate_${certificate?.certificate_number || user?.membership_number || 'teacher'}.png`
                );
            } catch (error) {
                showError(t('errors.somethingWentWrong'));
            }
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: t('teacherCertificateShowPage.share.title', { appName: t('common.appName') }),
                    text: t('teacherCertificateShowPage.share.text', { name: user?.name || t('common.user'), appName: t('common.appName') }),
                    url: window.location.href,
                });
            } catch (error) {
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert(t('teacherCertificateShowPage.toasts.linkCopied'));
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <>
            <Head title={t('teacherCertificateShowPage.pageTitle', { appName: t('common.appName') })}>
                <style>{`
                    @media print {
                        @page {
                            margin: 0;
                            size: A4 landscape;
                        }
                        body * {
                            visibility: hidden;
                        }
                        .certificate-print, .certificate-print * {
                            visibility: visible;
                        }
                        .certificate-print {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            background: white;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}</style>
            </Head>
            {premiumModal}
            <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen bg-gray-50">

                {/* Mobile View */}
                <div className="block md:hidden">
                    <MobileAppLayout
                        auth={auth}
                        title={t('teacherCertificateShowPage.navTitle')}
                        activeNav="profile"
                        onBack={() => router.visit('/')}
                    >
                        <div className="space-y-4">
                            {/* Teacher Information Section */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 no-print">
                                <h2 className="text-base font-bold text-gray-900 mb-4">{t('teacherCertificateShowPage.teacherInfo.title')}</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">{t('teacherCertificateShowPage.teacherInfo.name')}</label>
                                        <div className="text-sm font-bold text-gray-900">{user?.name || t('common.notAvailable')}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">{t('teacherCertificateShowPage.teacherInfo.membershipNumber')}:</label>
                                        <div className="text-sm font-bold text-gray-900">{user?.membership_number || t('common.notAvailable')}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">{t('teacherCertificateShowPage.teacherInfo.school')}</label>
                                        <div className="text-sm font-bold text-gray-900">{school?.name || t('common.notAvailable')}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">{t('teacherCertificateShowPage.teacherInfo.certificateAccess')}</label>
                                        <div className="text-sm font-bold text-gray-900">
                                            {membershipSummary?.certificate_access
                                                ? t('teacherCertificatesIndexPage.certificateAccess.available')
                                                : t('teacherCertificatesIndexPage.certificateAccess.unavailable')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Certificate Section */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                                <h2 className="text-base font-bold text-gray-900 mb-4">{t('teacherCertificateShowPage.certificate.title')}</h2>

                                {/* Certificate Display */}
                                <div ref={certificateRef} className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 relative">
                                    <div className="bg-white rounded-xl p-4">
                                        {/* Certificate Header with Logo */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex-1"></div>
                                            <h1 className="text-lg font-extrabold text-orange-600 text-center flex-2">
                                                {t('teacherCertificateShowPage.certificate.heading')}
                                            </h1>
                                            <div className="flex-1 flex justify-end">
                                                <img
                                                    src="/images/logo-modified.png"
                                                    alt={t('common.appName')}
                                                    className="w-16 h-16 object-contain"
                                                />
                                            </div>
                                        </div>
                                        <div className="h-0.5 bg-[#A3C042] mb-4"></div>

                                        {/* Certificate Body */}
                                        <div className="space-y-3 text-sm text-gray-800 leading-relaxed">
                                            <p className="text-center text-xs text-gray-600">
                                                {t('teacherCertificateShowPage.certificate.platformCertifies', { appName: t('common.appName') })}
                                            </p>

                                            <p className="text-center">
                                                <span className="font-bold text-[#A3C042] text-base">{t('teacherCertificateShowPage.certificate.nameLine', { name: user?.name || t('teacherCertificateShowPage.certificate.teacherFallback') })}</span>
                                            </p>

                                            <div className="border-b-2 border-dotted border-gray-300 my-2"></div>

                                            <p className="text-center text-xs text-gray-600 mb-3">
                                                {t('teacherCertificateShowPage.teacherInfo.membershipNumber')}: <span className="font-bold">{user?.membership_number || t('common.notAvailable')}</span>
                                            </p>

                                            <p className="text-justify leading-relaxed text-xs mb-2">
                                                {t('teacherCertificateShowPage.certificate.committeeLinePrefix')}{' '}
                                                <span className="font-bold text-[#A3C042]">{t('teacherCertificateShowPage.certificate.programName')}</span>
                                            </p>

                                            {certificate?.period_start && certificate?.period_end && (
                                                <p className="text-center text-xs text-gray-600 mb-2">
                                                    {t('teacherCertificateShowPage.certificate.periodLine', { start: formatDate(certificate.period_start), end: formatDate(certificate.period_end) })}
                                                </p>
                                            )}

                                            <p className="text-justify leading-relaxed text-xs mb-3">
                                                {t('teacherCertificateShowPage.certificate.excellenceParagraph')}
                                            </p>

                                            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 my-4 shadow-sm">
                                                <p className="text-center text-xs text-yellow-800 leading-relaxed font-medium">
                                                    {t('teacherCertificateShowPage.certificate.motto')}
                                                </p>
                                            </div>

                                        </div>

                                        {/* Certificate Footer */}
                                        <div className="mt-6 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div className="text-center flex-1">
                                                    <div className="text-[10px] text-gray-500 mb-1">{t('teacherCertificateShowPage.certificate.ceoTitle')}</div>
                                                    <div className="text-xs font-bold text-gray-700">{t('teacherCertificateShowPage.certificate.ceoName')}</div>
                                                    <div className="text-[10px] text-gray-500 mt-1">{t('teacherCertificateShowPage.certificate.ceoOrg')}</div>
                                                </div>
                                                <div className="w-10 h-10 border-2 border-green-500 rounded-full flex items-center justify-center mx-3">
                                                    <FaMedal className="text-green-500 text-sm" />
                                                </div>
                                                <div className="text-center flex-1">
                                                    <div className="text-[10px] text-gray-500 mb-1">{t('teacherCertificateShowPage.certificate.issueDate')}:</div>
                                                    <div className="text-xs font-bold text-gray-700">
                                                        {formatDate(certificate?.issue_date) || formatDate(new Date())}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="no-print mt-4 grid grid-cols-3 gap-3">
                                    <button
                                        onClick={handleShare}
                                        className="flex flex-col items-center justify-center gap-2 bg-purple-50 text-purple-600 rounded-xl py-3 hover:bg-purple-100 transition"
                                    >
                                        <FaShare className="text-lg" />
                                        <span className="text-xs font-bold">{t('teacherCertificateShowPage.actions.share')}</span>
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="flex flex-col items-center justify-center gap-2 bg-[#A3C042] text-white rounded-xl py-3 hover:bg-[#8CA635] transition"
                                    >
                                        <FaPrint className="text-lg" />
                                        <span className="text-xs font-bold">{t('teacherCertificateShowPage.actions.print')}</span>
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-xl py-3 hover:bg-blue-100 transition"
                                    >
                                        <FaDownload className="text-lg" />
                                        <span className="text-xs font-bold">{t('teacherCertificateShowPage.actions.download')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </MobileAppLayout>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                    <div className="no-print">
                        <MobileTopBar
                            title={t('teacherCertificateShowPage.navTitle')}
                            onBack={() => router.visit('/')}
                            reverseOrder={false}
                            auth={auth}
                        />
                    </div>
                    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Teacher Information Section */}
                            <div className="lg:col-span-1 no-print">
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-4">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">{t('teacherCertificateShowPage.teacherInfo.title')}</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-gray-600 mb-2 block">{t('teacherCertificateShowPage.teacherInfo.name')}</label>
                                            <div className="text-base font-bold text-gray-900">{user?.name || t('common.notAvailable')}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600 mb-2 block">{t('teacherCertificateShowPage.teacherInfo.membershipNumber')}:</label>
                                            <div className="text-base font-bold text-gray-900">{user?.membership_number || t('common.notAvailable')}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600 mb-2 block">{t('teacherCertificateShowPage.teacherInfo.school')}</label>
                                            <div className="text-base font-bold text-gray-900">{school?.name || t('common.notAvailable')}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600 mb-2 block">{t('teacherCertificateShowPage.teacherInfo.membershipType')}</label>
                                            <div className="text-base font-bold text-gray-900">
                                                {membershipSummary?.membership_type === 'subscription'
                                                    ? t('teacherCertificatesIndexPage.membershipStatus.subscription')
                                                    : t('teacherCertificatesIndexPage.membershipStatus.basic')}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600 mb-2 block">{t('teacherCertificateShowPage.teacherInfo.certificateAccess')}</label>
                                            <div className="text-base font-bold text-gray-900">
                                                {membershipSummary?.certificate_access
                                                    ? t('teacherCertificatesIndexPage.certificateAccess.available')
                                                    : t('teacherCertificatesIndexPage.certificateAccess.unavailable')}
                                            </div>
                                        </div>
                                        {membershipSummary?.subscription?.package_name && (
                                            <div>
                                                <label className="text-sm text-gray-600 mb-2 block">{t('teacherCertificateShowPage.teacherInfo.currentPackage')}</label>
                                                <div className="text-base font-bold text-gray-900">{membershipSummary.subscription.package_name}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Certificate Section */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 no-print">{t('teacherCertificateShowPage.certificate.title')}</h2>

                                    {/* Certificate Display */}
                                    <div ref={certificateRef} className="certificate-print bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 relative">
                                        <div className="bg-white rounded-xl p-8">
                                            {/* Certificate Header with Logo */}
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex-1"></div>
                                                <h1 className="text-2xl font-extrabold text-orange-600 text-center flex-2">
                                                    {t('teacherCertificateShowPage.certificate.heading')}
                                                </h1>
                                                <div className="flex-1 flex justify-end">
                                                    <img
                                                        src="/images/logo-modified.png"
                                                        alt={t('common.appName')}
                                                        className="w-24 h-24 object-contain"
                                                    />
                                                </div>
                                            </div>
                                            <div className="h-1 bg-[#A3C042] mb-6"></div>

                                            {/* Certificate Body */}
                                            <div className="space-y-4 text-base text-gray-800 leading-relaxed">
                                                <p className="text-center text-sm text-gray-600">
                                                    {t('teacherCertificateShowPage.certificate.platformCertifies', { appName: t('common.appName') })}
                                                </p>

                                                <p className="text-center">
                                                    <span className="font-bold text-[#A3C042] text-2xl">{t('teacherCertificateShowPage.certificate.nameLine', { name: user?.name || t('teacherCertificateShowPage.certificate.teacherFallback') })}</span>
                                                </p>

                                                <div className="border-b-2 border-dotted border-gray-300 my-4"></div>

                                                <p className="text-center text-sm text-gray-600 mb-4">
                                                    {t('teacherCertificateShowPage.teacherInfo.membershipNumber')}: <span className="font-bold">{user?.membership_number || t('common.notAvailable')}</span>
                                                </p>

                                                <p className="text-justify leading-relaxed text-base mb-4">
                                                    {t('teacherCertificateShowPage.certificate.committeeLinePrefix')}{' '}
                                                    <span className="font-bold text-[#A3C042]">{t('teacherCertificateShowPage.certificate.programName')}</span>
                                                </p>

                                                {certificate?.period_start && certificate?.period_end && (
                                                    <p className="text-center text-sm text-gray-600 mb-4">
                                                        {t('teacherCertificateShowPage.certificate.periodLine', { start: formatDate(certificate.period_start), end: formatDate(certificate.period_end) })}
                                                    </p>
                                                )}

                                                <p className="text-justify leading-relaxed text-base mb-4">
                                                    {t('teacherCertificateShowPage.certificate.excellenceParagraph')}
                                                </p>

                                                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 my-6 shadow-sm">
                                                    <p className="text-center text-sm text-yellow-800 leading-relaxed font-medium">
                                                        {t('teacherCertificateShowPage.certificate.motto')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Certificate Footer */}
                                            <div className="mt-8 pt-6 border-t border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-center flex-1">
                                                        <div className="text-sm text-gray-500 mb-2">{t('teacherCertificateShowPage.certificate.ceoTitle')}</div>
                                                        <div className="text-base font-bold text-gray-700">{t('teacherCertificateShowPage.certificate.ceoName')}</div>
                                                        <div className="text-xs text-gray-500 mt-2">{t('teacherCertificateShowPage.certificate.ceoOrg')}</div>
                                                    </div>
                                                    <div className="w-16 h-16 border-2 border-green-500 rounded-full flex items-center justify-center mx-6">
                                                        <FaMedal className="text-green-500 text-xl" />
                                                    </div>
                                                    <div className="text-center flex-1">
                                                        <div className="text-sm text-gray-500 mb-2">{t('teacherCertificateShowPage.certificate.issueDate')}:</div>
                                                        <div className="text-base font-bold text-gray-700">
                                                            {formatDate(certificate?.issue_date) || formatDate(new Date())}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="no-print mt-6 grid grid-cols-3 gap-4">
                                        <button
                                            onClick={handleShare}
                                            className="flex flex-col items-center justify-center gap-2 bg-purple-50 text-purple-600 rounded-xl py-4 hover:bg-purple-100 transition"
                                        >
                                            <FaShare className="text-xl" />
                                            <span className="text-sm font-bold">{t('teacherCertificateShowPage.actions.share')}</span>
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="flex flex-col items-center justify-center gap-2 bg-[#A3C042] text-white rounded-xl py-4 hover:bg-[#8CA635] transition"
                                        >
                                            <FaPrint className="text-xl" />
                                            <span className="text-sm font-bold">{t('teacherCertificateShowPage.actions.print')}</span>
                                        </button>
                                        <button
                                            onClick={handleDownload}
                                            className="flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-xl py-4 hover:bg-blue-100 transition"
                                        >
                                            <FaDownload className="text-xl" />
                                            <span className="text-sm font-bold">{t('teacherCertificateShowPage.actions.download')}</span>
                                        </button>
                                    </div>

                                    {latestApprovedCertificates.length > 0 && (
                                        <div className="no-print mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                            <h3 className="mb-3 text-lg font-bold text-gray-900">{t('teacherCertificateShowPage.latestApprovedTitle')}</h3>
                                            <div className="space-y-2">
                                                {latestApprovedCertificates.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
                                                        <div>
                                                            <div className="font-bold text-gray-900">{item.title}</div>
                                                            <div className="text-xs text-gray-500">{item.approved_at}</div>
                                                        </div>
                                                        {item.download_url && (
                                                            <button
                                                                type="button"
                                                                onClick={() => gate(() => downloadFile(item.download_url, `certificate_${item.id}.pdf`))}
                                                                className="text-sm font-bold text-blue-600 hover:text-blue-700"
                                                            >
                                                                {t('common.download')}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>
                    <div className="no-print">
                        <MobileBottomNav active="profile" role={currentUser?.role} isAuthed={isAuthed} user={currentUser} />
                        <DesktopFooter auth={auth} />
                    </div>
                </div>
            </div>
        </>
    );
}
