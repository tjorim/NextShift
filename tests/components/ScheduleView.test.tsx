import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { ScheduleView } from '../../src/components/ScheduleView';
import { dayjs } from '../../src/utils/dateTimeUtils';

// Mock the dependencies
vi.mock('../../src/hooks/useKeyboardShortcuts', () => ({
    useKeyboardShortcuts: vi.fn(),
}));

vi.mock('../../src/utils/shiftCalculations', () => ({
    calculateShift: vi.fn((date: string, teamNumber: number) => ({
        teamNumber,
        shift: {
            type: 'M',
            code: 'M',
            name: 'Morning',
            start: 7,
            end: 15,
            isWorking: true,
        },
        date: dayjs(date),
        dateCode: '2503.1M',
    })),
    formatYYWWD: vi.fn((_date: string) => '2503.1'),
}));

vi.mock('../../src/utils/shiftStyles', () => ({
    getShiftClassName: vi.fn(
        (shiftCode: string) => `shift-${shiftCode.toLowerCase()}`,
    ),
}));

vi.mock('../../src/utils/config', () => ({
    CONFIG: {
        TEAMS_COUNT: 5,
    },
}));

const defaultProps = {
    selectedTeam: 1,
    currentDate: dayjs('2025-01-15'),
    setCurrentDate: vi.fn(),
};

describe('ScheduleView', () => {
    describe('Basic rendering', () => {
        it('renders schedule overview header', () => {
            render(<ScheduleView {...defaultProps} />);
            expect(screen.getByText('Schedule Overview')).toBeInTheDocument();
        });

        it('displays navigation buttons', () => {
            render(<ScheduleView {...defaultProps} />);

            expect(screen.getByText('Previous')).toBeInTheDocument();
            expect(screen.getByText('This Week')).toBeInTheDocument();
            expect(screen.getByText('Next')).toBeInTheDocument();
        });

        it('shows date picker', () => {
            render(<ScheduleView {...defaultProps} />);

            const dateInput = screen.getByDisplayValue('2025-01-15');
            expect(dateInput).toBeInTheDocument();
        });

        it('displays team headers', () => {
            render(<ScheduleView {...defaultProps} />);

            expect(screen.getByText('Team 1')).toBeInTheDocument();
            expect(screen.getByText('Team 2')).toBeInTheDocument();
            expect(screen.getByText('Team 3')).toBeInTheDocument();
            expect(screen.getByText('Team 4')).toBeInTheDocument();
            expect(screen.getByText('Team 5')).toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('calls setCurrentDate when previous button clicked', async () => {
            const user = userEvent.setup();
            const mockSetCurrentDate = vi.fn();

            render(
                <ScheduleView
                    {...defaultProps}
                    setCurrentDate={mockSetCurrentDate}
                />,
            );

            const prevButton = screen.getByLabelText('Go to previous week');
            await user.click(prevButton);

            expect(mockSetCurrentDate).toHaveBeenCalled();
        });

        it('calls setCurrentDate when next button clicked', async () => {
            const user = userEvent.setup();
            const mockSetCurrentDate = vi.fn();

            render(
                <ScheduleView
                    {...defaultProps}
                    setCurrentDate={mockSetCurrentDate}
                />,
            );

            const nextButton = screen.getByLabelText('Go to next week');
            await user.click(nextButton);

            expect(mockSetCurrentDate).toHaveBeenCalled();
        });

        it('calls setCurrentDate when this week button clicked', async () => {
            const user = userEvent.setup();
            const mockSetCurrentDate = vi.fn();

            render(
                <ScheduleView
                    {...defaultProps}
                    setCurrentDate={mockSetCurrentDate}
                />,
            );

            const thisWeekButton = screen.getByLabelText('Go to current week');
            await user.click(thisWeekButton);

            expect(mockSetCurrentDate).toHaveBeenCalled();
        });
    });

    describe('Schedule table', () => {
        it('displays schedule table', () => {
            render(<ScheduleView {...defaultProps} />);

            const table = screen.getByRole('table');
            expect(table).toBeInTheDocument();
        });

        it('shows day codes', () => {
            render(<ScheduleView {...defaultProps} />);

            // Should show formatted date codes
            const dateCodes = screen.getAllByText('2503.1');
            expect(dateCodes.length).toBeGreaterThan(0);
        });
    });

    describe('Team highlighting', () => {
        it('highlights selected team when provided', () => {
            render(<ScheduleView {...defaultProps} selectedTeam={2} />);

            // The selected team row should have my-team class
            const team2Element = screen.getByText('Team 2');
            const teamRow = team2Element.closest('tr');
            expect(teamRow).toHaveClass('my-team');
        });

        it('handles no selected team', () => {
            render(<ScheduleView {...defaultProps} selectedTeam={null} />);

            // Should render without errors
            expect(screen.getByText('Team 1')).toBeInTheDocument();
        });
    });

    describe('Week display', () => {
        it('shows week information', () => {
            render(
                <ScheduleView
                    {...defaultProps}
                    currentDate={dayjs('2025-01-15')}
                />,
            );

            // Should show week range (Jan 15 is in the week of Jan 13-19)
            expect(screen.getByText(/Week of/)).toBeInTheDocument();
            expect(screen.getByText(/Jan 13/)).toBeInTheDocument();
        });
    });
});
