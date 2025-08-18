import { useId, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { useCookieConsent } from '../contexts/CookieConsentContext';

interface CookieConsentBannerProps {
    show: boolean;
}

/**
 * GDPR-compliant cookie consent banner that appears when the user
 * hasn't set their cookie preferences yet.
 *
 * Provides options to:
 * - Accept all cookies
 * - Reject non-essential cookies
 * - Customize cookie preferences
 */
export function CookieConsentBanner({ show }: CookieConsentBannerProps) {
    const [showCustomize, setShowCustomize] = useState(false);
    const necessarySwitchId = useId();
    const functionalSwitchId = useId();
    const analyticsSwitchId = useId();
    const {
        consentPreferences,
        setConsentPreferences,
        acceptAllCookies,
        rejectAllCookies,
    } = useCookieConsent();

    const [tempPreferences, setTempPreferences] = useState(consentPreferences);

    if (!show) {
        return null;
    }

    const handleCustomizeShow = () => {
        setTempPreferences(consentPreferences);
        setShowCustomize(true);
    };

    const handleCustomizeClose = () => {
        setShowCustomize(false);
    };

    const handleSaveCustom = () => {
        setConsentPreferences(tempPreferences);
        setShowCustomize(false);
    };

    const handleAcceptAll = () => {
        acceptAllCookies();
    };

    const handleRejectAll = () => {
        rejectAllCookies();
    };

    return (
        <>
            {/* Main consent banner */}
            <div
                className="position-fixed bottom-0 start-0 end-0 p-3 bg-light border-top shadow-lg"
                style={{ zIndex: 1050 }}
            >
                <Card>
                    <Card.Body>
                        <Row className="align-items-center">
                            <Col lg={8}>
                                <h6 className="mb-2">Cookie Preferences</h6>
                                <p className="mb-0 small text-muted">
                                    We use local storage to save your
                                    preferences and improve your experience. You
                                    can choose which types of data storage
                                    you're comfortable with.
                                </p>
                            </Col>
                            <Col lg={4} className="text-lg-end mt-2 mt-lg-0">
                                <div className="d-flex flex-column flex-lg-row gap-2">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleCustomizeShow}
                                    >
                                        Customize
                                    </Button>
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={handleRejectAll}
                                    >
                                        Reject All
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={handleAcceptAll}
                                    >
                                        Accept All
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </div>

            {/* Customization modal */}
            <Modal show={showCustomize} onHide={handleCustomizeClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Cookie Preferences</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="text-muted mb-4">
                        Choose which types of data storage you want to allow.
                        You can change these preferences at any time in the app
                        settings.
                    </p>

                    <Form>
                        <div className="mb-4">
                            <Form.Check
                                type="switch"
                                id={necessarySwitchId}
                                label={
                                    <div>
                                        <strong>Strictly Necessary</strong>
                                        <div className="small text-muted">
                                            Required for the app to function
                                            properly. Includes onboarding
                                            completion status.
                                        </div>
                                    </div>
                                }
                                checked={true}
                                disabled={true}
                                className="mb-2"
                            />
                        </div>

                        <div className="mb-4">
                            <Form.Check
                                type="switch"
                                id={functionalSwitchId}
                                label={
                                    <div>
                                        <strong>Functional</strong>
                                        <div className="small text-muted">
                                            Stores your preferences like theme,
                                            time format, team selection, and
                                            notification settings.
                                        </div>
                                    </div>
                                }
                                checked={tempPreferences.functional}
                                onChange={(e) =>
                                    setTempPreferences((prev) => ({
                                        ...prev,
                                        functional: e.target.checked,
                                    }))
                                }
                                className="mb-2"
                            />
                        </div>

                        <div className="mb-4">
                            <Form.Check
                                type="switch"
                                id={analyticsSwitchId}
                                label={
                                    <div>
                                        <strong>Analytics</strong>
                                        <div className="small text-muted">
                                            Would help us understand how the app
                                            is used to improve it. Currently not
                                            implemented.
                                        </div>
                                    </div>
                                }
                                checked={tempPreferences.analytics}
                                onChange={(e) =>
                                    setTempPreferences((prev) => ({
                                        ...prev,
                                        analytics: e.target.checked,
                                    }))
                                }
                                disabled={true}
                                className="mb-2"
                            />
                        </div>
                    </Form>

                    <Alert variant="info">
                        <small>
                            <strong>Your Privacy:</strong> All data is stored
                            locally on your device. No personal information is
                            sent to external servers. You can view and delete
                            all stored data in the app settings.
                        </small>
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={handleCustomizeClose}
                    >
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSaveCustom}>
                        Save Preferences
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
