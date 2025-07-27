import { useEffect, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AboutModal } from './AboutModal';
import { SettingsPanel } from './SettingsPanel';

/**
 * Displays the top navigation bar and About modal for the NextShift application.
 *
 * The header shows the app title, online/offline status, a PWA install button when available, and an About button. The About modal presents version information, service worker status, feature highlights, and licensing details.
 */
export function Header() {
    const isOnline = useOnlineStatus();
    const { isInstallable, promptInstall } = usePWAInstall();
    const [showAbout, setShowAbout] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const handleShowAbout = () => setShowAbout(true);

    // Listen for custom event from SettingsPanel to open AboutModal
    useEffect(() => {
        const handler = () => setShowAbout(true);
        window.addEventListener('show-about-modal', handler);
        return () => window.removeEventListener('show-about-modal', handler);
    }, []);

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
                                onClick={handleShowAbout}
                                aria-label="About NextShift"
                                className="header-button"
                            >
                                <i className="bi bi-info-circle"></i>
                                <span className="d-none d-lg-inline ms-1">
                                    About
                                </span>
                            </Button>
                            <Button
                                variant="outline-light"
                                size="sm"
                                onClick={() => setShowSettings(true)}
                                aria-label="Settings"
                                className="header-button"
                            >
                                <i className="bi bi-gear"></i>
                                <span className="d-none d-lg-inline ms-1">
                                    Settings
                                </span>
                            </Button>
                        </div>
                    </div>
                </Container>
            </header>

            {/* About Modal */}
            <AboutModal show={showAbout} onHide={() => setShowAbout(false)} />

            {/* Settings Panel */}
            <SettingsPanel
                show={showSettings}
                onHide={() => setShowSettings(false)}
            />
        </>
    );
}
