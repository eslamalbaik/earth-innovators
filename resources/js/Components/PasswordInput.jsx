import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTranslation } from '@/i18n';

export default function PasswordInput({
    id,
    value,
    onChange,
    className = '',
    inputClassName = '',
    toggleAriaLabel,
    ...props
}) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    return (
        <div className={`relative ${className}`}>
            <input
                id={id}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                className={`w-full border border-gray-300 rounded-lg px-4 py-2 pe-11 focus:ring-2 focus:ring-yellow-400 focus:border-transparent ${inputClassName}`}
                {...props}
            />
            <button
                type="button"
                tabIndex={-1}
                onClick={() => setVisible((v) => !v)}
                className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600"
                aria-label={toggleAriaLabel ?? t('adminLoginPage.togglePassword')}
            >
                {visible ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
            </button>
        </div>
    );
}
