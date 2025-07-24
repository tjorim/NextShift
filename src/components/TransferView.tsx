import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Card, Col, Form, Row } from 'react-bootstrap';
import { CONFIG } from '../utils/config';
import { calculateShift, type ShiftType } from '../utils/shiftCalculations';
import { getShiftClassName } from '../utils/shiftStyles';

interface TransferViewProps {
    selectedTeam: number | null;
}

interface TransferInfo {
    date: Dayjs;
    fromTeam: number;
    toTeam: number;
    fromShiftType: ShiftType;
    fromShiftName: string;
    toShiftType: ShiftType;
    toShiftName: string;
    isHandover: boolean;
}

/**
 * Helper function to check for transfer between two shifts and create TransferInfo if match is found
 */
function checkTransfer(
    shift1: { code: ShiftType; name: string },
    shift2: { code: ShiftType; name: string },
    fromShift: ShiftType,
    toShift: ShiftType,
    date: Dayjs,
    fromTeam: number,
    toTeam: number,
    isHandover: boolean,
): TransferInfo | null {
    if (shift1.code === fromShift && shift2.code === toShift) {
        return {
            date,
            fromTeam,
            toTeam,
            fromShiftType: shift1.code,
            fromShiftName: shift1.name,
            toShiftType: shift2.code,
            toShiftName: shift2.name,
            isHandover,
        };
    }
    return null;
}

/**
 * React component that displays shift transfer events between a selected team and another team over a user-defined date range.
 *
 * Users can select a comparison team and a date range (preset or custom) to view up to 20 detected shift transfers. Transfers are identified based on specific shift transitions (Morning to Evening, Evening to Night, Night to next-day Morning) in both directions between the two teams. Each transfer entry shows the date, involved teams, shift types, and whether it is a handover or takeover.
 *
 * If no team is selected or no transfers are found in the chosen range, an appropriate message is shown.
 */
export function TransferView({ selectedTeam }: TransferViewProps) {
    // Get available teams (excluding selected team)
    const availableTeams = useMemo(() => {
        const allTeams = Array.from(
            { length: CONFIG.TEAMS_COUNT },
            (_, i) => i + 1,
        );
        return allTeams.filter((team) => team !== selectedTeam);
    }, [selectedTeam]);

    // Default to first available team
    const defaultCompareTeam = availableTeams[0] || 1;
    const [compareTeam, setCompareTeam] = useState<number>(defaultCompareTeam);
    const [dateRange, setDateRange] = useState<string>('14');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');

    // Update compareTeam when selectedTeam changes and current compareTeam is not available
    useEffect(() => {
        if (!availableTeams.includes(compareTeam)) {
            setCompareTeam(defaultCompareTeam);
        }
    }, [availableTeams, compareTeam, defaultCompareTeam]);

    const transfers = useMemo((): TransferInfo[] => {
        if (!selectedTeam) return [];

        const transfers: TransferInfo[] = [];
        let endDate: Dayjs;

        if (dateRange === 'custom') {
            if (!customStartDate || !customEndDate) return [];
            endDate = dayjs(customEndDate);
        } else {
            endDate = dayjs().add(parseInt(dateRange), 'day');
        }

        const startDate =
            dateRange === 'custom' ? dayjs(customStartDate) : dayjs();

        for (
            let date = startDate;
            date.isBefore(endDate) || date.isSame(endDate);
            date = date.add(1, 'day')
        ) {
            const myShift = calculateShift(date, selectedTeam);
            const compareShift = calculateShift(date, compareTeam);

            // Check for same-day transfers (shift-to-shift)
            const nextDate = date.add(1, 'day');
            const myNextShift = calculateShift(nextDate, selectedTeam);
            const compareNextShift = calculateShift(nextDate, compareTeam);

            // Check all possible transfer patterns
            const transferChecks = [
                // Same-day transfers (my team to compare team)
                checkTransfer(
                    myShift,
                    compareShift,
                    'M',
                    'E',
                    date,
                    selectedTeam,
                    compareTeam,
                    true,
                ),
                checkTransfer(
                    myShift,
                    compareShift,
                    'E',
                    'N',
                    date,
                    selectedTeam,
                    compareTeam,
                    true,
                ),
                // Night to Morning transfer (next day)
                !nextDate.isAfter(endDate)
                    ? checkTransfer(
                          myShift,
                          compareNextShift,
                          'N',
                          'M',
                          nextDate,
                          selectedTeam,
                          compareTeam,
                          true,
                      )
                    : null,

                // Reverse transfers (compare team to my team)
                checkTransfer(
                    compareShift,
                    myShift,
                    'M',
                    'E',
                    date,
                    compareTeam,
                    selectedTeam,
                    false,
                ),
                checkTransfer(
                    compareShift,
                    myShift,
                    'E',
                    'N',
                    date,
                    compareTeam,
                    selectedTeam,
                    false,
                ),
                // Night to Morning transfer (next day, reverse)
                !nextDate.isAfter(endDate)
                    ? checkTransfer(
                          compareShift,
                          myNextShift,
                          'N',
                          'M',
                          nextDate,
                          compareTeam,
                          selectedTeam,
                          false,
                      )
                    : null,
            ];

            // Add valid transfers to the list
            transferChecks.forEach((transfer) => {
                if (transfer) {
                    transfers.push(transfer);
                }
            });
        }

        return transfers.slice(0, 20); // Limit to 20 transfers
    }, [selectedTeam, compareTeam, dateRange, customStartDate, customEndDate]);

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
                                                        'MMM D, YYYY',
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
                            {transfers.length > 20 && (
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
