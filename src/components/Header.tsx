import { useState } from 'react';
import { Badge, Button, Modal } from 'react-bootstrap';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
    getServiceWorkerStatusText,
    useServiceWorkerStatus,
} from '../hooks/useServiceWorkerStatus';
import { CONFIG } from '../utils/config';

/**
 * Renders the top navigation bar and About modal for the NextShift application.
 *
 * Displays the app title, online/offline status, a conditional PWA install button, and an About button. The About modal provides version information, service worker status, feature highlights, and licensing details.
 */
export function Header() {
    const isOnline = useOnlineStatus();
    const serviceWorkerStatus = useServiceWorkerStatus();
    const { isInstallable, promptInstall } = usePWAInstall();
    const [showAbout, setShowAbout] = useState(false);

    return (
        <>
            <header className="sticky-top bg-primary text-white py-2 mb-3 shadow-sm">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="h4 mb-0">NextShift</h1>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Badge
                                bg={isOnline ? 'success' : 'danger'}
                                className={`connection-${isOnline ? 'online' : 'offline'}`}
                            >
                                {isOnline ? 'Online' : 'Offline'}
                            </Badge>
                            {isInstallable && (
                                <Button
                                    variant="outline-light"
                                    size="sm"
                                    onClick={promptInstall}
                                    aria-label="Install NextShift App"
                                >
                                    📱 Install
                                </Button>
                            )}
                            <Button
                                variant="outline-light"
                                size="sm"
                                onClick={() => setShowAbout(true)}
                                aria-label="About NextShift"
                            >
                                ?
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* About Modal */}
            <Modal show={showAbout} onHide={() => setShowAbout(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>About NextShift</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-3">
                        <h6>NextShift - Team Shift Tracker</h6>
                        <p className="text-muted mb-1">
                            <strong>Version {CONFIG.VERSION}</strong>
                        </p>
                        <p className="text-muted small">
                            {getServiceWorkerStatusText(serviceWorkerStatus)}
                        </p>
                    </div>
                    <hr />
                    <p className="small mb-2">
                        <strong>Features:</strong>
                    </p>
                    <ul className="small">
                        <li>5-team continuous (24/7) shift tracking</li>
                        <li>Offline PWA functionality</li>
                        <li>Transfer/handover detection</li>
                        <li>YYWW.D date format (year.week.day)</li>
                    </ul>
                    <hr />
                    <p className="text-muted small mb-0">
                        Licensed under Apache 2.0
                        <br />
                        Built with React, TypeScript & React Bootstrap
                    </p>
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
        </>
    );
}
