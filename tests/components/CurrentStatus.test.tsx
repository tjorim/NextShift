import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CurrentStatus } from '../../src/components/CurrentStatus';
import { SettingsProvider } from '../../src/contexts/SettingsContext';
import { ToastProvider } from '../../src/contexts/ToastContext';
import * as useCountdownHook from '../../src/hooks/useCountdown';
import { dayjs, formatYYWWD } from '../../src/utils/dateTimeUtils';
import * as shiftCalculations from '../../src/utils/shiftCalculations';

// Mock dependencies
vi.mock('../../src/utils/shiftCalculations', () => ({
    calculateShift: vi.fn(),
    getAllTeamsShifts: vi.fn(),
    getCurrentShiftDay: vi.fn(),
    getNextShift: vi.fn(),
    getOffDayProgress: vi.fn(),
    getShiftCode: vi.fn(),
    getShiftByCode: vi.fn(),
}));

// getShiftClassName is now part of shiftCalculations mock

vi.mock('../../src/hooks/useCountdown', () => ({
    useCountdown: vi.fn(),
}));

vi.mock('../../src/utils/dateTimeUtils', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        dayjs: vi.fn(() => ({
            startOf: vi.fn(() => ({
                toISOString: vi.fn(() => '2024-01-15T00:00:00.000Z'),
            })),
            isSame: vi.fn(() => false),
            format: vi.fn(() => '2024-01-15'),
            hour: vi.fn(() => ({
                minute: vi.fn(() => ({
                    second: vi.fn(() => 'mockDateTime'),
                })),
            })),
            add: vi.fn(),
            subtract: vi.fn(),
        })),
        formatYYWWD: vi.fn(() => '2430.1'),
        formatTimeByPreference: vi.fn(() => '17:01'),
    };
});

function renderWithProviders(ui: React.ReactElement) {
    return render(
        <ToastProvider>
            <SettingsProvider>{ui}</SettingsProvider>
        </ToastProvider>,
    );
}

