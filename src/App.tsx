import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { AboutModal } from './components/AboutModal';
import { CurrentStatus } from './components/CurrentStatus';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { MainTabs } from './components/MainTabs';
import { UpdateAvailableModal } from './components/UpdateAvailableModal';
import { WelcomeWizard } from './components/WelcomeWizard';
import {
    CookieConsentProvider,
    useCookieConsent,
} from './contexts/CookieConsentContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { useServiceWorkerStatus } from './hooks/useServiceWorkerStatus';
import { useShiftCalculation } from './hooks/useShiftCalculation';
import { dayjs } from './utils/dateTimeUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';

// Service worker update timeout fallback in milliseconds
// 2000ms provides sufficient time for the controllerchange event to fire
// while preventing indefinite waiting if the event doesn't trigger
const SERVICE_WORKER_UPDATE_TIMEOUT = 2000;

/**
 * The main application component for team selection and shift management.
 *
 * Coordinates team selection, loading state, and tab navigation, and renders the primary UI for viewing and managing shift information.
 *
 * @returns The application's rendered user interface.
 */
function AppContent() {
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [teamModalMode, setTeamModalMode] = useState<
        'onboarding' | 'change-team'
    >('onboarding');
    const [activeTab, setActiveTab] = useState('today');
    const [showAbout, setShowAbout] = useState(false);
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    const { showSuccess, showInfo } = useToast();
    const serviceWorkerStatus = useServiceWorkerStatus();
    const {
        myTeam,
        setMyTeam,
        hasCompletedOnboarding,
        completeOnboardingWithTeam,
        settings,
    } = useSettings();
    const { hasConsentBeenSet, consentPreferences } = useCookieConsent();
    const { currentDate, setCurrentDate, todayShifts } = useShiftCalculation();

    // Handle URL parameters for deep linking
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        const teamParam = urlParams.get('team');
        const dateParam = urlParams.get('date');

        // Set active tab from URL
        if (tabParam && ['today', 'schedule', 'transfer'].includes(tabParam)) {
            setActiveTab(tabParam);
        }

        // Set team from URL (if valid and user has completed onboarding)
        if (teamParam && hasCompletedOnboarding) {
            const teamNumber = parseInt(teamParam, 10);
            if (teamNumber >= 1 && teamNumber <= 5) {
                setMyTeam(teamNumber);
            }
        }

        // Set date from URL
        if (dateParam && hasCompletedOnboarding) {
            const parsedDate = dayjs(dateParam);
            if (parsedDate.isValid()) {
                setCurrentDate(parsedDate);
            }
        }

        // Clear URL parameters after processing to keep URL clean
        if (urlParams.toString()) {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [hasCompletedOnboarding, setMyTeam, setCurrentDate]); // Run when onboarding completes

    // Show welcome wizard only on first visit (never completed onboarding)
    useEffect(() => {
        if (!hasCompletedOnboarding) {
            setTeamModalMode('onboarding');
            setShowTeamModal(true);
        }
    }, [hasCompletedOnboarding]); // Only run on mount

    // Theme switching effect - following Bootstrap 5.3 best practices
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const applyTheme = () => {
            const resolvedTheme =
                settings.theme === 'auto'
                    ? window.matchMedia('(prefers-color-scheme: dark)').matches
                        ? 'dark'
                        : 'light'
                    : settings.theme;

            document.documentElement.setAttribute(
                'data-bs-theme',
                resolvedTheme,
            );
        };

        applyTheme();

        // Watch for system preference changes when in auto mode
        if (settings.theme === 'auto') {
            const mql = window.matchMedia('(prefers-color-scheme: dark)');
            mql.addEventListener('change', applyTheme);
            return () => mql.removeEventListener('change', applyTheme);
        }
    }, [settings.theme]);

    // Show update prompt when service worker has a waiting update
    useEffect(() => {
        if (serviceWorkerStatus.isWaiting) {
            setShowUpdatePrompt(true);
        }
    }, [serviceWorkerStatus.isWaiting]);

    const handleUpdateApp = () => {
        // Send SKIP_WAITING message to service worker to activate update
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .getRegistration()
                .then((registration) => {
                    if (registration?.waiting) {
                        // Show updating message
                        showInfo('Updating app...', '🔄');

                        // Fallback timeout in case controllerchange doesn't fire
                        const fallbackTimeout = setTimeout(() => {
                            window.location.reload();
                        }, SERVICE_WORKER_UPDATE_TIMEOUT);

                        // Listen for the new service worker to take control before reloading
                        navigator.serviceWorker.addEventListener(
                            'controllerchange',
                            () => {
                                clearTimeout(fallbackTimeout);
                                window.location.reload();
                            },
                            { once: true },
                        );

                        // Send message to activate the waiting service worker
                        registration.waiting.postMessage({
                            type: 'SKIP_WAITING',
                        });
                    } else {
                        // No waiting service worker, show info and close prompt
                        showInfo(
                            'No update is currently available. Please try again later.',
                            '⚠️',
                        );
                        setShowUpdatePrompt(false);
                    }
                })
                .catch((error) => {
                    console.error('Error during service worker update:', error);
                    showInfo(
                        'Failed to update the app. Please try again later.',
                        '⚠️',
                    );
                });
        } else {
            showInfo('Service workers are not supported in this browser.', '⚠️');
        }
    };

    const handleUpdateLater = () => {
        setShowUpdatePrompt(false);
    };

    const handleTeamSelect = (team: number) => {
        // Use the atomic function to avoid race condition
        completeOnboardingWithTeam(team);
        setShowTeamModal(false);
        showSuccess(
            `Team ${team} selected! Your shifts are now personalized.`,
            '🎯',
        );
    };

    const handleChangeTeam = () => {
        // If consent not set or functional cookies declined, guide user through consent first
        if (!hasConsentBeenSet || !consentPreferences.functional) {
            showInfo(
                'You need to enable functional cookies to save team preferences',
                '🍪',
            );
        }

        // Always show the modal, but start at consent step if needed
        setTeamModalMode('change-team');
        setShowTeamModal(true);
    };

    const handleSkipTeamSelection = () => {
        // Complete onboarding without selecting a team
        completeOnboardingWithTeam(null);
        setShowTeamModal(false);
        showInfo(
            'Browsing all teams. Select a team anytime for personalized features!',
            '👀',
        );
    };

    const handleTeamModalHide = () => {
        // If user closes modal (Maybe Later), don't mark onboarding as completed
        // They should see the wizard again on next visit
        setShowTeamModal(false);
    };

    const handleTeamModalExited = () => {
        // If consent hasn't been set yet, show a brief message about cookie preferences
        // This only applies if they somehow completed onboarding without setting consent
        // This runs after the modal exit animation completes
        if (!hasConsentBeenSet && hasCompletedOnboarding) {
            showInfo('Please set your cookie preferences below', '🍪');
        }
    };

    const handleShowWhoIsWorking = () => {
        // Switch to Today tab to show who's working
        setActiveTab('today');
        setCurrentDate(dayjs());
        showInfo("Switched to Today view to see who's working", '👥');
    };

    return (
        <ErrorBoundary>
            <div className="min-vh-100">
                <Container fluid>
                    <Header onShowAbout={() => setShowAbout(true)} />
                    <ErrorBoundary>
                        <CurrentStatus
                            myTeam={myTeam}
                            onChangeTeam={handleChangeTeam}
                            onShowWhoIsWorking={handleShowWhoIsWorking}
                        />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <MainTabs
                            myTeam={myTeam}
                            currentDate={currentDate}
                            setCurrentDate={setCurrentDate}
                            todayShifts={todayShifts}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                    </ErrorBoundary>
                    <WelcomeWizard
                        show={showTeamModal}
                        onTeamSelect={handleTeamSelect}
                        onSkip={handleSkipTeamSelection}
                        onHide={handleTeamModalHide}
                        onExited={handleTeamModalExited}
                        startStep={
                            teamModalMode === 'onboarding'
                                ? 'welcome'
                                : !consentPreferences.functional
                                  ? 'consent'
                                  : 'team-selection'
                        }
                    />
                    <AboutModal
                        show={showAbout}
                        onHide={() => setShowAbout(false)}
                    />
                    <UpdateAvailableModal
                        show={showUpdatePrompt}
                        onUpdate={handleUpdateApp}
                        onLater={handleUpdateLater}
                    />
                </Container>
            </div>
        </ErrorBoundary>
    );
}

function App() {
    return (
        <CookieConsentProvider>
            <SettingsProvider>
                <ToastProvider>
                    <AppContent />
                </ToastProvider>
            </SettingsProvider>
        </CookieConsentProvider>
    );
}

export default App;
