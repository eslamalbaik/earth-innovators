/** UAE support line: 0544405004 */
export const SUPPORT_PHONE_LOCAL = '0544405004';
export const SUPPORT_PHONE_E164 = '+971544405004';
export const SUPPORT_PHONE_DISPLAY = '+971 54 440 5004';
export const SUPPORT_WHATSAPP_DIGITS = '971544405004';

export function resolveSupportPhoneE164() {
    return import.meta.env.VITE_SUPPORT_PHONE?.trim() || SUPPORT_PHONE_E164;
}

export function resolveSupportPhoneDisplay() {
    return import.meta.env.VITE_SUPPORT_PHONE_DISPLAY?.trim() || SUPPORT_PHONE_DISPLAY;
}

export function resolveSupportWhatsAppDigits() {
    const raw = import.meta.env.VITE_SUPPORT_WHATSAPP?.trim()
        || import.meta.env.VITE_SUPPORT_PHONE?.trim()
        || SUPPORT_WHATSAPP_DIGITS;

    return raw.replace(/[^\d]/g, '');
}

export function supportTelHref(e164 = resolveSupportPhoneE164()) {
    return `tel:${e164.replace(/[^\d+]/g, '')}`;
}
