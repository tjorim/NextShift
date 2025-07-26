import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import { CurrentStatus } from './components/CurrentStatus';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { MainTabs } from './components/MainTabs';
import { TeamSelector } from './components/TeamSelector';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { useShiftCalculation } from './hooks/useShiftCalculation';
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
    const {
        selectedTeam,
        setSelectedTeam,
        currentDate,
        setCurrentDate,
        todayShifts,
    } = useShiftCalculation();

    // Show team modal if no team is selected
    useEffect(() => {
        if (!selectedTeam) {
            setShowTeamModal(true);
        }
    }, [selectedTeam]); // setShowTeamModal is stable from useState

    const handleTeamSelect = (team: number) => {
        setIsLoading(true);

        // Use setTimeout to ensure loading state is visible before heavy operations
        setTimeout(() => {
            setSelectedTeam(team); // This triggers localStorage write and heavy recalculations
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

    const handleTeamModalHide = () => {
        // Only allow hiding if a team is already selected
        if (selectedTeam) {
            setShowTeamModal(false);
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

                    <TeamSelector
                        show={showTeamModal}
                        onTeamSelect={handleTeamSelect}
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
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
}

export default App;
