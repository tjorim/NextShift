import type { Dayjs } from 'dayjs';
import { getCurrentShiftDay } from '../../utils/shiftCalculations';

/**
 * Returns the terminal color class for a given shift code
 */
export function getShiftColor(shiftCode: string): string {
    if (shiftCode === 'M') return 'yellow';
    if (shiftCode === 'E') return 'magenta';
    if (shiftCode === 'N') return 'blue';
    return 'gray';
}

/**
 * Returns the emoji icon for a given shift code
 */
export function getShiftEmoji(shiftCode: string): string {
    if (shiftCode === 'M') return '🌅';
    if (shiftCode === 'E') return '🌆';
    if (shiftCode === 'N') return '🌙';
    return '🏠';
}

/**
 * Determines if a team is currently working based on shift times and current time
 */
export function isCurrentlyWorking(
    shift: { code: string; start: number | null; end: number | null },
    date: Dayjs,
    currentTime: Dayjs,
): boolean {
    if (!shift.start || !shift.end) return false;

    const shiftDay = getCurrentShiftDay(currentTime);
    if (!shiftDay.isSame(date, 'day')) return false;

    const hour = currentTime.hour();

    // Night shift spans midnight
    if (shift.code === 'N') {
        return hour >= shift.start || hour < shift.end;
    }

    return hour >= shift.start && hour < shift.end;
}
