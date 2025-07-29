import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { AboutModal } from './components/AboutModal';
import { CurrentStatus } from './components/CurrentStatus';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { MainTabs } from './components/MainTabs';
import { UpdateAvailableModal } from './components/UpdateAvailableModal';
import { WelcomeWizard } from './components/WelcomeWizard';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { useServiceWorkerStatus } from './hooks/useServiceWorkerStatus';
import { useShiftCalculation } from './hooks/useShiftCalculation';
import { dayjs } from './utils/dateTimeUtils';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.scss';

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
        if (serviceWorkerStatus.isWaiting && !showUpdatePrompt) {
            setShowUpdatePrompt(true);
        }
    }, [serviceWorkerStatus.isWaiting, showUpdatePrompt]);

    const handleUpdateApp = () => {
        // Send SKIP_WAITING message to service worker to activate update
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .getRegistration()
                .then((registration) => {
                    if (registration?.waiting) {
                        registration.waiting.postMessage({
                            type: 'SKIP_WAITING',
                        });
                        // Reload the page to get the new version
                        window.location.reload();
                    } else {
                        // No waiting service worker, show info and keep prompt open
                        showInfo(
                            'No update is currently available. Please try again later.',
                            '⚠️',
                        );
                    }
                })
                .catch(() => {
                    showInfo(
                        'Failed to update the app. Please try again later.',
                        '⚠️',
                    );
                });
        } else {
            showInfo('Service workers are not supported in this browser.', '⚠️');
        }
        setShowUpdatePrompt(false);
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
        // Use React's automatic batching to ensure both updates happen together
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
                        startStep={
                            teamModalMode === 'onboarding'
                                ? 'welcome'
                                : 'team-selection'
                        } // NEW
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
        <SettingsProvider>
            <ToastProvider>
                <AppContent />
            </ToastProvider>
        </SettingsProvider>
    );
}

export default App;
