import { useTranslation } from '@/i18n';

/**
 * شارة تصنيف المبتكر (ماسي، بلاتيني، ذهبي، فضي، برونزي، نامٍ)
 * details: { label, color, icon } من InnovationIndex::CLASSIFICATIONS
 * classificationKey: مفتاح التصنيف الخام (diamond/platinum/...) لترجمته حسب اللغة
 */
export default function ClassificationBadge({ details, classificationKey, size = 'md' }) {
    if (!details) return null;

    const { t } = useTranslation();

    const sizes = {
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-3.5 py-1.5 text-sm',
        lg: 'px-5 py-2 text-base',
    };

    const label = classificationKey
        ? t(`innovationIndex.classifications.${classificationKey}`)
        : details.label;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-bold border ${sizes[size] || sizes.md}`}
            style={{
                backgroundColor: `${details.color}33`,
                borderColor: details.color,
                color: '#374151',
            }}
        >
            <span>{details.icon}</span>
            <span>{label}</span>
        </span>
    );
}
