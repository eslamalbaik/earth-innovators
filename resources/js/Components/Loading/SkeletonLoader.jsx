import React from 'react';

export function SkeletonLoader({ className = '', lines = 3 }) {
    return (
        <div className={`animate-pulse ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-gray-200 rounded mb-2"
                    style={{ width: i === lines - 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
    return (
        <div className="animate-pulse">
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex space-x-4">
                        {Array.from({ length: cols }).map((_, colIndex) => (
                            <div
                                key={colIndex}
                                className="h-4 bg-gray-200 rounded flex-1"
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="animate-pulse bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
    );
}

