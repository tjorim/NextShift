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
