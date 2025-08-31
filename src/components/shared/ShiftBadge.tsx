import Badge from 'react-bootstrap/Badge';
import type { ShiftType } from '../../utils/shiftCalculations';
import { getShiftByCode } from '../../utils/shiftCalculations';

interface ShiftBadgeProps {
    shiftCode: ShiftType;
    shiftName: string;
    teamNumber: number;
    className?: string;
    size?: 'sm' | 'lg';
}

/**
 * Reusable badge component for displaying team shift information.
 * Automatically applies shift-specific styling based on shift code.
 *
 * @param shiftCode - The shift type code (M, E, N, O)
 * @param shiftName - Display name of the shift
 * @param teamNumber - Team number (1-5)
 * @param className - Additional CSS classes
 * @param size - Badge size ('sm' or 'lg')
 */
export function ShiftBadge({
    shiftCode,
    shiftName,
    teamNumber,
    className = '',
    size = 'lg',
}: ShiftBadgeProps) {
    const shiftMeta = getShiftByCode(shiftCode);
    const sizeClass = size === 'lg' ? 'shift-badge-lg' : '';

    return (
        <Badge
            className={`shift-code ${sizeClass} ${shiftMeta?.className ?? ''} ${className}`.trim()}
        >
            Team {teamNumber}: {shiftName}
        </Badge>
    );
}
