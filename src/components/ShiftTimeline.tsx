import type { Dayjs } from 'dayjs';
import { useId } from 'react';
import Badge from 'react-bootstrap/Badge';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import type { ShiftResult } from '../utils/shiftCalculations';
import { getAllTeamsShifts, getShiftByCode } from '../utils/shiftCalculations';

interface TimelineData {
    prevShift: ShiftResult | null;
    currentShift: ShiftResult;
    nextShift: ShiftResult | null;
}

function computeShiftTimeline(
    today: Dayjs,
    currentWorkingTeam: ShiftResult,
): TimelineData {
    // Get all teams for today to build timeline
    const allTeamsToday = getAllTeamsShifts(today);
    const workingTeams = allTeamsToday.filter((team) => team.shift.isWorking);

    // Sort by shift start time to create timeline
    const timeline = workingTeams.sort((a, b) => {
        const startA = a.shift.start || 0;
        const startB = b.shift.start || 0;
        return startA - startB;
    });

    const currentIndex = timeline.findIndex(
        (team) => team.teamNumber === currentWorkingTeam.teamNumber,
    );

    let prevShift: ShiftResult | null = null;

    // Check if there's a previous shift in today's timeline
    if (currentIndex > 0) {
        prevShift = timeline[currentIndex - 1] ?? null;
    } else {
        // Current shift is the first of the day, look at yesterday's last shift
        const yesterday = today.subtract(1, 'day');
        const allTeamsYesterday = getAllTeamsShifts(yesterday);
        const workingTeamsYesterday = allTeamsYesterday.filter(
            (team) => team.shift.isWorking,
        );

        if (workingTeamsYesterday.length > 0) {
            // Sort yesterday's shifts and get the last one (latest start time)
            const yesterdayTimeline = workingTeamsYesterday.sort((a, b) => {
                const startA = a.shift.start || 0;
                const startB = b.shift.start || 0;
                return startB - startA; // Descending order to get latest first
            });
            prevShift = yesterdayTimeline[0] ?? null;
        }
    }

    let nextShift: ShiftResult | null = null;

    // Check if there's a next shift in today's timeline
    if (currentIndex < timeline.length - 1) {
        nextShift = timeline[currentIndex + 1] ?? null;
    } else {
        // Current shift is the last of the day, look at tomorrow's first shift
        const tomorrow = today.add(1, 'day');
        const allTeamsTomorrow = getAllTeamsShifts(tomorrow);
        const workingTeamsTomorrow = allTeamsTomorrow.filter(
            (team) => team.shift.isWorking,
        );

        if (workingTeamsTomorrow.length > 0) {
            // Sort tomorrow's shifts and get the first one (earliest start time)
            const tomorrowTimeline = workingTeamsTomorrow.sort((a, b) => {
                const startA = a.shift.start || 0;
                const startB = b.shift.start || 0;
                return startA - startB;
            });
            nextShift = tomorrowTimeline[0] ?? null;
        }
    }

    return {
        prevShift,
        currentShift: currentWorkingTeam,
        nextShift,
    };
}

interface ShiftTimelineProps {
    currentWorkingTeam: ShiftResult;
    today: Dayjs;
}

/**
 * Displays today's shift timeline showing the sequence of working teams
 *
 * @param currentWorkingTeam - The team currently working
 * @param today - Current date for timeline calculation
 */
export function ShiftTimeline({
    currentWorkingTeam,
    today,
}: ShiftTimelineProps) {
    // Generate unique ID for tooltip to avoid HTML ID conflicts
    const timelineTooltipId = useId();
    const { prevShift, nextShift } = computeShiftTimeline(
        today,
        currentWorkingTeam,
    );

    return (
        <div className="card-timeline timeline-container">
            <div className="timeline-header text-center">
                <i className="bi bi-clock me-2" aria-hidden="true"></i>
                Today's Shift Timeline
            </div>
            <div className="d-flex timeline-flow flex-wrap">
                {prevShift && (
                    <div className="timeline-team">
                        <Badge
                            bg="light"
                            text="dark"
                            className="timeline-badge"
                        >
                            T{prevShift.teamNumber}
                        </Badge>
                        <div className="timeline-code">
                            {prevShift.shift.code}
                        </div>
                    </div>
                )}
                {prevShift && <span className="timeline-arrow">→</span>}
                <div className="timeline-team">
                    <OverlayTrigger
                        placement="bottom"
                        overlay={
                            <Tooltip id={timelineTooltipId}>
                                <strong>Currently Active</strong>
                                <br />
                                {currentWorkingTeam.shift.name}
                                <br />
                                {currentWorkingTeam.shift.hours}
                            </Tooltip>
                        }
                    >
                        <Badge
                            className={`${getShiftByCode(currentWorkingTeam.shift.code).className} timeline-current-badge timeline-badge`}
                        >
                            T{currentWorkingTeam.teamNumber}
                        </Badge>
                    </OverlayTrigger>
                    <div className="timeline-code">
                        {currentWorkingTeam.shift.code}
                        <OverlayTrigger
                            placement="bottom"
                            overlay={
                                <Tooltip id={`${timelineTooltipId}-live`}>
                                    <strong>📡 Live Updates</strong>
                                    <br />
                                    Data refreshes every minute
                                </Tooltip>
                            }
                        >
                            <i className="bi bi-broadcast text-success live-indicator ms-1"></i>
                        </OverlayTrigger>
                    </div>
                </div>
                {nextShift && <span className="timeline-arrow">→</span>}
                {nextShift && (
                    <div className="timeline-team">
                        <Badge
                            bg="light"
                            text="dark"
                            className="timeline-badge"
                        >
                            T{nextShift.teamNumber}
                        </Badge>
                        <div className="timeline-code">
                            {nextShift.shift.code}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
