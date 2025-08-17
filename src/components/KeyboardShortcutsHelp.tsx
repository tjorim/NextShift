import Modal from 'react-bootstrap/Modal';
import Table from 'react-bootstrap/Table';

interface KeyboardShortcutsHelpProps {
    show: boolean;
    onHide: () => void;
}

/**
 * Modal component that displays available keyboard shortcuts for the NextShift application.
 *
 * Shows a categorized list of keyboard shortcuts with their descriptions,
 * helping users navigate the application efficiently using keyboard controls.
 */
export function KeyboardShortcutsHelp({ show, onHide }: KeyboardShortcutsHelpProps) {
    const shortcuts = [
        {
            category: 'Navigation',
            items: [
                { keys: 'Ctrl+H / ⌘+H', description: 'Jump to today' },
                { keys: 'Ctrl+K / ⌘+K', description: 'Previous day/week' },
                { keys: 'Ctrl+J / ⌘+J', description: 'Next day/week' },
                { keys: '← Arrow Left', description: 'Previous (context-aware)' },
                { keys: '→ Arrow Right', description: 'Next (context-aware)' },
            ],
        },
        {
            category: 'Tab Switching',
            items: [
                { keys: 'T', description: 'Switch to Today tab' },
                { keys: 'S', description: 'Switch to Schedule tab' },
                { keys: 'R', description: 'Switch to Transfers tab' },
            ],
        },
        {
            category: 'Actions',
            items: [
                { keys: 'Ctrl+T / ⌘+T', description: 'Open team selection' },
                { keys: 'Ctrl+, / ⌘+,', description: 'Toggle settings panel' },
            ],
        },
    ];

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    <i className="bi bi-keyboard me-2" aria-hidden="true"></i>
                    Keyboard Shortcuts
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted mb-4">
                    Use these keyboard shortcuts to navigate NextShift quickly and efficiently.
                    Shortcuts are disabled when typing in input fields.
                </p>
                
                {shortcuts.map((category) => (
                    <div key={category.category} className="mb-4">
                        <h6 className="fw-bold text-primary mb-3">
                            {category.category}
                        </h6>
                        <Table striped hover size="sm" className="mb-0">
                            <thead>
                                <tr>
                                    <th style={{ width: '30%' }}>Shortcut</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {category.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <code className="text-dark bg-light p-1 rounded">
                                                {item.keys}
                                            </code>
                                        </td>
                                        <td>{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ))}
                
                <div className="alert alert-info mt-4 mb-0">
                    <i className="bi bi-info-circle me-2" aria-hidden="true"></i>
                    <strong>Note:</strong> On Mac, use ⌘ (Command) key instead of Ctrl.
                    Shortcuts work consistently across all major browsers and mobile devices with keyboards.
                </div>
            </Modal.Body>
        </Modal>
    );
}