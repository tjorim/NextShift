import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { TransferView } from '../../src/components/TransferView';

// Mock the dependencies
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
};

describe('TransferView', () => {
    describe('Basic rendering', () => {
        it('renders transfer view header', () => {
            render(<TransferView {...defaultProps} />);
            expect(screen.getByText('Team Transfers')).toBeInTheDocument();
        });

        it('shows team selection when team is selected', () => {
            render(<TransferView {...defaultProps} selectedTeam={1} />);
            expect(screen.getByText('Compare with Team:')).toBeInTheDocument();
        });

        it('shows team selection prompt when no team selected', () => {
            render(<TransferView {...defaultProps} selectedTeam={null} />);
            expect(
                screen.getByText(/Please select your team/),
            ).toBeInTheDocument();
        });
    });

    describe('Team comparison', () => {
        it('displays team comparison dropdown', () => {
            render(<TransferView {...defaultProps} />);

            const compareTeamSelect =
                screen.getByLabelText('Compare with Team:');
            expect(compareTeamSelect).toBeInTheDocument();
        });

        it('shows available teams for comparison', () => {
            render(<TransferView {...defaultProps} selectedTeam={1} />);

            expect(screen.getByText('Team 2')).toBeInTheDocument();
            expect(screen.getByText('Team 3')).toBeInTheDocument();
            expect(screen.getByText('Team 4')).toBeInTheDocument();
            expect(screen.getByText('Team 5')).toBeInTheDocument();
        });

        it('allows selecting different teams for comparison', async () => {
            const user = userEvent.setup();
            render(<TransferView {...defaultProps} />);

            const compareSelect = screen.getByLabelText('Compare with Team:');
            await user.selectOptions(compareSelect, '3');

            expect(compareSelect).toHaveValue('3');
        });
    });

    describe('Date range selection', () => {
        it('displays date range dropdown', () => {
            render(<TransferView {...defaultProps} />);

            const dateRangeSelect = screen.getByLabelText('Date Range:');
            expect(dateRangeSelect).toBeInTheDocument();
        });

        it('shows date range options', () => {
            render(<TransferView {...defaultProps} />);

            expect(screen.getByText('Next 14 days')).toBeInTheDocument();
            expect(screen.getByText('Next 30 days')).toBeInTheDocument();
            expect(screen.getByText('Next 60 days')).toBeInTheDocument();
            expect(screen.getByText('Custom range')).toBeInTheDocument();
        });

        it('allows changing date range', async () => {
            const user = userEvent.setup();
            render(<TransferView {...defaultProps} />);

            const dateRangeSelect = screen.getByLabelText('Date Range:');
            await user.selectOptions(dateRangeSelect, '30');

            expect(dateRangeSelect).toHaveValue('30');
        });
    });

    describe('Transfer results', () => {
        it('displays transfer information area', () => {
            render(<TransferView {...defaultProps} />);

            const transferInfo = screen.getByText(/No transfers found/);
            expect(transferInfo).toBeInTheDocument();
        });

        it('shows message when no transfers found', () => {
            render(<TransferView {...defaultProps} selectedTeam={1} />);

            expect(
                screen.getByText(
                    /No transfers found between Team 1 and Team 2/,
                ),
            ).toBeInTheDocument();
        });

        it('handles different team comparisons', () => {
            render(<TransferView {...defaultProps} selectedTeam={3} />);

            // Should show team 3 in the message
            expect(screen.getByText(/Team 3/)).toBeInTheDocument();
        });
    });

    describe('No team selected state', () => {
        it('shows team selection prompt', () => {
            render(<TransferView {...defaultProps} selectedTeam={null} />);

            expect(
                screen.getByText(/Please select your team/),
            ).toBeInTheDocument();
        });
    });

    describe('Error handling', () => {
        it('handles invalid team selection gracefully', () => {
            render(<TransferView {...defaultProps} selectedTeam={999} />);

            // Should render without crashing
            expect(screen.getByText('Team Transfers')).toBeInTheDocument();
        });

        it('renders with default team comparison', () => {
            render(<TransferView {...defaultProps} selectedTeam={1} />);

            // Should default to comparing with team 2
            const compareSelect = screen.getByLabelText('Compare with Team:');
            expect(compareSelect).toHaveValue('2');
        });
    });
});
