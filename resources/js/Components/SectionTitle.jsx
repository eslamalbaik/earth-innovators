import React from 'react';

const SectionTitle = ({
    text,
    size = '2xl',
    align = 'center',
    className = ''
}) => {
    const getSizeClasses = (size) => {
        switch (size) {
            case 'sm':
                return 'text-sm md:text-base';
            case 'md':
                return 'text-base md:text-lg';
            case 'lg':
                return 'text-lg md:text-xl';
            case 'xl':
                return 'text-xl md:text-2xl';
            case '2xl':
                return 'text-2xl md:text-3xl';
            case '3xl':
                return 'text-3xl md:text-4xl';
            case '4xl':
                return 'text-4xl md:text-5xl';
            default:
                return 'text-2xl md:text-3xl';
        }
    };

    const getLineHeight = (size) => {
        switch (size) {
            case 'sm':
                return 'h-1';
            case 'md':
                return 'h-1.5';
            case 'lg':
                return 'h-2';
            case 'xl':
                return 'h-2.5';
            case '2xl':
                return 'h-3';
            case '3xl':
                return 'h-3';
            case '4xl':
                return 'h-4';
            default:
                return 'h-3';
        }
    };

    const getLineWidth = (size) => {
        switch (size) {
            case 'sm':
                return 'w-4/5';
            case 'md':
                return 'w-5/6';
            case 'lg':
                return 'w-11/12';
            case 'xl':
                return 'w-11/12';
            case '2xl':
                return 'w-full';
            case '3xl':
                return 'w-full';
            case '4xl':
                return 'w-full';
            default:
                return 'w-full';
        }
    };

    const getLineTopMargin = (size) => {
        switch (size) {
            case 'sm':
                return 'mt-[8px]';
            case 'md':
                return 'mt-[10px]';
            case 'lg':
                return 'mt-[12px]';
            case 'xl':
                return 'mt-[14px]';
            case '2xl':
                return 'mt-[16px]';
            case '3xl':
                return 'mt-[17px]';
            case '4xl':
                return 'mt-[20px]';
            default:
                return 'mt-[16px]';
        }
    };

    const getAlignClasses = (align) => {
        switch (align) {
            case 'start':
                return 'justify-start text-right';
            case 'center':
                return 'justify-center text-center';
            case 'end':
                return 'justify-end text-left';
            default:
                return 'justify-center text-center';
        }
    };

    return (
        <div className={`py-8 flex items-center ${getAlignClasses(align)} ${className}`}>
            <div className="relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`bg-yellow-400 rounded-full ${getLineHeight(size)} ${getLineTopMargin(size)} ${getLineWidth(size)}`}></div>
                </div>
                <div className={`relative flex ${getAlignClasses(align)}`}>
                    <span className={`px-4 font-bold text-gray-800 ${getSizeClasses(size)}`}>
                        {text}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SectionTitle;
