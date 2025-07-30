import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import { useToast } from '../contexts/ToastContext';
import { dayjs } from '../utils/dateTimeUtils';
import { exportCalendar } from '../utils/exportCalendar';
import type { ExportFormData, ExportProgress } from '../types/export';

interface ExportModalProps {
    show: boolean;
    onHide: () => void;
    defaultTeamNumber?: number;
    title?: string;
}

/**
 * Modal component for configuring and executing calendar exports
 * 
 * Features export configuration with:
 * - Team selection
 * - Date range selection with validation
 * - Export options (include off days, shift times)
 * - Progress indication during export
 * - Error handling and user feedback
 */
export function ExportModal({ 
    show, 
    onHide, 
    defaultTeamNumber = 1,
    title = "Export Schedule"
}: ExportModalProps) {
    const [formData, setFormData] = useState<ExportFormData>({
        teamNumber: defaultTeamNumber,
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().add(3, 'months').format('YYYY-MM-DD'),
        includeOffDays: true,
        includeShiftTimes: true,
    });

    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toast = useToast();

    // Validate date range
    const validateDates = (): string | null => {
        const start = dayjs(formData.startDate);
        const end = dayjs(formData.endDate);

        if (!start.isValid() || !end.isValid()) {
            return 'Please enter valid dates.';
        }

        if (end.isBefore(start)) {
            return 'End date must be after start date.';
        }

        const daysDiff = end.diff(start, 'days');
        if (daysDiff > 365) {
            return 'Date range cannot exceed 365 days.';
        }

        if (daysDiff < 0) {
            return 'Invalid date range.';
        }

        return null;
    };

    const handleFormChange = (field: keyof ExportFormData, value: string | number | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error when user makes changes
        if (error) {
            setError(null);
        }
    };

    const handleExport = async () => {
        // Validate form
        const validationError = validateDates();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsExporting(true);
        setError(null);
        setExportProgress(null);

        try {
            const options = {
                startDate: dayjs(formData.startDate),
                endDate: dayjs(formData.endDate),
                teamNumber: formData.teamNumber,
                includeOffDays: formData.includeOffDays,
                includeShiftTimes: formData.includeShiftTimes,
                timeZone: 'Europe/Brussels' // Could be made configurable
            };

            const result = await exportCalendar(options, (progress) => {
                setExportProgress(progress);
            });

            if (result.success) {
                toast?.showSuccess(
                    `Successfully exported ${result.eventCount} events to ${result.filename}`
                );
                onHide();
            } else {
                setError(result.error || 'Export failed');
                toast?.showError('Failed to export calendar');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            setError(errorMessage);
            toast?.showError('Export failed: ' + errorMessage);
        } finally {
            setIsExporting(false);
            setExportProgress(null);
        }
    };

    const handleClose = () => {
        if (!isExporting) {
            onHide();
            // Reset form state when closing
            setTimeout(() => {
                setError(null);
                setExportProgress(null);
            }, 300);
        }
    };

    // Calculate estimated event count
    const estimatedEvents = (() => {
        const start = dayjs(formData.startDate);
        const end = dayjs(formData.endDate);
        if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
            return 0;
        }
        const days = end.diff(start, 'days') + 1;
        return formData.includeOffDays ? days : Math.ceil(days * 0.6); // ~60% working days
    })();

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered backdrop={isExporting ? 'static' : true}>
            <Modal.Header closeButton={!isExporting}>
                <Modal.Title>
                    <i className="bi bi-calendar-event me-2"></i>
                    {title}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" className="mb-3">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                )}

                {isExporting && exportProgress && (
                    <div className="mb-4">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">{exportProgress.step}</small>
                            <small className="text-muted">
                                {exportProgress.current} / {exportProgress.total}
                            </small>
                        </div>
                        <ProgressBar 
                            now={(exportProgress.current / exportProgress.total) * 100}
                            striped 
                            animated 
                        />
                    </div>
                )}

                <Form>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Team</Form.Label>
                                <Form.Select
                                    value={formData.teamNumber}
                                    onChange={(e) => handleFormChange('teamNumber', parseInt(e.target.value))}
                                    disabled={isExporting}
                                >
                                    {[1, 2, 3, 4, 5].map(team => (
                                        <option key={team} value={team}>
                                            Team {team}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Estimated Events</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={`${estimatedEvents} events`}
                                    disabled
                                    className="bg-light"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleFormChange('startDate', e.target.value)}
                                    disabled={isExporting}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                                    disabled={isExporting}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="mb-3">
                        <Form.Label className="fw-medium">Export Options</Form.Label>
                        <div className="mt-2">
                            <Form.Check
                                type="checkbox"
                                id="includeOffDays"
                                label="Include off days (rest days)"
                                checked={formData.includeOffDays}
                                onChange={(e) => handleFormChange('includeOffDays', e.target.checked)}
                                disabled={isExporting}
                                className="mb-2"
                            />
                            <Form.Check
                                type="checkbox"
                                id="includeShiftTimes"
                                label="Include shift times in descriptions"
                                checked={formData.includeShiftTimes}
                                onChange={(e) => handleFormChange('includeShiftTimes', e.target.checked)}
                                disabled={isExporting}
                            />
                        </div>
                    </div>

                    <Alert variant="info" className="mb-0">
                        <div className="small">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>Export Details:</strong>
                            <ul className="mb-0 mt-1">
                                <li>File format: iCalendar (.ics) compatible with Google Calendar, Outlook, and Apple Calendar</li>
                                <li>Working shifts include specific times, off days are all-day events</li>
                                <li>Maximum range: 365 days per export</li>
                                <li>Timezone: Europe/Brussels (CET/CEST)</li>
                            </ul>
                        </div>
                    </Alert>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isExporting}>
                    Cancel
                </Button>
                <Button 
                    variant="primary" 
                    onClick={handleExport} 
                    disabled={isExporting || estimatedEvents === 0}
                >
                    {isExporting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Exporting...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-download me-2"></i>
                            Export Calendar
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}