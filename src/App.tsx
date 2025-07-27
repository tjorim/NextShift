import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { CurrentStatus } from './components/CurrentStatus';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { MainTabs } from './components/MainTabs';
import { WelcomeWizard } from './components/WelcomeWizard';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
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
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('today');
    const { showSuccess, showInfo } = useToast();
    const {
        selectedTeam,
        updateTeam,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
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
                updateTeam(teamNumber);
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
    }, [hasCompletedOnboarding, updateTeam, setCurrentDate]); // Run when onboarding completes

    // Show welcome wizard only on first visit (never completed onboarding)
    useEffect(() => {
        if (!hasCompletedOnboarding) {
            setTeamModalMode('onboarding');
            setShowTeamModal(true);
        }
    }, [hasCompletedOnboarding]); // Only run on mount

    // Theme switching effect
    useEffect(() => {
        const applyTheme = () => {
            document.body.setAttribute(
                'data-bs-theme',
                settings.theme === 'auto'
                    ? window.matchMedia('(prefers-color-scheme: dark)').matches
                        ? 'dark'
                        : 'light'
                    : settings.theme,
            );
        };
        applyTheme();
        if (settings.theme === 'auto') {
            const mql = window.matchMedia('(prefers-color-scheme: dark)');
            mql.addEventListener('change', applyTheme);
            return () => mql.removeEventListener('change', applyTheme);
        }
    }, [settings.theme]);

    const handleTeamSelect = (team: number) => {
        setIsLoading(true);

        // Use setTimeout to ensure loading state is visible before heavy operations
        setTimeout(() => {
            updateTeam(team); // Use user preferences for team selection
            setHasCompletedOnboarding(true);
            setShowTeamModal(false);
            setIsLoading(false);
            showSuccess(
                `Team ${team} selected! Your shifts are now personalized.`,
                '🎯',
            );
        }, 0);
    };

    const handleChangeTeam = () => {
        setTeamModalMode('change-team');
        setShowTeamModal(true);
    };

    const handleSkipTeamSelection = () => {
        setIsLoading(true);

        // Use setTimeout to ensure loading state is visible
        setTimeout(() => {
            updateTeam(null); // Clear team selection in preferences
            setHasCompletedOnboarding(true);
            setShowTeamModal(false);
            setIsLoading(false);
            showInfo(
                'Browsing all teams. Select a team anytime for personalized features!',
                '👀',
            );
        }, 0);
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
                    <Header />
                    <ErrorBoundary>
                        <CurrentStatus
                            selectedTeam={selectedTeam}
                            onChangeTeam={handleChangeTeam}
                            onShowWhoIsWorking={handleShowWhoIsWorking}
                            isLoading={isLoading}
                        />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <MainTabs
                            selectedTeam={selectedTeam}
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
                        isLoading={isLoading}
                        startStep={
                            teamModalMode === 'onboarding'
                                ? 'welcome'
                                : 'team-selection'
                        } // NEW
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
