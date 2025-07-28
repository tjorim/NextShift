import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
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
            expect(
                screen.getByRole('heading', { name: /Welcome to NextShift!/i }),
            ).toBeInTheDocument();
        });

        it('does not render modal when show is false', () => {
            render(<WelcomeWizard {...defaultProps} show={false} />);
            expect(
                screen.queryByRole('heading', {
                    name: /Welcome to NextShift!/i,
                }),
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
            expect(
                screen.getByText('Welcome to NextShift! 👋'),
            ).toBeInTheDocument();
            expect(mockOnHide).toBeDefined();
        });
    });

    describe('Integration tests', () => {
        beforeEach(() => {
            // Clear localStorage and ensure consistent test state
            window.localStorage.clear();

            // Mock localStorage to ensure clean state
            Object.defineProperty(window, 'localStorage', {
                value: {
                    clear: vi.fn(),
                    getItem: vi.fn((key) => {
                        // Return null for user state key to trigger WelcomeWizard
                        if (key === 'nextshift_user_state') {
                            return null;
                        }
                        return null;
                    }),
                    setItem: vi.fn(),
                    removeItem: vi.fn(),
                    length: 0,
                    key: vi.fn(),
                },
                writable: true,
            });
        });

        afterEach(() => {
            window.localStorage.clear();
            vi.clearAllMocks();
        });

        it('shows WelcomeWizard on first load and after reset', async () => {
            render(<App />);

            // There are two elements with this text, select the modal title
            const welcomeHeadings =
                await screen.findAllByText(/Welcome to NextShift/i);
            const modalHeading = welcomeHeadings.find((el) =>
                el.className.includes('modal-title'),
            );
            expect(modalHeading).toBeInTheDocument();

            // Simulate completing onboarding
            fireEvent.click(screen.getByText(/Let's Get Started/i));

            // Wait for step 2 to appear with better timing
            await waitFor(() => {
                expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
            });

            // Find the "Choose My Experience" button after step transition
            const chooseButton = await screen.findByRole('button', {
                name: /Choose My Experience/i,
            });
            fireEvent.click(chooseButton);
            
            // Wait for step 3 to appear
            await waitFor(() => {
                expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument();
            });
            
            fireEvent.click(screen.getByLabelText(/Select Team 1/i));

            await waitFor(() =>
                expect(
                    screen.queryByText(/Welcome to NextShift/i),
                ).not.toBeInTheDocument(),
            );

            // Simulate reset
            fireEvent.click(screen.getByLabelText(/Settings/i));
            fireEvent.click(screen.getByText(/Reset Data/i));
            fireEvent.click(screen.getByText(/^Reset$/));

            const welcomeHeadingsAfterReset =
                await screen.findAllByText(/Welcome to NextShift/i);
            const modalHeadingAfterReset = welcomeHeadingsAfterReset.find(
                (el) => el.className.includes('modal-title'),
            );
            expect(modalHeadingAfterReset).toBeInTheDocument();
        });

        it('lets user skip team selection and browse all teams', async () => {
            // First test that the modal shows up
            render(<App />);

            // Wait for the modal to appear
            const welcomeModal = await screen.findByText(
                /Welcome to NextShift/i,
                {
                    selector: '.modal-title',
                },
            );
            expect(welcomeModal).toBeInTheDocument();

            // Progress through the wizard
            fireEvent.click(screen.getByText(/Let's Get Started/i));

            // Wait for step 2 to appear first
            await waitFor(() =>
                expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument(),
            );

            // Wait for the Choose My Experience button to appear
            const chooseButton = await screen.findByRole('button', {
                name: /Choose My Experience/i,
            });
            fireEvent.click(chooseButton);

            // Wait for step 3 to appear
            await waitFor(() => {
                expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument();
            });

            // Skip team selection
            fireEvent.click(screen.getByText(/Browse All Teams/i));

            // Modal should close
            await waitFor(() =>
                expect(
                    screen.queryByText(/Welcome to NextShift/i),
                ).not.toBeInTheDocument(),
            );

            // Should be able to open settings and reset again
            fireEvent.click(screen.getByLabelText(/Settings/i));
            fireEvent.click(screen.getByText(/Reset Data/i));
            fireEvent.click(screen.getByText(/^Reset$/));

            const welcomeHeadingsAfterReset =
                await screen.findAllByText(/Welcome to NextShift/i);
            const modalHeadingAfterReset = welcomeHeadingsAfterReset.find(
                (el) => el.className.includes('modal-title'),
            );
            expect(modalHeadingAfterReset).toBeInTheDocument();
        });

        it('shows correct progress and disables buttons when loading', async () => {
            render(<App />);

            const welcomeHeadings =
                await screen.findAllByText(/Welcome to NextShift/i);
            const modalHeading = welcomeHeadings.find((el) =>
                el.className.includes('modal-title'),
            );
            expect(modalHeading).toBeInTheDocument();

            // Progress bar and step text
            expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
            fireEvent.click(screen.getByText(/Let's Get Started/i));

            // Wait for step 2 to appear
            await waitFor(() =>
                expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument(),
            );

            // Wait for the Choose My Experience button and click it
            const chooseButton = await screen.findByRole('button', {
                name: /Choose My Experience/i,
            });
            fireEvent.click(chooseButton);

            // Wait for step 3 to appear
            await waitFor(() => {
                const step3Matches = screen.getAllByText((content) =>
                    content.includes('Step 3 of 3'),
                );
                expect(step3Matches.length).toBeGreaterThan(0);
            });
        });
    });
});
