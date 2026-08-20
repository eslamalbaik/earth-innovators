import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

import { useTranslation } from '@/i18n';

/**
 * مخطط راداري للمؤشرات (0-100) — يُستخدم لمؤشرات الابتكار الثمانية
 * وللعوامل المعرفية الخمسة (ستانفورد-بينيه)
 */
export default function IndexRadarChart({
    indexes = {},
    indexNames = {},
    height = 280,
    color = '#6366f1',
    name,
    maxValue = 100,
}) {
    const { t } = useTranslation();
    const chartName = name || t('dashboard.indexes') || 'المؤشرات';

    const data = Object.entries(indexNames).map(([key, label]) => ({
        subject: label,
        value: Number(indexes?.[key] ?? 0),
        fullMark: maxValue,
    }));

    if (data.length === 0) return null;

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 11, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, maxValue]} tick={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#111827', fontWeight: 600 }}
                    />
                    <Radar
                        name={chartName}
                        dataKey="value"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.35}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
