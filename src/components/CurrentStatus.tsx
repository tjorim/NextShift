import { useId, useMemo } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Tooltip from 'react-bootstrap/Tooltip';
import { useSettings } from '../contexts/SettingsContext';
import { useCountdown } from '../hooks/useCountdown';
import { useLiveTime } from '../hooks/useLiveTime';
import { CONFIG } from '../utils/config';
import {
    dayjs,
    formatTimeByPreference,
    formatYYWWD,
} from '../utils/dateTimeUtils';
import type {
    NextShiftResult,
    OffDayProgress,
    ShiftResult,
} from '../utils/shiftCalculations';
import {
    calculateShift,
    getAllTeamsShifts,
    getCurrentShiftDay,
    getNextShift,
    getOffDayProgress,
    getShiftCode,
} from '../utils/shiftCalculations';
import { getShiftClassName } from '../utils/shiftStyles';
import { ShiftTimeline } from './ShiftTimeline';

interface CurrentStatusProps {
    selectedTeam: number | null;
    onChangeTeam: () => void;
    onShowWhoIsWorking?: () => void;
    isLoading?: boolean;
}

/**
 * Renders the current and upcoming work shift details for a selected team, or generic shift information when no team is selected.
 *
 * When a team is selected: Displays personalized shift status, countdown timers, and off-day progress.
 * When no team is selected: Shows which team is currently working and encourages team selection for personalization.
 * Provides controls to select/change teams and view who is currently working. Shows loading indicators when appropriate.
 *
 * @param selectedTeam - The team number to display shift information for, or null for generic view.
 * @param onChangeTeam - Callback invoked when the user requests to select/change the team.
 * @param onShowWhoIsWorking - Optional callback to show the current working members.
 * @param isLoading - Optional flag to indicate loading state.
 *
 * @returns A React component displaying current status with team-specific or generic information.
 */
