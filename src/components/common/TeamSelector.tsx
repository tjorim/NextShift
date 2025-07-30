import { useId } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { CONFIG } from '../../utils/config';

/**
 * Props interface for the TeamSelector component
 */
export interface TeamSelectorProps {
    /** Currently selected team number or null if none selected */
    selectedTeam: number | null;
    /** Callback fired when team selection changes */
    onTeamSelect: (team: number | null) => void;
    /** Array of team numbers to display (defaults to [1,2,3,4,5]) */
    teams?: number[];
    /** Placeholder text for dropdown mode */
    placeholder?: string;
    /** Whether to include a "None" or "All Teams" option */
    includeNoneOption?: boolean;
    /** Text for the none option when includeNoneOption is true */
    noneOptionText?: string;
    /** Whether the component is disabled */
    disabled?: boolean;
    /** Size variant for the component */
    size?: 'sm' | 'lg';
    /** Display variant - dropdown or button grid */
    variant?: 'dropdown' | 'buttons';
    /** Teams to exclude from the list */
    excludeTeams?: number[];
    /** Additional CSS class name */
    className?: string;
    /** ARIA label for accessibility */
    'aria-label'?: string;
    /** Label text to display above the component */
    label?: string;
    /** Whether to show an icon in the label */
    showIcon?: boolean;
}

/**
 * Reusable team selector component that provides consistent team selection UI across the application.
 * 
 * Features:
 * - Two display modes: dropdown (Form.Select) or button grid
 * - Flexible team filtering and exclusion
 * - Consistent validation and styling
 * - Full accessibility support
 * - React Bootstrap integration
 * - TypeScript support with comprehensive prop interface
 */
export function TeamSelector({
    selectedTeam,
    onTeamSelect,
    teams = Array.from({ length: CONFIG.TEAMS_COUNT }, (_, i) => i + 1),
    placeholder = 'Select a team',
    includeNoneOption = false,
    noneOptionText = 'None',
    disabled = false,
    size,
    variant = 'dropdown',
    excludeTeams = [],
    className = '',
    'aria-label': ariaLabel,
    label,
    showIcon = false,
}: TeamSelectorProps) {
    const id = useId();
    
    // Filter teams based on excludeTeams prop
    const availableTeams = teams.filter(team => !excludeTeams.includes(team));
    
    // Validate team numbers
    const validatedTeams = availableTeams.filter(team => 
        typeof team === 'number' && team >= 1 && team <= CONFIG.TEAMS_COUNT
    );
    
    // Handle team selection with validation
    const handleTeamSelect = (team: number | null) => {
        if (team !== null && (team < 1 || team > CONFIG.TEAMS_COUNT)) {
            console.warn(`Invalid team number: ${team}. Expected 1-${CONFIG.TEAMS_COUNT}`);
            return;
        }
        onTeamSelect(team);
    };
    
    // Generate label content
    const labelContent = label && (
        <Form.Label htmlFor={variant === 'dropdown' ? id : undefined} className="fw-semibold">
            {showIcon && <i className="bi bi-people me-1"></i>}
            {label}
        </Form.Label>
    );
    
    if (variant === 'buttons') {
        return (
            <div className={className}>
                {labelContent}
                <Row className="g-2" aria-label={ariaLabel || label || 'Select team'}>
                    {validatedTeams.map((team) => (
                        <Col key={team} xs={6} sm={4} md={4}>
                            <Button
                                variant={selectedTeam === team ? 'primary' : 'outline-primary'}
                                className="w-100"
                                onClick={() => handleTeamSelect(team)}
                                disabled={disabled}
                                size={size}
                                aria-label={`Select Team ${team}`}
                                aria-pressed={selectedTeam === team}
                            >
                                Team {team}
                            </Button>
                        </Col>
                    ))}
                    {includeNoneOption && (
                        <Col xs={6} sm={4} md={4}>
                            <Button
                                variant={selectedTeam === null ? 'secondary' : 'outline-secondary'}
                                className="w-100"
                                onClick={() => handleTeamSelect(null)}
                                disabled={disabled}
                                size={size}
                                aria-label={`Select ${noneOptionText}`}
                                aria-pressed={selectedTeam === null}
                            >
                                {noneOptionText}
                            </Button>
                        </Col>
                    )}
                </Row>
            </div>
        );
    }
    
    // Dropdown variant
    return (
        <div className={className}>
            {labelContent}
            <Form.Select
                id={id}
                value={selectedTeam ?? ''}
                onChange={(e) => {
                    const value = e.target.value;
                    handleTeamSelect(value === '' ? null : parseInt(value, 10));
                }}
                disabled={disabled}
                size={size}
                aria-label={ariaLabel || label || 'Select team'}
            >
                {includeNoneOption ? (
                    <option value="">{noneOptionText}</option>
                ) : selectedTeam === null ? (
                    <option value="" disabled>{placeholder}</option>
                ) : null}
                {validatedTeams.map((team) => (
                    <option key={team} value={team}>
                        Team {team}
                    </option>
                ))}
            </Form.Select>
        </div>
    );
}