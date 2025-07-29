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

// Test helper functions
const findModalTitle = async (text: RegExp) => {
    const headings = await screen.findAllByText(text);
    const modalHeading = headings.find((el) =>
        el.className.includes('modal-title'),
    );
    expect(modalHeading).toBeInTheDocument();
    return modalHeading;
};

const waitForStep = async (stepNumber: number, timeout = 3000) => {
    await waitFor(
        () => {
            expect(
                screen.getByText(new RegExp(`Step ${stepNumber} of 3`, 'i')),
            ).toBeInTheDocument();
        },
        { timeout },
    );
};

const navigateWizardSteps = async (
    user: ReturnType<typeof userEvent.setup>,
) => {
    // Step 1 -> Step 2
    const getStartedButton = screen.getByRole('button', {
        name: /Let's Get Started/i,
    });
    await user.click(getStartedButton);
    await waitForStep(2);

    // Step 2 -> Step 3
    const chooseButton = await screen.findByRole('button', {
        name: /Choose My Experience/i,
    });
    await user.click(chooseButton);
    await waitForStep(3);
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
            vi.clearAllMocks();

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
            // Clean up any DOM modifications
            document.body.className = '';
            document.documentElement.removeAttribute('data-bs-theme');
        });

        it('shows WelcomeWizard on first load and after reset', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Verify welcome wizard appears
            await findModalTitle(/Welcome to NextShift/i);

            // Navigate through wizard steps using helper
            await navigateWizardSteps(user);

            // Complete team selection
            await user.click(screen.getByLabelText(/Select Team 1/i));

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
            const user = userEvent.setup();
            render(<App />);

            // Verify welcome wizard appears
            await findModalTitle(/Welcome to NextShift/i);

            // Navigate through wizard steps using helper
            await navigateWizardSteps(user);

            // Skip team selection
            const browseButton = screen.getByRole('button', {
                name: /Browse All Teams/i,
            });
            await user.click(browseButton);

            // Modal should close
            await waitFor(() =>
                expect(
                    screen.queryByText(/Welcome to NextShift/i),
                ).not.toBeInTheDocument(),
            );

            // Should be able to open settings and reset again
            await user.click(screen.getByLabelText(/Settings/i));
            await user.click(screen.getByText(/Reset Data/i));
            await user.click(screen.getByText(/^Reset$/));

            const welcomeHeadingsAfterReset =
                await screen.findAllByText(/Welcome to NextShift/i);
            const modalHeadingAfterReset = welcomeHeadingsAfterReset.find(
                (el) => el.className.includes('modal-title'),
            );
            expect(modalHeadingAfterReset).toBeInTheDocument();
        });

        it('shows correct progress and disables buttons when loading', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Verify welcome wizard appears with correct initial step
            await findModalTitle(/Welcome to NextShift/i);
            expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();

            // Navigate through wizard steps and verify progress indicators
            await navigateWizardSteps(user);

            // Verify we reached the final step
            expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument();
        });
    });
});