export function CurrentStatus({
    selectedTeam,
    onChangeTeam,
    onShowWhoIsWorking,
    isLoading = false,
}: CurrentStatusProps) {
    // Generate unique IDs for tooltips to avoid HTML ID conflicts
    const dateTooltipId = useId();
    const teamTooltipId = useId();

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
    const liveTime = useLiveTime();
    const todayMinuteKey = today.startOf('minute').toISOString();

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
    }, [validatedTeam, todayMinuteKey]);

    // Calculate next shift from today
    // biome-ignore lint/correctness/useExhaustiveDependencies: Using minute-based ISO string to limit recalculation to once per minute instead of every render
    const nextShift = useMemo((): NextShiftResult | null => {
        if (!validatedTeam) return null;
        return getNextShift(today, validatedTeam);
    }, [validatedTeam, todayMinuteKey]);

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
    }, [todayMinuteKey]);

    // Calculate off-day progress when team is off
    // biome-ignore lint/correctness/useExhaustiveDependencies: Using minute-based ISO string to limit recalculation to once per minute instead of every render
    const offDayProgress = useMemo((): OffDayProgress | null => {
        if (!validatedTeam) return null;
        return getOffDayProgress(today, validatedTeam);
    }, [validatedTeam, todayMinuteKey]);

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

    // Get current time's shift code for live display
    const currentTimeShiftCode = useMemo(() => {
        const hour = liveTime.hour();
        if (hour >= 7 && hour < 15) return 'M';
        if (hour >= 15 && hour < 23) return 'E';
        return 'N'; // 23:00-07:00
    }, [liveTime]);

    // Get the proper shift day for date code display (previous day for night shifts)
    const currentShiftDay = useMemo(() => {
        return getCurrentShiftDay(liveTime);
    }, [liveTime]);

    const { settings } = useSettings();

    return (
        <Col className="mb-4">
            <Card>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center gap-3">
                            <Card.Title className="mb-0">
                                Current Status
                            </Card.Title>
                            <div className="text-muted">
                                <OverlayTrigger
                                    placement="bottom"
                                    overlay={
                                        <Tooltip id={dateTooltipId}>
                                            <strong>Date Format: YYWW.D</strong>
                                            <br />
                                            YY = Year (2-digit)
                                            <br />
                                            WW = Week number
                                            <br />D = Weekday (1=Mon, 7=Sun)
                                            <br />
                                            <em>
                                                Today: {formatYYWWD(today)}
                                                <br />
                                                Shift Day:{' '}
                                                {formatYYWWD(currentShiftDay)}
                                            </em>
                                        </Tooltip>
                                    }
                                >
                                    <small className="help-underline">
                                        📅 {formatYYWWD(currentShiftDay)}
                                        {currentTimeShiftCode} •{' '}
                                        {liveTime.format('dddd, MMM D')} •{' '}
                                        {formatTimeByPreference(
                                            liveTime,
                                            settings.timeFormat,
                                        )}
                                    </small>
                                </OverlayTrigger>
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={onShowWhoIsWorking}
                                title="See who's working right now"
                                disabled={!onShowWhoIsWorking}
                            >
                                <i className="bi bi-people me-1"></i>
                                Who's On?
                            </Button>
                            <Button
                                variant={
                                    validatedTeam
                                        ? 'outline-secondary'
                                        : 'primary'
                                }
                                size="sm"
                                onClick={onChangeTeam}
                            >
                                <i
                                    className={`bi ${validatedTeam ? 'bi-person-gear' : 'bi-person-plus'} me-1`}
                                ></i>
                                {validatedTeam ? 'Change Team' : 'Select Team'}
                            </Button>
                        </div>
                    </div>

                    {/* Timeline Row */}
                    {currentWorkingTeam && (
                        <Row className="mb-3">
                            <Col>
                                <ShiftTimeline
                                    currentWorkingTeam={currentWorkingTeam}
                                    today={today}
                                />
                            </Col>
                        </Row>
                    )}

                    {/* Team Status Row */}
                    <Row>
                        <Col md={6}>
                            <Card className="h-100">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title
                                        as="h6"
                                        className="mb-2 text-primary"
                                    >
                                        {validatedTeam
                                            ? '🏷️ Your Team Status'
                                            : '👥 Current Status'}
                                    </Card.Title>
                                    <div className="flex-grow-1">
                                        {isLoading ? (
                                            <div className="d-flex align-items-center gap-2">
                                                <Spinner
                                                    animation="border"
                                                    size="sm"
                                                />
                                                <span className="text-muted">
                                                    Updating...
                                                </span>
                                            </div>
                                        ) : validatedTeam && currentShift ? (
                                            <div>
                                                <OverlayTrigger
                                                    placement="bottom"
                                                    overlay={
                                                        <Tooltip
                                                            id={teamTooltipId}
                                                        >
                                                            <strong>
                                                                Your Team Today
                                                            </strong>
                                                            <br />
                                                            Code:{' '}
                                                            <strong>
                                                                {
                                                                    currentShift
                                                                        .shift
                                                                        .code
                                                                }
                                                            </strong>
                                                            <br />
                                                            {currentShift.shift
                                                                .code === 'M' &&
                                                                'Morning shift (7:00-15:00)'}
                                                            {currentShift.shift
                                                                .code === 'E' &&
                                                                'Evening shift (15:00-23:00)'}
                                                            {currentShift.shift
                                                                .code === 'N' &&
                                                                'Night shift (23:00-7:00)'}
                                                            {currentShift.shift
                                                                .code === 'O' &&
                                                                'Off duty - rest day'}
                                                            <br />
                                                            <em>
                                                                Full code:{' '}
                                                                {
                                                                    currentShift.code
                                                                }
                                                            </em>
                                                        </Tooltip>
                                                    }
                                                >
                                                    <Badge
                                                        className={`shift-code shift-badge-lg cursor-help ${getShiftClassName(currentShift.shift.code)}`}
                                                    >
                                                        Team {validatedTeam}:{' '}
                                                        {
                                                            currentShift.shift
                                                                .name
                                                        }
                                                    </Badge>
                                                </OverlayTrigger>
                                                {currentShift.shift.hours && (
                                                    <div className="small text-muted mt-1">
                                                        {
                                                            currentShift.shift
                                                                .hours
                                                        }
                                                    </div>
                                                )}
                                                {!currentShift.shift
                                                    .isWorking &&
                                                    offDayProgress && (
                                                        <div className="mt-2">
                                                            <div className="small text-muted mb-1">
                                                                Off Day
                                                                Progress: Day{' '}
                                                                {
                                                                    offDayProgress.current
                                                                }{' '}
                                                                of{' '}
                                                                {
                                                                    offDayProgress.total
                                                                }
                                                            </div>
                                                            <ProgressBar
                                                                now={
                                                                    (offDayProgress.current /
                                                                        offDayProgress.total) *
                                                                    100
                                                                }
                                                                variant="info"
                                                                className="progress-thin"
                                                                aria-label={`Off day progress: ${offDayProgress.current} of ${offDayProgress.total} days`}
                                                            />
                                                        </div>
                                                    )}
                                            </div>
                                        ) : !validatedTeam ? (
                                            <div>
                                                {currentWorkingTeam ? (
                                                    <div>
                                                        <Badge
                                                            className={`shift-code shift-badge-lg ${getShiftClassName(currentWorkingTeam.shift.code)}`}
                                                        >
                                                            Team{' '}
                                                            {
                                                                currentWorkingTeam.teamNumber
                                                            }
                                                            :{' '}
                                                            {
                                                                currentWorkingTeam
                                                                    .shift.name
                                                            }
                                                        </Badge>
                                                        <div className="small text-muted mt-1">
                                                            {
                                                                currentWorkingTeam
                                                                    .shift.hours
                                                            }
                                                        </div>
                                                        <div className="small text-success mt-2">
                                                            ✅ Currently working
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-muted">
                                                        <div className="mb-2">
                                                            <Badge bg="secondary">
                                                                No teams working
                                                            </Badge>
                                                        </div>
                                                        <div className="small">
                                                            All teams are
                                                            currently off duty
                                                        </div>
                                                    </div>
                                                )}
                                                <hr className="my-3" />
                                                <div className="small text-muted">
                                                    💡 Select your team above
                                                    for personalized shift
                                                    tracking and countdown
                                                    timers
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="h-100">
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title
                                        as="h6"
                                        className="mb-2 text-success"
                                    >
                                        <i className="bi bi-arrow-right-circle me-1"></i>
                                        {validatedTeam
                                            ? 'Your Next Shift'
                                            : 'Next Activity'}
                                    </Card.Title>
                                    <div className="text-muted flex-grow-1">
                                        {isLoading ? (
                                            <div className="d-flex align-items-center gap-2">
                                                <Spinner
                                                    animation="border"
                                                    size="sm"
                                                />
                                                <span>
                                                    Calculating your next
                                                    shift...
                                                </span>
                                            </div>
                                        ) : validatedTeam && nextShift ? (
                                            <div>
                                                <div className="fw-semibold">
                                                    {nextShift.date.format(
                                                        'ddd, MMM D',
                                                    )}{' '}
                                                    - {nextShift.shift.name}
                                                </div>
                                                <div className="small text-muted">
                                                    {nextShift.shift.hours}
                                                </div>
                                                {countdown &&
                                                    !countdown.isExpired &&
                                                    nextShiftStartTime && (
                                                        <Badge
                                                            bg="info"
                                                            className="mt-2"
                                                        >
                                                            ⏰ Starts in{' '}
                                                            {
                                                                countdown.formatted
                                                            }
                                                        </Badge>
                                                    )}
                                            </div>
                                        ) : validatedTeam ? (
                                            <div>
                                                Next shift information not
                                                available
                                            </div>
                                        ) : (
                                            <div>
                                                {currentWorkingTeam ? (
                                                    <div>
                                                        <div className="fw-semibold">
                                                            Next shift change
                                                            coming soon
                                                        </div>
                                                        <div className="small">
                                                            Check the timeline
                                                            above or view all
                                                            teams in the "Today"
                                                            tab
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="fw-semibold">
                                                            Next shift starts
                                                            tomorrow
                                                        </div>
                                                        <div className="small">
                                                            View the schedule in
                                                            other tabs for
                                                            detailed timing
                                                        </div>
                                                    </div>
                                                )}
                                                <hr className="my-3" />
                                                <div className="small text-muted">
                                                    Select your team for
                                                    countdown timers and
                                                    personalized notifications
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Col>
    );
}
