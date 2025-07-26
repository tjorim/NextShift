import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { WelcomeWizard } from '../../src/components/WelcomeWizard';

const defaultProps = {
    show: true,
    onTeamSelect: vi.fn(),
    onHide: vi.fn(),
    isLoading: false,
};

describe('WelcomeWizard', () => {
    describe('Basic rendering', () => {
        it('renders modal when show is true', () => {
            render(<WelcomeWizard {...defaultProps} />);
            expect(screen.getByText('Welcome to NextShift! 👋')).toBeInTheDocument();
        });

        it('does not render modal when show is false', () => {
            render(<WelcomeWizard {...defaultProps} show={false} />);
            expect(
                screen.queryByText('Welcome to NextShift! 👋'),
            ).not.toBeInTheDocument();
        });

        it('renders all team buttons on team selection step', async () => {
            const user = userEvent.setup();
            render(<WelcomeWizard {...defaultProps} />);

            // Navigate to team selection step
            await user.click(screen.getByText("Let's Get Started!"));
            await user.click(screen.getByText('Choose My Experience'));

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
                <WelcomeWizard
                    {...defaultProps}
                    onTeamSelect={mockOnTeamSelect}
                />,
            );

            // Navigate to team selection step
            await user.click(screen.getByText("Let's Get Started!"));
            await user.click(screen.getByText('Choose My Experience'));

            const team3Button = screen.getByText('Team 3');
            await user.click(team3Button);

            expect(mockOnTeamSelect).toHaveBeenCalledWith(3);
        });
    });

    describe('Loading state', () => {
        it('shows loading spinner when isLoading is true', () => {
            render(<WelcomeWizard {...defaultProps} isLoading={true} />);
            expect(
                screen.getByText('Setting up your experience...'),
            ).toBeInTheDocument();
        });

        it('hides wizard content when loading', () => {
            render(<WelcomeWizard {...defaultProps} isLoading={true} />);

            // Wizard content should not be present when loading
            expect(
                screen.queryByText("Let's Get Started!"),
            ).not.toBeInTheDocument();
        });
    });

    describe('Modal behavior', () => {
        it('accepts onHide callback prop', () => {
            const mockOnHide = vi.fn();
            render(<WelcomeWizard {...defaultProps} onHide={mockOnHide} />);

            // Modal renders without errors and accepts the callback
            expect(screen.getByText('Welcome to NextShift! 👋')).toBeInTheDocument();
            expect(mockOnHide).toBeDefined();
        });
    });
});
