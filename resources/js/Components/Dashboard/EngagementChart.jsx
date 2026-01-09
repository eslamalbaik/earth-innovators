import { memo, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Dot
} from 'recharts';

/**
 * Custom Dot Component for data points
 */
const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    return (
        <circle
            cx={cx}
            cy={cy}
            r={5}
            fill="#1E3A8A"
            stroke="#fff"
            strokeWidth={2}
            className="hover:r-6 transition-all duration-200"
            aria-label={`${payload.month}: ${payload.value} نقطة`}
        />
    );
};

/**
 * Custom Tooltip Component
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                    {label}
                </p>
                <p className="text-sm text-blue-600 font-bold">
                    {payload[0].value} نقطة
                </p>
            </div>
        );
    }
    return null;
};

/**
 * EngagementChart Component
 * 
 * High-performance line chart for monthly engagement points
 * Optimized with memoization and responsive design
 */
function EngagementChart({ data = [] }) {
    // Memoize chart configuration
    const chartConfig = useMemo(() => ({
        lineColor: '#1E3A8A',
        gridColor: '#E5E7EB',
        textColor: '#6B7280',
        axisColor: '#9CA3AF'
    }), []);

    // Ensure data is valid
    const validData = useMemo(() => {
        if (!Array.isArray(data) || data.length === 0) {
            return [
                { month: 'يناير', value: 75 },
                { month: 'فبراير', value: 70 },
                { month: 'مارس', value: 65 },
                { month: 'أبريل', value: 68 },
                { month: 'مايو', value: 75 },
                { month: 'يونيو', value: 78 },
                { month: 'يوليو', value: 80 }
            ];
        }
        return data;
    }, [data]);

    return (
        <div 
            className="w-full"
            role="img"
            aria-label="رسم بياني يوضح متوسط نقاط التفاعل الشهري"
        >
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={validData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 10,
                    }}
                >
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke={chartConfig.gridColor}
                        opacity={0.3}
                    />
                    <XAxis
                        dataKey="month"
                        stroke={chartConfig.axisColor}
                        tick={{ fill: chartConfig.textColor, fontSize: 12 }}
                        tickLine={{ stroke: chartConfig.axisColor }}
                        axisLine={{ stroke: chartConfig.axisColor }}
                    />
                    <YAxis
                        domain={[0, 100]}
                        ticks={[0, 25, 50, 75, 100]}
                        stroke={chartConfig.axisColor}
                        tick={{ fill: chartConfig.textColor, fontSize: 12 }}
                        tickLine={{ stroke: chartConfig.axisColor }}
                        axisLine={{ stroke: chartConfig.axisColor }}
                        label={{ 
                            value: 'نقاط التفاعل', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fill: chartConfig.textColor }
                        }}
                    />
                    <Tooltip 
                        content={<CustomTooltip />}
                        cursor={{ stroke: chartConfig.lineColor, strokeWidth: 1, strokeDasharray: '5 5' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={chartConfig.lineColor}
                        strokeWidth={3}
                        dot={<CustomDot />}
                        activeDot={{ r: 7, fill: chartConfig.lineColor }}
                        animationDuration={800}
                        animationEasing="ease-out"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// Export memoized component for performance
export default memo(EngagementChart);

