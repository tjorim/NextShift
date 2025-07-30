import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useCookieConsent } from '../contexts/CookieConsentContext';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { clearNonEssentialStorage } from '../hooks/useConsentAwareLocalStorage';
import { CONFIG } from '../utils/config';
import { shareApp, shareTodayView } from '../utils/share';
import { ChangelogModal } from './ChangelogModal';

interface SettingsPanelProps {
    show: boolean;
    onHide: () => void;
    onShowAbout?: () => void;
}

/**
 * Settings panel component that provides access to app preferences, information, and features.
 *
 * Features an offcanvas sidebar with organized sections for:
 * - App preferences and configuration
 * - About and help information
 * - Changelog and version history
 * - Quick actions and utilities
 *
 * @param show - Whether the settings panel is visible
 * @param onHide - Callback to hide the settings panel
 * @param onShowAbout - Optional callback to show the About modal
 * @returns The settings panel component
 */
export function SettingsPanel({
    show,
    onHide,
    onShowAbout,
}: SettingsPanelProps) {
    const [showChangelog, setShowChangelog] = useState(false);
    const [showConfirmReset, setShowConfirmReset] = useState(false);
    const [showPrivacySettings, setShowPrivacySettings] = useState(false);
    const { settings, updateTimeFormat, updateTheme, resetSettings } =
        useSettings();
    const {
        consentPreferences,
        setConsentPreferences,
        resetConsent,
        hasConsentBeenSet,
    } = useCookieConsent();
    const toast = useToast();

    const handleChangelogClick = () => {
        setShowChangelog(true);
    };

    const handleChangelogClose = () => {
        setShowChangelog(false);
    };

    const handlePrivacySettingsClick = () => {
        setShowPrivacySettings(true);
    };

    const handlePrivacySettingsClose = () => {
        setShowPrivacySettings(false);
    };

    const handleClearData = () => {
        clearNonEssentialStorage();
        resetConsent();
        resetSettings();
        setShowPrivacySettings(false);
        toast.showSuccess('All data cleared and consent reset', '🗑️');
    };

    const handleResetSettings = () => {
        setShowConfirmReset(true);
    };
    const handleConfirmReset = () => {
        resetSettings();
        setShowConfirmReset(false);
        onHide(); // Close the settings panel after reset
    };
    const handleCancelReset = () => {
        setShowConfirmReset(false);
    };

    // Open About modal through callback prop
    const handleAboutHelpClick = () => {
        onShowAbout?.();
    };

    // Share handlers
    const handleShareApp = () => {
        shareApp(
            () => toast?.showSuccess('Share dialog opened or link copied!'),
            () =>
                toast?.showError(
                    'Could not share. Try copying the link manually.',
                ),
        );
    };
    const handleShareWithContext = () => {
        shareTodayView(
            () => toast?.showSuccess('Share dialog opened or link copied!'),
            () =>
                toast?.showError(
                    'Could not share. Try copying the link manually.',
                ),
        );
    };

    return (
        <>
            <Offcanvas show={show} onHide={onHide} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>
                        <i className="bi bi-gear me-2"></i>
                        Settings
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    {/* App Preferences Section */}
                    <div className="border-bottom">
                        <div className="p-3">
                            <h6 className="text-muted mb-3">
                                <i className="bi bi-sliders me-2"></i>
                                Preferences
                            </h6>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-medium">
                                                Time Format
                                            </div>
                                            <small className="text-muted">
                                                24-hour or 12-hour display
                                            </small>
                                        </div>
                                        <ButtonGroup size="sm">
                                            <Button
                                                variant={
                                                    settings.timeFormat ===
                                                    '24h'
                                                        ? 'primary'
                                                        : 'outline-secondary'
                                                }
                                                onClick={() =>
                                                    updateTimeFormat('24h')
                                                }
                                            >
                                                24h
                                            </Button>
                                            <Button
                                                variant={
                                                    settings.timeFormat ===
                                                    '12h'
                                                        ? 'primary'
                                                        : 'outline-secondary'
                                                }
                                                onClick={() =>
                                                    updateTimeFormat('12h')
                                                }
                                            >
                                                12h
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item className="">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-medium">
                                                Theme
                                            </div>
                                            <small className="text-muted">
                                                App appearance
                                            </small>
                                        </div>
                                        <ButtonGroup size="sm">
                                            <Button
                                                variant={
                                                    settings.theme === 'auto'
                                                        ? 'primary'
                                                        : 'outline-secondary'
                                                }
                                                onClick={() =>
                                                    updateTheme('auto')
                                                }
                                            >
                                                <i className="bi bi-circle-half me-1"></i>
                                                Auto
                                            </Button>
                                            <Button
                                                variant={
                                                    settings.theme === 'light'
                                                        ? 'primary'
                                                        : 'outline-secondary'
                                                }
                                                onClick={() =>
                                                    updateTheme('light')
                                                }
                                            >
                                                <i className="bi bi-sun me-1"></i>
                                                Light
                                            </Button>
                                            <Button
                                                variant={
                                                    settings.theme === 'dark'
                                                        ? 'primary'
                                                        : 'outline-secondary'
                                                }
                                                onClick={() =>
                                                    updateTheme('dark')
                                                }
                                            >
                                                <i className="bi bi-moon me-1"></i>
                                                Dark
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item className="">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-medium text-muted">
                                                Notifications
                                                <span className="badge bg-secondary ms-2 small">
                                                    Coming Soon
                                                </span>
                                            </div>
                                            <small className="text-muted">
                                                Shift reminders and alerts
                                            </small>
                                        </div>
                                        <ButtonGroup size="sm">
                                            <Button
                                                variant="outline-secondary"
                                                disabled
                                            >
                                                <i className="bi bi-bell me-1"></i>
                                                On
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                disabled
                                            >
                                                <i className="bi bi-bell-slash me-1"></i>
                                                Off
                                            </Button>
                                        </ButtonGroup>
                                    </div>
                                </ListGroup.Item>
                            </ListGroup>
                        </div>
                    </div>

                    {/* Information Section */}
                    <div className="border-bottom">
                        <div className="p-3">
                            <h6 className="text-muted mb-3">
                                <i className="bi bi-info-circle me-2"></i>
                                Information
                            </h6>
                            <ListGroup variant="flush">
                                <ListGroup.Item
                                    action
                                    onClick={handleChangelogClick}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-medium">
                                                <i className="bi bi-stars me-2"></i>
                                                What's New
                                            </div>
                                            <small className="text-muted">
                                                Recent updates and changes
                                            </small>
                                        </div>
                                        <i className="bi bi-chevron-right text-muted"></i>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    onClick={handleAboutHelpClick}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-medium">
                                                <i className="bi bi-question-circle me-2"></i>
                                                About & Help
                                            </div>
                                            <small className="text-muted">
                                                Version info, user guide, and
                                                support
                                            </small>
                                        </div>
                                        <i className="bi bi-chevron-right text-muted"></i>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    onClick={handlePrivacySettingsClick}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-medium">
                                                <i className="bi bi-shield-check me-2"></i>
                                                Privacy & Data
                                            </div>
                                            <small className="text-muted">
                                                Cookie consent and data
                                                management
                                            </small>
                                        </div>
                                        <i className="bi bi-chevron-right text-muted"></i>
                                    </div>
                                </ListGroup.Item>
                            </ListGroup>
                        </div>
                    </div>

                    {/* Quick Actions Section */}
                    <div>
                        <div className="p-3">
                            <h6 className="text-muted mb-3">
                                <i className="bi bi-lightning me-2"></i>
                                Quick Actions
                            </h6>
                            <ListGroup variant="flush">
                                <ListGroup.Item action disabled>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-medium">
                                                <i className="bi bi-calendar-event me-2"></i>
                                                Export Schedule{' '}
                                                <span className="badge bg-secondary ms-2">
                                                    Coming Soon
                                                </span>
                                            </div>
                                            <small className="text-muted">
                                                Download as calendar file
                                            </small>
                                        </div>
                                        <i className="bi bi-chevron-right text-muted"></i>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item action onClick={handleShareApp}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-medium">
                                                <i className="bi bi-share me-2"></i>
                                                Share App
                                            </div>
                                            <small className="text-muted">
                                                Send NextShift to colleagues
                                            </small>
                                        </div>
                                        <i className="bi bi-share text-muted"></i>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    onClick={handleShareWithContext}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-medium">
                                                <i className="bi bi-link-45deg me-2"></i>
                                                Share This View
                                            </div>
                                            <small className="text-muted">
                                                Share with current context
                                            </small>
                                        </div>
                                        <i className="bi bi-share-fill text-muted"></i>
                                    </div>
                                </ListGroup.Item>
                                <ListGroup.Item
                                    action
                                    onClick={handleResetSettings}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <div className="fw-medium text-danger">
                                                <i className="bi bi-arrow-clockwise me-2"></i>
                                                Reset Data
                                            </div>
                                            <small className="text-muted">
                                                Clear all preferences
                                            </small>
                                        </div>
                                        <i className="bi bi-trash text-danger"></i>
                                    </div>
                                </ListGroup.Item>
                            </ListGroup>
                        </div>
                    </div>

                    {/* App Version Footer */}
                    <div className="mt-auto p-3 text-center border-top">
                        <small className="text-muted d-block">
                            NextShift v{CONFIG.VERSION}
                        </small>
                        <small className="text-muted">
                            Built with ❤️ by Jorim Tielemans
                        </small>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Changelog Modal */}
            <ChangelogModal
                show={showChangelog}
                onHide={handleChangelogClose}
            />

            {/* Privacy Settings Modal */}
            <Modal
                show={showPrivacySettings}
                onHide={handlePrivacySettingsClose}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-shield-check me-2"></i>
                        Privacy & Data Settings
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">
                        <h6>Cookie Consent Status</h6>
                        <p className="text-muted">
                            {hasConsentBeenSet
                                ? 'You have set your cookie preferences. You can update them below.'
                                : 'You have not yet set your cookie preferences.'}
                        </p>
                    </div>

                    <div className="mb-4">
                        <h6>Data Storage Categories</h6>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Strictly Necessary</strong>
                                    <div className="small text-muted">
                                        Required for the app to function
                                        properly
                                    </div>
                                </div>
                                <span className="badge bg-success">
                                    Always Enabled
                                </span>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Functional</strong>
                                    <div className="small text-muted">
                                        User preferences and settings
                                    </div>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="functional-toggle"
                                        checked={consentPreferences.functional}
                                        onChange={(e) =>
                                            setConsentPreferences({
                                                ...consentPreferences,
                                                functional: e.target.checked,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Analytics</strong>
                                    <div className="small text-muted">
                                        Usage analytics (not currently
                                        implemented)
                                    </div>
                                </div>
                                <span className="badge bg-secondary">
                                    Not Used
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="alert alert-info">
                        <strong>Your Privacy:</strong> All data is stored
                        locally on your device. No personal information is sent
                        to external servers.
                    </div>

                    <div className="mb-3">
                        <h6>Data Management</h6>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleClearData}
                        >
                            <i className="bi bi-trash me-2"></i>
                            Clear All Data & Reset Consent
                        </Button>
                        <div className="small text-muted mt-1">
                            This will clear all stored preferences and reset
                            your cookie consent.
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={handlePrivacySettingsClose}
                    >
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Confirm Reset Modal */}
            <Modal show={showConfirmReset} onHide={handleCancelReset} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reset All Settings?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to reset all settings to defaults?
                    This cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCancelReset}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmReset}>
                        Reset
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
