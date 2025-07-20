import { Button, Col, Modal, Row } from 'react-bootstrap';

interface TeamSelectorProps {
    show: boolean;
    onTeamSelect: (team: number) => void;
    onHide: () => void;
}

export function TeamSelector({
    show,
    onTeamSelect,
    onHide,
}: TeamSelectorProps) {
    const teams = [1, 2, 3, 4, 5];

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
                <Row className="g-2">
                    {teams.map((team) => (
                        <Col key={team} xs={12} sm={6} md={4}>
                            <Button
                                variant="outline-primary"
                                className="w-100 team-btn"
                                onClick={() => handleTeamSelect(team)}
                            >
                                Team {team}
                            </Button>
                        </Col>
                    ))}
                </Row>
            </Modal.Body>
        </Modal>
    );
}
