import { useSelector } from 'react-redux';

export const useDirection = () => {
    const { dir, currentLanguage } = useSelector((state) => state.language);
    return { dir, currentLanguage };
};

export const getDropdownPosition = (isRtl) => {
    return isRtl ? 'end-0' : 'start-0';
};

export const getDropdownAlign = (isRtl) => {
    return isRtl ? 'right-auto' : 'left-auto';
};
