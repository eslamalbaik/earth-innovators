import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

/**
 * مخطط راداري للمؤشرات (0-100) — يُستخدم لمؤشرات الابتكار الثمانية
 * وللعوامل المعرفية الخمسة (ستانفورد-بينيه)
 */
export default function IndexRadarChart({
    indexes = {},
    indexNames = {},
    height = 280,
    color = '#6366f1',
    name = 'المؤشرات',
    maxValue = 100,
}) {
    const data = Object.entries(indexNames).map(([key, label]) => ({
        subject: label,
        value: Number(indexes?.[key] ?? 0),
    }));

    if (data.length === 0) {
        return null;
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <PolarRadiusAxis angle={90} domain={[0, maxValue]} tick={{ fontSize: 9, fill: '#9ca3af' }} />
                <Radar name={name} dataKey="value" stroke={color} fill={color} fillOpacity={0.35} />
                <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}`, name]} />
            </RadarChart>
        </ResponsiveContainer>
    );
}
