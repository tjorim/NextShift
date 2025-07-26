import dayjs, { type Dayjs } from 'dayjs';
import {
    Badge,
    Button,
    Card,
    Form,
    OverlayTrigger,
    Table,
    Tooltip,
} from 'react-bootstrap';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { CONFIG } from '../utils/config';
import { calculateShift, formatDateCode } from '../utils/shiftCalculations';
import { getShiftClassName } from '../utils/shiftStyles';

interface ScheduleViewProps {
    selectedTeam: number | null;
    currentDate: Dayjs;
    setCurrentDate: (date: Dayjs) => void;
}

/**
 * Renders a weekly schedule table for all teams, allowing users to view, navigate, and select weeks using buttons, a date picker, or keyboard shortcuts.
 *
 * The component displays each team's shift assignments for the selected week, highlights the current day and selected team, and provides accessible ARIA labels for navigation and table elements. Users can move between weeks, jump to the current week, or select a specific date to update the schedule view.
 *
 * @param selectedTeam - The team number currently selected, or null if no team is selected.
 * @param currentDate - The date used to determine the week displayed.
 * @param setCurrentDate - Function to update the current date in the schedule view.
 */
export function ScheduleView({
    selectedTeam: inputSelectedTeam,
    currentDate,
    setCurrentDate,
}: ScheduleViewProps) {
    // Validate and sanitize selectedTeam prop
    let selectedTeam = inputSelectedTeam;
    if (
        typeof selectedTeam === 'number' &&
        (selectedTeam < 1 || selectedTeam > CONFIG.TEAMS_COUNT)
    ) {
        console.warn(
            `Invalid team number: ${selectedTeam}. Expected 1-${CONFIG.TEAMS_COUNT}`,
        );
        selectedTeam = null;
    }
    const isMyTeam = (teamNumber: number) => {
        return selectedTeam === teamNumber ? 'my-team' : '';
    };

    const handlePrevious = () => {
        setCurrentDate(currentDate.subtract(7, 'day'));
    };

    const handleNext = () => {
        setCurrentDate(currentDate.add(7, 'day'));
    };

    const handleCurrent = () => {
        setCurrentDate(dayjs());
    };

    const handleDateChange = (dateString: string) => {
        if (dateString) {
            setCurrentDate(dayjs(dateString));
        }
    };

    // Generate Monday-Sunday week containing the current date
    const startOfWeek = currentDate.startOf('isoWeek'); // Monday (ISO week)
    const weekDays = Array.from({ length: 7 }, (_, i) =>
        startOfWeek.add(i, 'day'),
    );

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onToday: handleCurrent,
        onPrevious: handlePrevious,
        onNext: handleNext,
    });

    return (
        <Card>
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Schedule Overview</h6>
                    <fieldset
                        className="btn-group"
                        aria-label="Week navigation"
                    >
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handlePrevious}
                            aria-label="Go to previous week"
                        >
                            <i className="bi bi-chevron-left me-1"></i>
                            Previous
                        </Button>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={handleCurrent}
                            aria-label="Go to current week"
                        >
                            <i className="bi bi-house me-1"></i>
                            This Week
                        </Button>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleNext}
                            aria-label="Go to next week"
                        >
                            Next
                            <i className="bi bi-chevron-right ms-1"></i>
                        </Button>
                    </fieldset>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <Form.Label
                            htmlFor="datePicker"
                            className="mb-0 small text-muted"
                        >
                            <i className="bi bi-calendar3 me-1"></i>
                            Jump to date:
                        </Form.Label>
                        <Form.Control
                            type="date"
                            id="datePicker"
                            size="sm"
                            value={currentDate.format('YYYY-MM-DD')}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="date-picker-auto"
                        />
                    </div>
                    <div className="small text-muted">
                        Keyboard: ← → arrows, Ctrl+H (this week)
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                {selectedTeam && (
                    <div className="mb-3">
                        <strong>Team {selectedTeam} Schedule:</strong>
                        <div className="text-muted small">
                            Week of {startOfWeek.format('MMM D')} -{' '}
                            {startOfWeek.add(6, 'day').format('MMM D, YYYY')}
                        </div>
                    </div>
                )}

                <div className="table-responsive">
                    <Table
                        className="schedule-table table-sm"
                        aria-label={`Schedule for week of ${startOfWeek.format('MMM D')} - ${startOfWeek.add(6, 'day').format('MMM D, YYYY')}`}
                    >
                        <thead>
                            <tr>
                                <th className="team-header">Team</th>
                                {weekDays.map((day) => {
                                    const isToday = day.isSame(dayjs(), 'day');
                                    return (
                                        <th
                                            key={day.format('YYYY-MM-DD')}
                                            className={`text-center ${isToday ? 'table-primary' : ''}`}
                                            aria-label={`${day.format('dddd, MMM D')}${isToday ? ' (today)' : ''}`}
                                        >
                                            <div className="fw-semibold">
                                                {day.format('ddd')}
                                            </div>
                                            <div className="small text-muted">
                                                <OverlayTrigger
                                                    placement="bottom"
                                                    overlay={
                                                        <Tooltip
                                                            id={`date-tooltip-${day.format('YYYY-MM-DD')}`}
                                                        >
                                                            <strong>
                                                                Date Code:{' '}
                                                                {formatDateCode(
                                                                    day,
                                                                )}
                                                            </strong>
                                                            <br />
                                                            Format: YYWW.D
                                                            <br />
                                                            YY = Year{' '}
                                                            {day.format('YY')}
                                                            <br />
                                                            WW = Week{' '}
                                                            {day.format('WW')}
                                                            <br />D = Day{' '}
                                                            {day.format('d')} (
                                                            {day.format('ddd')})
                                                        </Tooltip>
                                                    }
                                                >
                                                    <span className="help-underline">
                                                        {formatDateCode(day)}
                                                    </span>
                                                </OverlayTrigger>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from(
                                { length: CONFIG.TEAMS_COUNT },
                                (_, i) => i + 1,
                            ).map((teamNumber) => (
                                <tr
                                    key={teamNumber}
                                    className={isMyTeam(teamNumber)}
                                    aria-label={`Team ${teamNumber}${selectedTeam === teamNumber ? ' (your team)' : ''}`}
                                >
                                    <td className="team-header">
                                        <strong>Team {teamNumber}</strong>
                                    </td>
                                    {weekDays.map((day) => {
                                        const shift = calculateShift(
                                            day,
                                            teamNumber,
                                        );
                                        const isToday = day.isSame(
                                            dayjs(),
                                            'day',
                                        );

                                        return (
                                            <td
                                                key={day.format('YYYY-MM-DD')}
                                                className={`text-center ${isToday ? 'table-primary' : ''}`}
                                                aria-label={`Team ${teamNumber} on ${day.format('dddd')}: ${shift.isWorking ? shift.name : 'Off'}`}
                                            >
                                                {shift.isWorking && (
                                                    <OverlayTrigger
                                                        placement="bottom"
                                                        overlay={
                                                            <Tooltip
                                                                id={`schedule-tooltip-${teamNumber}-${day.format('YYYY-MM-DD')}`}
                                                            >
                                                                <strong>
                                                                    Shift:{' '}
                                                                    {shift.code}
                                                                </strong>
                                                                <br />
                                                                {shift.code ===
                                                                    'M' &&
                                                                    'Morning shift (7:00-15:00)'}
                                                                {shift.code ===
                                                                    'E' &&
                                                                    'Evening shift (15:00-23:00)'}
                                                                {shift.code ===
                                                                    'N' &&
                                                                    'Night shift (23:00-7:00)'}
                                                                <br />
                                                                <em>
                                                                    {shift.name}{' '}
                                                                    -{' '}
                                                                    {
                                                                        shift.hours
                                                                    }
                                                                </em>
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <Badge
                                                            className={`shift-code cursor-help ${getShiftClassName(shift.code)}`}
                                                        >
                                                            {shift.code}
                                                        </Badge>
                                                    </OverlayTrigger>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
}
