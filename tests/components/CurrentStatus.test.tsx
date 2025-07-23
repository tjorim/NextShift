import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { CurrentStatus } from '../../src/components/CurrentStatus';
import * as shiftCalculations from '../../src/utils/shiftCalculations';
import * as useCountdownHook from '../../src/hooks/useCountdown';

// Mock dependencies
vi.mock('../../src/utils/shiftCalculations', () => ({
    calculateShift: vi.fn(),
    formatDateCode: vi.fn(),
    getCurrentShiftDay: vi.fn(),
    getNextShift: vi.fn(),
    getShiftCode: vi.fn(),
}));

vi.mock('../../src/utils/shiftStyles', () => ({
    getShiftClassName: vi.fn(() => 'shift-day'),
}));

vi.mock('../../src/hooks/useCountdown', () => ({
    useCountdown: vi.fn(),
}));

describe('CurrentStatus Component', () => {
    const mockOnChangeTeam = vi.fn();
    const mockOnShowWhoIsWorking = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Setup default mocks
        vi.mocked(shiftCalculations.formatDateCode).mockReturnValue('Mon 15 Jan');
        vi.mocked(shiftCalculations.getCurrentShiftDay).mockReturnValue(dayjs('2024-01-15'));
        vi.mocked(shiftCalculations.calculateShift).mockReturnValue({
            code: 'D',
            name: 'Day Shift',
            hours: '07:00 - 19:00',
            start: 7,
            end: 19,
        });
        vi.mocked(shiftCalculations.getShiftCode).mockReturnValue('D1');
        vi.mocked(shiftCalculations.getNextShift).mockReturnValue({
            date: dayjs('2024-01-16'),
            shift: {
                code: 'N',
                name: 'Night Shift',
                hours: '19:00 - 07:00',
                start: 19,
                end: 7,
            },
        });
        vi.mocked(useCountdownHook.useCountdown).mockReturnValue({
            formatted: '2h 30m',
            isExpired: false,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render without crashing', () => {
            render(
                <CurrentStatus
                    selectedTeam={null}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(screen.getByText('Current Status')).toBeInTheDocument();
        });

        it('should render the card structure correctly', () => {
            render(
                <CurrentStatus
                    selectedTeam={null}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(screen.getByText('Current Status')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /change team/i })).toBeInTheDocument();
        });

        it('should show who is working button when callback is provided', () => {
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                    onShowWhoIsWorking={mockOnShowWhoIsWorking}
                />
            );
            
            const whoIsWorkingButton = screen.getByRole('button', { name: /who's on/i });
            expect(whoIsWorkingButton).toBeInTheDocument();
            expect(whoIsWorkingButton).not.toBeDisabled();
        });

        it('should disable who is working button when callback is not provided', () => {
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            const whoIsWorkingButton = screen.getByRole('button', { name: /who's on/i });
            expect(whoIsWorkingButton).toBeDisabled();
        });
    });

    describe('Loading States', () => {
        it('should show loading spinner when isLoading is true', () => {
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                    isLoading={true}
                />
            );
            
            expect(screen.getByText('Updating...')).toBeInTheDocument();
            expect(screen.getByText('Calculating next shift...')).toBeInTheDocument();
        });

        it('should hide loading spinner when isLoading is false', () => {
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                    isLoading={false}
                />
            );
            
            expect(screen.queryByText('Updating...')).not.toBeInTheDocument();
            expect(screen.queryByText('Calculating next shift...')).not.toBeInTheDocument();
        });
    });

    describe('Team Selection States', () => {
        it('should show team selection prompt when no team is selected', () => {
            render(
                <CurrentStatus
                    selectedTeam={null}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(screen.getByText('Please select your team to see current status')).toBeInTheDocument();
            expect(screen.getByText('Select your team to see next shift')).toBeInTheDocument();
        });

        it('should show current shift information when team is selected', () => {
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(screen.getByText('Team 1: Day Shift')).toBeInTheDocument();
            expect(screen.getByText('07:00 - 19:00')).toBeInTheDocument();
        });

        it('should show next shift information when team is selected', () => {
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(screen.getByText('Next Shift:')).toBeInTheDocument();
            expect(screen.getByText(/Jan 16.*Night Shift/)).toBeInTheDocument();
            expect(screen.getByText('19:00 - 07:00')).toBeInTheDocument();
        });
    });

    describe('Date Display', () => {
        it('should display formatted date code', () => {
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(screen.getByText('Mon 15 Jan')).toBeInTheDocument();
            expect(shiftCalculations.formatDateCode).toHaveBeenCalledWith(expect.any(Object));
        });
    });

    describe('Countdown Display', () => {
        it('should show countdown when next shift start time is available', () => {
            vi.mocked(shiftCalculations.getNextShift).mockReturnValue({
                date: dayjs('2024-01-16'),
                shift: {
                    code: 'D',
                    name: 'Day Shift',
                    hours: '07:00 - 19:00',
                    start: 7,
                    end: 19,
                },
            });

            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(screen.getByText(/⏰ Starts in 2h 30m/)).toBeInTheDocument();
        });

        it('should handle night shift countdown correctly', () => {
            vi.mocked(shiftCalculations.getNextShift).mockReturnValue({
                date: dayjs('2024-01-16'),
                shift: {
                    code: 'N',
                    name: 'Night Shift',
                    hours: '23:00 - 07:00',
                    start: 23,
                    end: 7,
                },
            });

            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            // Should still show countdown
            expect(screen.getByText(/⏰ Starts in 2h 30m/)).toBeInTheDocument();
        });

        it('should not show countdown when expired', () => {
            vi.mocked(useCountdownHook.useCountdown).mockReturnValue({
                formatted: '0h 0m',
                isExpired: true,
            });

            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(screen.queryByText(/⏰ Starts in/)).not.toBeInTheDocument();
        });

        it('should not show countdown when no countdown data', () => {
            vi.mocked(useCountdownHook.useCountdown).mockReturnValue(null);

            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(screen.queryByText(/⏰ Starts in/)).not.toBeInTheDocument();
        });
    });

    describe('User Interactions', () => {
        it('should call onChangeTeam when change team button is clicked', async () => {
            const user = userEvent.setup();
            
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            const changeTeamButton = screen.getByRole('button', { name: /change team/i });
            await user.click(changeTeamButton);
            
            expect(mockOnChangeTeam).toHaveBeenCalledTimes(1);
        });

        it('should call onShowWhoIsWorking when who is working button is clicked', async () => {
            const user = userEvent.setup();
            
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                    onShowWhoIsWorking={mockOnShowWhoIsWorking}
                />
            );
            
            const whoIsWorkingButton = screen.getByRole('button', { name: /who's on/i });
            await user.click(whoIsWorkingButton);
            
            expect(mockOnShowWhoIsWorking).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle null current shift gracefully', () => {
            vi.mocked(shiftCalculations.calculateShift).mockReturnValue(null);
            
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            // Should not crash and should show fallback content
            expect(screen.getByText('Please select your team to see current status')).toBeInTheDocument();
        });

        it('should handle null next shift gracefully', () => {
            vi.mocked(shiftCalculations.getNextShift).mockReturnValue(null);
            
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(screen.getByText('Next shift information not available')).toBeInTheDocument();
        });

        it('should handle undefined shift start time', () => {
            vi.mocked(shiftCalculations.getNextShift).mockReturnValue({
                date: dayjs('2024-01-16'),
                shift: {
                    code: 'D',
                    name: 'Day Shift',
                    hours: '07:00 - 19:00',
                    start: undefined,
                    end: 19,
                },
            });

            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            // Should not show countdown
            expect(screen.queryByText(/⏰ Starts in/)).not.toBeInTheDocument();
        });

        it('should handle different team numbers correctly', () => {
            render(
                <CurrentStatus
                    selectedTeam={4}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(screen.getByText('Team 4: Day Shift')).toBeInTheDocument();
            expect(shiftCalculations.calculateShift).toHaveBeenCalledWith(expect.any(Object), 4);
        });
    });

    describe('Accessibility', () => {
        it('should have proper button labels and titles', () => {
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                    onShowWhoIsWorking={mockOnShowWhoIsWorking}
                />
            );
            
            const whoIsWorkingButton = screen.getByRole('button', { name: /who's on/i });
            expect(whoIsWorkingButton).toHaveAttribute('title', "See who's working right now");
        });

        it('should maintain focus management for buttons', () => {
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                    onShowWhoIsWorking={mockOnShowWhoIsWorking}
                />
            );
            
            const changeTeamButton = screen.getByRole('button', { name: /change team/i });
            const whoIsWorkingButton = screen.getByRole('button', { name: /who's on/i });
            
            changeTeamButton.focus();
            expect(changeTeamButton).toHaveFocus();
            
            whoIsWorkingButton.focus();
            expect(whoIsWorkingButton).toHaveFocus();
        });
    });

    describe('Component State Management', () => {
        it('should recalculate shifts when team changes', () => {
            const { rerender } = render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(shiftCalculations.calculateShift).toHaveBeenCalledWith(expect.any(Object), 1);
            
            rerender(
                <CurrentStatus
                    selectedTeam={2}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(shiftCalculations.calculateShift).toHaveBeenCalledWith(expect.any(Object), 2);
        });

        it('should use memoized values correctly', () => {
            const { rerender } = render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            const initialCallCount = vi.mocked(shiftCalculations.calculateShift).mock.calls.length;
            
            // Rerender with same props - should not recalculate
            rerender(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            expect(vi.mocked(shiftCalculations.calculateShift)).toHaveBeenCalledTimes(initialCallCount);
        });
    });

    describe('Bootstrap Components Integration', () => {
        it('should render with correct Bootstrap classes', () => {
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            // Check for Bootstrap card structure
            const cardElement = screen.getByText('Current Status').closest('.card');
            expect(cardElement).toBeInTheDocument();
            
            // Check for Bootstrap button classes
            const changeTeamButton = screen.getByRole('button', { name: /change team/i });
            expect(changeTeamButton).toHaveClass('btn');
        });

        it('should render badges with correct classes', () => {
            render(
                <CurrentStatus
                    selectedTeam={1}
                    onChangeTeam={mockOnChangeTeam}
                />
            );
            
            const shiftBadge = screen.getByText('Team 1: Day Shift');
            expect(shiftBadge).toHaveClass('badge');
            expect(shiftBadge).toHaveClass('shift-code');
            expect(shiftBadge).toHaveClass('shift-badge-lg');
        });
    });
});