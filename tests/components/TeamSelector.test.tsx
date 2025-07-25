import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { TeamSelector } from '../../src/components/TeamSelector';

const defaultProps = {
    show: true,
    onTeamSelect: vi.fn(),
    onHide: vi.fn(),
    isLoading: false,
};

describe('TeamSelector', () => {
    describe('Basic rendering', () => {
        it('renders modal when show is true', () => {
            render(<TeamSelector {...defaultProps} />);
            expect(screen.getByText('Select Your Team')).toBeInTheDocument();
        });

        it('does not render modal when show is false', () => {
            render(<TeamSelector {...defaultProps} show={false} />);
            expect(
                screen.queryByText('Select Your Team'),
            ).not.toBeInTheDocument();
        });

        it('renders all team buttons', () => {
            render(<TeamSelector {...defaultProps} />);

            for (let team = 1; team <= 5; team++) {
                expect(screen.getByText(`Team ${team}`)).toBeInTheDocument();
            }
        });
    });

    describe('Team selection', () => {
        it('calls onTeamSelect when team button is clicked', async () => {
            const user = userEvent.setup();
            const mockOnTeamSelect = vi.fn();

            render(
                <TeamSelector
                    {...defaultProps}
                    onTeamSelect={mockOnTeamSelect}
                />,
            );

            const team3Button = screen.getByText('Team 3');
            await user.click(team3Button);

            expect(mockOnTeamSelect).toHaveBeenCalledWith(3);
        });
    });

    describe('Loading state', () => {
        it('shows loading spinner when isLoading is true', () => {
            render(<TeamSelector {...defaultProps} isLoading={true} />);
            expect(
                screen.getByText('Setting up your team...'),
            ).toBeInTheDocument();
        });

        it('hides team buttons when loading', () => {
            render(<TeamSelector {...defaultProps} isLoading={true} />);

            // Team buttons should not be present when loading
            for (let team = 1; team <= 5; team++) {
                expect(
                    screen.queryByText(`Team ${team}`),
                ).not.toBeInTheDocument();
            }
        });
    });

    describe('Modal behavior', () => {
        it('accepts onHide callback prop', () => {
            const mockOnHide = vi.fn();
            render(<TeamSelector {...defaultProps} onHide={mockOnHide} />);

            // Modal renders without errors and accepts the callback
            expect(screen.getByText('Select Your Team')).toBeInTheDocument();
            expect(mockOnHide).toBeDefined();
        });
    });
});
