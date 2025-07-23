import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { CurrentStatus } from './components/CurrentStatus';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { MainTabs } from './components/MainTabs';
import { TeamSelector } from './components/TeamSelector';
import { useShiftCalculation } from './hooks/useShiftCalculation';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

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

        // Use requestAnimationFrame to ensure loading state is visible
        requestAnimationFrame(() => {
            setSelectedTeam(team); // This triggers localStorage write and heavy recalculations
            setShowTeamModal(false);
            setIsLoading(false);
        });
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

                    <Row>
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
                    </Row>

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

export default App;
