import { FaWhatsapp } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

function normalizeWhatsAppHref(value) {
    if (!value || typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        return trimmed;
    }

    const digits = trimmed.replace(/[^\d]/g, '');
    if (!digits) {
        return null;
    }

    return `https://wa.me/${digits}`;
}

export default function WhatsAppSupportButton() {
    const { t } = useTranslation();
    const supportWhatsApp = import.meta.env.VITE_SUPPORT_WHATSAPP || import.meta.env.VITE_SUPPORT_PHONE || '';
    const href = normalizeWhatsAppHref(supportWhatsApp);

    if (!href) {
        return null;
    }

    const defaultMessage = encodeURIComponent(t('supportWidget.whatsappMessage'));
    const finalHref = href.includes('?') ? href : `${href}?text=${defaultMessage}`;

    return (
        <a
            href={finalHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('supportWidget.whatsappLabel')}
            className="fixed bottom-24 end-4 z-[70] inline-flex items-center gap-2 rounded-full bg-[#25D366] p-2 text-2xl font-bold text-white shadow-2xl transition hover:scale-[1.02] hover:bg-[#20bd5a] md:bottom-6 md:end-6"
        >
            <FaWhatsapp className="text-3xl" />
        </a>
    );
}
