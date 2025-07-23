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
            // Morning to Evening transfer
            if (myShift.code === 'M' && compareShift.code === 'E') {
                transfers.push({
                    date,
                    fromTeam: selectedTeam,
                    toTeam: compareTeam,
                    fromShiftType: myShift.code,
                    fromShiftName: myShift.name,
                    toShiftType: compareShift.code,
                    toShiftName: compareShift.name,
                    isHandover: true,
                });
            }

            // Evening to Night transfer
            if (myShift.code === 'E' && compareShift.code === 'N') {
                transfers.push({
                    date,
                    fromTeam: selectedTeam,
                    toTeam: compareTeam,
                    fromShiftType: myShift.code,
                    fromShiftName: myShift.name,
                    toShiftType: compareShift.code,
                    toShiftName: compareShift.name,
                    isHandover: true,
                });
            }

            // Night to Morning transfer (next day)
            const nextDate = date.add(1, 'day');
            const myNextShift = calculateShift(nextDate, selectedTeam);
            const compareNextShift = calculateShift(nextDate, compareTeam);

            if (
                myShift.code === 'N' &&
                compareNextShift.code === 'M' &&
                !nextDate.isAfter(endDate)
            ) {
                transfers.push({
                    date: nextDate,
                    fromTeam: selectedTeam,
                    toTeam: compareTeam,
                    fromShiftType: myShift.code,
                    fromShiftName: myShift.name,
                    toShiftType: compareNextShift.code,
                    toShiftName: compareNextShift.name,
                    isHandover: true,
                });
            }

            // Reverse transfers (compare team to my team)
            if (compareShift.code === 'M' && myShift.code === 'E') {
                transfers.push({
                    date,
                    fromTeam: compareTeam,
                    toTeam: selectedTeam,
                    fromShiftType: compareShift.code,
                    fromShiftName: compareShift.name,
                    toShiftType: myShift.code,
                    toShiftName: myShift.name,
                    isHandover: false,
                });
            }

            if (compareShift.code === 'E' && myShift.code === 'N') {
                transfers.push({
                    date,
                    fromTeam: compareTeam,
                    toTeam: selectedTeam,
                    fromShiftType: compareShift.code,
                    fromShiftName: compareShift.name,
                    toShiftType: myShift.code,
                    toShiftName: myShift.name,
                    isHandover: false,
                });
            }

            if (
                compareShift.code === 'N' &&
                myNextShift.code === 'M' &&
                !nextDate.isAfter(endDate)
            ) {
                transfers.push({
                    date: nextDate,
                    fromTeam: compareTeam,
                    toTeam: selectedTeam,
                    fromShiftType: compareShift.code,
                    fromShiftName: compareShift.name,
                    toShiftType: myNextShift.code,
                    toShiftName: myNextShift.name,
                    isHandover: false,
                });
            }
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
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}
