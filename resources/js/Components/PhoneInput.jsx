import { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaPhone } from 'react-icons/fa';
import { DEFAULT_DIAL_CODE, getDialCodeOptions, detectDialCode, stripDialCode } from '@/utils/dialCodeOptions';
import { useTranslation } from '@/i18n';

/**
 * PhoneInput — حقل هاتف موحّد مع اختيار كود الدولة وعلمها.
 *
 * Props:
 *  - value         {string}   القيمة الكاملة بصيغة E.164  e.g. "+971501234567"
 *  - onChange      {(full) => void}  ترجع الرقم كاملاً  e.g. "+971501234567"
 *  - id            {string}
 *  - name          {string}
 *  - required      {bool}
 *  - disabled      {bool}
 *  - className     {string}   كلاسات إضافية على الـ input
 *  - error         {string}   رسالة خطأ
 *  - dir           {string}   'rtl' | 'ltr'
 */
export default function PhoneInput({
    value = '',
    onChange,
    id = 'phone',
    name = 'phone',
    required = false,
    disabled = false,
    className = '',
    error = '',
    dir,
}) {
    const { t, language } = useTranslation();
    const dialCodeOptions  = getDialCodeOptions(t);
    const resolvedDir      = dir ?? (language === 'ar' ? 'rtl' : 'ltr');

    const [dialCode, setDialCode]     = useState(() => detectDialCode(value) || DEFAULT_DIAL_CODE);
    const [localNum, setLocalNum]     = useState(() => stripDialCode(value, detectDialCode(value) || DEFAULT_DIAL_CODE));
    const [open, setOpen]             = useState(false);
    const dropdownRef                 = useRef(null);

    // Sync external value changes
    useEffect(() => {
        const detected = detectDialCode(value) || DEFAULT_DIAL_CODE;
        setDialCode(detected);
        setLocalNum(stripDialCode(value, detected));
    }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleDialCodeChange = (code) => {
        setDialCode(code);
        setOpen(false);
        onChange?.(`${code}${localNum.replace(/\D/g, '')}`);
    };

    const handleLocalChange = (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        setLocalNum(raw);
        onChange?.(`${dialCode}${raw}`);
    };

    const selectedOption = dialCodeOptions.find(o => o.value === dialCode) ?? dialCodeOptions[0];

    return (
        <div className="w-full">
            <div
                dir={resolvedDir}
                className={`flex items-stretch border rounded-lg focus-within:ring-2 focus-within:ring-[#A3C042] focus-within:border-[#A3C042] transition
                    ${error ? 'border-red-400' : 'border-gray-300'}
                    ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50' : 'bg-white'}`}
            >
                {/* Dial code selector */}
                <div ref={dropdownRef} className="relative shrink-0">
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setOpen(v => !v)}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        className="h-full flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border-e border-gray-300 hover:bg-gray-100 transition select-none whitespace-nowrap rounded-s-lg"
                    >
                        <span className="text-base leading-none">{selectedOption.flag}</span>
                        <span>{dialCode}</span>
                        <FaChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>

                    {open && (
                        <ul
                            role="listbox"
                            className="absolute z-50 top-full start-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl overflow-auto max-h-60 py-1"
                        >
                            {dialCodeOptions.map(opt => (
                                <li
                                    key={opt.value}
                                    role="option"
                                    aria-selected={opt.value === dialCode}
                                    onClick={() => handleDialCodeChange(opt.value)}
                                    className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer hover:bg-[#A3C042]/10 transition
                                        ${opt.value === dialCode ? 'bg-[#A3C042]/15 font-semibold text-[#5a7a00]' : 'text-gray-700'}`}
                                >
                                    <span className="text-base">{opt.flag}</span>
                                    <span className="font-mono text-xs w-10 shrink-0">{opt.value}</span>
                                    <span className="truncate">{t(opt.countryKey)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Number input */}
                <input
                    id={id}
                    name={name}
                    type="tel"
                    inputMode="numeric"
                    required={required}
                    disabled={disabled}
                    value={localNum}
                    onChange={handleLocalChange}
                    dir="ltr"
                    placeholder="501234567"
                    className={`flex-1 min-w-0 px-3 py-2 text-sm outline-none bg-transparent placeholder-gray-400 rounded-e-lg ${className}`}
                />
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
