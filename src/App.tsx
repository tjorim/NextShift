import { useEffect, useState } from 'react';
import { Container, Row } from 'react-bootstrap';
import { CurrentStatus } from './components/CurrentStatus';
import { Header } from './components/Header';
import { MainTabs } from './components/MainTabs';
import { TeamSelector } from './components/TeamSelector';
import { useShiftCalculation } from './hooks/useShiftCalculation';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

function App() {
    const [showTeamModal, setShowTeamModal] = useState(false);
    const {
        selectedTeam,
        setSelectedTeam,
        currentDate,
        setCurrentDate,
        currentShift,
        nextShift,
        todayShifts,
    } = useShiftCalculation();

    // Show team modal if no team is selected
    useEffect(() => {
        if (!selectedTeam) {
            setShowTeamModal(true);
        }
    }, [selectedTeam]); // setShowTeamModal is stable from useState

    const handleTeamSelect = (team: number) => {
        setSelectedTeam(team);
        setShowTeamModal(false);
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

    return (
        <div className="bg-light min-vh-100">
            <Container fluid>
                <Header />

                <CurrentStatus
                    selectedTeam={selectedTeam}
                    currentShift={currentShift}
                    nextShift={nextShift}
                    currentDate={currentDate}
                    onChangeTeam={handleChangeTeam}
                />

                <Row>
                    <MainTabs
                        selectedTeam={selectedTeam}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                        todayShifts={todayShifts}
                    />
                </Row>

                <TeamSelector
                    show={showTeamModal}
                    onTeamSelect={handleTeamSelect}
                    onHide={handleTeamModalHide}
                />
            </Container>
        </div>
    );
}

export default App;
