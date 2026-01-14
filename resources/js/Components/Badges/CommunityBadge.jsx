import React, { useState, useEffect } from 'react';
import { FaBug, FaHeart, FaBrain, FaRocket } from 'react-icons/fa';

/**
 * CommunityBadge Component
 * Displays a progress-based community badge with animated gradient progress bar
 * Shows score ranges (0-20, 21-50, 51-80, 81-100) with icons
 */
// Helper function to get range key from min value
function getRangeKey(min) {
    if (min >= 81) return 'rocket';
    if (min >= 51) return 'brain';
    if (min >= 21) return 'heart';
    return 'beginner';
}

// Helper function to get range from score
function getRangeFromScore(score) {
    if (score >= 81) return 'rocket';
    if (score >= 51) return 'brain';
    if (score >= 21) return 'heart';
    return 'beginner';
}

export default function CommunityBadge({ badge, progress = null }) {
    const [imageError, setImageError] = useState(false);
    const imageUrl = badge.image || badge.icon;

    // Get progress data or default to 0
    const score = progress?.score || 0;
    const percentage = progress?.percentage || score;
    const currentRange = progress?.current_range || getRangeFromScore(score);

    // Range definitions
    const ranges = [
        { min: 0, max: 20, icon: FaBug, label: '0–20', color: 'from-green-400 to-green-500', iconColor: 'text-green-600' },
        { min: 21, max: 50, icon: FaHeart, label: '21–50', color: 'from-pink-400 to-pink-500', iconColor: 'text-pink-600' },
        { min: 51, max: 80, icon: FaBrain, label: '51–80', color: 'from-purple-400 to-purple-500', iconColor: 'text-purple-600' },
        { min: 81, max: 100, icon: FaRocket, label: '81–100', color: 'from-yellow-400 to-yellow-500', iconColor: 'text-yellow-600' },
    ];

    // Get current range info
    const activeRange = ranges.find(r => currentRange === getRangeKey(r.min));

    // Get icon for current range
    const CurrentIcon = activeRange?.icon || FaBug;

    // Calculate progress bar segments
    const getProgressBarSegments = () => {
        const segments = [];
        let cumulativeProgress = 0;

        ranges.forEach((range, index) => {
            const rangeSize = range.max - range.min + 1;
            const rangeProgress = Math.min(100, Math.max(0, ((score - range.min) / rangeSize) * 100));
            const isActive = score >= range.min && score <= range.max;
            const isCompleted = score > range.max;

            segments.push({
                ...range,
                progress: isCompleted ? 100 : (isActive ? rangeProgress : 0),
                isActive,
                isCompleted,
            });
        });

        return segments;
    };

    const segments = getProgressBarSegments();

    // Animated gradient effect
    const [gradientOffset, setGradientOffset] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setGradientOffset(prev => (prev + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-[#A3C042]/50 transition-all">
            <div className="p-6">
                {/* Header with percentage and title */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl font-bold text-gray-900">{percentage}%</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {badge.name_ar || badge.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                            {score} من 100 نقطة
                        </p>
                    </div>

                    {/* Large badge icon */}
                    <div className="relative">
                        {imageUrl && !imageError ? (
                            <img
                                src={imageUrl}
                                alt={badge.name_ar || badge.name}
                                className="w-20 h-20 object-contain"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br ${activeRange?.color || 'from-gray-300 to-gray-400'}`}>
                                <CurrentIcon className="text-3xl text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Small active icon indicator */}
                {activeRange && (
                    <div className="flex items-center gap-2 mb-4">
                        <activeRange.icon className={`text-lg ${activeRange.iconColor}`} />
                        <span className="text-xs text-gray-600">المستوى الحالي</span>
                    </div>
                )}

                {/* Progress bar with animated gradient */}
                <div className="mb-6">
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                        {/* Background segments */}
                        <div className="absolute inset-0 flex">
                            {segments.map((segment, index) => (
                                <div
                                    key={index}
                                    className={`flex-1 ${segment.isActive || segment.isCompleted ? `bg-gradient-to-r ${segment.color}` : 'bg-gray-200'}`}
                                    style={{
                                        opacity: segment.isActive || segment.isCompleted ? 1 : 0.3,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Animated gradient overlay for active segment */}
                        {segments.map((segment, index) => {
                            if (!segment.isActive || segment.progress === 0) return null;

                            return (
                                <div
                                    key={`overlay-${index}`}
                                    className="absolute h-full"
                                    style={{
                                        left: `${(index / segments.length) * 100}%`,
                                        width: `${(1 / segments.length) * 100}%`,
                                    }}
                                >
                                    <div
                                        className="h-full bg-gradient-to-r from-pink-500 via-pink-400 to-green-400"
                                        style={{
                                            width: `${segment.progress}%`,
                                            background: `linear-gradient(90deg,
                                                rgba(236, 72, 153, 0.8) 0%,
                                                rgba(236, 72, 153, 0.6) 50%,
                                                rgba(34, 197, 94, 0.6) 100%)`,
                                            backgroundSize: '200% 100%',
                                            backgroundPosition: `${gradientOffset}% 0`,
                                            transition: 'background-position 0.1s ease',
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Score ranges with icons */}
                <div className="flex items-center justify-between gap-2">
                    {ranges.map((range, index) => {
                        const RangeIcon = range.icon;
                        const isActive = getRangeKey(range.min) === currentRange;
                        const isCompleted = score > range.max;

                        return (
                            <div
                                key={index}
                                className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition ${
                                    isActive
                                        ? 'bg-gradient-to-br from-pink-50 to-green-50 border-2 border-pink-300'
                                        : isCompleted
                                        ? 'bg-gray-50 border border-gray-200'
                                        : 'bg-gray-50 border border-gray-200 opacity-60'
                                }`}
                            >
                                <RangeIcon
                                    className={`text-xl ${
                                        isActive
                                            ? range.iconColor
                                            : isCompleted
                                            ? 'text-gray-400'
                                            : 'text-gray-300'
                                    }`}
                                />
                                <span
                                    className={`text-xs font-medium ${
                                        isActive
                                            ? 'text-gray-900'
                                            : isCompleted
                                            ? 'text-gray-600'
                                            : 'text-gray-400'
                                    }`}
                                >
                                    {range.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Description */}
                {badge.description_ar || badge.description ? (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                            {badge.description_ar || badge.description}
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
