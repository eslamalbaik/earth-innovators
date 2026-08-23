import React, { forwardRef } from 'react';
import { useTranslation } from '@/i18n';
import { FaQrcode } from 'react-icons/fa';

const CertificateCard = forwardRef(({ user, role, barcode, issueDate, membershipStatus }, ref) => {
    const { t } = useTranslation();

    // Determine Role Strings
    let cardTitle = 'بطاقة العضوية';
    let roleName = '';
    let roleText = 'للعضو';
    let membershipTitle = 'عضوية';
    
    if (role === 'teacher') {
        cardTitle = 'بطاقة عضوية المعلم';
        roleName = 'معلم | Teacher';
        roleText = 'للمعلم';
        membershipTitle = 'عضوية المعلم';
    } else if (role === 'school') {
        cardTitle = 'بطاقة عضوية المدرسة';
        roleName = 'مدرسة | School';
        roleText = 'للمدرسة';
        membershipTitle = 'عضوية المدرسة';
    } else if (role === 'student') {
        cardTitle = 'بطاقة عضوية الطالب';
        roleName = 'طالب | Student';
        roleText = 'للطالب';
        membershipTitle = 'عضوية الطالب';
    } else {
        roleName = role;
    }

    const membershipNumber = user?.membership_number || t('common.notAvailable');
    const name = user?.name || t('common.notAvailable');
    const status = membershipStatus || 'عضو معتمد';
    
    let finalIssueDate = issueDate;
    if (!finalIssueDate) {
        const today = new Date();
        finalIssueDate = `${today.getDate().toString().padStart(2, '0')} / ${(today.getMonth() + 1).toString().padStart(2, '0')} / ${today.getFullYear()}`;
    }

    return (
        <div 
            ref={ref}
            className="certificate-print relative mx-auto bg-white rounded-2xl overflow-hidden"
            style={{ width: '100%', maxWidth: '800px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}
            dir="rtl" // Force RTL for Arabic content alignment
        >
            {/* Top Border / Accent */}
            <div className="h-3 w-full bg-[#A3C042]"></div>

            <div className="p-8 md:p-10 text-right text-gray-800 font-sans bg-[url('/images/pattern-bg.png')] bg-opacity-5">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">{cardTitle}</h1>
                        <h2 className="text-lg font-semibold text-[#8CA635]">إرث المبتكرين | Earth Innovators</h2>
                    </div>
                    <div>
                        <img src="/images/logo-icon.png" alt="Logo" className="w-20 h-20 object-contain" />
                    </div>
                </div>

                {/* Personal Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-50/80 p-6 rounded-xl border border-gray-100">
                    <div>
                        <span className="block text-xs text-gray-500 font-bold mb-1">الاسم:</span>
                        <span className="text-base font-bold text-gray-900">{name}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 font-bold mb-1">الفئة:</span>
                        <span className="text-base font-bold text-gray-900">{roleName}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 font-bold mb-1">رقم العضوية:</span>
                        <span className="text-base font-bold text-gray-900">{membershipNumber}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 font-bold mb-1">حالة العضوية:</span>
                        <span className="text-base font-bold text-[#A3C042]">{status}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-gray-500 font-bold mb-1">تاريخ الإصدار:</span>
                        <span className="text-base font-bold text-gray-900" dir="ltr">{finalIssueDate}</span>
                    </div>
                </div>

                {/* Description Body */}
                <div className="mb-10 pl-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{membershipTitle}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                        عضوية معتمدة تتيح {roleText} الانضمام إلى مجتمع إرث المبتكرين التعليمي والعلمي والإبداعي، والمشاركة في المبادرات والبرامج والفعاليات التي تدعم التعليم والابتكار والإبداع وتبادل المعرفة.
                    </p>
                </div>

                {/* Footer Section */}
                <div className="flex flex-col md:flex-row justify-between items-end border-t border-gray-200 pt-6">
                    
                    {/* Issuance Info */}
                    <div className="mb-6 md:mb-0">
                        <div className="text-sm font-bold text-gray-800 mb-2">صادرة عن:</div>
                        <div className="text-xs text-gray-600 mb-1">منصة إرث المبتكرين – Earth Innovators</div>
                        <div className="text-xs font-bold text-gray-900 uppercase">AWJ CULTURE & ARTS PUBLISHING</div>
                    </div>

                    {/* CEO Signature */}
                    <div className="text-center mx-auto md:mx-0 mb-6 md:mb-0">
                        <div className="text-xs text-gray-500 mb-1">المدير التنفيذي</div>
                        <div className="text-sm font-bold text-gray-900">أ. ليلى إبراهيم الجسمي</div>
                    </div>

                    {/* Verification / Barcode */}
                    <div className="text-center md:text-left flex flex-col items-center">
                        <div className="text-xs font-bold text-gray-800 mb-2">للتحقق من العضوية:</div>
                        {barcode ? (
                            <img src={barcode.startsWith('http') || barcode.startsWith('/') ? barcode : `/storage/${barcode}`} alt="Barcode" className="h-16 object-contain" />
                        ) : (
                            <div className="w-16 h-16 bg-gray-50 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400">
                                <FaQrcode className="text-3xl" />
                            </div>
                        )}
                        <div className="text-[10px] text-gray-500 mt-2 uppercase tracking-wide">QR Code | Digital Verification</div>
                    </div>

                </div>
            </div>
            
            {/* Bottom Accent */}
            <div className="h-2 w-full bg-[#8CA635]"></div>
        </div>
    );
});

export default CertificateCard;
