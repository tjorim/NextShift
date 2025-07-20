import { useState } from 'react';
import { Badge, Button, Col, Modal } from 'react-bootstrap';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { CONFIG } from '../utils/config';

interface HeaderProps {
    onChangeTeam: () => void;
}

export function Header({ onChangeTeam: _ }: HeaderProps) {
    const isOnline = useOnlineStatus();
    const [showAbout, setShowAbout] = useState(false);

    return (
        <>
            <header className="row bg-primary text-white py-3 mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="h3 mb-0">NextShift</h1>
                            <small className="text-white-50">
                                v{CONFIG.VERSION}
                            </small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Badge
                                bg={isOnline ? 'success' : 'danger'}
                                className={`connection-${isOnline ? 'online' : 'offline'}`}
                            >
                                {isOnline ? 'Online' : 'Offline'}
                            </Badge>
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
                </Col>
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
                            Version {CONFIG.VERSION}
                        </p>
                        <p className="text-muted small">
                            Service Worker Loading...
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
