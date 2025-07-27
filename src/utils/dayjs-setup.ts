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

// ISO week utilities for YYWW.D format
export const getISOWeekYear2Digit = (
    date: string | Date | dayjs.Dayjs,
): string => {
    return dayjs(date).isoWeekYear().toString().slice(-2);
};

export const getISOWeek2Digit = (date: string | Date | dayjs.Dayjs): string => {
    return dayjs(date).isoWeek().toString().padStart(2, '0');
};

export const getISOWeekday = (date: string | Date | dayjs.Dayjs): number => {
    return dayjs(date).isoWeekday();
};

// Complete YYWW.D formatting function
export const formatYYWWD = (date: string | Date | dayjs.Dayjs): string => {
    const year = getISOWeekYear2Digit(date);
    const week = getISOWeek2Digit(date);
    const day = getISOWeekday(date);
    return `${year}${week}.${day}`;
};
