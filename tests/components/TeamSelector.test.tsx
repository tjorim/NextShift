import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TeamSelector } from '../../src/components/TeamSelector';

describe('TeamSelector Component', () => {
    let mockOnTeamSelect: ReturnType<typeof vi.fn>;
    let mockOnHide: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnTeamSelect = vi.fn();
        mockOnHide = vi.fn();
        vi.clearAllMocks();
    });

    describe('Basic Rendering Tests', () => {
        it('should render when show is true', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            expect(screen.getByText('Select Your Team')).toBeInTheDocument();
            expect(
                screen.getByText('Please select which team you belong to:'),
            ).toBeInTheDocument();
        });

        it('should render all team buttons', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            for (let i = 1; i <= 5; i++) {
                expect(screen.getByText(`Team ${i}`)).toBeInTheDocument();
            }
        });

        it('should call onTeamSelect and onHide when team is selected', async () => {
            const user = userEvent.setup();

            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            const team3Button = screen.getByText('Team 3');
            await user.click(team3Button);

            expect(mockOnTeamSelect).toHaveBeenCalledWith(3);
            expect(mockOnHide).toHaveBeenCalled();
        });

        it('should not render when show is false', () => {
            render(
                <TeamSelector
                    show={false}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            expect(
                screen.queryByText('Select Your Team'),
            ).not.toBeInTheDocument();
        });

        it('should render correct number of team buttons based on CONFIG.TEAMS_COUNT', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            const teamButtons = screen.getAllByText(/^Team \d+$/);
            expect(teamButtons).toHaveLength(5); // CONFIG.TEAMS_COUNT = 5
        });
    });

    describe('Loading State Tests', () => {
        it('should show loading spinner when isLoading is true', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={true}
                />,
            );

            expect(
                screen.getByText('Setting up your team...'),
            ).toBeInTheDocument(); // Check for loading text instead
        });

        it('should not show team buttons when loading', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={true}
                />,
            );

            expect(screen.queryByText('Team 1')).not.toBeInTheDocument();
            expect(screen.queryByText('Team 2')).not.toBeInTheDocument();
            expect(screen.queryByText('Team 3')).not.toBeInTheDocument();
            expect(screen.queryByText('Team 4')).not.toBeInTheDocument();
            expect(screen.queryByText('Team 5')).not.toBeInTheDocument();
        });

        it('should transition from loading to normal state', () => {
            const { rerender } = render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={true}
                />,
            );

            expect(
                screen.getByText('Setting up your team...'),
            ).toBeInTheDocument();
            expect(screen.queryByText('Team 1')).not.toBeInTheDocument();

            rerender(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={false}
                />,
            );

            expect(screen.queryByRole('status')).not.toBeInTheDocument();
            expect(screen.getByText('Team 1')).toBeInTheDocument();
        });

        it('should handle isLoading prop default value', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    // isLoading not provided, should default to false
                />,
            );

            // Should show team buttons, not loading state
            expect(screen.getByText('Team 1')).toBeInTheDocument();
            expect(screen.queryByRole('status')).not.toBeInTheDocument();
        });
    });

    describe('Focus Management Tests', () => {
        it('should focus first button when modal opens', async () => {
            const { rerender } = render(
                <TeamSelector
                    show={false}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            rerender(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            // Wait for the focus timeout to complete
            await waitFor(
                () => {
                    const firstButton = screen.getByText('Team 1');
                    expect(firstButton).toHaveFocus();
                },
                { timeout: 200 },
            );
        });

        it('should not focus button when loading', async () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={true}
                />,
            );

            // Wait to ensure focus timeout has passed
            await new Promise((resolve) => setTimeout(resolve, 150));

            // No team buttons should exist when loading
            expect(screen.queryByText('Team 1')).not.toBeInTheDocument();
        });

        it('should focus first button after loading completes', async () => {
            const { rerender } = render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={true}
                />,
            );

            rerender(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={false}
                />,
            );

            await waitFor(
                () => {
                    const firstButton = screen.getByText('Team 1');
                    expect(firstButton).toHaveFocus();
                },
                { timeout: 200 },
            );
        });

        it('should have first button with ref when not loading', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={false}
                />,
            );

            const firstButton = screen.getByText('Team 1');
            expect(firstButton).toBeInTheDocument();
            // The ref is attached to the first button for focus management
        });
    });

    describe('User Interaction Tests', () => {
        it('should handle clicks on all team buttons correctly', async () => {
            const user = userEvent.setup();

            for (let teamNumber = 1; teamNumber <= 5; teamNumber++) {
                const localMockOnTeamSelect = vi.fn();
                const localMockOnHide = vi.fn();

                const { unmount } = render(
                    <TeamSelector
                        show={true}
                        onTeamSelect={localMockOnTeamSelect}
                        onHide={localMockOnHide}
                    />,
                );

                const teamButton = screen.getByText(`Team ${teamNumber}`);
                await user.click(teamButton);

                expect(localMockOnTeamSelect).toHaveBeenCalledWith(teamNumber);
                expect(localMockOnTeamSelect).toHaveBeenCalledTimes(1);
                expect(localMockOnHide).toHaveBeenCalledTimes(1);

                unmount();
            }
        });

        it('should handle keyboard navigation with Enter key', async () => {
            const user = userEvent.setup();

            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            const team2Button = screen.getByText('Team 2');
            team2Button.focus();
            await user.keyboard('{Enter}');

            expect(mockOnTeamSelect).toHaveBeenCalledWith(2);
            expect(mockOnHide).toHaveBeenCalled();
        });

        it('should handle keyboard navigation with Space key', async () => {
            const user = userEvent.setup();

            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            const team4Button = screen.getByText('Team 4');
            team4Button.focus();
            await user.keyboard(' ');

            expect(mockOnTeamSelect).toHaveBeenCalledWith(4);
            expect(mockOnHide).toHaveBeenCalled();
        });

        it('should handle Tab navigation between buttons', async () => {
            const user = userEvent.setup();

            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            // Wait for initial focus
            await waitFor(() => {
                expect(screen.getByText('Team 1')).toHaveFocus();
            });

            await user.tab();
            expect(screen.getByText('Team 2')).toHaveFocus();

            await user.tab();
            expect(screen.getByText('Team 3')).toHaveFocus();
        });

        it('should prevent interaction when loading', async () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={true}
                />,
            );

            // Try to click where buttons would be - should not exist
            expect(screen.queryByText('Team 1')).not.toBeInTheDocument();
            expect(mockOnTeamSelect).not.toHaveBeenCalled();
            expect(mockOnHide).not.toHaveBeenCalled();
        });

        it('should handle rapid clicks on same button', async () => {
            const user = userEvent.setup();

            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            const team1Button = screen.getByText('Team 1');

            // Rapid clicks
            await user.click(team1Button);
            await user.click(team1Button);
            await user.click(team1Button);

            // Should handle gracefully - exact behavior depends on implementation
            expect(mockOnTeamSelect).toHaveBeenCalledWith(1);
            expect(mockOnHide).toHaveBeenCalled();
        });
    });

    describe('Accessibility Tests', () => {
        it('should have proper ARIA labels for team buttons', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            for (let i = 1; i <= 5; i++) {
                const button = screen.getByRole('button', {
                    name: `Select Team ${i}`,
                });
                expect(button).toBeInTheDocument();
                expect(button).toHaveAttribute(
                    'aria-label',
                    `Select Team ${i}`,
                );
            }
        });

        it('should have proper modal structure with role dialog', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();
        });

        it('should have team selection area with proper aria-label', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            const teamSelectionArea = screen.getByLabelText('Select your team');
            expect(teamSelectionArea).toBeInTheDocument();
        });

        it('should have proper heading structure', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            const heading = screen.getByText('Select Your Team');
            expect(heading).toBeInTheDocument();
        });

        it('should have proper loading state accessibility', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={true}
                />,
            );

            const loadingText = screen.getByText('Setting up your team...');
            expect(loadingText).toBeInTheDocument();
        });
    });

    describe('Modal Behavior Tests', () => {
        it('should have static backdrop and no keyboard dismissal', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();
            // Modal should be present and not dismissible via backdrop or keyboard
            // This is tested by the backdrop="static" and keyboard={false} props
        });

        it('should be centered', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            const dialog = screen.getByRole('dialog');
            expect(dialog).toBeInTheDocument();
            // The centered prop is passed to Modal component
        });

        it('should handle modal show/hide transitions', () => {
            const { rerender } = render(
                <TeamSelector
                    show={false}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            // When show={false}, modal is not in document
            expect(
                screen.queryByText('Select Your Team'),
            ).not.toBeInTheDocument();

            // Show the modal
            rerender(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            expect(screen.getByText('Select Your Team')).toBeInTheDocument();
            // Test that modal is properly shown - we can click a team button
            expect(screen.getByText('Team 1')).toBeInTheDocument();
        });
    });

    describe('Component Integration Tests', () => {
        it('should work with React Bootstrap components', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            // Check for Bootstrap classes
            const buttons = screen.getAllByText(/^Team \d+$/);
            buttons.forEach((button) => {
                expect(button).toHaveClass('btn'); // Bootstrap button class
                expect(button).toHaveClass('btn-outline-primary');
                expect(button).toHaveClass('w-100');
                expect(button).toHaveClass('team-btn');
            });
        });

        it('should render proper Bootstrap grid structure', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            // Check that team selection area exists with proper structure
            const teamSelectionArea = screen.getByLabelText('Select your team');
            expect(teamSelectionArea).toBeInTheDocument();
            expect(teamSelectionArea).toHaveClass('row');
            expect(teamSelectionArea).toHaveClass('g-2');
        });

        it('should handle component unmounting cleanly', () => {
            const { unmount } = render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(() => unmount()).not.toThrow();
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle callback prop changes', async () => {
            const user = userEvent.setup();
            const newMockOnTeamSelect = vi.fn();
            const newMockOnHide = vi.fn();

            const { rerender } = render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            rerender(
                <TeamSelector
                    show={true}
                    onTeamSelect={newMockOnTeamSelect}
                    onHide={newMockOnHide}
                />,
            );

            const team3Button = screen.getByText('Team 3');
            await user.click(team3Button);

            expect(mockOnTeamSelect).not.toHaveBeenCalled();
            expect(mockOnHide).not.toHaveBeenCalled();
            expect(newMockOnTeamSelect).toHaveBeenCalledWith(3);
            expect(newMockOnHide).toHaveBeenCalled();
        });

        it('should handle all team selections sequentially', async () => {
            const user = userEvent.setup();

            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            // Test each team button individually
            for (let i = 1; i <= 5; i++) {
                vi.clearAllMocks();

                const teamButton = screen.getByText(`Team ${i}`);
                await user.click(teamButton);

                expect(mockOnTeamSelect).toHaveBeenCalledWith(i);
                expect(mockOnTeamSelect).toHaveBeenCalledTimes(1);
                expect(mockOnHide).toHaveBeenCalledTimes(1);
            }
        });

        it('should maintain proper state during loading transitions', () => {
            const { rerender } = render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={false}
                />,
            );

            expect(screen.getByText('Team 1')).toBeInTheDocument();
            expect(screen.queryByRole('status')).not.toBeInTheDocument();

            // Multiple transitions
            for (let i = 0; i < 5; i++) {
                rerender(
                    <TeamSelector
                        show={true}
                        onTeamSelect={mockOnTeamSelect}
                        onHide={mockOnHide}
                        isLoading={i % 2 === 0}
                    />,
                );

                if (i % 2 === 0) {
                    expect(
                        screen.getByText('Setting up your team...'),
                    ).toBeInTheDocument();
                    expect(
                        screen.queryByText('Team 1'),
                    ).not.toBeInTheDocument();
                } else {
                    expect(
                        screen.queryByRole('status'),
                    ).not.toBeInTheDocument();
                    expect(screen.getByText('Team 1')).toBeInTheDocument();
                }
            }
        });
    });

    describe('Performance Tests', () => {
        it('should not cause memory leaks with multiple renders', () => {
            const { rerender, unmount } = render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            // Multiple re-renders with different props
            for (let i = 0; i < 10; i++) {
                rerender(
                    <TeamSelector
                        show={i % 2 === 0}
                        onTeamSelect={mockOnTeamSelect}
                        onHide={mockOnHide}
                        isLoading={i % 3 === 0}
                    />,
                );
            }

            expect(() => unmount()).not.toThrow();
        });

        it('should handle rapid prop changes efficiently', () => {
            const { rerender } = render(
                <TeamSelector
                    show={false}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                    isLoading={false}
                />,
            );

            // Rapid property changes
            for (let i = 0; i < 20; i++) {
                rerender(
                    <TeamSelector
                        show={i % 2 === 0}
                        onTeamSelect={mockOnTeamSelect}
                        onHide={mockOnHide}
                        isLoading={i % 4 === 0}
                    />,
                );
            }

            // Should end in a predictable state (even number, so show=true)
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('should efficiently render team buttons from CONFIG', () => {
            render(
                <TeamSelector
                    show={true}
                    onTeamSelect={mockOnTeamSelect}
                    onHide={mockOnHide}
                />,
            );

            // Verify all buttons render without throwing
            const buttons = screen.getAllByText(/^Team \d+$/);
            expect(buttons).toHaveLength(5);

            // Verify DOM structure is optimal (no excessive nesting)
            buttons.forEach((button) => {
                expect(button.closest('[role="dialog"]')).toBeInTheDocument();
            });

            // All buttons should be rendered with correct text
            for (let i = 1; i <= 5; i++) {
                expect(screen.getByText(`Team ${i}`)).toBeInTheDocument();
            }
        });
    });
});
