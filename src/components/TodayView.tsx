import dayjs from 'dayjs';
import React from 'react';
import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import type { ShiftResult } from '../utils/shiftCalculations';

interface TodayViewProps {
    todayShifts: ShiftResult[];
    selectedTeam: number | null;
    currentDate: any; // Dayjs
    onTodayClick: () => void;
}

export function TodayView({
    todayShifts,
    selectedTeam,
    currentDate,
    onTodayClick,
}: TodayViewProps) {
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

    const isMyTeam = (teamNumber: number) => {
        return selectedTeam === teamNumber ? 'my-team' : '';
    };

    return (
        <div className="tab-pane fade show active" id="today" role="tabpanel">
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0">All Teams Today</h6>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={onTodayClick}
                            >
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
                                        lg={4}
                                    >
                                        <div
                                            className={`border rounded p-3 ${isMyTeam(shiftResult.teamNumber)}`}
                                        >
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <h6 className="mb-0">
                                                    Team{' '}
                                                    {shiftResult.teamNumber}
                                                </h6>
                                                <Badge
                                                    className={`shift-code ${getShiftClassName(shiftResult.shift.code)}`}
                                                >
                                                    {shiftResult.shift.code}
                                                </Badge>
                                            </div>
                                            <div className="text-muted small">
                                                {shiftResult.shift.name}
                                                {shiftResult.shift.hours !==
                                                    'Not working' && (
                                                    <>
                                                        <br />
                                                        {
                                                            shiftResult.shift
                                                                .hours
                                                        }
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-muted small mt-1">
                                                {shiftResult.code}
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
