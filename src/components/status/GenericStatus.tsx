import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useSettings } from '../../contexts/SettingsContext';
import { getLocalizedShiftTime } from '../../utils/dateTimeUtils';
import {
    getShiftByCode,
    type ShiftResult,
} from '../../utils/shiftCalculations';

interface GenericStatusProps {
    currentWorkingTeam: ShiftResult | null;
}

/**
 * Renders shift status when no team is selected by the user.
 * Shows which team is currently working and encourages team selection for personalized features.
 *
 * @param currentWorkingTeam - The team currently working, or null if no teams are working
 */
export function GenericStatus({ currentWorkingTeam }: GenericStatusProps) {
    const { settings } = useSettings();

    return (
        <Row>
            <Col md={6}>
                <Card className="h-100">
                    <Card.Body className="d-flex flex-column">
                        <Card.Title as="h6" className="mb-2 text-primary">
                            👥 Current Status
                        </Card.Title>
                        <div className="flex-grow-1">
                            <div>
                                {currentWorkingTeam ? (
                                    <div>
                                        {(() => {
                                            const shiftMeta = getShiftByCode(
                                                currentWorkingTeam.shift.code,
                                            );
                                            return (
                                                <Badge
                                                    className={`shift-code shift-badge-lg ${shiftMeta?.className ?? ''}`}
                                                >
                                                    Team{' '}
                                                    {
                                                        currentWorkingTeam.teamNumber
                                                    }
                                                    :{' '}
                                                    {
                                                        currentWorkingTeam.shift
                                                            .name
                                                    }
                                                </Badge>
                                            );
                                        })()}
                                        <div className="small text-muted mt-1">
                                            {currentWorkingTeam.shift.start !=
                                                null &&
                                            currentWorkingTeam.shift.end != null
                                                ? getLocalizedShiftTime(
                                                      currentWorkingTeam.shift
                                                          .start,
                                                      currentWorkingTeam.shift
                                                          .end,
                                                      settings.timeFormat,
                                                  )
                                                : currentWorkingTeam.shift
                                                      .hours}
                                        </div>
                                        <div className="small text-success mt-2">
                                            ✅ Currently working
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-muted">
                                        <div className="mb-2">
                                            <Badge bg="secondary">
                                                No teams working
                                            </Badge>
                                        </div>
                                        <div className="small">
                                            All teams are currently off duty
                                        </div>
                                    </div>
                                )}
                                <hr className="my-3" />
                                <div className="small text-muted">
                                    💡 Select your team above for personalized
                                    shift tracking and countdown timers
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={6}>
                <Card className="h-100">
                    <Card.Body className="d-flex flex-column">
                        <Card.Title as="h6" className="mb-2 text-success">
                            <i className="bi bi-arrow-right-circle me-1"></i>
                            Next Activity
                        </Card.Title>
                        <div className="text-muted flex-grow-1">
                            <div>
                                {currentWorkingTeam ? (
                                    <div>
                                        <div className="fw-semibold">
                                            Next shift change coming soon
                                        </div>
                                        <div className="small">
                                            Check the timeline above or view all
                                            teams in the "Today" tab
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="fw-semibold">
                                            Next shift starts tomorrow
                                        </div>
                                        <div className="small">
                                            View the schedule in other tabs for
                                            detailed timing
                                        </div>
                                    </div>
                                )}
                                <hr className="my-3" />
                                <div className="small text-muted">
                                    Select your team for countdown timers and
                                    personalized notifications
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );
}
