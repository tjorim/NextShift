import dayjs from 'dayjs';
import {
    Badge,
    Button,
    Card,
    Col,
    OverlayTrigger,
    Row,
    Tooltip,
} from 'react-bootstrap';
import type { ShiftResult } from '../utils/shiftCalculations';
import { getShiftClassName } from '../utils/shiftStyles';

const SHIFT_DESCRIPTIONS = {
    M: 'Morning (7:00-15:00)',
    E: 'Evening (15:00-23:00)',
    N: 'Night (23:00-7:00)',
    O: 'Off duty',
} as const;

interface TodayViewProps {
    todayShifts: ShiftResult[];
    selectedTeam: number | null;
    onTodayClick: () => void;
}

export function TodayView({
    todayShifts,
    selectedTeam,
    onTodayClick,
}: TodayViewProps) {
    const isMyTeam = (teamNumber: number) => {
        return selectedTeam === teamNumber ? 'my-team' : '';
    };

    const isCurrentlyActive = (shiftResult: ShiftResult) => {
        if (!shiftResult.shift.isWorking) return false;

        const now = dayjs();
        const shiftDay = shiftResult.date;
        const shiftStartHour = shiftResult.shift.start;
        const shiftEndHour = shiftResult.shift.end;

        if (shiftStartHour === null || shiftEndHour === null) return false;

        // Check if this shift is for today (or yesterday for night shifts)
        const isRightDay = shiftDay.isSame(now, 'day');
        if (!isRightDay) return false;

        const currentHour = now.hour();

        // Handle night shift crossing midnight (23:00-07:00)
        if (shiftStartHour > shiftEndHour) {
            return currentHour >= shiftStartHour || currentHour < shiftEndHour;
        }

        // Handle regular shifts (morning and evening)
        return currentHour >= shiftStartHour && currentHour < shiftEndHour;
    };

    return (
        <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">All Teams Today</h6>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={onTodayClick}
                >
                    <i className="bi bi-calendar-check me-1"></i>
                    Today
                </Button>
            </Card.Header>
            <Card.Body>
                <Row className="g-2">
                    {todayShifts.map((shiftResult) => (
                        <Col key={shiftResult.teamNumber} xs={12} sm={6} lg={4}>
                            <div
                                className={`border rounded p-3 ${isMyTeam(shiftResult.teamNumber)}`}
                            >
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <h6 className="mb-0">
                                            Team {shiftResult.teamNumber}
                                        </h6>
                                        {isCurrentlyActive(shiftResult) && (
                                            <Badge
                                                bg="success"
                                                className="small"
                                            >
                                                Active
                                            </Badge>
                                        )}
                                    </div>
                                    <OverlayTrigger
                                        placement="bottom"
                                        overlay={
                                            <Tooltip
                                                id={`shift-tooltip-${shiftResult.teamNumber}`}
                                            >
                                                <strong>
                                                    Shift Code:{' '}
                                                    {shiftResult.shift.code}
                                                </strong>
                                                <br />
                                                {SHIFT_DESCRIPTIONS[
                                                    shiftResult.shift.code
                                                ] || 'Unknown shift'}
                                            </Tooltip>
                                        }
                                    >
                                        <Badge
                                            className={`shift-code cursor-help ${getShiftClassName(shiftResult.shift.code)}`}
                                        >
                                            {shiftResult.shift.code}
                                        </Badge>
                                    </OverlayTrigger>
                                </div>
                                <div className="text-muted small">
                                    {shiftResult.shift.name}
                                    <br />
                                    {shiftResult.shift.isWorking
                                        ? shiftResult.shift.hours
                                        : 'Not working today'}
                                </div>
                                <div className="text-muted small mt-1">
                                    <OverlayTrigger
                                        placement="bottom"
                                        overlay={
                                            <Tooltip
                                                id={`code-tooltip-${shiftResult.teamNumber}`}
                                            >
                                                <strong>Full Shift Code</strong>
                                                <br />
                                                Format: YYWW.D + Shift
                                                <br />
                                                <em>{shiftResult.code}</em> =
                                                Year{' '}
                                                {shiftResult.date.format('YY')},
                                                Week{' '}
                                                {shiftResult.date.format('WW')},{' '}
                                                {shiftResult.date.format(
                                                    'dddd',
                                                )}
                                                , {shiftResult.shift.name}
                                            </Tooltip>
                                        }
                                    >
                                        <span className="help-underline">
                                            {shiftResult.code}
                                        </span>
                                    </OverlayTrigger>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
}
