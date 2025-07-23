import dayjs, { type Dayjs } from 'dayjs';
import { Badge, Button, Card, Form, Table } from 'react-bootstrap';
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
 * Displays a weekly schedule overview for all teams, with navigation controls, date picker, and keyboard shortcuts.
 *
 * Renders a table showing each team's shift assignments for the selected week, highlighting the current day and selected team. Users can navigate between weeks, jump to the current week, or select a specific date. Accessibility features include ARIA labels for navigation and table elements.
 *
 * @param selectedTeam - The currently selected team number, or null if none is selected.
 * @param currentDate - The date representing the week to display.
 * @param setCurrentDate - Callback to update the current date in view.
 */
export function ScheduleView({
    selectedTeam,
    currentDate,
    setCurrentDate,
}: ScheduleViewProps) {
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
                            Previous
                        </Button>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={handleCurrent}
                            aria-label="Go to current week"
                        >
                            This Week
                        </Button>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleNext}
                            aria-label="Go to next week"
                        >
                            Next
                        </Button>
                    </fieldset>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                        <Form.Label
                            htmlFor="datePicker"
                            className="mb-0 small text-muted"
                        >
                            Jump to date:
                        </Form.Label>
                        <Form.Control
                            type="date"
                            id="datePicker"
                            size="sm"
                            value={currentDate.format('YYYY-MM-DD')}
                            onChange={(e) => handleDateChange(e.target.value)}
                            style={{ width: 'auto' }}
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
                                                {formatDateCode(day)}
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
                                                    <Badge
                                                        className={`shift-code ${getShiftClassName(shift.code)}`}
                                                    >
                                                        {shift.code}
                                                    </Badge>
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
