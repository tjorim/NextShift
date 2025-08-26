import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Row from 'react-bootstrap/Row';
import Tooltip from 'react-bootstrap/Tooltip';
import { useSettings } from '../contexts/SettingsContext';
import {
    dayjs,
    getISOWeekYear2Digit,
    getLocalizedShiftTime,
} from '../utils/dateTimeUtils';
import type { ShiftResult } from '../utils/shiftCalculations';
import { getShiftByCode } from '../utils/shiftCalculations';

interface TodayViewProps {
    todayShifts: ShiftResult[];
    myTeam: number | null; // The user's team from onboarding
    onTodayClick: () => void;
    onTeamClick?: (teamNumber: number) => void;
}

function TeamCard({
    shiftResult,
    isMyTeam,
    isCurrentlyActive,
    onTeamClick,
}: {
    shiftResult: ShiftResult;
    isMyTeam: boolean;
    isCurrentlyActive: boolean;
    onTeamClick?: (teamNumber: number) => void;
}) {
    const { settings } = useSettings();

    const cardContent = (
        <>
            {isCurrentlyActive && (
                <>
                    <div className="live-team-overlay"></div>
                    <Badge
                        bg="success"
                        className="live-badge"
                        aria-label={`Team ${shiftResult.teamNumber} is currently working`}
                    >
                        LIVE
                    </Badge>
                </>
            )}
            <div
                className="d-flex justify-content-between align-items-center mb-2"
                style={{ position: 'relative', zIndex: 2 }}
            >
                <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0">Team {shiftResult.teamNumber}</h6>
                    {onTeamClick && (
                        <i
                            className="bi bi-chevron-right text-muted small"
                            aria-hidden="true"
                        ></i>
                    )}
                </div>
                <OverlayTrigger
                    placement="top"
                    overlay={
                        <Tooltip id={`shift-tooltip-${shiftResult.teamNumber}`}>
                            <strong>
                                Shift Code: {shiftResult.shift.code}
                            </strong>
                            <br />
                            {(() => {
                                const shift = getShiftByCode(
                                    shiftResult.shift.code,
                                );
                                return (
                                    <>
                                        {shift.emoji} <em>{shift.name}</em>
                                        <br />
                                        {shift.start != null &&
                                        shift.end != null
                                            ? getLocalizedShiftTime(
                                                  shift.start,
                                                  shift.end,
                                                  settings.timeFormat,
                                              )
                                            : shift.hours}
                                    </>
                                );
                            })()}
                        </Tooltip>
                    }
                >
                    <Badge
                        className={`shift-code cursor-help ${getShiftByCode(shiftResult.shift.code).className}`}
                    >
                        {shiftResult.shift.code}
                    </Badge>
                </OverlayTrigger>
            </div>
            <div className="text-muted small">
                {shiftResult.shift.name}
                <br />
                {shiftResult.shift.isWorking
                    ? getLocalizedShiftTime(
                          shiftResult.shift.start,
                          shiftResult.shift.end,
                          settings.timeFormat,
                      )
                    : 'Not working today'}
            </div>
            <div className="text-muted small mt-1">
                <OverlayTrigger
                    placement="bottom"
                    overlay={
                        <Tooltip id={`code-tooltip-${shiftResult.teamNumber}`}>
                            <strong>Full Shift Code</strong>
                            <br />
                            Format: YYWW.D + Shift
                            <br />
                            <em>{shiftResult.code}</em> = ISO Year{' '}
                            {getISOWeekYear2Digit(shiftResult.date)}, ISO Week{' '}
                            {shiftResult.date.isoWeek()},{' '}
                            {shiftResult.date.format('dddd')},{' '}
                            {shiftResult.shift.name}
                        </Tooltip>
                    }
                >
                    <span className="help-underline">{shiftResult.code}</span>
                </OverlayTrigger>
            </div>
        </>
    );

    if (onTeamClick) {
        return (
            <Card
                className={`team-card-interactive w-100${
                    isMyTeam ? ' my-team' : ''
                }`}
                onClick={() => onTeamClick(shiftResult.teamNumber)}
                title={`View details for Team ${shiftResult.teamNumber}`}
                style={{ cursor: 'pointer' }}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onTeamClick(shiftResult.teamNumber);
                    }
                }}
            >
                <Card.Body className="p-3">{cardContent}</Card.Body>
            </Card>
        );
    }

    return (
        <Card className={isMyTeam ? 'my-team' : ''}>
            <Card.Body className="p-3">{cardContent}</Card.Body>
        </Card>
    );
}

export function TodayView({
    todayShifts,
    myTeam,
    onTodayClick,
    onTeamClick,
}: TodayViewProps) {
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
                <h6 className="mb-0">👥 All Teams Today</h6>
                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={onTodayClick}
                >
                    <i
                        className="bi bi-calendar-check me-1"
                        aria-hidden="true"
                    ></i>
                    Today
                </Button>
            </Card.Header>
            <Card.Body>
                <Row className="g-2">
                    {todayShifts.map((shiftResult) => (
                        <Col
                            key={shiftResult.teamNumber}
                            xs={12}
                            sm={6}
                            md={4}
                            lg
                        >
                            <TeamCard
                                shiftResult={shiftResult}
                                isMyTeam={myTeam === shiftResult.teamNumber}
                                isCurrentlyActive={isCurrentlyActive(
                                    shiftResult,
                                )}
                                onTeamClick={onTeamClick}
                            />
                        </Col>
                    ))}
                </Row>
            </Card.Body>
        </Card>
    );
}
