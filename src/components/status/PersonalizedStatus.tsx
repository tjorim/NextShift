import type { Dayjs } from 'dayjs';
import { useId } from 'react';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import Tooltip from 'react-bootstrap/Tooltip';
import { useSettings } from '../../contexts/SettingsContext';
import type { CountdownResult } from '../../hooks/useCountdown';
import { getLocalizedShiftTime } from '../../utils/dateTimeUtils';
import type {
    NextShiftResult,
    OffDayProgress,
    ShiftResult,
} from '../../utils/shiftCalculations';
import { getShiftByCode } from '../../utils/shiftCalculations';

interface PersonalizedStatusProps {
    myTeam: number;
    currentShift: ShiftResult | null;
    nextShift: NextShiftResult | null;
    offDayProgress: OffDayProgress | null;
    countdown: CountdownResult | null;
    nextShiftStartTime: Dayjs | null;
}

/**
 * Renders personalized shift status for a user's selected team.
 * Shows current shift details, off-day progress, and next shift countdown with real-time updates.
 *
 * @param myTeam - The user's selected team number (1-5)
 * @param currentShift - The team's current shift, or null if off duty
 * @param nextShift - The team's next scheduled shift
 * @param offDayProgress - Progress through off days (when team is not working)
 * @param countdown - Live countdown to next shift start
 * @param nextShiftStartTime - Exact start time of next shift for countdown calculation
 */
export function PersonalizedStatus({
    myTeam,
    currentShift,
    nextShift,
    offDayProgress,
    countdown,
    nextShiftStartTime,
}: PersonalizedStatusProps) {
    const teamTooltipId = useId();
    const { settings } = useSettings();

    return (
        <Row>
            <Col md={6}>
                <Card className="h-100">
                    <Card.Body className="d-flex flex-column">
                        <Card.Title as="h6" className="mb-2 text-primary">
                            🏷️ Your Team Status
                        </Card.Title>
                        <div className="flex-grow-1">
                            {currentShift ? (
                                <div>
                                    <OverlayTrigger
                                        placement="bottom"
                                        overlay={
                                            <Tooltip id={teamTooltipId}>
                                                <strong>Your Team Today</strong>
                                                <br />
                                                Code:{' '}
                                                <strong>
                                                    {currentShift.shift.code}
                                                </strong>
                                                <br />
                                                {(() => {
                                                    const shiftMeta =
                                                        getShiftByCode(
                                                            currentShift.shift
                                                                .code,
                                                        );
                                                    if (!shiftMeta)
                                                        return 'Unknown shift';
                                                    return `${shiftMeta.emoji} ${shiftMeta.name} shift (${shiftMeta.start != null && shiftMeta.end != null ? getLocalizedShiftTime(shiftMeta.start, shiftMeta.end, settings.timeFormat) : shiftMeta.hours})`;
                                                })()}
                                                <br />
                                                <em>
                                                    Full code:{' '}
                                                    {currentShift.code}
                                                </em>
                                            </Tooltip>
                                        }
                                    >
                                        {(() => {
                                            const shiftMeta = getShiftByCode(
                                                currentShift.shift.code,
                                            );
                                            return (
                                                <Badge
                                                    className={`shift-code shift-badge-lg cursor-help ${shiftMeta?.className ?? ''}`}
                                                >
                                                    Team {myTeam}:{' '}
                                                    {currentShift.shift.name}
                                                </Badge>
                                            );
                                        })()}
                                    </OverlayTrigger>
                                    {currentShift.shift.start != null &&
                                        currentShift.shift.end != null && (
                                            <div className="small text-muted mt-1">
                                                {getLocalizedShiftTime(
                                                    currentShift.shift.start,
                                                    currentShift.shift.end,
                                                    settings.timeFormat,
                                                )}
                                            </div>
                                        )}
                                    {!currentShift.shift.isWorking &&
                                        offDayProgress && (
                                            <div className="mt-2">
                                                <div className="small text-muted mb-1">
                                                    Off Day Progress: Day{' '}
                                                    {offDayProgress.current} of{' '}
                                                    {offDayProgress.total}
                                                </div>
                                                <ProgressBar
                                                    now={(() => {
                                                        const {
                                                            current,
                                                            total,
                                                        } = offDayProgress;
                                                        if (
                                                            !total ||
                                                            total <= 0
                                                        )
                                                            return 0;
                                                        const percentage =
                                                            (current / total) *
                                                            100;
                                                        return Math.min(
                                                            Math.max(
                                                                percentage,
                                                                0,
                                                            ),
                                                            100,
                                                        );
                                                    })()}
                                                    variant="info"
                                                    className="progress-thin"
                                                    aria-label={`Off day progress: ${offDayProgress.current} of ${offDayProgress.total} days`}
                                                />
                                            </div>
                                        )}
                                </div>
                            ) : null}
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="h-100">
                    <Card.Body className="d-flex flex-column">
                        <Card.Title as="h6" className="mb-2 text-success">
                            <i className="bi bi-arrow-right-circle me-1"></i>
                            Your Next Shift
                        </Card.Title>
                        <div className="text-muted flex-grow-1">
                            {nextShift ? (
                                <div>
                                    <div className="fw-semibold">
                                        {nextShift.date.format('ddd, MMM D')} -{' '}
                                        {nextShift.shift.name}
                                    </div>
                                    <div className="small text-muted">
                                        {nextShift.shift.start != null &&
                                        nextShift.shift.end != null
                                            ? getLocalizedShiftTime(
                                                  nextShift.shift.start,
                                                  nextShift.shift.end,
                                                  settings.timeFormat,
                                              )
                                            : nextShift.shift.hours}
                                    </div>
                                    {countdown &&
                                        !countdown.isExpired &&
                                        nextShiftStartTime && (
                                            <Badge
                                                bg="info"
                                                className="mt-2"
                                                aria-live="polite"
                                            >
                                                ⏰ Starts in{' '}
                                                {countdown.formatted}
                                            </Badge>
                                        )}
                                </div>
                            ) : (
                                <div>Next shift information not available</div>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}
