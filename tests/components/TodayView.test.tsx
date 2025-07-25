import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { TodayView } from '../../src/components/TodayView';
import type { ShiftResult } from '../../src/utils/shiftCalculations';

// Mock getShiftClassName utility
vi.mock('../../src/utils/shiftStyles', () => ({
    getShiftClassName: vi.fn(
        (shiftCode: string) => `shift-${shiftCode.toLowerCase()}`,
    ),
}));

const mockTodayShifts: ShiftResult[] = [
    {
        teamNumber: 1,
        shift: {
            type: 'M',
            code: 'M',
            name: 'Morning',
            start: 7,
            end: 15,
            isWorking: true,
        },
        date: dayjs('2025-01-15'),
        dateCode: '2503.3M',
    },
    {
        teamNumber: 2,
        shift: {
            type: 'E',
            code: 'E',
            name: 'Evening',
            start: 15,
            end: 23,
            isWorking: true,
        },
        date: dayjs('2025-01-15'),
        dateCode: '2503.3E',
    },
    {
        teamNumber: 3,
        shift: {
            type: 'O',
            code: 'O',
            name: 'Off',
            start: null,
            end: null,
            isWorking: false,
        },
        date: dayjs('2025-01-15'),
        dateCode: '2503.3O',
    },
];

const defaultProps = {
    todayShifts: mockTodayShifts,
    selectedTeam: 1,
    onTodayClick: vi.fn(),
};

describe('TodayView', () => {
    describe('Basic rendering', () => {
        it('renders today view with shifts', () => {
            render(<TodayView {...defaultProps} />);

            expect(screen.getByText('Today')).toBeInTheDocument();
            expect(screen.getByText('Team 1')).toBeInTheDocument();
            expect(screen.getByText('Team 2')).toBeInTheDocument();
            expect(screen.getByText('Team 3')).toBeInTheDocument();
        });

        it('displays shift information for working teams', () => {
            render(<TodayView {...defaultProps} />);

            expect(screen.getByText('Morning')).toBeInTheDocument();
            expect(screen.getByText('Evening')).toBeInTheDocument();
            expect(screen.getByText('Off')).toBeInTheDocument();
        });

        it('shows Today button', () => {
            render(<TodayView {...defaultProps} />);
            expect(screen.getByText('Today')).toBeInTheDocument();
        });
    });

    describe('Team highlighting', () => {
        it('highlights selected team', () => {
            render(<TodayView {...defaultProps} selectedTeam={1} />);

            // The selected team should have my-team class on the div element
            const team1Element = screen.getByText('Team 1').closest('.my-team');
            expect(team1Element).toBeInTheDocument();
        });

        it('handles no selected team', () => {
            render(<TodayView {...defaultProps} selectedTeam={null} />);

            // Should render without errors
            expect(screen.getByText('Team 1')).toBeInTheDocument();
        });
    });

    describe('Today button functionality', () => {
        it('calls onTodayClick when Today button is clicked', async () => {
            const user = userEvent.setup();
            const mockOnTodayClick = vi.fn();

            render(
                <TodayView {...defaultProps} onTodayClick={mockOnTodayClick} />,
            );

            const todayButton = screen.getByRole('button', { name: /today/i });
            await user.click(todayButton);

            expect(mockOnTodayClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('Empty state', () => {
        it('handles empty shifts array', () => {
            render(<TodayView {...defaultProps} todayShifts={[]} />);

            // Should still render the Today header
            expect(screen.getByText('Today')).toBeInTheDocument();
        });
    });

    describe('Shift display', () => {
        it('shows shift names for working shifts', () => {
            render(<TodayView {...defaultProps} />);

            // Should show shift names
            expect(screen.getByText('Morning')).toBeInTheDocument();
            expect(screen.getByText('Evening')).toBeInTheDocument();
        });

        it('shows off status for non-working teams', () => {
            render(<TodayView {...defaultProps} />);

            expect(screen.getByText('Off')).toBeInTheDocument();
        });
    });
});
