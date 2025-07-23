import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import type { NextShiftResult, ShiftResult } from '../utils/shiftCalculations';
import {
    calculateShift,
    formatDateCode,
    getCurrentShiftDay,
    getNextShift,
    getShiftCode,
} from '../utils/shiftCalculations';
import { getShiftClassName } from '../utils/shiftStyles';

interface CurrentStatusProps {
    selectedTeam: number | null;
    onChangeTeam: () => void;
}

export function CurrentStatus({
    selectedTeam,
    onChangeTeam,
}: CurrentStatusProps) {
    // Always use today's date for current status
    const today = dayjs();

    // Calculate current shift for today
    const currentShift = useMemo((): ShiftResult | null => {
        if (!selectedTeam) return null;

        const shiftDay = getCurrentShiftDay(today);
        const shift = calculateShift(shiftDay, selectedTeam);

        return {
            date: shiftDay,
            shift,
            code: getShiftCode(shiftDay, selectedTeam),
            teamNumber: selectedTeam,
        };
    }, [selectedTeam, today]);

    // Calculate next shift from today
    const nextShift = useMemo((): NextShiftResult | null => {
        if (!selectedTeam) return null;
        return getNextShift(today, selectedTeam);
    }, [selectedTeam, today]);
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
                                {formatDateCode(today)}
                            </div>
                            <div className="mb-3">
                                {selectedTeam && currentShift ? (
                                    <div>
                                        <Badge
                                            className={`shift-code shift-badge-lg ${getShiftClassName(currentShift.shift.code)}`}
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
