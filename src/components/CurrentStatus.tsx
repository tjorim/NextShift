import { useMemo } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Row from 'react-bootstrap/Row';
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
import { ShiftTimeline } from './ShiftTimeline';
import { GenericStatus } from './status/GenericStatus';
import { PersonalizedStatus } from './status/PersonalizedStatus';

interface CurrentStatusProps {
    myTeam: number | null; // The user's team from onboarding
    onChangeTeam: () => void;
    onShowWhoIsWorking?: () => void;
}

/**
 * Renders the current and upcoming work shift details for the user's team, or generic shift information when no team is selected.
 *
 * When a team is selected: Displays personalized shift status, countdown timers, and off-day progress.
 * When no team is selected: Shows which team is currently working and encourages team selection for personalization.
 * Provides controls to select/change teams and view who is currently working.
 *
 * @param myTeam - The user's team number from onboarding, or null for generic view.
 * @param onChangeTeam - Callback invoked when the user requests to select/change the team.
 * @param onShowWhoIsWorking - Optional callback to show the current working members.
 *
 * @returns A React component displaying current status with team-specific or generic information.
 */
export function CurrentStatus({
    myTeam,
    onChangeTeam,
    onShowWhoIsWorking,
}: CurrentStatusProps) {
    // Validate and sanitize myTeam prop
    const validatedTeam =
        typeof myTeam === 'number' &&
        myTeam >= 1 &&
        myTeam <= CONFIG.TEAMS_COUNT
            ? myTeam
            : null;

    if (myTeam !== null && validatedTeam === null) {
        console.warn(
            `Invalid team number: ${myTeam}. Expected 1-${CONFIG.TEAMS_COUNT}`,
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

    // Calculate current shift end time for countdown (when user is currently working)
    const currentShiftEndTime = useMemo(() => {
        if (!validatedTeam || !currentShift || !currentShift.shift.isWorking)
            return null;
        if (!currentShift.shift.start || !currentShift.shift.end) return null;

        // Check if we're currently within the shift time range
        const currentHour = liveTime.hour();
        const { start, end } = currentShift.shift;

        let isCurrentlyInShift = false;
        if (start > end) {
            // Night shift: 23:00 to 07:00 (next day)
            isCurrentlyInShift = currentHour >= start || currentHour < end;
        } else {
            // Day/Evening shift: normal range
            isCurrentlyInShift = currentHour >= start && currentHour < end;
        }

        if (!isCurrentlyInShift) return null;

        const shiftDay = currentShift.date;
        const endHour = currentShift.shift.end;

        // Create datetime for the shift end
        let endTime = shiftDay.hour(endHour).minute(0).second(0);

        // Handle night shift that ends the next day (23:00-07:00)
        if (currentShift.shift.start > currentShift.shift.end) {
            // Night shift ends on the next calendar day
            endTime = endTime.add(1, 'day');
        }

        // Only return if the end time is in the future
        return endTime.isAfter(liveTime) ? endTime : null;
    }, [validatedTeam, currentShift, liveTime]);

    // Countdown to current shift end
    const currentShiftCountdown = useCountdown(currentShiftEndTime);

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
                                        <Tooltip>
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
                    {validatedTeam ? (
                        <PersonalizedStatus
                            myTeam={validatedTeam}
                            currentShift={currentShift}
                            nextShift={nextShift}
                            offDayProgress={offDayProgress}
                            countdown={countdown}
                            nextShiftStartTime={nextShiftStartTime}
                            currentShiftCountdown={currentShiftCountdown}
                        />
                    ) : (
                        <GenericStatus
                            currentWorkingTeam={currentWorkingTeam}
                        />
                    )}
                </Card.Body>
            </Card>
        </Col>
    );
}
