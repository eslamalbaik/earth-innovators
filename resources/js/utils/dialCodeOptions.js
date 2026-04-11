export const DEFAULT_DIAL_CODE = '+971';

export const PHONE_COUNTRY_OPTIONS = [
    { value: '+971', countryKey: 'countries.uae', flag: '🇦🇪' },
    { value: '+966', countryKey: 'countries.saudi', flag: '🇸🇦' },
    { value: '+20', countryKey: 'countries.egypt', flag: '🇪🇬' },
    { value: '+962', countryKey: 'countries.jordan', flag: '🇯🇴' },
    { value: '+974', countryKey: 'countries.qatar', flag: '🇶🇦' },
    { value: '+965', countryKey: 'countries.kuwait', flag: '🇰🇼' },
    { value: '+973', countryKey: 'countries.bahrain', flag: '🇧🇭' },
    { value: '+968', countryKey: 'countries.oman', flag: '🇴🇲' },
    { value: '+970', countryKey: 'countries.palestine', flag: '🇵🇸' },
    { value: '+961', countryKey: 'countries.lebanon', flag: '🇱🇧' },
];

export function getDialCodeOptions(t) {
    return PHONE_COUNTRY_OPTIONS.map((option) => ({
        ...option,
        label: `${option.flag} ${option.value} (${t(option.countryKey)})`,
    }));
}

export function detectDialCode(phone) {
    if (typeof phone !== 'string') {
        return DEFAULT_DIAL_CODE;
    }

    const trimmed = phone.trim();
    if (!trimmed) {
        return DEFAULT_DIAL_CODE;
    }

    const matchedOption = [...PHONE_COUNTRY_OPTIONS]
        .sort((a, b) => b.value.length - a.value.length)
        .find((option) => trimmed.startsWith(option.value));

    if (matchedOption) {
        return matchedOption.value;
    }

    const plusNumberMatch = trimmed.match(/^\+\d{1,4}/);
    if (plusNumberMatch) {
        return plusNumberMatch[0];
    }

    return DEFAULT_DIAL_CODE;
}

export function stripDialCode(phone, dialCode = DEFAULT_DIAL_CODE) {
    if (typeof phone !== 'string') {
        return '';
    }

    if (phone.startsWith(dialCode)) {
        return phone.slice(dialCode.length).trim().replace(/\D/g, '');
    }

    return phone.replace(/\D/g, '');
}
