import React from 'react';
import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import type { NextShiftResult, ShiftResult } from '../utils/shiftCalculations';
import { formatDateCode } from '../utils/shiftCalculations';

interface CurrentStatusProps {
    selectedTeam: number | null;
    currentShift: ShiftResult | null;
    nextShift: NextShiftResult | null;
    currentDate: any; // Dayjs
    onChangeTeam: () => void;
}

export function CurrentStatus({
    selectedTeam,
    currentShift,
    nextShift,
    currentDate,
    onChangeTeam,
}: CurrentStatusProps) {
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

    return (
        <div className="col-12 mb-4">
            <Card>
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <Card.Title className="mb-0">Current Status</Card.Title>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={onChangeTeam}
                        >
                            Change Team
                        </Button>
                    </div>
                    <Row>
                        <Col md={6}>
                            <div className="h6 text-muted mb-2">
                                {formatDateCode(currentDate)}
                            </div>
                            <div className="mb-3">
                                {selectedTeam && currentShift ? (
                                    <div>
                                        <Badge
                                            className={`shift-code ${getShiftClassName(currentShift.shift.code)}`}
                                            style={{
                                                fontSize: '1rem',
                                                padding: '0.5rem 1rem',
                                            }}
                                        >
                                            Team {selectedTeam}:{' '}
                                            {currentShift.shift.name}
                                        </Badge>
                                        <div className="small text-muted mt-1">
                                            {currentShift.shift.hours}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-muted">
                                        Please select your team to see current
                                        status
                                    </div>
                                )}
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="text-muted">
                                {selectedTeam && nextShift ? (
                                    <div>
                                        <strong>Next Shift:</strong>
                                        <br />
                                        {nextShift.date.format('MMM D')} -{' '}
                                        {nextShift.shift.name}
                                        <br />
                                        <small>{nextShift.shift.hours}</small>
                                    </div>
                                ) : selectedTeam ? (
                                    <div>
                                        Next shift information not available
                                    </div>
                                ) : (
                                    <div>
                                        Select your team to see next shift
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
}
