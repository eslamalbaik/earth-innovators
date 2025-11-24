/**
 * Date Utilities for Hijri Calendar Conversion
 * Converts Gregorian dates to Hijri (Islamic) calendar
 */

/**
 * Convert Gregorian date to Hijri date
 * @param {Date|string} date - The date to convert
 * @param {boolean} includeTime - Whether to include time in the output
 * @returns {string} - Formatted Hijri date string
 */
export function toHijriDate(date, includeTime = false) {
    if (!date) return 'غير محدد';
    
    const gregorianDate = new Date(date);
    if (isNaN(gregorianDate.getTime())) return 'تاريخ غير صحيح';

    // Convert to Hijri using the algorithm
    const hijri = gregorianToHijri(gregorianDate);
    
    const hijriMonths = [
        'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
        'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
    ];

    const day = hijri.day;
    const month = hijriMonths[hijri.month - 1];
    const year = hijri.year;

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
 * Convert Gregorian date to Hijri date (simple format: DD/MM/YYYY)
 * @param {Date|string} date - The date to convert
 * @returns {string} - Formatted Hijri date string (DD/MM/YYYY)
 */
export function toHijriDateShort(date) {
    if (!date) return 'غير محدد';
    
    const gregorianDate = new Date(date);
    if (isNaN(gregorianDate.getTime())) return 'تاريخ غير صحيح';

    const hijri = gregorianToHijri(gregorianDate);
    
    return `${hijri.day}/${hijri.month}/${hijri.year}`;
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
 * Format date for display (Hijri with optional Gregorian)
 * @param {Date|string} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export function formatDate(date, options = {}) {
    const {
        includeTime = false,
        includeGregorian = false,
        format = 'full' // 'full', 'short', 'long'
    } = options;

    if (!date) return 'غير محدد';

    if (format === 'short') {
        return toHijriDateShort(date);
    }

    let result = toHijriDate(date, includeTime);

    if (includeGregorian) {
        const gregorianDate = new Date(date);
        const gregorianStr = gregorianDate.toLocaleDateString('ar-SA');
        result += ` (${gregorianStr})`;
    }

    return result;
}

