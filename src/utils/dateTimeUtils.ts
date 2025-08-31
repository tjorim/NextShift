import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/en-gb';

// Configure dayjs with plugins and locale
dayjs.extend(isoWeek);
dayjs.locale('en-gb');

// Export the configured dayjs instance
export { dayjs };

// Common date utility functions used across the app
export const addDays = (date: Date, days: number): Date => {
    return dayjs(date).add(days, 'day').toDate();
};

export const formatISODate = (date: Date): string => {
    return dayjs(date).format('YYYY-MM-DD');
};

export const formatDisplayDate = (date: Date): string => {
    return dayjs(date).format('ddd, MMM D');
};

/**
 * Returns the 2-digit ISO week year (e.g., "25" for 2025)
 * @param date - The date to extract the year from
 * @returns The 2-digit ISO week year
 */
export const getISOWeekYear2Digit = (
    date: string | Date | dayjs.Dayjs,
): string => {
    return String(dayjs(date).isoWeekYear()).slice(-2);
};

/**
 * Returns the 2-digit ISO week number (e.g., "20" for the 20th week)
 * @param date - The date to extract the week number from
 * @returns The 2-digit ISO week number
 */
export const getISOWeek2Digit = (date: string | Date | dayjs.Dayjs): string => {
    return String(dayjs(date).isoWeek()).padStart(2, '0');
};

/**
 * Returns the ISO weekday (1-7) for the date, where 1 is Monday and 7 is Sunday
 * @param date - The date to extract the weekday from
 * @returns The ISO weekday number
 */
export const getISOWeekday = (date: string | Date | dayjs.Dayjs): number => {
    return dayjs(date).isoWeekday();
};

/**
 * Formats a date into the YYWW.D format using ISO week numbering
 * Note: Year is represented as 2 digits (00-99), valid for years 2000-2099
 * Uses ISO week numbering, where weeks start on Monday and end on Sunday
 * @param date - The date to format
 * @returns The formatted date code (e.g., "2520.2")
 */
export const formatYYWWD = (date: string | Date | dayjs.Dayjs): string => {
    const year = getISOWeekYear2Digit(date);
    const week = getISOWeek2Digit(date);
    const day = getISOWeekday(date);
    return `${year}${week}.${day}`;
};

/**
 * Format a dayjs object as time according to user preference ('12h' or '24h').
 * @param dayjsObj - The dayjs object to format
 * @param timeFormat - '12h' or '24h'
 */
export function formatTimeByPreference(
    dayjsObj: dayjs.Dayjs,
    timeFormat: '12h' | '24h',
): string {
    return dayjsObj.format(timeFormat === '12h' ? 'hh:mm A' : 'HH:mm');
}

/**
 * Returns the localized time string for a shift's start, end, or range.
 * If both start and end are provided, returns a range (e.g., "07:00–15:00" or "7:00 AM–3:00 PM").
 * If only one is provided, returns just that time.
 * Returns null if neither is valid.
 * @param start - Start hour (0–23) or null
 * @param end - End hour (0–23) or null
 * @param timeFormat - '12h' or '24h'
 */
export function getLocalizedShiftTime(
    start: number | null,
    end: number | null,
    timeFormat: '12h' | '24h',
): string | null {
    if (start == null && end == null) return null;
    const format = (hour: number) =>
        formatTimeByPreference(
            dayjs().hour(hour).minute(0).second(0),
            timeFormat,
        );
    if (start != null && end != null) {
        return `${format(start)}–${format(end === 0 ? 24 : end)}`;
    }
    if (start != null) return format(start);
    if (end != null) return format(end === 0 ? 24 : end);
    return null;
}

/**
 * Formats shift display text with emoji, name, and localized time.
 * Uses localized time format when start/end hours are available, falls back to hours string.
 * @param shiftMeta - The shift metadata object with emoji, name, start, end, and hours
 * @param timeFormat - User's preferred time format ('12h' or '24h')
 * @returns Formatted shift display string or 'Unknown shift' if shiftMeta is null
 */
export function formatShiftDisplay(
    shiftMeta: {
        emoji?: string;
        name: string;
        start: number | null;
        end: number | null;
        hours: string;
    } | null,
    timeFormat: '12h' | '24h',
): string {
    if (!shiftMeta) return 'Unknown shift';

    const timeDisplay =
        shiftMeta.start != null && shiftMeta.end != null
            ? getLocalizedShiftTime(shiftMeta.start, shiftMeta.end, timeFormat)
            : shiftMeta.hours;

    return `${shiftMeta.emoji || ''} ${shiftMeta.name} shift (${timeDisplay})`.trim();
}
