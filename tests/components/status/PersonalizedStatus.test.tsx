import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PersonalizedStatus } from '../../../src/components/status/PersonalizedStatus';
import { SettingsProvider } from '../../../src/contexts/SettingsContext';
import { ToastProvider } from '../../../src/contexts/ToastContext';
import { dayjs } from '../../../src/utils/dateTimeUtils';
import * as shiftCalculations from '../../../src/utils/shiftCalculations';

// Mock dependencies
vi.mock('../../../src/utils/shiftCalculations', () => ({
    getShiftByCode: vi.fn(),
}));

function renderWithProviders(ui: React.ReactElement) {
    return render(
        <ToastProvider>
            <SettingsProvider>{ui}</SettingsProvider>
        </ToastProvider>,
    );
}

describe('PersonalizedStatus Component', () => {
    const mockCurrentShift = {
        date: dayjs('2024-01-15'),
        shift: {
            code: 'M',
            name: 'Morning',
            hours: '07:00-15:00',
            start: 7,
            end: 15,
            isWorking: true,
        },
        code: '2401.1M',
        teamNumber: 1,
    };

    const mockNextShift = {
        date: dayjs('2024-01-16'),
        shift: {
            code: 'E',
            name: 'Evening',
            hours: '15:00-23:00',
            start: 15,
            end: 23,
            isWorking: true,
        },
        code: '2401.2E',
    };

    const mockOffDayProgress = {
        current: 2,
        total: 4,
    };

    const mockCountdown = {
        days: 0,
        hours: 2,
        minutes: 30,
        seconds: 0,
        totalSeconds: 9000,
        formatted: '2h 30m',
        isExpired: false,
    };

    const mockNextShiftStartTime = dayjs('2024-01-16')
        .hour(15)
        .minute(0)
        .second(0);

    beforeEach(() => {
        vi.clearAllMocks();

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
    });

    describe('Team Status Display', () => {
        it('should render team status when current shift is provided', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(screen.getByText('🏷️ Your Team Status')).toBeInTheDocument();
            expect(screen.getByText('Team 1: Morning')).toBeInTheDocument();
            expect(screen.getByText('07:00–15:00')).toBeInTheDocument();
        });

        it('should show shift tooltip with detailed information', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            const badge = screen.getByText('Team 1: Morning');
            expect(badge).toHaveClass(
                'shift-code',
                'shift-badge-lg',
                'cursor-help',
            );
        });

        it('should not render team status when current shift is null', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={null}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(screen.getByText('🏷️ Your Team Status')).toBeInTheDocument();
            expect(
                screen.queryByText('Team 1: Morning'),
            ).not.toBeInTheDocument();
        });

        it('should display different team numbers correctly', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={3}
                    currentShift={{
                        ...mockCurrentShift,
                        teamNumber: 3,
                    }}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(screen.getByText('Team 3: Morning')).toBeInTheDocument();
        });
    });

    describe('Off Day Progress', () => {
        it('should show off day progress when team is not working', () => {
            const offShift = {
                ...mockCurrentShift,
                shift: {
                    ...mockCurrentShift.shift,
                    isWorking: false,
                    name: 'Off',
                    code: 'O',
                },
            };

            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={offShift}
                    nextShift={mockNextShift}
                    offDayProgress={mockOffDayProgress}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(
                screen.getByText('Off Day Progress: Day 2 of 4'),
            ).toBeInTheDocument();

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toBeInTheDocument();
        });

        it('should not show off day progress when team is working', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={mockNextShift}
                    offDayProgress={mockOffDayProgress}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(
                screen.queryByText('Off Day Progress'),
            ).not.toBeInTheDocument();
        });

        it('should not show off day progress when progress data is null', () => {
            const offShift = {
                ...mockCurrentShift,
                shift: {
                    ...mockCurrentShift.shift,
                    isWorking: false,
                },
            };

            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={offShift}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(
                screen.queryByText('Off Day Progress'),
            ).not.toBeInTheDocument();
        });

        it('should calculate progress bar percentage correctly', () => {
            const offShift = {
                ...mockCurrentShift,
                shift: {
                    ...mockCurrentShift.shift,
                    isWorking: false,
                },
            };

            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={offShift}
                    nextShift={mockNextShift}
                    offDayProgress={{ current: 3, total: 4 }}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-valuenow', '75');
        });
    });

    describe('Next Shift Display', () => {
        it('should render next shift information when available', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(screen.getByText('Your Next Shift')).toBeInTheDocument();
            expect(
                screen.getByText('Tue, Jan 16 - Evening'),
            ).toBeInTheDocument();
            expect(screen.getByText('15:00–23:00')).toBeInTheDocument();
        });

        it('should show countdown when available and not expired', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(screen.getByText('⏰ Starts in 2h 30m')).toBeInTheDocument();
        });

        it('should not show countdown when expired', () => {
            const expiredCountdown = {
                ...mockCountdown,
                isExpired: true,
            };

            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={expiredCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(screen.queryByText(/⏰ Starts in/)).not.toBeInTheDocument();
        });

        it('should not show countdown when countdown is null', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={null}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(screen.queryByText(/⏰ Starts in/)).not.toBeInTheDocument();
        });

        it('should not show countdown when nextShiftStartTime is null', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={null}
                />,
            );

            expect(screen.queryByText(/⏰ Starts in/)).not.toBeInTheDocument();
        });

        it('should show fallback message when next shift is null', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={null}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(
                screen.getByText('Next shift information not available'),
            ).toBeInTheDocument();
        });

        it('should handle next shift without start/end times', () => {
            const nextShiftNoTime = {
                ...mockNextShift,
                shift: {
                    ...mockNextShift.shift,
                    start: null,
                    end: null,
                    hours: 'Off',
                },
            };

            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={nextShiftNoTime}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            expect(screen.getByText('Off')).toBeInTheDocument();
        });
    });

    describe('Component Structure', () => {
        it('should render correct Bootstrap layout structure', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            // Check for Bootstrap card elements
            const cards = document.querySelectorAll('.card');
            expect(cards).toHaveLength(2); // Two cards in the layout
        });

        it('should have proper card structure with flex layout', () => {
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            const statusCard = screen
                .getByText('🏷️ Your Team Status')
                .closest('.card');
            const nextShiftCard = screen
                .getByText('Your Next Shift')
                .closest('.card');

            expect(statusCard).toHaveClass('h-100');
            expect(nextShiftCard).toHaveClass('h-100');
        });
    });

    describe('Integration with Settings', () => {
        it('should use settings for time format display', () => {
            // The component uses useSettings hook and formatters
            // This is tested implicitly through the time display checks above
            renderWithProviders(
                <PersonalizedStatus
                    myTeam={1}
                    currentShift={mockCurrentShift}
                    nextShift={mockNextShift}
                    offDayProgress={null}
                    countdown={mockCountdown}
                    nextShiftStartTime={mockNextShiftStartTime}
                />,
            );

            // Verify that time is displayed in localized format (en-dash)
            expect(screen.getByText('07:00–15:00')).toBeInTheDocument();
            expect(screen.getByText('15:00–23:00')).toBeInTheDocument();
        });
    });
});
