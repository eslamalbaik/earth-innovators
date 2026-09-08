import { Link } from '@inertiajs/react';
import { FaRobot } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function AiDisclosureBadge({ className = '' }) {
    const { t } = useTranslation();

    return (
        <Link
            href="/ai-ethics"
            className={`inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 ${className}`}
        >
            <FaRobot className="text-indigo-500" />
            {t('common.aiGeneratedDisclosure')}
        </Link>
    );
}
