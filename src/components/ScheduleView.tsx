import dayjs, { type Dayjs } from 'dayjs';
import React from 'react';
import { Badge, Button, Card, Table } from 'react-bootstrap';
import { formatDateCode, getAllTeamsShifts } from '../utils/shiftCalculations';

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
    const getShiftClassName = (shiftCode: string) => {
        switch (shiftCode) {
            case 'M':
                return 'shift-morning';
            case 'E':
                return 'shift-evening';
            case 'N':
                return 'shift-night';
            default:
                return 'shift-off';
        }
    };

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
        <div className="tab-pane fade" id="schedule" role="tabpanel">
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Schedule Overview</h6>
                    <div className="btn-group" role="group">
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
                    </div>
                </Card.Header>
                <Card.Body>
                    {selectedTeam && (
                        <div className="mb-3">
                            <strong>Team {selectedTeam} Schedule:</strong>
                            <div className="text-muted small">
                                Week starting{' '}
                                {currentDate.format('MMM D, YYYY')}
                            </div>
                        </div>
                    )}

                    <div className="table-responsive">
                        <Table className="schedule-table table-sm">
                            <thead>
                                <tr>
                                    <th className="team-header">Team</th>
                                    {weekDays.map((day) => (
                                        <th
                                            key={day.format('YYYY-MM-DD')}
                                            className="text-center"
                                        >
                                            <div>{day.format('ddd')}</div>
                                            <div className="small text-muted">
                                                {formatDateCode(day)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5].map((teamNumber) => (
                                    <tr
                                        key={teamNumber}
                                        className={isMyTeam(teamNumber)}
                                    >
                                        <td className="team-header">
                                            <strong>Team {teamNumber}</strong>
                                        </td>
                                        {weekDays.map((day) => {
                                            const dayShifts =
                                                getAllTeamsShifts(day);
                                            const teamShift = dayShifts.find(
                                                (s) =>
                                                    s.teamNumber === teamNumber,
                                            );
                                            return (
                                                <td
                                                    key={day.format(
                                                        'YYYY-MM-DD',
                                                    )}
                                                    className="text-center"
                                                >
                                                    {teamShift && (
                                                        <Badge
                                                            className={`shift-code ${getShiftClassName(teamShift.shift.code)}`}
                                                        >
                                                            {
                                                                teamShift.shift
                                                                    .code
                                                            }
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
        </div>
    );
}
