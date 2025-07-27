import { useEffect, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Pagination from 'react-bootstrap/Pagination';
import Row from 'react-bootstrap/Row';
import { useTransferCalculations } from '../hooks/useTransferCalculations';
import { CONFIG } from '../utils/config';
import { getShiftClassName } from '../utils/shiftStyles';

interface TransferViewProps {
    selectedTeam: number | null;
    initialCompareTeam?: number | null;
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
    initialCompareTeam,
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const transfersPerPage = 6; // 2 rows of 3 cards each

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

    // Calculate pagination
    const totalPages = Math.ceil(transfers.length / transfersPerPage);
    const startIndex = (currentPage - 1) * transfersPerPage;
    const endIndex = startIndex + transfersPerPage;
    const currentTransfers = transfers.slice(startIndex, endIndex);

    // Set compare team from initial prop
    useEffect(() => {
        if (initialCompareTeam && initialCompareTeam !== compareTeam) {
            setCompareTeam(initialCompareTeam);
        }
    }, [initialCompareTeam, compareTeam, setCompareTeam]);

    // Reset pagination when transfers change
    // biome-ignore lint/correctness/useExhaustiveDependencies: We want to reset when these specific values change
    useEffect(() => {
        setCurrentPage(1);
    }, [transfers.length, compareTeam, dateRange]);

    // Helper to get page numbers to display in pagination
    function getPageNumbers(current: number, total: number): number[] {
        if (total <= 5) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        const pages: number[] = [1];
        if (current > 3) pages.push(-1); // -1 will represent an ellipsis
        for (
            let i = Math.max(2, current - 1);
            i <= Math.min(total - 1, current + 1);
            i++
        ) {
            pages.push(i);
        }
        if (current < total - 2) pages.push(-2); // -2 will represent an ellipsis
        pages.push(total);
        return pages;
    }

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
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="mb-0">
                                    Transfers between Team {selectedTeam} and
                                    Team {compareTeam}
                                </h6>
                                <small className="text-muted">
                                    {transfers.length}{' '}
                                    {transfers.length === 1
                                        ? 'transfer'
                                        : 'transfers'}{' '}
                                    found
                                    {totalPages > 1 && (
                                        <span className="ms-2">
                                            • Page {currentPage} of {totalPages}
                                        </span>
                                    )}
                                </small>
                            </div>

                            <Row className="g-3">
                                {currentTransfers.map((transfer) => (
                                    <Col
                                        key={`${transfer.date.toISOString()}-${transfer.fromTeam}-${transfer.toTeam}`}
                                        md={6}
                                        lg={4}
                                    >
                                        <Card className="h-100 transfer-card">
                                            <Card.Body className="p-3">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    <i
                                                        className={`bi ${transfer.isHandover ? 'bi-arrow-right-circle' : 'bi-arrow-left-circle'} text-${transfer.isHandover ? 'success' : 'info'}`}
                                                        aria-hidden="true"
                                                    ></i>
                                                    <strong className="fw-semibold">
                                                        {transfer.date.format(
                                                            'ddd, MMM D',
                                                        )}
                                                    </strong>
                                                </div>
                                                <div className="text-muted small mb-2">
                                                    Team {transfer.fromTeam} →
                                                    Team {transfer.toTeam}
                                                </div>
                                                <div className="mb-2">
                                                    <Badge
                                                        className={`${transfer.isHandover ? 'bg-success' : 'bg-info'} text-white`}
                                                        pill
                                                    >
                                                        {transfer.isHandover
                                                            ? 'Handover'
                                                            : 'Takeover'}
                                                    </Badge>
                                                </div>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <Badge
                                                        className={getShiftClassName(
                                                            transfer.fromShiftType,
                                                        )}
                                                        pill
                                                    >
                                                        {transfer.fromShiftName}
                                                    </Badge>
                                                    <i
                                                        className="bi bi-arrow-right text-muted"
                                                        aria-hidden="true"
                                                    ></i>
                                                    <Badge
                                                        className={getShiftClassName(
                                                            transfer.toShiftType,
                                                        )}
                                                        pill
                                                    >
                                                        {transfer.toShiftName}
                                                    </Badge>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <Pagination size="sm">
                                        <Pagination.First
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                        />
                                        <Pagination.Prev
                                            onClick={() =>
                                                setCurrentPage(currentPage - 1)
                                            }
                                            disabled={currentPage === 1}
                                        />

                                        {getPageNumbers(
                                            currentPage,
                                            totalPages,
                                        ).map((page, idx) => {
                                            if (page === -1 || page === -2) {
                                                return (
                                                    <Pagination.Ellipsis
                                                        key={`ellipsis-${page === -1 ? 'start' : 'end'}-${idx}`}
                                                    />
                                                );
                                            }
                                            return (
                                                <Pagination.Item
                                                    key={page}
                                                    active={
                                                        page === currentPage
                                                    }
                                                    onClick={() =>
                                                        setCurrentPage(page)
                                                    }
                                                >
                                                    {page}
                                                </Pagination.Item>
                                            );
                                        })}

                                        <Pagination.Next
                                            onClick={() =>
                                                setCurrentPage(currentPage + 1)
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                        />
                                        <Pagination.Last
                                            onClick={() =>
                                                setCurrentPage(totalPages)
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                        />
                                    </Pagination>
                                </div>
                            )}

                            {hasMoreTransfers && (
                                <div className="d-flex align-items-center gap-2 text-muted small mt-3">
                                    <i
                                        className="bi bi-info-circle"
                                        aria-hidden="true"
                                    ></i>
                                    <span>
                                        Some transfers may not be shown. Narrow
                                        your date range for complete results.
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
}