describe('CurrentStatus Component', () => {
    const mockOnChangeTeam = vi.fn();
    const mockOnShowWhoIsWorking = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        vi.mocked(formatYYWWD).mockReturnValue('Mon 15 Jan');
        vi.mocked(shiftCalculations.getCurrentShiftDay).mockReturnValue(
            dayjs('2024-01-15'),
        );
        vi.mocked(shiftCalculations.calculateShift).mockReturnValue({
            code: 'M',
            name: 'Morning',
            hours: '07:00-15:00',
            start: 7,
            end: 15,
            isWorking: true,
        });
        vi.mocked(shiftCalculations.getShiftCode).mockReturnValue('D1');
        vi.mocked(shiftCalculations.getAllTeamsShifts).mockReturnValue([
            {
                teamNumber: 1,
                shift: {
                    code: 'M',
                    name: 'Morning',
                    hours: '07:00-15:00',
                    start: 7,
                    end: 15,
                    isWorking: true,
                },
                date: dayjs('2024-01-15'),
                code: 'D1M',
            },
            {
                teamNumber: 2,
                shift: {
                    code: 'O',
                    name: 'Off',
                    hours: '',
                    start: null,
                    end: null,
                    isWorking: false,
                },
                date: dayjs('2024-01-15'),
                code: 'D1O',
            },
        ]);
        vi.mocked(shiftCalculations.getNextShift).mockReturnValue({
            date: dayjs('2024-01-16'),
            shift: {
                code: 'E',
                name: 'Evening',
                hours: '15:00-23:00',
                start: 15,
                end: 23,
                isWorking: true,
            },
            code: '2404.2E',
        });
        vi.mocked(shiftCalculations.getOffDayProgress).mockReturnValue({
            current: 2,
            total: 4,
        });
        vi.mocked(shiftCalculations.getShiftByCode).mockReturnValue({
            code: 'M',
            emoji: '🌅',
            name: 'Morning',
            hours: '07:00-15:00',
            start: 7,
            end: 15,
            isWorking: true,
            className: 'shift-morning',
        });
        vi.mocked(useCountdownHook.useCountdown).mockReturnValue({
            days: 0,
            hours: 2,
            minutes: 30,
            seconds: 0,
            totalSeconds: 9000,
            formatted: '2h 30m',
            isExpired: false,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={null}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            expect(screen.getByText('Current Status')).toBeInTheDocument();
        });

        it('should render the card structure correctly', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={null}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            expect(screen.getByText('Current Status')).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: /select team/i }),
            ).toBeInTheDocument();
        });

        it('should show who is working button when callback is provided', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                    onShowWhoIsWorking={mockOnShowWhoIsWorking}
                />,
            );

            const whoIsWorkingButton = screen.getByRole('button', {
                name: /who's on/i,
            });
            expect(whoIsWorkingButton).toBeInTheDocument();
            expect(whoIsWorkingButton).not.toBeDisabled();
        });

        it('should disable who is working button when callback is not provided', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            const whoIsWorkingButton = screen.getByRole('button', {
                name: /who's on/i,
            });
            expect(whoIsWorkingButton).toBeDisabled();
        });
    });

    describe('Team Selection States', () => {
        it('should show team selection prompt when no team is selected', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={null}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            expect(
                screen.getByText(
                    '💡 Select your team above for personalized shift tracking and countdown timers',
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Select your team for countdown timers and personalized notifications',
                ),
            ).toBeInTheDocument();
        });

        it('should show current shift information when team is selected', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            const teamMorningElements = screen.getAllByText('Team 1: Morning');
            expect(teamMorningElements.length).toBeGreaterThan(0);
            const hoursElements = screen.getAllByText('07:00-15:00');
            expect(hoursElements.length).toBeGreaterThan(0);
        });

        it('should show next shift information when team is selected', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            expect(screen.getByText('Your Next Shift')).toBeInTheDocument();
            expect(screen.getByText(/2024-01-15.*Evening/)).toBeInTheDocument();
            expect(screen.getByText('15:00-23:00')).toBeInTheDocument();
        });
    });

    describe('Date Display', () => {
        it('should display formatted date code', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            expect(screen.getByText(/📅.*Mon 15 Jan/)).toBeInTheDocument();
            expect(formatYYWWD).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    describe('Countdown Display', () => {
        it('should show countdown when next shift start time is available', () => {
            vi.mocked(shiftCalculations.getNextShift).mockReturnValue({
                date: dayjs('2024-01-16'),
                shift: {
                    code: 'M',
                    name: 'Morning',
                    hours: '07:00-15:00',
                    start: 7,
                    end: 15,
                    isWorking: true,
                },
                code: '2404.2M',
            });

            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            expect(screen.getByText(/⏰ Starts in 2h 30m/)).toBeInTheDocument();
        });

        it('should handle night shift countdown correctly', () => {
            vi.mocked(shiftCalculations.getNextShift).mockReturnValue({
                date: dayjs('2024-01-16'),
                shift: {
                    code: 'N',
                    name: 'Night',
                    hours: '23:00-07:00',
                    start: 23,
                    end: 7,
                    isWorking: true,
                },
                code: '2404.2N',
            });

            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            // Should still show countdown
            expect(screen.getByText(/⏰ Starts in 2h 30m/)).toBeInTheDocument();
        });

        it('should not show countdown when expired', () => {
            vi.mocked(useCountdownHook.useCountdown).mockReturnValue({
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                totalSeconds: 0,
                formatted: '',
                isExpired: true,
            });

            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            expect(screen.queryByText(/⏰ Starts in/)).not.toBeInTheDocument();
        });

        it('should not show countdown when no countdown data', () => {
            vi.mocked(useCountdownHook.useCountdown).mockReturnValue({
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                totalSeconds: 0,
                formatted: '',
                isExpired: true,
            });

            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            expect(screen.queryByText(/⏰ Starts in/)).not.toBeInTheDocument();
        });
    });

    describe('User Interactions', () => {
        it('should call onChangeTeam when change team button is clicked', async () => {
            const user = userEvent.setup();

            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            const changeTeamButton = screen.getByRole('button', {
                name: /change team/i,
            });
            await user.click(changeTeamButton);

            expect(mockOnChangeTeam).toHaveBeenCalledTimes(1);
        });

        it('should call onShowWhoIsWorking when who is working button is clicked', async () => {
            const user = userEvent.setup();

            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                    onShowWhoIsWorking={mockOnShowWhoIsWorking}
                />,
            );

            const whoIsWorkingButton = screen.getByRole('button', {
                name: /who's on/i,
            });
            await user.click(whoIsWorkingButton);

            expect(mockOnShowWhoIsWorking).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should show fallback when no team is selected', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={null}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            // Should show team selection prompt
            expect(
                screen.getByText(
                    '💡 Select your team above for personalized shift tracking and countdown timers',
                ),
            ).toBeInTheDocument();
        });

        it('should handle null next shift gracefully', () => {
            vi.mocked(shiftCalculations.getNextShift).mockReturnValue(null);

            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            expect(
                screen.getByText('Next shift information not available'),
            ).toBeInTheDocument();
        });

        it('should handle undefined shift start time', () => {
            vi.mocked(shiftCalculations.getNextShift).mockReturnValue({
                date: dayjs('2024-01-16'),
                shift: {
                    code: 'O',
                    name: 'Off',
                    hours: '',
                    start: null,
                    end: null,
                    isWorking: false,
                },
                code: '2404.2O',
            });

            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            // Should not show countdown
            expect(screen.queryByText(/⏰ Starts in/)).not.toBeInTheDocument();
        });

        it('should handle different team numbers correctly', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={4}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            expect(screen.getByText('Team 4: Morning')).toBeInTheDocument();
            expect(shiftCalculations.calculateShift).toHaveBeenCalledWith(
                expect.any(Object),
                4,
            );
        });
    });

    describe('Accessibility', () => {
        it('should have proper button labels and titles', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                    onShowWhoIsWorking={mockOnShowWhoIsWorking}
                />,
            );

            const whoIsWorkingButton = screen.getByRole('button', {
                name: /who's on/i,
            });
            expect(whoIsWorkingButton).toHaveAttribute(
                'title',
                "See who's working right now",
            );
        });

        it('should maintain focus management for buttons', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                    onShowWhoIsWorking={mockOnShowWhoIsWorking}
                />,
            );

            const changeTeamButton = screen.getByRole('button', {
                name: /change team/i,
            });
            const whoIsWorkingButton = screen.getByRole('button', {
                name: /who's on/i,
            });

            changeTeamButton.focus();
            expect(changeTeamButton).toHaveFocus();

            whoIsWorkingButton.focus();
            expect(whoIsWorkingButton).toHaveFocus();
        });
    });

    describe('Component State Management', () => {
        it('should recalculate shifts when team changes', () => {
            const { rerender } = renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            expect(shiftCalculations.calculateShift).toHaveBeenCalledWith(
                expect.any(Object),
                1,
            );

            rerender(
                <ToastProvider>
                    <SettingsProvider>
                        <CurrentStatus
                            selectedTeam={2}
                            onChangeTeam={mockOnChangeTeam}
                        />
                    </SettingsProvider>
                </ToastProvider>,
            );

            expect(shiftCalculations.calculateShift).toHaveBeenCalledWith(
                expect.any(Object),
                2,
            );
        });

        it('should use memoized values correctly', () => {
            const { rerender } = renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            const initialCallCount = vi.mocked(shiftCalculations.calculateShift)
                .mock.calls.length;

            // Rerender with same props - should not recalculate
            rerender(
                <ToastProvider>
                    <SettingsProvider>
                        <CurrentStatus
                            selectedTeam={1}
                            onChangeTeam={mockOnChangeTeam}
                        />
                    </SettingsProvider>
                </ToastProvider>,
            );

            expect(
                vi.mocked(shiftCalculations.calculateShift),
            ).toHaveBeenCalledTimes(initialCallCount);
        });
    });

    describe('Bootstrap Components Integration', () => {
        it('should render with correct Bootstrap classes', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            // Check for Bootstrap card structure
            const cardElement = screen
                .getByText('Current Status')
                .closest('.card');
            expect(cardElement).toBeInTheDocument();

            // Check for Bootstrap button classes
            const changeTeamButton = screen.getByRole('button', {
                name: /change team/i,
            });
            expect(changeTeamButton).toHaveClass('btn');
        });

        it('should render badges with correct classes', () => {
            renderWithProviders(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />,
            );

            const shiftBadges = screen.getAllByText('Team 1: Morning');
            const mainShiftBadge = shiftBadges.find((badge) =>
                badge.classList.contains('shift-badge-lg'),
            );
            expect(mainShiftBadge).toBeTruthy();
            expect(mainShiftBadge).toHaveClass('badge');
            expect(mainShiftBadge).toHaveClass('shift-code');
            expect(mainShiftBadge).toHaveClass('shift-badge-lg');
        });
    });
});
