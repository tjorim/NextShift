import dayjs, { type Dayjs } from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { CONFIG } from './config';

// Initialize dayjs plugins
dayjs.extend(weekOfYear);

export type ShiftType = 'M' | 'E' | 'N' | 'O';

export interface Shift {
    code: ShiftType;
    name: string;
    hours: string;
    start: number | null;
    end: number | null;
}

export interface ShiftResult {
    date: Dayjs;
    shift: Shift;
    code: string;
    teamNumber: number;
}

export interface NextShiftResult {
    date: Dayjs;
    shift: Shift;
    code: string;
}

// Shift definitions
export const SHIFTS: Record<string, Shift> = {
    MORNING: {
        code: 'M',
        name: 'Morning',
        hours: '07:00-15:00',
        start: 7,
        end: 15,
    },
    EVENING: {
        code: 'E',
        name: 'Evening',
        hours: '15:00-23:00',
        start: 15,
        end: 23,
    },
    NIGHT: {
        code: 'N',
        name: 'Night',
        hours: '23:00-07:00',
        start: 23,
        end: 7,
    },
    OFF: {
        code: 'O',
        name: 'Off',
        hours: 'Not working',
        start: null,
        end: null,
    },
} as const;

/**
 * Calculates the shift for a given team on a specific date.
 * @param date - The date to calculate the shift for
 * @param teamNumber - The team number (1-5)
 * @returns The shift information for the team on that date
 */
export function calculateShift(
    date: string | Date | Dayjs,
    teamNumber: number,
): Shift {
    const targetDate = dayjs(date).startOf('day');
    const referenceDate = dayjs(CONFIG.REFERENCE_DATE).startOf('day');

    // Calculate days since reference
    const daysSinceReference = targetDate.diff(referenceDate, 'day');

    // Calculate team offset (each team starts 2 days later)
    const teamOffset = (teamNumber - CONFIG.REFERENCE_TEAM) * 2;

    // Calculate position in 10-day cycle
    const adjustedDays = daysSinceReference - teamOffset;
    const cyclePosition =
        ((adjustedDays % CONFIG.SHIFT_CYCLE_DAYS) + CONFIG.SHIFT_CYCLE_DAYS) %
        CONFIG.SHIFT_CYCLE_DAYS;

    // Determine shift based on cycle position
    if (cyclePosition < 2) {
        return SHIFTS.MORNING;
    }
    if (cyclePosition < 4) {
        return SHIFTS.EVENING;
    }
    if (cyclePosition < 6) {
        return SHIFTS.NIGHT;
    }
    return SHIFTS.OFF;
}

/**
 * Formats a date into the YYWW.D format
 * @param date - The date to format
 * @returns The formatted date code (e.g., "2520.2")
 */
export function formatDateCode(date: string | Date | Dayjs): string {
    const d = dayjs(date);
    const year = d.year().toString().slice(-2);
    const week = d.week().toString().padStart(2, '0');
    const day = d.day() === 0 ? 7 : d.day(); // Sunday = 7, Monday = 1, etc.
    return `${year}${week}.${day}`;
}

/**
 * Returns the current shift day for a given date
 * @param date - The date to check
 * @returns The current shift day
 */
export function getCurrentShiftDay(date: string | Date | Dayjs): Dayjs {
    const current = dayjs(date);
    const hour = current.hour();

    // If it's before 7 AM, we're in the previous day's night shift
    if (hour < 7) {
        return current.subtract(1, 'day');
    }

    return current;
}

/**
 * Returns the shift code for a given date and team, adjusting for night shifts to use the previous day's date code.
 * @param date - The date for which to generate the shift code
 * @param teamNumber - The team number
 * @returns The shift code in the format YYWW.DX (e.g., "2520.2M")
 */
export function getShiftCode(
    date: string | Date | Dayjs,
    teamNumber: number,
): string {
    const shift = calculateShift(date, teamNumber);
    let codeDate = dayjs(date);

    // For night shifts, use the previous day's date code
    if (shift.code === 'N') {
        codeDate = codeDate.subtract(1, 'day');
    }

    const dateCode = formatDateCode(codeDate);
    return `${dateCode}${shift.code}`;
}

/**
 * Finds the next working shift for a team starting from a given date
 * @param fromDate - The date to start searching from
 * @param teamNumber - The team number
 * @returns The next shift information or null if not found within cycle
 */
export function getNextShift(
    fromDate: string | Date | Dayjs,
    teamNumber: number,
): NextShiftResult | null {
    let checkDate = dayjs(fromDate).add(1, 'day');

    for (let i = 0; i < CONFIG.SHIFT_CYCLE_DAYS; i++) {
        const shift = calculateShift(checkDate, teamNumber);
        if (shift !== SHIFTS.OFF) {
            return {
                date: checkDate,
                shift: shift,
                code: getShiftCode(checkDate, teamNumber),
            };
        }
        checkDate = checkDate.add(1, 'day');
    }

    return null;
}

/**
 * Gets all teams' shifts for a specific date
 * @param date - The date to get shifts for
 * @returns Array of shift results for all teams
 */
export function getAllTeamsShifts(date: string | Date | Dayjs): ShiftResult[] {
    const results: ShiftResult[] = [];

    for (let teamNumber = 1; teamNumber <= CONFIG.TEAMS_COUNT; teamNumber++) {
        const shift = calculateShift(date, teamNumber);
        const code = getShiftCode(date, teamNumber);

        results.push({
            date: dayjs(date),
            shift,
            code,
            teamNumber,
        });
    }

    return results;
}

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param unsafe - The unsafe string to escape
 * @returns The escaped string safe for HTML insertion
 */
export function escapeHtml(unsafe: unknown): string {
    if (typeof unsafe !== 'string') {
        return String(unsafe);
    }

    // Use native browser API if available (browser environment)
    if (typeof document !== 'undefined') {
        const div = document.createElement('div');
        div.textContent = unsafe;
        return div.innerHTML;
    }

    // Fallback for test environment (no DOM)
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
