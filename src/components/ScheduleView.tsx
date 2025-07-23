import dayjs, { type Dayjs } from 'dayjs';
import { Badge, Button, Card, Table } from 'react-bootstrap';
import { CONFIG } from '../utils/config';
import { calculateShift, formatDateCode } from '../utils/shiftCalculations';
import { getShiftClassName } from '../utils/shiftStyles';

interface ScheduleViewProps {
    selectedTeam: number | null;
    currentDate: Dayjs;
    setCurrentDate: (date: Dayjs) => void;
}

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

    // Generate 7 days starting from current date
    const weekDays = Array.from({ length: 7 }, (_, i) =>
        currentDate.add(i, 'day'),
    );

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Schedule Overview</h6>
                <fieldset className="btn-group">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handlePrevious}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleCurrent}
                    >
                        Current
                    </Button>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </fieldset>
            </Card.Header>
            <Card.Body>
                {selectedTeam && (
                    <div className="mb-3">
                        <strong>Team {selectedTeam} Schedule:</strong>
                        <div className="text-muted small">
                            Week starting {currentDate.format('MMM D, YYYY')}
                        </div>
                    </div>
                )}

                <div className="table-responsive">
                    <Table className="schedule-table table-sm">
                        <thead>
                            <tr>
                                <th className="team-header">Team</th>
                                {weekDays.map((day) => {
                                    const isToday = day.isSame(dayjs(), 'day');
                                    return (
                                        <th
                                            key={day.format('YYYY-MM-DD')}
                                            className={`text-center ${isToday ? 'table-primary' : ''}`}
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
