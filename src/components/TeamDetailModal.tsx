import { useMemo } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Tooltip from 'react-bootstrap/Tooltip';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { useTransferCalculations } from '../hooks/useTransferCalculations';
import { dayjs, getLocalizedShiftTime } from '../utils/dateTimeUtils';
import { shareAppWithContext } from '../utils/share';
import { calculateShift, getCurrentShiftDay } from '../utils/shiftCalculations';
import { getShiftClassName } from '../utils/shiftStyles';

interface TeamDetailModalProps {
    show: boolean;
    onHide: () => void;
    teamNumber: number;
}

/**
 * Team detail modal component that displays comprehensive information about a specific team.
 *
 * Features detailed views of:
 * - 7-day schedule overview with shift types and times
 * - Current status and next shift information
 * - Team statistics and patterns
 * - Quick actions for team management
 *
 * @param show - Whether the modal is visible
 * @param onHide - Callback to hide the modal
 * @param teamNumber - The team number to display details for (1-5)
 * @returns The team detail modal component
 */
export function TeamDetailModal({
    show,
    onHide,
    teamNumber,
}: TeamDetailModalProps) {
    // Generate 7-day schedule for the team
    const weekSchedule = useMemo(() => {
        const today = dayjs();
        const schedule = [];

        for (let i = 0; i < 7; i++) {
            const date = today.add(i, 'day');
            const shiftDay = getCurrentShiftDay(date);
            const shift = calculateShift(shiftDay, teamNumber);

            schedule.push({
                date,
                shift,
                isToday: i === 0,
                isTomorrow: i === 1,
            });
        }

        return schedule;
    }, [teamNumber]);

    // Calculate team statistics
    const stats = useMemo(() => {
        const workingDays = weekSchedule.filter(
            (day) => day.shift.code !== 'O',
        ).length;
        const offDays = 7 - workingDays;
        const morningShifts = weekSchedule.filter(
            (day) => day.shift.code === 'M',
        ).length;
        const eveningShifts = weekSchedule.filter(
            (day) => day.shift.code === 'E',
        ).length;
        const nightShifts = weekSchedule.filter(
            (day) => day.shift.code === 'N',
        ).length;

        return {
            workingDays,
            offDays,
            morningShifts,
            eveningShifts,
            nightShifts,
        };
    }, [weekSchedule]);

    // Find current status
    const currentStatus = weekSchedule[0];
    const nextShift = weekSchedule.find(
        (day) => day.shift.code !== 'O' && !day.isToday,
    );

    const toast = useToast();
    const { settings } = useSettings();

    // Share handler for this team
    const handleShareSchedule = async () => {
        const today = dayjs().format('YYYY-MM-DD');
        const context = `Team ${teamNumber} schedule as of ${today}`;
        await shareAppWithContext(
            context,
            () => toast?.showSuccess('Share dialog opened or link copied!'),
            () =>
                toast?.showError(
                    'Could not share. Try copying the link manually.',
                ),
        );
    };

    // Transfer history for this team
    const { transfers, hasMoreTransfers } = useTransferCalculations({
        selectedTeam: teamNumber,
    });

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-people me-2 text-primary"></i>
                    Team {teamNumber} Details
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Current Status Card */}
                <Card className="mb-4">
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-1">
                                    <i className="bi bi-clock me-2"></i>
                                    Current Status
                                </h6>
                                <div className="d-flex align-items-center gap-2">
                                    {currentStatus?.shift.code === 'O' ? (
                                        <Badge bg="secondary" pill>
                                            <i className="bi bi-house me-1"></i>
                                            Off Duty
                                        </Badge>
                                    ) : (
                                        <Badge
                                            className={getShiftClassName(
                                                currentStatus?.shift.code ||
                                                    'O',
                                            )}
                                            pill
                                        >
                                            <i className="bi bi-briefcase me-1"></i>
                                            {currentStatus?.shift.name ||
                                                'Unknown'}
                                        </Badge>
                                    )}
                                    <small className="text-muted">
                                        {currentStatus?.date.format(
                                            'dddd, MMM D',
                                        ) || 'Unknown date'}
                                    </small>
                                </div>
                            </div>
                            {nextShift && (
                                <div className="text-end">
                                    <small className="text-muted d-block">
                                        Next Shift
                                    </small>
                                    <Badge
                                        className={getShiftClassName(
                                            nextShift.shift.code,
                                        )}
                                        pill
                                    >
                                        {nextShift.shift.name}
                                    </Badge>
                                    <small className="text-muted d-block">
                                        {nextShift.date.format('MMM D')}
                                    </small>
                                </div>
                            )}
                        </div>
                    </Card.Body>
                </Card>

                {/* 7-Day Schedule */}
                <div className="mb-4">
                    <h6 className="mb-3">
                        <i className="bi bi-calendar-week me-2"></i>
                        7-Day Schedule
                    </h6>
                    <div className="table-responsive">
                        <Table striped hover className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Date</th>
                                    <th>Day</th>
                                    <th>Shift</th>
                                    <th>Hours</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weekSchedule.map((day) => (
                                    <tr
                                        key={day.date.format('YYYY-MM-DD')}
                                        className={
                                            day.isToday ? 'table-primary' : ''
                                        }
                                    >
                                        <td>
                                            <strong>
                                                {day.date.format('MMM D')}
                                            </strong>
                                            {day.isToday && (
                                                <Badge
                                                    bg="primary"
                                                    className="ms-2"
                                                >
                                                    Today
                                                </Badge>
                                            )}
                                            {day.isTomorrow && (
                                                <Badge
                                                    bg="info"
                                                    className="ms-2"
                                                >
                                                    Tomorrow
                                                </Badge>
                                            )}
                                        </td>
                                        <td>{day.date.format('ddd')}</td>
                                        <td>
                                            {day.shift.code === 'O' ? (
                                                <Badge bg="secondary" pill>
                                                    Off
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    className={getShiftClassName(
                                                        day.shift.code,
                                                    )}
                                                    pill
                                                >
                                                    {day.shift.name}
                                                </Badge>
                                            )}
                                        </td>
                                        <td>
                                            <small className="text-muted">
                                                {day.shift.code === 'O'
                                                    ? '—'
                                                    : getLocalizedShiftTime(
                                                          day.shift.start,
                                                          day.shift.end,
                                                          settings.timeFormat,
                                                      )}
                                            </small>
                                        </td>
                                        <td>
                                            {day.shift.code === 'O' ? (
                                                <small className="text-muted">
                                                    <i className="bi bi-house me-1"></i>
                                                    Rest Day
                                                </small>
                                            ) : (
                                                <small className="text-success">
                                                    <i className="bi bi-briefcase me-1"></i>
                                                    Working
                                                </small>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>

                {/* Team Statistics */}
                <Row className="mb-4">
                    <Col md={6}>
                        <Card>
                            <Card.Body>
                                <h6 className="mb-3">
                                    <i className="bi bi-bar-chart me-2"></i>
                                    Weekly Statistics
                                </h6>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="px-0 py-2 d-flex justify-content-between">
                                        <span>Working Days</span>
                                        <Badge bg="success">
                                            {stats.workingDays}/7
                                        </Badge>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="px-0 py-2 d-flex justify-content-between">
                                        <span>Rest Days</span>
                                        <Badge bg="secondary">
                                            {stats.offDays}/7
                                        </Badge>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card>
                            <Card.Body>
                                <h6 className="mb-3">
                                    <i className="bi bi-pie-chart me-2"></i>
                                    Shift Distribution
                                </h6>
                                <ListGroup variant="flush">
                                    <ListGroup.Item className="px-0 py-2 d-flex justify-content-between">
                                        <span>
                                            <i className="bi bi-sun me-1 text-warning"></i>
                                            Morning Shifts
                                        </span>
                                        <Badge className="bg-warning">
                                            {stats.morningShifts}
                                        </Badge>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="px-0 py-2 d-flex justify-content-between">
                                        <span>
                                            <i className="bi bi-sunset me-1 text-info"></i>
                                            Evening Shifts
                                        </span>
                                        <Badge bg="info">
                                            {stats.eveningShifts}
                                        </Badge>
                                    </ListGroup.Item>
                                    <ListGroup.Item className="px-0 py-2 d-flex justify-content-between">
                                        <span>
                                            <i className="bi bi-moon me-1 text-primary"></i>
                                            Night Shifts
                                        </span>
                                        <Badge bg="primary">
                                            {stats.nightShifts}
                                        </Badge>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Transfer History */}
                <div className="mb-4">
                    <h6 className="mb-3">
                        <i className="bi bi-arrow-left-right me-2"></i>
                        Transfer History
                    </h6>
                    {transfers.length === 0 ? (
                        <div className="text-muted small">
                            No recent transfers detected for this team.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table size="sm" className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Type</th>
                                        <th>Handover</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transfers.map((t) => (
                                        <tr
                                            key={
                                                t.date.format('YYYY-MM-DD') +
                                                '-' +
                                                t.fromTeam +
                                                '-' +
                                                t.toTeam +
                                                '-' +
                                                t.fromShiftType
                                            }
                                        >
                                            <td>{t.date.format('MMM D')}</td>
                                            <td>
                                                Team {t.fromTeam} (
                                                {t.fromShiftName})
                                            </td>
                                            <td>
                                                Team {t.toTeam} ({t.toShiftName}
                                                )
                                            </td>
                                            <td>
                                                {t.fromShiftType} →{' '}
                                                {t.toShiftType}
                                            </td>
                                            <td>
                                                {t.isHandover ? 'Yes' : 'No'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            {hasMoreTransfers && (
                                <div className="text-muted small mt-1">
                                    Showing latest {transfers.length} transfers.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <Card>
                    <Card.Body>
                        <h6 className="mb-3">
                            <i className="bi bi-lightning me-2"></i>
                            Quick Actions
                        </h6>
                        <div className="d-grid gap-2 d-md-flex">
                            <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip id="calendar-coming-soon-tooltip">
                                        Live calendar sync coming soon!
                                    </Tooltip>
                                }
                            >
                                <span className="d-inline-block">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        disabled
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        <i className="bi bi-calendar-plus me-1"></i>
                                        Add to Calendar
                                    </Button>
                                </span>
                            </OverlayTrigger>
                            <Button
                                variant="outline-info"
                                size="sm"
                                onClick={handleShareSchedule}
                            >
                                <i className="bi bi-share me-1"></i>
                                Share Schedule
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                                <i className="bi bi-arrow-left-right me-1"></i>
                                View Transfers
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
