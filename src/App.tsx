import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { CurrentStatus } from './components/CurrentStatus';
import { Header } from './components/Header';
import { MainTabs } from './components/MainTabs';
import { TeamSelector } from './components/TeamSelector';
import { useShiftCalculation } from './hooks/useShiftCalculation';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

/**
 * Main application component for managing team selection and shift display.
 *
 * Handles team selection, loading state, tab navigation, and displays the current team's shift information using various UI components.
 *
 * @returns The rendered application UI.
 */
function App() {
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('today');
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
        // Simulate brief loading for better UX
        setTimeout(() => {
            setSelectedTeam(team);
            setShowTeamModal(false);
            setIsLoading(false);
        }, 300);
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
    };

    return (
        <div className="bg-light min-vh-100">
            <Container fluid>
                <Header />

                <CurrentStatus
                    selectedTeam={selectedTeam}
                    onChangeTeam={handleChangeTeam}
                    onShowWhoIsWorking={handleShowWhoIsWorking}
                    isLoading={isLoading}
                />

                <Row>
                    <MainTabs
                        selectedTeam={selectedTeam}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        todayShifts={todayShifts}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />
                </Row>

                <TeamSelector
                    show={showTeamModal}
                    onTeamSelect={handleTeamSelect}
                    onHide={handleTeamModalHide}
                    isLoading={isLoading}
                />
            </Container>
        </div>
    );
}

export default App;
