import type { ShiftType } from './shiftCalculations';

/**
 * Returns the CSS class name for a given shift code
 * @param shiftCode - The shift code ('M', 'E', 'N', 'O')
 * @returns The corresponding CSS class name
 */
export function getShiftClassName(shiftCode: ShiftType): string {
    switch (shiftCode) {
        case 'M':
            return 'shift-morning';
        case 'E':
            return 'shift-evening';
        case 'N':
            return 'shift-night';
        default:
            return 'shift-off';
    }
}
