import { Badge, Card, Col, Form, Row } from 'react-bootstrap';
import { useTransferCalculations } from '../hooks/useTransferCalculations';
import { CONFIG } from '../utils/config';
import { getShiftClassName } from '../utils/shiftStyles';

interface TransferViewProps {
    selectedTeam: number | null;
}

/**
 * React component that displays shift transfer events between a selected team and another team over a user-defined date range.
 *
 * Users can select a comparison team and a date range (preset or custom) to view up to 20 detected shift transfers.
 * Transfers are identified based on specific shift transitions (Morning to Evening, Evening to Night, Night to next-day Morning)
 * in both directions between the two teams. Each transfer entry shows the date, involved teams, shift types, and whether it is a handover or takeover.
 *
 * If no team is selected or no transfers are found in the chosen range, an appropriate message is shown.
 */
export function TransferView({
    selectedTeam: inputSelectedTeam,
}: TransferViewProps) {
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

    // Use the transfer calculations hook
    const {
        transfers,
        hasMoreTransfers,
        availableTeams,
        compareTeam,
        setCompareTeam,
        dateRange,
        setDateRange,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
    } = useTransferCalculations({ selectedTeam });

    return (
        <Card>
            <Card.Header>
                <h6 className="mb-0">Team Transfers</h6>
            </Card.Header>
            <Card.Body>
                <Row className="mb-3">
                    <Col md={6}>
                        <Form.Label htmlFor="compareTeam">
                            Compare with Team:
                        </Form.Label>
                        <Form.Select
                            id="compareTeam"
                            value={compareTeam}
                            onChange={(e) =>
                                setCompareTeam(parseInt(e.target.value))
                            }
                        >
                            {availableTeams.map((teamNumber) => (
                                <option key={teamNumber} value={teamNumber}>
                                    Team {teamNumber}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col md={6}>
                        <Form.Label htmlFor="transferRange">
                            Date Range:
                        </Form.Label>
                        <Form.Select
                            id="transferRange"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <option value="14">Next 14 days</option>
                            <option value="30">Next 30 days</option>
                            <option value="60">Next 60 days</option>
                            <option value="custom">Custom range</option>
                        </Form.Select>
                    </Col>
                </Row>

                {dateRange === 'custom' && (
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Label htmlFor="startDate">
                                Start Date:
                            </Form.Label>
                            <Form.Control
                                type="date"
                                id="startDate"
                                value={customStartDate}
                                onChange={(e) =>
                                    setCustomStartDate(e.target.value)
                                }
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Label htmlFor="endDate">End Date:</Form.Label>
                            <Form.Control
                                type="date"
                                id="endDate"
                                value={customEndDate}
                                onChange={(e) =>
                                    setCustomEndDate(e.target.value)
                                }
                            />
                        </Col>
                    </Row>
                )}

                <div id="transferInfo">
                    {!selectedTeam ? (
                        <div className="text-muted">
                            Please select your team to see transfer information.
                        </div>
                    ) : transfers.length === 0 ? (
                        <div className="text-muted">
                            No transfers found between Team {selectedTeam} and
                            Team {compareTeam} in the selected date range.
                        </div>
                    ) : (
                        <div>
                            <h6 className="mb-3">
                                Transfers between Team {selectedTeam} and Team{' '}
                                {compareTeam}:
                            </h6>
                            <div className="row g-2">
                                {transfers.map((transfer) => (
                                    <div
                                        key={`${transfer.date.toISOString()}-${transfer.fromTeam}-${transfer.toTeam}`}
                                        className="col-12 col-md-6"
                                    >
                                        <div className="border rounded p-3">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <strong>
                                                    {transfer.date.format(
                                                        'ddd, MMM D, YYYY',
                                                    )}
                                                </strong>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <Badge
                                                        className={getShiftClassName(
                                                            transfer.fromShiftType,
                                                        )}
                                                    >
                                                        {transfer.fromShiftName}
                                                    </Badge>
                                                    <span>→</span>
                                                    <Badge
                                                        className={getShiftClassName(
                                                            transfer.toShiftType,
                                                        )}
                                                    >
                                                        {transfer.toShiftName}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-muted small">
                                                Team {transfer.fromTeam} → Team{' '}
                                                {transfer.toTeam}
                                                <br />
                                                <em>
                                                    {transfer.isHandover
                                                        ? 'Handover'
                                                        : 'Takeover'}
                                                </em>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {hasMoreTransfers && (
                                <div className="text-muted small mt-2">
                                    Showing first 20 transfers. Narrow your date
                                    range to see more specific results.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}
