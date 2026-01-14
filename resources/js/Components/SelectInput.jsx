import { forwardRef } from 'react';

export default forwardRef(function SelectInput(
    { className = '', children, ...props },
    ref,
) {
    return (
        <select
            {...props}
            className={
                'rounded-md border-[#A3C042] shadow-sm focus:border-[#A3C042] focus:ring-[#A3C042] ' +
                className
            }
            ref={ref}
        >
            {children}
        </select>
    );
});

