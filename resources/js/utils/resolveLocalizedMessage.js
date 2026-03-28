import { getTranslation } from '@/i18n';

const BACKEND_MESSAGE_KEY_MAP = {
    'تم تقييم التسليم بنجاح!': 'toastMessages.submissionEvaluatedSuccess',
    'تم إنشاء المشروع بنجاح': 'toastMessages.schoolProjectCreatedSuccess',
    'تم تحديث المشروع بنجاح': 'toastMessages.schoolProjectUpdatedSuccess',
    'تم حذف المشروع بنجاح': 'toastMessages.schoolProjectDeletedSuccess',
    'تم قبول المشروع بنجاح': 'toastMessages.schoolProjectApprovedSuccess',
    'تم رفض المشروع': 'toastMessages.schoolProjectRejectedSuccess',
    'حدث خطأ أثناء حذف المشروع': 'toastMessages.schoolProjectDeleteError',
    'حدث خطأ أثناء حفظ التعديلات': 'toastMessages.schoolProjectUpdateError',
    'تم اعتماد الشهادة وإصدار ملفها بنجاح.': 'toastMessages.schoolCertificateApprovedSuccess',
    'تم رفض طلب الشهادة وتسجيل سبب الرفض.': 'toastMessages.schoolCertificateRejectedSuccess',
    'يرجى تسجيل الدخول أولاً': 'toastMessages.authLoginFirst',
    'لديك اشتراك نشط بالفعل. يرجى إلغاء الاشتراك الحالي أولاً.': 'toastMessages.activeSubscriptionExists',
    'فشل في إنشاء طلب الدفع': 'toastMessages.packagePaymentRequestFailed',
    'لم يتم الحصول على رابط الدفع': 'toastMessages.packagePaymentLinkMissing',
    'حدث خطأ أثناء الاشتراك. يرجى المحاولة مرة أخرى.': 'toastMessages.packageSubscriptionStartError',
    'تم الاشتراك بنجاح! تم تفعيل باقتك.': 'toastMessages.packageSubscriptionActivatedSuccess',
    'لم يتم تأكيد الدفع. يرجى التواصل مع الدعم الفني.': 'toastMessages.packagePaymentNotConfirmed',
    'حدث خطأ أثناء تأكيد الدفع.': 'toastMessages.packagePaymentConfirmationError',
    'تم إلغاء عملية الدفع.': 'toastMessages.packagePaymentCancelled',
    'تم إلغاء الاشتراك بنجاح.': 'toastMessages.packageSubscriptionCancelledSuccess',
    'حدث خطأ أثناء إلغاء الاشتراك.': 'toastMessages.packageSubscriptionCancelError',
    'حدث خطأ.': 'toastMessages.genericUnexpectedError',
};

const BACKEND_MESSAGE_PATTERNS = [
    {
        pattern: /^الملف (.+) أكبر من (\d+) ميجابايت$/,
        key: 'toastMessages.fileTooLarge',
        getParams: (matches) => ({ name: matches[1], maxMb: matches[2] }),
    },
    {
        pattern: /^نوع الملف (.+) غير مدعوم$/,
        key: 'toastMessages.fileTypeNotSupported',
        getParams: (matches) => ({ name: matches[1] }),
    },
    {
        pattern: /^يرجى اختيار المشروع$/,
        key: 'toastMessages.selectProjectFirst',
    },
    {
        pattern: /^يرجى إرفاق ملف واحد على الأقل$/,
        key: 'toastMessages.attachAtLeastOneFile',
    },
    {
        pattern: /^تم رفع المشروع بنجاح$/,
        key: 'toastMessages.projectUploadSuccess',
    },
    {
        pattern: /^حدث خطأ أثناء رفع المشروع$/,
        key: 'toastMessages.projectUploadError',
    },
    {
        pattern: /^تم إلغاء الاشتراك بنجاح$/,
        key: 'toastMessages.packageSubscriptionCancelledSuccess',
    },
    {
        pattern: /^حدث خطأ أثناء إلغاء الاشتراك$/,
        key: 'toastMessages.packageSubscriptionCancelError',
    },
    {
        pattern: /^تم إضافة الموعد بنجاح$/,
        key: 'toastMessages.teacherAvailabilityCreatedSuccess',
    },
    {
        pattern: /^حدث خطأ أثناء إضافة الموعد$/,
        key: 'toastMessages.teacherAvailabilityCreateError',
    },
    {
        pattern: /^تم تحديث الموعد بنجاح$/,
        key: 'toastMessages.teacherAvailabilityUpdatedSuccess',
    },
    {
        pattern: /^حدث خطأ أثناء تحديث الموعد$/,
        key: 'toastMessages.teacherAvailabilityUpdateError',
    },
    {
        pattern: /^تم حذف الموعد بنجاح$/,
        key: 'toastMessages.teacherAvailabilityDeletedSuccess',
    },
    {
        pattern: /^حدث خطأ أثناء حذف الموعد$/,
        key: 'toastMessages.teacherAvailabilityDeleteError',
    },
    {
        pattern: /^حدث خطأ ما$/,
        key: 'toastMessages.genericUnexpectedError',
    },
];

const isPlainObject = (value) => (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
);

export const resolveLocalizedMessage = (message, language = 'ar') => {
    if (message === null || message === undefined || message === '') {
        return '';
    }

    if (Array.isArray(message)) {
        return message
            .map((item) => resolveLocalizedMessage(item, language))
            .filter(Boolean)
            .join('\n');
    }

    if (isPlainObject(message)) {
        const translationKey = message.translationKey || message.key;

        if (translationKey) {
            return getTranslation(language, translationKey, message.params || {});
        }

        if (typeof message.message === 'string') {
            return resolveLocalizedMessage(message.message, language);
        }

        return '';
    }

    if (typeof message !== 'string') {
        return String(message);
    }

    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
        return '';
    }

    if (trimmedMessage.startsWith('i18n:')) {
        return getTranslation(language, trimmedMessage.slice(5));
    }

    const mappedKey = BACKEND_MESSAGE_KEY_MAP[trimmedMessage];
    if (mappedKey) {
        return getTranslation(language, mappedKey);
    }

    for (const matcher of BACKEND_MESSAGE_PATTERNS) {
        const matches = trimmedMessage.match(matcher.pattern);
        if (matches) {
            return getTranslation(
                language,
                matcher.key,
                matcher.getParams ? matcher.getParams(matches) : {},
            );
        }
    }

    return trimmedMessage;
};

export default resolveLocalizedMessage;
