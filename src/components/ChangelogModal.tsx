import { useState } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import {
    type ChangelogVersion,
    changelogData,
    futurePlans,
} from '../data/changelog';

interface ChangelogModalProps {
    show: boolean;
    onHide: () => void;
}

export function ChangelogModal({ show, onHide }: ChangelogModalProps) {
    const [activeKey, setActiveKey] = useState<string>('0');

    const getStatusBadge = (status: ChangelogVersion['status']) => {
        switch (status) {
            case 'current':
                return <Badge bg="primary">Current</Badge>;
            case 'planned':
                return <Badge bg="secondary">Planned</Badge>;
            case 'released':
                return <Badge bg="success">Released</Badge>;
            default:
                return null;
        }
    };

    const renderChangeSection = (
        title: string,
        items: string[],
        variant: string,
    ) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-3">
                <h6 className={`text-${variant} mb-2`}>
                    <i className={`bi bi-${getIconForSection(title)} me-2`}></i>
                    {title}
                </h6>
                <ul className="list-unstyled">
                    {items.map((item) => (
                        <li key={item} className="mb-1">
                            <small className="text-muted">•</small> {item}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const getIconForSection = (title: string): string => {
        switch (title) {
            case 'Added':
                return 'plus-circle';
            case 'Changed':
                return 'arrow-repeat';
            case 'Fixed':
                return 'bug';
            case 'Planned':
                return 'calendar-event';
            default:
                return 'info-circle';
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" scrollable>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-journal-text me-2"></i>
                    What's New in NextShift
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="mb-3">
                    <p className="text-muted">
                        Track the evolution of NextShift with our comprehensive
                        changelog. See what's new, what's changed, and what's
                        coming next.
                    </p>
                </div>

                <Accordion
                    activeKey={activeKey}
                    onSelect={(key) => setActiveKey(key as string)}
                >
                    {changelogData.map((version, index) => (
                        <Accordion.Item
                            eventKey={index.toString()}
                            key={version.version}
                        >
                            <Accordion.Header>
                                <div className="d-flex justify-content-between align-items-center w-100 me-2">
                                    <div>
                                        <strong>
                                            Version {version.version}
                                        </strong>
                                        <small className="text-muted ms-2">
                                            {version.date}
                                        </small>
                                    </div>
                                    {getStatusBadge(version.status)}
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                {renderChangeSection(
                                    'Added',
                                    version.added,
                                    'success',
                                )}
                                {renderChangeSection(
                                    'Changed',
                                    version.changed,
                                    'info',
                                )}
                                {renderChangeSection(
                                    'Fixed',
                                    version.fixed,
                                    'warning',
                                )}
                                {version.planned &&
                                    renderChangeSection(
                                        'Planned',
                                        version.planned,
                                        'secondary',
                                    )}

                                {version.technicalDetails && (
                                    <Card className="mt-3 border-0 bg-body-secondary">
                                        <Card.Body className="py-2">
                                            <small className="text-muted">
                                                <i className="bi bi-info-circle me-1"></i>
                                                <strong>
                                                    {
                                                        version.technicalDetails
                                                            .title
                                                    }
                                                    :
                                                </strong>{' '}
                                                {
                                                    version.technicalDetails
                                                        .description
                                                }
                                            </small>
                                        </Card.Body>
                                    </Card>
                                )}
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>

                <div className="mt-4 p-3 bg-body-secondary rounded">
                    <h6 className="text-primary mb-2">
                        <i className="bi bi-rocket me-2"></i>
                        Coming Soon
                    </h6>
                    <p className="mb-1 small text-muted">
                        <strong>v3.2.0:</strong>{' '}
                        {futurePlans['v3.2.0'].features.join(', ')}
                    </p>
                    <p className="mb-0 small text-muted">
                        <strong>v3.3.0:</strong>{' '}
                        {futurePlans['v3.3.0'].features.join(', ')}
                    </p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <small className="text-muted me-auto">
                    NextShift follows{' '}
                    <a
                        href="https://semver.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Semantic Versioning
                    </a>
                </small>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
