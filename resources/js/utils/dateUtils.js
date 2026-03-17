/**
 * Date Utilities for Date Formatting
 * Formats dates in Arabic format (Gregorian)
 *
 * Note: The original toHijriDate function has been modified to return
 * Gregorian dates in Arabic format instead of Hijri calendar.
 */

/**
 * Date Utilities for Date Formatting
 * Formats dates in Arabic format (Gregorian)
 */

import store from '@/store/store';
import { getTranslation } from '@/i18n';

const getCurrentLanguage = () => store?.getState?.()?.language?.currentLanguage || 'ar';

const getGregorianMonths = (language) => ([
    getTranslation(language, 'common.months.january'),
    getTranslation(language, 'common.months.february'),
    getTranslation(language, 'common.months.march'),
    getTranslation(language, 'common.months.april'),
    getTranslation(language, 'common.months.may'),
    getTranslation(language, 'common.months.june'),
    getTranslation(language, 'common.months.july'),
    getTranslation(language, 'common.months.august'),
    getTranslation(language, 'common.months.september'),
    getTranslation(language, 'common.months.october'),
    getTranslation(language, 'common.months.november'),
    getTranslation(language, 'common.months.december'),
]);

const getNotAvailableLabel = (language) => getTranslation(language, 'common.notAvailable');
const getInvalidDateLabel = (language) => getTranslation(language, 'common.invalidDate');

/**
 * Format date in localized Gregorian format
 * @param {Date|string} date - The date to format
 * @param {boolean} includeTime - Whether to include time in the output
 * @param {string} language - Language code
 * @returns {string} - Formatted date string
 */
export function toHijriDate(date, includeTime = false, language = getCurrentLanguage()) {
    if (!date) return getNotAvailableLabel(language);
    
    const gregorianDate = new Date(date);
    if (isNaN(gregorianDate.getTime())) return getInvalidDateLabel(language);

    const gregorianMonths = getGregorianMonths(language);

    const day = gregorianDate.getDate();
    const month = gregorianMonths[gregorianDate.getMonth()];
    const year = gregorianDate.getFullYear();

    let result = `${day} ${month} ${year}`;
    
    if (includeTime) {
        const hours = gregorianDate.getHours();
        const minutes = gregorianDate.getMinutes();
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        result += ` - ${timeString}`;
    }

    return result;
}

/**
 * Format date in short format (DD/MM/YYYY)
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date string (DD/MM/YYYY)
 */
export function toHijriDateShort(date, language = getCurrentLanguage()) {
    if (!date) return getNotAvailableLabel(language);
    
    const gregorianDate = new Date(date);
    if (isNaN(gregorianDate.getTime())) return getInvalidDateLabel(language);

    const day = gregorianDate.getDate();
    const month = gregorianDate.getMonth() + 1;
    const year = gregorianDate.getFullYear();
    
    return `${day}/${month}/${year}`;
}

/**
 * Convert Gregorian date to Hijri date object
 * Algorithm based on the Umm al-Qura calendar
 * @param {Date} date - Gregorian date
 * @returns {Object} - {year, month, day}
 */
function gregorianToHijri(date) {
    const gYear = date.getFullYear();
    const gMonth = date.getMonth() + 1;
    const gDay = date.getDate();

    // Calculate Julian Day Number
    let jd = gregorianToJulianDay(gYear, gMonth, gDay);
    
    // Convert to Hijri
    const hijri = julianDayToHijri(jd);
    
    return hijri;
}

/**
 * Convert Gregorian date to Julian Day Number
 */
function gregorianToJulianDay(year, month, day) {
    let a = Math.floor((14 - month) / 12);
    let y = year + 4800 - a;
    let m = month + 12 * a - 3;
    
    let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + 
             Math.floor(y / 4) - Math.floor(y / 100) + 
             Math.floor(y / 400) - 32045;
    
    return jd;
}

/**
 * Convert Julian Day Number to Hijri date
 * Using accurate algorithm based on Umm al-Qura calendar
 */
function julianDayToHijri(jd) {
    // Julian Day Number for 16 July 622 CE (start of Hijri calendar)
    const hijriEpoch = 1948439.5;
    
    // Days since Hijri epoch
    const days = Math.floor(jd - hijriEpoch);
    
    // Calculate Hijri year (354.367 days per year on average)
    let hijriYear = Math.floor((days * 30) / 10631) + 1;
    
    // Calculate remaining days in the year
    let remainingDays = days;
    for (let y = 1; y < hijriYear; y++) {
        remainingDays -= getHijriYearLength(y);
    }
    
    // Hijri months lengths (default pattern)
    const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
    
    // Check if it's a leap year (11 leap years in 30-year cycle)
    const cyclePosition = (hijriYear - 1) % 30;
    const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
    const isLeapYear = leapYears.includes(cyclePosition + 1);
    
    // Adjust Dhu al-Hijjah for leap years
    if (isLeapYear) {
        monthLengths[11] = 30;
    }
    
    // Find the month and day
    let hijriMonth = 1;
    let hijriDay = remainingDays;
    
    for (let i = 0; i < 12; i++) {
        if (hijriDay <= monthLengths[i]) {
            hijriMonth = i + 1;
            break;
        }
        hijriDay -= monthLengths[i];
    }
    
    // Ensure day is at least 1
    if (hijriDay < 1) {
        hijriDay = 1;
    }
    if (hijriDay > monthLengths[hijriMonth - 1]) {
        hijriDay = monthLengths[hijriMonth - 1];
    }
    
    return {
        year: hijriYear,
        month: hijriMonth,
        day: hijriDay
    };
}

/**
 * Get the length of a Hijri year
 */
function getHijriYearLength(year) {
    const cyclePosition = (year - 1) % 30;
    const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
    const isLeapYear = leapYears.includes(cyclePosition + 1);
    return isLeapYear ? 355 : 354;
}

/**
 * Format Gregorian date in localized format
 * @param {Date|string} date - The date to format
 * @param {boolean} includeTime - Whether to include time in the output
 * @param {string} language - Language code
 * @returns {string} - Formatted Gregorian date string
 */
export function toGregorianDate(date, includeTime = false, language = getCurrentLanguage()) {
    if (!date) return getNotAvailableLabel(language);
    
    const gregorianDate = new Date(date);
    if (isNaN(gregorianDate.getTime())) return getInvalidDateLabel(language);

    const gregorianMonths = getGregorianMonths(language);

    const day = gregorianDate.getDate();
    const month = gregorianMonths[gregorianDate.getMonth()];
    const year = gregorianDate.getFullYear();

    let result = `${day} ${month} ${year}`;
    
    if (includeTime) {
        const hours = gregorianDate.getHours();
        const minutes = gregorianDate.getMinutes();
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        result += ` - ${timeString}`;
    }

    return result;
}

/**
 * Format date for display (Hijri with optional Gregorian)
 * @param {Date|string} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
    const {
        includeTime = false,
        includeGregorian = false,
        format = 'full', // 'full', 'short', 'long'
        language = getCurrentLanguage(),
    } = options;

    if (!date) return getNotAvailableLabel(language);

    if (format === 'short') {
        return toHijriDateShort(date, language);
    }

    let result = toHijriDate(date, includeTime, language);

    if (includeGregorian) {
        const gregorianDate = new Date(date);
        const locale = language === 'ar' ? 'ar' : 'en-US';
        const gregorianStr = gregorianDate.toLocaleDateString(locale);
        result += ` (${gregorianStr})`;
    }

    return result;
}
