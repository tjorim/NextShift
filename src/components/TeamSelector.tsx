import { Button, Col, Modal, Row, Spinner } from 'react-bootstrap';
import { CONFIG } from '../utils/config';

interface TeamSelectorProps {
    show: boolean;
    onTeamSelect: (team: number) => void;
    onHide: () => void;
    isLoading?: boolean;
}

export function TeamSelector({
    show,
    onTeamSelect,
    onHide,
    isLoading = false,
}: TeamSelectorProps) {
    const teams = Array.from({ length: CONFIG.TEAMS_COUNT }, (_, i) => i + 1);

    const handleTeamSelect = (team: number) => {
        onTeamSelect(team);
        onHide();
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header>
                <Modal.Title>Select Your Team</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Please select which team you belong to:</p>
                {isLoading ? (
                    <div className="text-center py-3">
                        <Spinner animation="border" />
                        <div className="mt-2 text-muted">
                            Setting up your team...
                        </div>
                    </div>
                ) : (
                    <Row className="g-2">
                        {teams.map((team) => (
                            <Col key={team} xs={12} sm={6} md={4}>
                                <Button
                                    variant="outline-primary"
                                    className="w-100 team-btn"
                                    onClick={() => handleTeamSelect(team)}
                                    disabled={isLoading}
                                >
                                    Team {team}
                                </Button>
                            </Col>
                        ))}
                    </Row>
                )}
            </Modal.Body>
        </Modal>
    );
}
