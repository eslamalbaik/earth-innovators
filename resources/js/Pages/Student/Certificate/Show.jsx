import { Head, Link, router } from '@inertiajs/react';
import { FaDownload, FaPrint, FaShare, FaCalendarAlt, FaProjectDiagram, FaMedal, FaLock } from 'react-icons/fa';
import { useRef } from 'react';
import { usePremiumGate } from '@/Hooks/usePremiumGate';
import MobileAppLayout from '@/Layouts/MobileAppLayout';
import MobileTopBar from '@/Components/Mobile/MobileTopBar';
import MobileBottomNav from '@/Components/Mobile/MobileBottomNav';
import DesktopFooter from '@/Components/Mobile/DesktopFooter';
import { useTranslation } from '@/i18n';
import { useToast } from '@/Contexts/ToastContext';
import { downloadElementAsImage, downloadElementAsPdf, printElementAsImage, shareElementAsImage } from '@/utils/downloadElementAsImage';
import CertificateCard from '@/Components/Certificate/CertificateCard';

export default function StudentCertificateShow({ auth, user, stats, certificate, membershipSummary = null }) {
    const { t, language } = useTranslation();
    const { showError } = useToast();
    const { gate, canAccess, premiumModal } = usePremiumGate(membershipSummary, {
        featureName: t('common.certificates'),
        requiredAccessKey: 'certificate_access',
    });
    const isAuthed = !!auth?.user;
    const currentUser = auth?.user;
    const certificateRef = useRef(null);

    const handleDownload = async () => {
        gate(async () => {
            try {
                await downloadElementAsPdf(
                    certificateRef.current,
                    `certificate_${certificate?.certificate_number || user?.membership_number || 'student'}.pdf`
                );
            } catch (error) {
                showError(t('errors.somethingWentWrong'));
            }
        });
    };

    const handlePrint = async () => {
        gate(async () => {
            try {
                await printElementAsImage(
                    certificateRef.current,
                    `certificate_${certificate?.certificate_number || user?.membership_number || 'student'}`
                );
            } catch (error) {
                showError(t('errors.somethingWentWrong'));
            }
        });
    };

    const handleShare = async () => {
        gate(async () => {
            try {
                await shareElementAsImage(certificateRef.current, {
                    filename: `certificate_${certificate?.certificate_number || user?.membership_number || 'student'}.png`,
                    title: t('studentCertificateShowPage.share.title', { appName: t('common.appName') }),
                    text: t('studentCertificateShowPage.share.text', { name: user?.name || t('common.user'), appName: t('common.appName') }),
                });
            } catch (error) {
                try {
                    await downloadElementAsImage(
                        certificateRef.current,
                        `certificate_${certificate?.certificate_number || user?.membership_number || 'student'}.png`
                    );
                } catch {
                    showError(t('errors.somethingWentWrong'));
                }
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    const formatDateForCertificate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).replace(/\//g, '-');
        } catch {
            return dateString;
        }
    };

    return (
        <>
            <Head title={t('studentCertificateShowPage.pageTitle', { appName: t('common.appName') })}>
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
                        title={t('studentCertificateShowPage.navTitle')}
                        activeNav="profile"
                        onBack={() => router.visit('/')}
                    >
                        <div className="space-y-4">
                            {/* Student Information Section */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-4 no-print">
                                <h2 className="text-base font-bold text-gray-900 mb-4">{t('studentCertificateShowPage.studentInfo.title')}</h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">{t('studentCertificateShowPage.studentInfo.name')}</label>
                                        <div className="text-sm font-bold text-gray-900">{user?.name || t('common.notAvailable')}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">{t('studentCertificateShowPage.studentInfo.membershipNumber')}:</label>
                                        <div className="text-sm font-bold text-gray-900">{user?.membership_number || t('common.notAvailable')}</div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">{t('studentCertificateShowPage.studentInfo.joinDate')}:</label>
                                        <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                            <FaCalendarAlt className="text-gray-400" />
                                            {formatDate(stats?.join_date)}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">{t('studentCertificateShowPage.studentInfo.projectsCount')}:</label>
                                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <FaProjectDiagram className="text-[#A3C042]" />
                                                {stats?.projects_count || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">{t('studentCertificateShowPage.studentInfo.badgesCount')}:</label>
                                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <FaMedal className="text-purple-500" />
                                                {stats?.badges_count || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Certificate Section */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-4">
                                <h2 className="text-base font-bold text-gray-900 mb-4 no-print">{t('studentCertificateShowPage.certificate.title')}</h2>

                                {/* Certificate Display */}
                                <CertificateCard 
                                    ref={certificateRef}
                                    user={user}
                                    role="student"
                                    barcode={certificate?.barcode}
                                    issueDate={certificate?.issue_date_formatted || new Date().toLocaleDateString('en-GB')}
                                />
                                {/* Premium gate notice */}
                                {!canAccess && (
                                    <div className="no-print mt-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
                                        <FaLock className="text-amber-500 text-sm shrink-0" />
                                        <span className="text-xs text-amber-700 font-medium">{t('premiumGate.featureRequiresPremium')}</span>
                                        <button onClick={() => router.visit('/packages')} className="ms-auto text-xs font-bold text-[#A3C042] hover:underline">{t('premiumGate.upgrade')}</button>
                                    </div>
                                )}


                                {/* Action Buttons */}
                                <div className="no-print mt-4 grid grid-cols-3 gap-3">
                                    <button
                                        onClick={handleDownload}
                                        className="flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-xl py-3 hover:bg-blue-100 transition"
                                    >
                                        <FaDownload className="text-lg" />
                                        <span className="text-xs font-bold">{t('studentCertificateShowPage.actions.download')}</span>
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="flex flex-col items-center justify-center gap-2 bg-[#A3C042] text-white rounded-xl py-3 hover:bg-[#8CA635] transition"
                                    >
                                        <FaPrint className="text-lg" />
                                        <span className="text-xs font-bold">{t('studentCertificateShowPage.actions.print')}</span>
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="flex flex-col items-center justify-center gap-2 bg-purple-50 text-purple-600 rounded-xl py-3 hover:bg-purple-100 transition"
                                    >
                                        <FaShare className="text-lg" />
                                        <span className="text-xs font-bold">{t('studentCertificateShowPage.actions.share')}</span>
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
                            title={t('studentCertificateShowPage.navTitle')}
                            onBack={() => router.visit('/')}
                            reverseOrder={false}
                            auth={auth}
                        />
                    </div>
                    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Student Information Section */}
                            <div className="lg:col-span-1 no-print">
                                <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">{t('studentCertificateShowPage.studentInfo.title')}</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm text-gray-600 mb-2 block">{t('studentCertificateShowPage.studentInfo.name')}</label>
                                            <div className="text-base font-bold text-gray-900">{user?.name || t('common.notAvailable')}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600 mb-2 block">{t('studentCertificateShowPage.studentInfo.membershipNumber')}:</label>
                                            <div className="text-base font-bold text-gray-900">{user?.membership_number || t('common.notAvailable')}</div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600 mb-2 block">{t('studentCertificateShowPage.studentInfo.joinDate')}:</label>
                                            <div className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                <FaCalendarAlt className="text-gray-400" />
                                                {formatDate(stats?.join_date)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600 mb-2 block">{t('studentCertificateShowPage.studentInfo.projectsCount')}:</label>
                                            <div className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                <FaProjectDiagram className="text-[#A3C042]" />
                                                {stats?.projects_count || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600 mb-2 block">{t('studentCertificateShowPage.studentInfo.badgesCount')}:</label>
                                            <div className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                <FaMedal className="text-purple-500" />
                                                {stats?.badges_count || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Certificate Section */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 no-print">{t('studentCertificateShowPage.certificate.title')}</h2>

                                    {/* Certificate Display */}
                                    <CertificateCard 
                                        ref={certificateRef}
                                        user={user}
                                        role="student"
                                        barcode={certificate?.barcode}
                                        issueDate={certificate?.issue_date_formatted || new Date().toLocaleDateString('en-GB')}
                                    />

                                    {/* Action Buttons */}
                                    <div className="no-print mt-6 grid grid-cols-3 gap-4">
                                        <button
                                            onClick={handleDownload}
                                            className="flex flex-col items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-xl py-4 hover:bg-blue-100 transition"
                                        >
                                            <FaDownload className="text-xl" />
                                            <span className="text-sm font-bold">{t('studentCertificateShowPage.actions.download')}</span>
                                        </button>
                                        <button
                                            onClick={handlePrint}
                                            className="flex flex-col items-center justify-center gap-2 bg-[#A3C042] text-white rounded-xl py-4 hover:bg-[#8CA635] transition"
                                        >
                                            <FaPrint className="text-xl" />
                                            <span className="text-sm font-bold">{t('studentCertificateShowPage.actions.print')}</span>
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="flex flex-col items-center justify-center gap-2 bg-purple-50 text-purple-600 rounded-xl py-4 hover:bg-purple-100 transition"
                                        >
                                            <FaShare className="text-xl" />
                                            <span className="text-sm font-bold">{t('studentCertificateShowPage.actions.share')}</span>
                                        </button>
                                    </div>
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
