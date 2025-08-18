import { useEffect, useId, useRef, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { useCookieConsent } from '../contexts/CookieConsentContext';
import { CONFIG } from '../utils/config';

type WizardStep = 'welcome' | 'features' | 'consent' | 'team-selection';

interface WelcomeWizardProps {
    show: boolean;
    onTeamSelect: (team: number) => void;
    onSkip?: () => void;
    onHide: () => void;
    onExited?: () => void; // NEW: callback when modal exit animation completes
    isLoading?: boolean;
    startStep?: WizardStep; // NEW: allows controlling initial step
}

/**
 * Welcome wizard component that guides new users through getting started with NextShift.
 *
 * Features a multi-step onboarding experience with:
 * - Welcome and app introduction
 * - Feature highlights and benefits
 * - Team selection or option to browse without selection
 * - Progress indicators and smooth transitions
 *
 * @param show - Whether the wizard is visible
 * @param onTeamSelect - Invoked with the selected team number when a team is chosen
 * @param onSkip - Optional callback invoked when user chooses to skip team selection
 * @param onHide - Invoked to hide the wizard
 * @param isLoading - If true, displays a loading spinner and disables interaction
 *
 * @returns The welcome wizard component
 */
export function WelcomeWizard({
    show,
    onTeamSelect,
    onSkip,
    onHide,
    onExited,
    isLoading = false,
    startStep = 'welcome', // NEW: default to 'welcome'
}: WelcomeWizardProps) {
    const [currentStep, setCurrentStep] = useState<WizardStep>(startStep);
    const initialStepRef = useRef(startStep);
    const firstButtonRef = useRef<HTMLButtonElement>(null);

    // Cookie consent integration
    const { consentPreferences, setConsentPreferences } = useCookieConsent();
    const [tempConsentPreferences, setTempConsentPreferences] =
        useState(consentPreferences);

    // Generate unique IDs for form elements
    const wizardNecessarySwitchId = useId();
    const wizardFunctionalSwitchId = useId();
    const wizardAnalyticsSwitchId = useId();

    // Sync currentStep when startStep prop changes
    useEffect(() => {
        if (startStep !== initialStepRef.current) {
            setCurrentStep(startStep);
            initialStepRef.current = startStep;
        }
    }, [startStep]);

    // Sync temp consent preferences with current consent state
    useEffect(() => {
        setTempConsentPreferences(consentPreferences);
    }, [consentPreferences]);
    const teams = Array.from({ length: CONFIG.TEAMS_COUNT }, (_, i) => i + 1);

    const SETTINGS_LOCATION_TEXT = 'Settings panel (⚙️ in the top right)';

    const getStepNumber = () => {
        switch (currentStep) {
            case 'welcome':
                return '1';
            case 'features':
                return '2';
            case 'consent':
                return '3';
            case 'team-selection':
                return '4';
            default:
                return '1';
        }
    };

    // Reset to startStep when modal opens
    const handleModalEntered = () => {
        if (!isLoading) {
            setCurrentStep(initialStepRef.current);
            // Focus the first interactive element using ref
            if (firstButtonRef.current) {
                firstButtonRef.current.focus();
            }
        }
    };

    const handleTeamSelect = (team: number) => {
        onTeamSelect(team);
        // Don't call onHide() here - let the parent component handle modal hiding
    };

    const handleSkip = () => {
        onSkip?.();
        onHide();
    };

    const nextStep = () => {
        if (currentStep === 'welcome') {
            setCurrentStep('features');
        } else if (currentStep === 'features') {
            setCurrentStep('consent');
        } else if (currentStep === 'consent') {
            // Save consent preferences before proceeding
            setConsentPreferences(tempConsentPreferences);

            // If functional cookies declined, skip team selection and complete onboarding
            if (!tempConsentPreferences.functional) {
                onSkip?.(); // Complete onboarding without team selection
                onHide();
                return;
            }

            setCurrentStep('team-selection');
        }
    };

    const prevStep = () => {
        if (currentStep === 'team-selection') {
            setCurrentStep('consent');
        } else if (currentStep === 'consent') {
            setCurrentStep('features');
        } else if (currentStep === 'features') {
            setCurrentStep('welcome');
        }
    };

    const getProgressPercentage = () => {
        switch (currentStep) {
            case 'welcome':
                return 25;
            case 'features':
                return 50;
            case 'consent':
                return 75;
            case 'team-selection':
                return 100;
            default:
                return 0;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 'welcome':
                return 'Welcome to NextShift! 👋';
            case 'features':
                return 'What can NextShift do? ✨';
            case 'consent':
                return 'Privacy & Data Preferences 🔒';
            case 'team-selection':
                return 'Choose Your Experience 🎯';
            default:
                return 'Welcome to NextShift';
        }
    };

    const renderWelcomeStep = () => (
        <>
            <div className="text-center mb-4">
                <div className="mb-3">
                    <i
                        className="bi bi-clock-history text-primary"
                        style={{ fontSize: '3rem' }}
                    ></i>
                </div>
                <h4 className="text-primary mb-3">Welcome to NextShift!</h4>
                <p className="lead mb-3">
                    Your personal 24/7 shift tracker for 5-team continuous
                    operations
                </p>
                <p className="text-muted">
                    NextShift helps you stay on top of your shift schedule with
                    real-time tracking, countdown timers, and instant access to
                    team information - all offline-capable!
                </p>
            </div>
            <div className="d-flex justify-content-between">
                <Button
                    variant="outline-secondary"
                    onClick={onHide}
                    disabled={isLoading}
                    ref={currentStep === 'welcome' ? firstButtonRef : undefined}
                >
                    Maybe Later
                </Button>
                <Button
                    variant="primary"
                    onClick={nextStep}
                    disabled={isLoading}
                >
                    Let's Get Started!{' '}
                    <i className="bi bi-arrow-right ms-1"></i>
                </Button>
            </div>
        </>
    );

    const renderFeaturesStep = () => (
        <>
            <div className="mb-4">
                <h5 className="text-center mb-4">
                    Here's what NextShift can do for you:
                </h5>
                <Row className="g-3">
                    <Col xs={12} md={6}>
                        <div className="d-flex align-items-start">
                            <i
                                className="bi bi-stopwatch text-success me-3 mt-1"
                                style={{ fontSize: '1.5rem' }}
                            ></i>
                            <div>
                                <h6 className="mb-1">Live Countdown Timers</h6>
                                <small className="text-muted">
                                    Know exactly when your next shift starts
                                </small>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="d-flex align-items-start">
                            <i
                                className="bi bi-wifi-off text-info me-3 mt-1"
                                style={{ fontSize: '1.5rem' }}
                            ></i>
                            <div>
                                <h6 className="mb-1">Works Offline</h6>
                                <small className="text-muted">
                                    No internet? No problem - fully functional
                                    offline
                                </small>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="d-flex align-items-start">
                            <i
                                className="bi bi-people text-warning me-3 mt-1"
                                style={{ fontSize: '1.5rem' }}
                            ></i>
                            <div>
                                <h6 className="mb-1">Team Overview</h6>
                                <small className="text-muted">
                                    See who's working across all 5 teams
                                </small>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} md={6}>
                        <div className="d-flex align-items-start">
                            <i
                                className="bi bi-arrow-left-right text-primary me-3 mt-1"
                                style={{ fontSize: '1.5rem' }}
                            ></i>
                            <div>
                                <h6 className="mb-1">Transfer Detection</h6>
                                <small className="text-muted">
                                    Track handovers between teams
                                </small>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Alert variant="info" className="mt-4">
                    <i className="bi bi-gear me-2"></i>
                    <strong>Tip:</strong> You can customize your experience
                    anytime in the <b>{SETTINGS_LOCATION_TEXT}</b>.
                </Alert>
            </div>
            <div className="d-flex justify-content-between">
                <Button
                    variant="outline-secondary"
                    onClick={prevStep}
                    disabled={isLoading}
                    ref={
                        currentStep === 'features' ? firstButtonRef : undefined
                    }
                >
                    <i className="bi bi-arrow-left me-1"></i> Back
                </Button>
                <Button
                    variant="primary"
                    onClick={nextStep}
                    disabled={isLoading}
                >
                    Set Privacy Preferences{' '}
                    <i className="bi bi-arrow-right ms-1"></i>
                </Button>
            </div>
        </>
    );

    const renderConsentStep = () => (
        <>
            <div className="mb-4">
                <h5 className="text-center mb-4">
                    Let's set up your privacy preferences
                </h5>
                <p className="text-muted text-center mb-4">
                    NextShift stores your preferences locally on your device.
                    Choose what you're comfortable with:
                </p>

                <Form>
                    <div className="mb-4">
                        <Form.Check
                            type="switch"
                            id={wizardNecessarySwitchId}
                            label={
                                <div>
                                    <strong>Strictly Necessary</strong>
                                    <div className="small text-muted">
                                        Required for the app to function
                                        properly. Includes your onboarding
                                        completion and basic app functionality.
                                    </div>
                                </div>
                            }
                            checked={true}
                            disabled={true}
                            className="mb-3"
                        />
                    </div>

                    <div className="mb-4">
                        <Form.Check
                            type="switch"
                            id={wizardFunctionalSwitchId}
                            label={
                                <div>
                                    <strong>Functional</strong>
                                    <div className="small text-muted">
                                        Stores your preferences like theme, time
                                        format, and your team selection for a
                                        personalized experience.
                                    </div>
                                </div>
                            }
                            checked={tempConsentPreferences.functional}
                            onChange={(e) =>
                                setTempConsentPreferences((prev) => ({
                                    ...prev,
                                    functional: e.target.checked,
                                }))
                            }
                            className="mb-3"
                        />
                    </div>

                    <div className="mb-4">
                        <Form.Check
                            type="switch"
                            id={wizardAnalyticsSwitchId}
                            label={
                                <div>
                                    <strong>Analytics</strong>
                                    <div className="small text-muted">
                                        Would help us understand how the app is
                                        used to improve it. Currently not
                                        implemented.
                                    </div>
                                </div>
                            }
                            checked={tempConsentPreferences.analytics}
                            onChange={(e) =>
                                setTempConsentPreferences((prev) => ({
                                    ...prev,
                                    analytics: e.target.checked,
                                }))
                            }
                            disabled={true}
                            className="mb-3"
                        />
                    </div>
                </Form>

                <Alert variant="info">
                    <small>
                        <strong>Your Privacy:</strong> All data stays on your
                        device. No personal information is sent to external
                        servers. You can change these preferences anytime in
                        Settings.
                    </small>
                </Alert>

                {!tempConsentPreferences.functional && (
                    <Alert variant="warning">
                        <small>
                            <strong>Note:</strong> Without functional cookies,
                            you won't be able to save a team preference. You can
                            still use NextShift to view all teams' schedules.
                        </small>
                    </Alert>
                )}
            </div>
            <div className="d-flex justify-content-between">
                <Button
                    variant="outline-secondary"
                    onClick={prevStep}
                    disabled={isLoading}
                    ref={currentStep === 'consent' ? firstButtonRef : undefined}
                >
                    <i className="bi bi-arrow-left me-1"></i> Back
                </Button>
                <Button
                    variant="primary"
                    onClick={nextStep}
                    disabled={isLoading}
                >
                    {tempConsentPreferences.functional
                        ? 'Continue to Team Selection'
                        : 'Complete Setup'}{' '}
                    <i className="bi bi-arrow-right ms-1"></i>
                </Button>
            </div>
        </>
    );

    const renderTeamSelectionStep = () => (
        <>
            <div className="text-center mb-4">
                <h5 className="mb-3">How would you like to use NextShift?</h5>
                <p className="text-muted">
                    You can always change this later in the app.
                </p>
            </div>

            <div className="mb-4">
                <h6 className="mb-3">
                    Option 1: Select Your Team (Recommended)
                </h6>
                <p className="small text-muted mb-3">
                    Get personalized features like countdown timers and shift
                    progress tracking.
                </p>
                <Row className="g-2" aria-label="Select your team">
                    {teams.map((team) => (
                        <Col key={team} xs={6} sm={4} md={4}>
                            <Button
                                variant="outline-primary"
                                className="w-100 team-btn"
                                onClick={() => handleTeamSelect(team)}
                                disabled={isLoading}
                                aria-label={`Select Team ${team}`}
                                ref={
                                    currentStep === 'team-selection' &&
                                    team === 1
                                        ? firstButtonRef
                                        : undefined
                                }
                            >
                                Team {team}
                            </Button>
                        </Col>
                    ))}
                </Row>
            </div>

            <hr />

            <div className="text-center">
                <h6 className="mb-2">Option 2: Browse All Teams</h6>
                <p className="small text-muted mb-3">
                    View shift information for all teams without
                    personalization.
                </p>
                <Button
                    variant="outline-secondary"
                    onClick={handleSkip}
                    disabled={isLoading}
                >
                    <i className="bi bi-eye me-1"></i>
                    Browse All Teams
                </Button>
            </div>

            <div className="d-flex justify-content-start mt-3">
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={prevStep}
                    disabled={isLoading}
                >
                    <i className="bi bi-arrow-left me-1"></i> Back
                </Button>
            </div>
        </>
    );

    return (
        <Modal
            show={show}
            onHide={onHide}
            onExited={onExited}
            backdrop="static"
            keyboard={false}
            centered
            size="lg"
            onEntered={handleModalEntered}
        >
            <Modal.Header>
                <Modal.Title>{getStepTitle()}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Progress bar */}
                <div className="mb-4">
                    <ProgressBar
                        now={getProgressPercentage()}
                        variant="primary"
                        style={{ height: '4px' }}
                        className="mb-2"
                    />
                    <div className="d-flex justify-content-between small text-muted">
                        <span>Step {getStepNumber()} of 4</span>
                        <span>{getProgressPercentage()}% Complete</span>
                    </div>
                </div>
                {isLoading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                        <div className="mt-3 text-muted">
                            Setting up your experience...
                        </div>
                    </div>
                ) : (
                    <>
                        {currentStep === 'welcome' && renderWelcomeStep()}
                        {currentStep === 'features' && renderFeaturesStep()}
                        {currentStep === 'consent' && renderConsentStep()}
                        {currentStep === 'team-selection' &&
                            renderTeamSelectionStep()}
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}
