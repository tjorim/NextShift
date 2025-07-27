import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { CurrentStatus } from './components/CurrentStatus';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { MainTabs } from './components/MainTabs';
import { WelcomeWizard } from './components/WelcomeWizard';
import { SettingsProvider } from './contexts/SettingsContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useShiftCalculation } from './hooks/useShiftCalculation';
import { useUserPreferences } from './hooks/useUserPreferences';
import { dayjs } from './utils/dayjs-setup';
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
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('today');
    const { showSuccess, showInfo } = useToast();
    const { selectedTeam, updateTeam } = useUserPreferences();
    const { currentDate, setCurrentDate, todayShifts } = useShiftCalculation();

    // Track whether user has completed onboarding (seen the welcome wizard)
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage(
        'hasCompletedOnboarding',
        false,
    );

    // Show welcome wizard only on first visit (never completed onboarding)
    useEffect(() => {
        if (!hasCompletedOnboarding) {
            setShowTeamModal(true);
        }
    }, [hasCompletedOnboarding]); // Only run on mount

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
            <div className="bg-light min-vh-100">
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
