import { getLocalizedShiftTime } from '../../utils/dateTimeUtils';

interface ShiftTimeDisplayProps {
    start: number | null;
    end: number | null;
    hours: string;
    timeFormat: '12h' | '24h';
    className?: string;
}

/**
 * Reusable component for displaying shift time information.
 * Uses localized time format when start/end times are available, falls back to hours string.
 *
 * @param start - Shift start hour (0-23) or null
 * @param end - Shift end hour (0-23) or null
 * @param hours - Fallback hours string (e.g., "07:00-15:00")
 * @param timeFormat - User's preferred time format ('12h' or '24h')
 * @param className - Additional CSS classes
 */
export function ShiftTimeDisplay({
    start,
    end,
    hours,
    timeFormat,
    className = '',
}: ShiftTimeDisplayProps) {
    const timeText =
        start != null && end != null
            ? getLocalizedShiftTime(start, end, timeFormat)
            : hours;

    return <span className={className}>{timeText}</span>;
}
