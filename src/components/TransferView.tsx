import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { Badge, Card, Col, Form, Row } from 'react-bootstrap';
import { calculateShift } from '../utils/shiftCalculations';

interface TransferViewProps {
    selectedTeam: number | null;
    currentDate: Dayjs;
}

interface TransferInfo {
    date: Dayjs;
    fromTeam: number;
    toTeam: number;
    shiftType: string;
    isHandover: boolean;
}

export function TransferView({ selectedTeam, currentDate }: TransferViewProps) {
    const [compareTeam, setCompareTeam] = useState<number>(1);
    const [dateRange, setDateRange] = useState<string>('14');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');

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

    const transfers = useMemo((): TransferInfo[] => {
        if (!selectedTeam) return [];

        const transfers: TransferInfo[] = [];
        let endDate: Dayjs;

        if (dateRange === 'custom') {
            if (!customStartDate || !customEndDate) return [];
            endDate = dayjs(customEndDate);
        } else {
            endDate = currentDate.add(parseInt(dateRange), 'day');
        }

        const startDate =
            dateRange === 'custom' ? dayjs(customStartDate) : currentDate;

        for (
            let date = startDate;
            date.isBefore(endDate) || date.isSame(endDate);
            date = date.add(1, 'day')
        ) {
            const myShift = calculateShift(date, selectedTeam);
            const compareShift = calculateShift(date, compareTeam);

            // Check for handovers (one team ends, another starts)
            const prevDate = date.subtract(1, 'day');
            const myPrevShift = calculateShift(prevDate, selectedTeam);
            const comparePrevShift = calculateShift(prevDate, compareTeam);

            // My team hands over to compare team (I finish working, they start)
            if (
                myPrevShift.code !== 'O' &&
                myShift.code === 'O' &&
                compareShift.code !== 'O'
            ) {
                transfers.push({
                    date,
                    fromTeam: selectedTeam,
                    toTeam: compareTeam,
                    shiftType: compareShift.name,
                    isHandover: true,
                });
            }

            // Compare team hands over to my team (they finish working, I start)
            if (
                comparePrevShift.code !== 'O' &&
                compareShift.code === 'O' &&
                myShift.code !== 'O'
            ) {
                transfers.push({
                    date,
                    fromTeam: compareTeam,
                    toTeam: selectedTeam,
                    shiftType: myShift.name,
                    isHandover: false,
                });
            }
        }

        return transfers.slice(0, 20); // Limit to 20 transfers
    }, [
        selectedTeam,
        compareTeam,
        dateRange,
        customStartDate,
        customEndDate,
        currentDate,
    ]);

    return (
        <div className="tab-pane fade" id="transfer" role="tabpanel">
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
                                <option value={1}>Team 1</option>
                                <option value={2}>Team 2</option>
                                <option value={3}>Team 3</option>
                                <option value={4}>Team 4</option>
                                <option value={5}>Team 5</option>
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
                                <Form.Label htmlFor="endDate">
                                    End Date:
                                </Form.Label>
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
                                Please select your team to see transfer
                                information.
                            </div>
                        ) : transfers.length === 0 ? (
                            <div className="text-muted">
                                No transfers found between Team {selectedTeam}{' '}
                                and Team {compareTeam} in the selected date
                                range.
                            </div>
                        ) : (
                            <div>
                                <h6 className="mb-3">
                                    Transfers between Team {selectedTeam} and
                                    Team {compareTeam}:
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
                                                    <Badge
                                                        className={`${getShiftClassName(transfer.shiftType.charAt(0))}`}
                                                    >
                                                        {transfer.shiftType}
                                                    </Badge>
                                                </div>
                                                <div className="text-muted small">
                                                    Team {transfer.fromTeam} →
                                                    Team {transfer.toTeam}
                                                    <br />
                                                    <em>
                                                        {transfer.isHandover
                                                            ? 'Handover'
                                                            : 'Transfer'}
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
        </div>
    );
}
