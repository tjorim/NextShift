import { useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
    getServiceWorkerStatusText,
    useServiceWorkerStatus,
} from '../hooks/useServiceWorkerStatus';
import { CONFIG } from '../utils/config';
import { ChangelogModal } from './ChangelogModal';

/**
 * Displays the top navigation bar and About modal for the NextShift application.
 *
 * The header shows the app title, online/offline status, a PWA install button when available, and an About button. The About modal presents version information, service worker status, feature highlights, and licensing details.
 */
export function Header() {
    const isOnline = useOnlineStatus();
    const serviceWorkerStatus = useServiceWorkerStatus();
    const { isInstallable, promptInstall } = usePWAInstall();
    const [showAbout, setShowAbout] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);

    return (
        <>
            <header className="sticky-top bg-primary text-white py-2 mb-3 shadow-sm">
                <Container fluid>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-clock-history me-2 header-icon"></i>
                            <h1 className="h4 mb-0 fw-bold">NextShift</h1>
                        </div>
                        <div className="d-flex align-items-center header-button-spacing">
                            <Badge
                                bg={isOnline ? 'success' : 'danger'}
                                className={`connection-${isOnline ? 'online' : 'offline'}`}
                            >
                                <i
                                    className={`bi ${isOnline ? 'bi-wifi' : 'bi-wifi-off'} me-1`}
                                ></i>
                                {isOnline ? 'Online' : 'Offline'}
                            </Badge>
                            {isInstallable && (
                                <Button
                                    variant="outline-light"
                                    size="sm"
                                    onClick={promptInstall}
                                    aria-label="Install NextShift App"
                                    className="header-button"
                                >
                                    <i className="bi bi-download"></i>
                                    <span className="d-none d-lg-inline ms-1">
                                        Install
                                    </span>
                                </Button>
                            )}
                            <Button
                                variant="outline-light"
                                size="sm"
                                onClick={() => setShowChangelog(true)}
                                aria-label="What's New"
                                title="What's New"
                                className="header-button"
                            >
                                <i className="bi bi-journal-text"></i>
                                <span className="d-none d-lg-inline ms-1">
                                    New
                                </span>
                            </Button>
                            <Button
                                variant="outline-light"
                                size="sm"
                                onClick={() => setShowAbout(true)}
                                aria-label="About NextShift"
                                className="header-button"
                            >
                                <i className="bi bi-info-circle"></i>
                                <span className="d-none d-lg-inline ms-1">
                                    About
                                </span>
                            </Button>
                        </div>
                    </div>
                </Container>
            </header>

            {/* About Modal */}
            <Modal show={showAbout} onHide={() => setShowAbout(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>About NextShift</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* App Title & Version */}
                    <div className="text-center mb-4">
                        <div className="mb-2">
                            <i
                                className="bi bi-clock-history text-primary"
                                style={{ fontSize: '2rem' }}
                            ></i>
                        </div>
                        <h5 className="mb-2">NextShift - Team Shift Tracker</h5>
                        <div className="d-flex justify-content-center align-items-center gap-3 mb-2">
                            <span className="badge bg-primary">
                                <i className="bi bi-tag me-1"></i>Version{' '}
                                {CONFIG.VERSION}
                            </span>
                            <span className="badge bg-success">
                                <i className="bi bi-wifi me-1"></i>
                                {getServiceWorkerStatusText(
                                    serviceWorkerStatus,
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Author Section */}
                    <div className="text-center mb-4">
                        <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                            <i className="bi bi-person-circle text-muted"></i>
                            <span className="fw-semibold">
                                Created by Jorim Tielemans
                            </span>
                        </div>
                        <a
                            href="https://github.com/tjorim"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary btn-sm"
                        >
                            <i className="bi bi-github me-1"></i>GitHub Profile
                        </a>
                    </div>

                    <hr />

                    {/* Features List with Icons */}
                    <div className="mb-4">
                        <h6 className="mb-3">
                            <i className="bi bi-star me-2 text-warning"></i>Key
                            Features
                        </h6>
                        <Row className="g-2">
                            <Col xs={6}>
                                <div className="d-flex align-items-center small">
                                    <i className="bi bi-people text-primary me-2"></i>
                                    <span>5-team shift tracking</span>
                                </div>
                            </Col>
                            <Col xs={6}>
                                <div className="d-flex align-items-center small">
                                    <i className="bi bi-wifi-off text-success me-2"></i>
                                    <span>Offline PWA support</span>
                                </div>
                            </Col>
                            <Col xs={6}>
                                <div className="d-flex align-items-center small">
                                    <i className="bi bi-arrow-left-right text-info me-2"></i>
                                    <span>Transfer detection</span>
                                </div>
                            </Col>
                            <Col xs={6}>
                                <div className="d-flex align-items-center small">
                                    <i className="bi bi-calendar-date text-secondary me-2"></i>
                                    <span>YYWW.D date format</span>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <hr />

                    {/* Quick Links */}
                    <div className="mb-4">
                        <h6 className="mb-3">
                            <i className="bi bi-link-45deg me-2 text-info"></i>
                            Quick Links
                        </h6>
                        <div className="d-grid gap-2">
                            <Row className="g-2">
                                <Col xs={6}>
                                    <a
                                        href="https://github.com/tjorim/NextShift#readme"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-secondary btn-sm w-100"
                                    >
                                        <i className="bi bi-book me-1"></i>
                                        Documentation
                                    </a>
                                </Col>
                                <Col xs={6}>
                                    <a
                                        href="https://github.com/tjorim/NextShift"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-secondary btn-sm w-100"
                                    >
                                        <i className="bi bi-code-slash me-1"></i>
                                        Source Code
                                    </a>
                                </Col>
                            </Row>
                        </div>
                    </div>

                    {/* Support Section */}
                    <div className="mb-4">
                        <h6 className="mb-3">
                            <i className="bi bi-headset me-2 text-success"></i>
                            Support & Feedback
                        </h6>
                        <div className="d-grid gap-2">
                            <Row className="g-2">
                                <Col xs={6}>
                                    <a
                                        href="https://github.com/tjorim/NextShift/issues/new?template=bug_report.md"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-danger btn-sm w-100"
                                    >
                                        <i className="bi bi-bug me-1"></i>Report
                                        Bug
                                    </a>
                                </Col>
                                <Col xs={6}>
                                    <a
                                        href="https://github.com/tjorim/NextShift/issues/new?template=feature_request.md"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-success btn-sm w-100"
                                    >
                                        <i className="bi bi-lightbulb me-1"></i>
                                        Request Feature
                                    </a>
                                </Col>
                            </Row>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="text-center">
                        <div className="d-flex justify-content-center align-items-center gap-3 small text-muted">
                            <span>
                                <i className="bi bi-shield-check me-1"></i>
                                Apache 2.0
                            </span>
                            <span>
                                <i className="bi bi-code-square me-1"></i>React
                                + TypeScript
                            </span>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowAbout(false)}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Changelog Modal */}
            <ChangelogModal
                show={showChangelog}
                onHide={() => setShowChangelog(false)}
            />
        </>
    );
}
