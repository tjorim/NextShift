import dayjs from 'dayjs';
import { useMemo } from 'react';
import {
    Badge,
    Button,
    Card,
    Col,
    OverlayTrigger,
    ProgressBar,
    Row,
    Spinner,
    Tooltip,
} from 'react-bootstrap';
import { useCountdown } from '../hooks/useCountdown';
import { CONFIG } from '../utils/config';
import type {
    NextShiftResult,
    OffDayProgress,
    ShiftResult,
} from '../utils/shiftCalculations';
import {
    calculateShift,
    formatDateCode,
    getAllTeamsShifts,
    getCurrentShiftDay,
    getNextShift,
    getOffDayProgress,
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
    // Validate and sanitize selectedTeam prop
    const validatedTeam =
        typeof selectedTeam === 'number' &&
        selectedTeam >= 1 &&
        selectedTeam <= CONFIG.TEAMS_COUNT
            ? selectedTeam
            : null;

    if (selectedTeam !== null && validatedTeam === null) {
        console.warn(
            `Invalid team number: ${selectedTeam}. Expected 1-${CONFIG.TEAMS_COUNT}`,
        );
    }
    // Always use today's date for current status
    const today = dayjs();

    // Calculate current shift for today
    // biome-ignore lint/correctness/useExhaustiveDependencies: Using minute-based ISO string to limit recalculation to once per minute instead of every render
    const currentShift = useMemo((): ShiftResult | null => {
        if (!validatedTeam) return null;

        const shiftDay = getCurrentShiftDay(today);
        const shift = calculateShift(shiftDay, validatedTeam);

        return {
            date: shiftDay,
            shift,
            code: getShiftCode(shiftDay, validatedTeam),
            teamNumber: validatedTeam,
        };
    }, [validatedTeam, today.startOf('minute').toISOString()]);

    // Calculate next shift from today
    // biome-ignore lint/correctness/useExhaustiveDependencies: Using minute-based ISO string to limit recalculation to once per minute instead of every render
    const nextShift = useMemo((): NextShiftResult | null => {
        if (!validatedTeam) return null;
        return getNextShift(today, validatedTeam);
    }, [validatedTeam, today.startOf('minute').toISOString()]);

    // Find which team is currently working
    // biome-ignore lint/correctness/useExhaustiveDependencies: Using minute-based ISO string to limit recalculation to once per minute instead of every render
    const currentWorkingTeam = useMemo((): ShiftResult | null => {
        const allTeamsToday = getAllTeamsShifts(today);
        const currentHour = today.hour();

        // Find team that is working right now based on current time
        const workingTeam = allTeamsToday.find((teamShift) => {
            if (!teamShift.shift.isWorking) return false;

            const { start, end } = teamShift.shift;
            if (start === null || end === null) return false;

            // Handle night shift that crosses midnight
            if (start > end) {
                // Night shift: 23:00 to 07:00 (next day)
                return currentHour >= start || currentHour < end;
            } else {
                // Day/Evening shift: normal range
                return currentHour >= start && currentHour < end;
            }
        });

        return workingTeam || null;
    }, [today.startOf('minute').toISOString()]);

    // Calculate off-day progress when team is off
    // biome-ignore lint/correctness/useExhaustiveDependencies: Using minute-based ISO string to limit recalculation to once per minute instead of every render
    const offDayProgress = useMemo((): OffDayProgress | null => {
        if (!validatedTeam) return null;
        return getOffDayProgress(today, validatedTeam);
    }, [validatedTeam, today.startOf('minute').toISOString()]);

    // Calculate next shift start time for countdown
    const nextShiftStartTime = useMemo(() => {
        if (!nextShift || !nextShift.shift.start) return null;

        // Create datetime for the shift start
        const shiftDate = nextShift.date;
        const startTime = shiftDate
            .hour(nextShift.shift.start)
            .minute(0)
            .second(0);

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
                                <OverlayTrigger
                                    placement="bottom"
                                    overlay={
                                        <Tooltip id="date-code-tooltip">
                                            <strong>Date Format: YYWW.D</strong>
                                            <br />
                                            YY = Year (2-digit)
                                            <br />
                                            WW = Week number
                                            <br />D = Weekday (1=Mon, 7=Sun)
                                            <br />
                                            <em>
                                                Today: {formatDateCode(today)}
                                            </em>
                                        </Tooltip>
                                    }
                                >
                                    <span
                                        style={{
                                            cursor: 'help',
                                            textDecoration: 'underline dotted',
                                        }}
                                    >
                                        {formatDateCode(today)}
                                    </span>
                                </OverlayTrigger>
                            </div>

                            {/* Show which team is currently working */}
                            {currentWorkingTeam && (
                                <div className="mb-3 p-2 bg-light rounded">
                                    <div className="small text-muted mb-1">
                                        Currently Working:
                                    </div>
                                    <OverlayTrigger
                                        placement="bottom"
                                        overlay={
                                            <Tooltip id="working-team-tooltip">
                                                <strong>
                                                    Shift Code:{' '}
                                                    {
                                                        currentWorkingTeam.shift
                                                            .code
                                                    }
                                                </strong>
                                                <br />M = Morning (7:00-15:00)
                                                <br />E = Evening (15:00-23:00)
                                                <br />N = Night (23:00-7:00)
                                                <br />O = Off duty
                                            </Tooltip>
                                        }
                                    >
                                        <Badge
                                            className={`${getShiftClassName(currentWorkingTeam.shift.code)}`}
                                            style={{ cursor: 'help' }}
                                        >
                                            Team {currentWorkingTeam.teamNumber}
                                            : {currentWorkingTeam.shift.name}
                                        </Badge>
                                    </OverlayTrigger>
                                    <div className="small text-muted mt-1">
                                        {currentWorkingTeam.shift.hours}
                                    </div>
                                </div>
                            )}

                            <div className="mb-3">
                                {isLoading ? (
                                    <div className="d-flex align-items-center gap-2">
                                        <Spinner animation="border" size="sm" />
                                        <span className="text-muted">
                                            Updating...
                                        </span>
                                    </div>
                                ) : validatedTeam && currentShift ? (
                                    <div>
                                        <OverlayTrigger
                                            placement="bottom"
                                            overlay={
                                                <Tooltip id="team-shift-tooltip">
                                                    <strong>
                                                        Your Team Shift
                                                    </strong>
                                                    <br />
                                                    Code:{' '}
                                                    <strong>
                                                        {
                                                            currentShift.shift
                                                                .code
                                                        }
                                                    </strong>
                                                    <br />
                                                    {currentShift.shift.code ===
                                                        'M' &&
                                                        'Morning shift (7:00-15:00)'}
                                                    {currentShift.shift.code ===
                                                        'E' &&
                                                        'Evening shift (15:00-23:00)'}
                                                    {currentShift.shift.code ===
                                                        'N' &&
                                                        'Night shift (23:00-7:00)'}
                                                    {currentShift.shift.code ===
                                                        'O' &&
                                                        'Off duty - rest day'}
                                                    <br />
                                                    <em>
                                                        Full code:{' '}
                                                        {currentShift.code}
                                                    </em>
                                                </Tooltip>
                                            }
                                        >
                                            <Badge
                                                className={`shift-code shift-badge-lg ${getShiftClassName(currentShift.shift.code)}`}
                                                style={{ cursor: 'help' }}
                                            >
                                                Team {validatedTeam}:{' '}
                                                {currentShift.shift.name}
                                            </Badge>
                                        </OverlayTrigger>
                                        {currentShift.shift.hours && (
                                            <div className="small text-muted mt-1">
                                                {currentShift.shift.hours}
                                            </div>
                                        )}
                                        {!currentShift.shift.isWorking &&
                                            offDayProgress && (
                                                <div className="mt-2">
                                                    <div className="small text-muted mb-1">
                                                        Off Day Progress: Day{' '}
                                                        {offDayProgress.current}{' '}
                                                        of{' '}
                                                        {offDayProgress.total}
                                                    </div>
                                                    <ProgressBar
                                                        now={
                                                            (offDayProgress.current /
                                                                offDayProgress.total) *
                                                            100
                                                        }
                                                        variant="info"
                                                        style={{
                                                            height: '8px',
                                                        }}
                                                        aria-label={`Day ${offDayProgress.current} of ${offDayProgress.total} off days`}
                                                    />
                                                </div>
                                            )}
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
                                ) : validatedTeam && nextShift ? (
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
                                ) : validatedTeam ? (
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
