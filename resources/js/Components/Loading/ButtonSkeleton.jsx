import React from 'react';

export default function ButtonSkeleton({ className = '' }) {
    return (
        <div className={`h-10 bg-gray-200 rounded animate-pulse ${className}`}></div>
    );
}

