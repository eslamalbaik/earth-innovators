import { useTranslation } from '@/i18n';

/**
 * شارة "دور الطالب" (سفير المعرفة / سفير التعلّم / سفير الابتكار) —
 * role: { key, label_ar, label_en, icon, color, tooltip_ar, tooltip_en }
 * محسوبة تلقائياً من App\Services\ScoringEngine\StudentRoleBadgeService
 */
export default function RoleBadge({ role, size = 'md' }) {
    const { language } = useTranslation();

    if (!role) return null;

    const sizes = {
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-3.5 py-1.5 text-sm',
        lg: 'px-5 py-2 text-base',
    };

    const label = language === 'ar' ? role.label_ar : role.label_en;
    const tooltip = language === 'ar' ? role.tooltip_ar : role.tooltip_en;

    return (
        <span
            title={tooltip}
            className={`inline-flex items-center gap-1.5 rounded-full font-bold border cursor-help ${sizes[size] || sizes.md}`}
            style={{
                backgroundColor: `${role.color}22`,
                borderColor: role.color,
                color: '#374151',
            }}
        >
            <span>{role.icon}</span>
            <span>{label}</span>
        </span>
    );
}
