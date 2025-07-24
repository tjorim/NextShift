import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { useCountdown } from '../hooks/useCountdown';
import type { NextShiftResult, ShiftResult } from '../utils/shiftCalculations';
import {
    calculateShift,
    formatDateCode,
    getCurrentShiftDay,
    getNextShift,
    getShiftCode,
} from '../utils/shiftCalculations';
import { getShiftClassName } from '../utils/shiftStyles';

interface CurrentStatusProps {
    selectedTeam: number | null;
    onChangeTeam: () => void;
    onShowWhoIsWorking?: () => void;
    isLoading?: boolean;
}

/**
 * Renders the current and upcoming work shift details for a selected team, including a live countdown to the next shift.
 *
 * Displays today's date, the current shift with team and shift information, and the next scheduled shift with a countdown timer. Provides controls to change the team and, if available, view who is currently working. Shows loading indicators when shift data is being fetched.
 *
 * @param selectedTeam - The team number to display shift information for, or null if no team is selected.
 * @param onChangeTeam - Callback invoked when the user requests to change the team.
 * @param onShowWhoIsWorking - Optional callback to show the current working members.
 * @param isLoading - Optional flag to indicate loading state.
 *
 * @returns A React component displaying the current and next shift status for the selected team.
 */
export function CurrentStatus({
    selectedTeam,
    onChangeTeam,
    onShowWhoIsWorking,
    isLoading = false,
}: CurrentStatusProps) {
    // Always use today's date for current status
    const today = dayjs();

    // Calculate current shift for today
    // biome-ignore lint/correctness/useExhaustiveDependencies: Using minute-based ISO string to limit recalculation to once per minute instead of every render
    const currentShift = useMemo((): ShiftResult | null => {
        if (!selectedTeam) return null;

        const shiftDay = getCurrentShiftDay(today);
        const shift = calculateShift(shiftDay, selectedTeam);

        // Return null if calculateShift returns null
        if (!shift) return null;

        return {
            date: shiftDay,
            shift,
            code: getShiftCode(shiftDay, selectedTeam),
            teamNumber: selectedTeam,
        };
    }, [selectedTeam, today.startOf('minute').toISOString()]);

    // Calculate next shift from today
    // biome-ignore lint/correctness/useExhaustiveDependencies: Using minute-based ISO string to limit recalculation to once per minute instead of every render
    const nextShift = useMemo((): NextShiftResult | null => {
        if (!selectedTeam) return null;
        return getNextShift(today, selectedTeam);
    }, [selectedTeam, today.startOf('minute').toISOString()]);

    // Calculate next shift start time for countdown
    const nextShiftStartTime = useMemo(() => {
        if (!nextShift || !nextShift.shift.start) return null;

        // Create datetime for the shift start
        const shiftDate = nextShift.date;
        let startTime = shiftDate
            .hour(nextShift.shift.start)
            .minute(0)
            .second(0);

        // If it's night shift (23:00), it starts on the previous day
        if (nextShift.shift.code === 'N' && nextShift.shift.start === 23) {
            startTime = shiftDate
                .subtract(1, 'day')
                .hour(23)
                .minute(0)
                .second(0);
        }

        return startTime;
    }, [nextShift]);

    // Countdown to next shift
    const countdown = useCountdown(nextShiftStartTime);
    return (
        <div className="col-12 mb-4">
            <Card>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Card.Title className="mb-0">Current Status</Card.Title>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={onShowWhoIsWorking}
                                title="See who's working right now"
                                disabled={!onShowWhoIsWorking}
                            >
                                👥 Who's On?
                            </Button>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={onChangeTeam}
                            >
                                Change Team
                            </Button>
                        </div>
                    </div>
                    <Row>
                        <Col md={6}>
                            <div className="h6 text-muted mb-2">
                                {formatDateCode(today)}
                            </div>
                            <div className="mb-3">
                                {isLoading ? (
                                    <div className="d-flex align-items-center gap-2">
                                        <Spinner animation="border" size="sm" />
                                        <span className="text-muted">
                                            Updating...
                                        </span>
                                    </div>
                                ) : selectedTeam && currentShift ? (
                                    <div>
                                        <Badge
                                            className={`shift-code shift-badge-lg ${getShiftClassName(currentShift.shift.code)}`}
                                        >
                                            Team {selectedTeam}:{' '}
                                            {currentShift.shift.name}
                                        </Badge>
                                        <div className="small text-muted mt-1">
                                            {currentShift.shift.hours}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-muted">
                                        Please select your team to see current
                                        status
                                    </div>
                                )}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="text-muted">
                                {isLoading ? (
                                    <div className="d-flex align-items-center gap-2">
                                        <Spinner animation="border" size="sm" />
                                        <span>Calculating next shift...</span>
                                    </div>
                                ) : selectedTeam && nextShift ? (
                                    <div>
                                        <strong>Next Shift:</strong>
                                        <br />
                                        {nextShift.date.format('MMM D')} -{' '}
                                        {nextShift.shift.name}
                                        <br />
                                        <small>{nextShift.shift.hours}</small>
                                        {countdown &&
                                            !countdown.isExpired &&
                                            nextShiftStartTime && (
                                                <>
                                                    <br />
                                                    <Badge
                                                        bg="info"
                                                        className="mt-1"
                                                    >
                                                        ⏰ Starts in{' '}
                                                        {countdown.formatted}
                                                    </Badge>
                                                </>
                                            )}
                                    </div>
                                ) : selectedTeam ? (
                                    <div>
                                        Next shift information not available
                                    </div>
                                ) : (
                                    <div>
                                        Select your team to see next shift
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}
