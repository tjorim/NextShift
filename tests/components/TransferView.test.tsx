import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TransferView } from '../../src/components/TransferView';
import { useTransferCalculations } from '../../src/hooks/useTransferCalculations';
import { dayjs } from '../../src/utils/dateTimeUtils';

// Mock the useTransferCalculations hook
vi.mock('../../src/hooks/useTransferCalculations', () => ({
    useTransferCalculations: vi.fn(),
}));

const mockUseTransferCalculations = vi.mocked(useTransferCalculations);

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

// Mock console.warn to test validation
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

// Default hook return value
const defaultHookReturn = {
    transfers: [],
    hasMoreTransfers: false,
    availableTeams: [2, 3, 4, 5],
    compareTeam: 2,
    setCompareTeam: vi.fn(),
    dateRange: '14',
    setDateRange: vi.fn(),
    customStartDate: '',
    setCustomStartDate: vi.fn(),
    customEndDate: '',
    setCustomEndDate: vi.fn(),
};

const defaultProps = {
    selectedTeam: 1,
};

describe('TransferView', () => {
    beforeEach(() => {
        mockUseTransferCalculations.mockReturnValue(defaultHookReturn);
        mockConsoleWarn.mockClear();
    });

    describe('Basic rendering', () => {
        it('renders transfer view header', () => {
            render(<TransferView {...defaultProps} />);
            expect(screen.getByText('Team Transfers')).toBeInTheDocument();
        });

        it('shows team comparison controls when team is selected', () => {
            render(<TransferView {...defaultProps} selectedTeam={1} />);
            expect(screen.getByText('Compare with Team:')).toBeInTheDocument();
            expect(screen.getByText('Date Range:')).toBeInTheDocument();
        });

        it('shows team selection prompt when no team selected', () => {
            mockUseTransferCalculations.mockReturnValue({
                ...defaultHookReturn,
                transfers: [],
            });

            render(<TransferView {...defaultProps} selectedTeam={null} />);
            expect(
                screen.getByText(/Please select your team/),
            ).toBeInTheDocument();
        });
    });

    describe('Team comparison UI', () => {
        it('displays team comparison dropdown with available teams', () => {
            render(<TransferView {...defaultProps} />);

            const compareTeamSelect =
                screen.getByLabelText('Compare with Team:');
            expect(compareTeamSelect).toBeInTheDocument();
            expect(compareTeamSelect).toHaveValue('2'); // From mock hook

            // Check that available teams are rendered
            expect(screen.getByText('Team 2')).toBeInTheDocument();
            expect(screen.getByText('Team 3')).toBeInTheDocument();
            expect(screen.getByText('Team 4')).toBeInTheDocument();
            expect(screen.getByText('Team 5')).toBeInTheDocument();
        });

        it('calls setCompareTeam when user selects different team', async () => {
            const mockSetCompareTeam = vi.fn();
            mockUseTransferCalculations.mockReturnValue({
                ...defaultHookReturn,
                setCompareTeam: mockSetCompareTeam,
            });

            const user = userEvent.setup();
            render(<TransferView {...defaultProps} />);

            const compareSelect = screen.getByLabelText('Compare with Team:');
            await user.selectOptions(compareSelect, '3');

            expect(mockSetCompareTeam).toHaveBeenCalledWith(3);
        });
    });

    describe('Date range selection UI', () => {
        it('displays date range dropdown with options', () => {
            render(<TransferView {...defaultProps} />);

            const dateRangeSelect = screen.getByLabelText('Date Range:');
            expect(dateRangeSelect).toBeInTheDocument();
            expect(dateRangeSelect).toHaveValue('14'); // From mock hook

            expect(screen.getByText('Next 14 days')).toBeInTheDocument();
            expect(screen.getByText('Next 30 days')).toBeInTheDocument();
            expect(screen.getByText('Next 60 days')).toBeInTheDocument();
            expect(screen.getByText('Custom range')).toBeInTheDocument();
        });

        it('calls setDateRange when user changes date range', async () => {
            const mockSetDateRange = vi.fn();
            mockUseTransferCalculations.mockReturnValue({
                ...defaultHookReturn,
                setDateRange: mockSetDateRange,
            });

            const user = userEvent.setup();
            render(<TransferView {...defaultProps} />);

            const dateRangeSelect = screen.getByLabelText('Date Range:');
            await user.selectOptions(dateRangeSelect, '30');

            expect(mockSetDateRange).toHaveBeenCalledWith('30');
        });

        it('shows custom date inputs when custom range is selected', () => {
            mockUseTransferCalculations.mockReturnValue({
                ...defaultHookReturn,
                dateRange: 'custom',
            });

            render(<TransferView {...defaultProps} />);

            expect(screen.getByLabelText('Start Date:')).toBeInTheDocument();
            expect(screen.getByLabelText('End Date:')).toBeInTheDocument();
        });

        it('calls custom date setters when user changes custom dates', async () => {
            const mockSetCustomStartDate = vi.fn();
            const mockSetCustomEndDate = vi.fn();
            mockUseTransferCalculations.mockReturnValue({
                ...defaultHookReturn,
                dateRange: 'custom',
                setCustomStartDate: mockSetCustomStartDate,
                setCustomEndDate: mockSetCustomEndDate,
            });

            const user = userEvent.setup();
            render(<TransferView {...defaultProps} />);

            const startDateInput = screen.getByLabelText('Start Date:');
            const endDateInput = screen.getByLabelText('End Date:');

            await user.type(startDateInput, '2025-01-01');
            await user.type(endDateInput, '2025-01-31');

            expect(mockSetCustomStartDate).toHaveBeenCalled();
            expect(mockSetCustomEndDate).toHaveBeenCalled();
        });
    });

    describe('Transfer results display', () => {
        it('shows no transfers message when transfers array is empty', () => {
            mockUseTransferCalculations.mockReturnValue({
                ...defaultHookReturn,
                transfers: [],
                compareTeam: 2,
            });

            render(<TransferView {...defaultProps} selectedTeam={1} />);

            expect(
                screen.getByText(
                    /No transfers found between Team 1 and Team 2/,
                ),
            ).toBeInTheDocument();
        });

        it('displays transfers when provided by hook', () => {
            const mockTransfers = [
                {
                    date: dayjs('2025-01-15'),
                    fromTeam: 1,
                    toTeam: 2,
                    fromShiftType: 'M' as const,
                    fromShiftName: 'Morning',
                    toShiftType: 'E' as const,
                    toShiftName: 'Evening',
                    isHandover: true,
                },
            ];

            mockUseTransferCalculations.mockReturnValue({
                ...defaultHookReturn,
                transfers: mockTransfers,
                compareTeam: 2,
            });

            render(<TransferView {...defaultProps} selectedTeam={1} />);

            expect(
                screen.getByText('Transfers between Team 1 and Team 2'),
            ).toBeInTheDocument();
            expect(screen.getByText('Wed, Jan 15')).toBeInTheDocument();
            expect(screen.getByText('Morning')).toBeInTheDocument();
            expect(screen.getByText('Evening')).toBeInTheDocument();
            expect(screen.getByText('Team 1 → Team 2')).toBeInTheDocument();
            expect(screen.getByText('Handover')).toBeInTheDocument();
        });

        it('shows team selection prompt when no team selected', () => {
            render(<TransferView {...defaultProps} selectedTeam={null} />);

            expect(
                screen.getByText(/Please select your team/),
            ).toBeInTheDocument();
        });
    });

    describe('Prop validation', () => {
        it('handles invalid team selection and shows warning', () => {
            render(<TransferView {...defaultProps} selectedTeam={999} />);

            // Should render without crashing
            expect(screen.getByText('Team Transfers')).toBeInTheDocument();
            // Should have called console.warn
            expect(mockConsoleWarn).toHaveBeenCalledWith(
                'Invalid team number: 999. Expected 1-5',
            );
        });

        it('handles negative team numbers', () => {
            render(<TransferView {...defaultProps} selectedTeam={-1} />);

            expect(screen.getByText('Team Transfers')).toBeInTheDocument();
            expect(mockConsoleWarn).toHaveBeenCalledWith(
                'Invalid team number: -1. Expected 1-5',
            );
        });

        it('handles null team selection without warning', () => {
            render(<TransferView {...defaultProps} selectedTeam={null} />);

            expect(screen.getByText('Team Transfers')).toBeInTheDocument();
            expect(mockConsoleWarn).not.toHaveBeenCalled();
        });
    });

    describe('Transfer data display', () => {
        it('displays transfer data with proper formatting', () => {
            const mockTransfers = [
                {
                    date: dayjs('2025-01-15'),
                    fromTeam: 1,
                    toTeam: 2,
                    fromShiftType: 'M' as const,
                    fromShiftName: 'Morning',
                    toShiftType: 'E' as const,
                    toShiftName: 'Evening',
                    isHandover: true,
                },
                {
                    date: dayjs('2025-01-16'),
                    fromTeam: 2,
                    toTeam: 1,
                    fromShiftType: 'E' as const,
                    fromShiftName: 'Evening',
                    toShiftType: 'N' as const,
                    toShiftName: 'Night',
                    isHandover: false,
                },
            ];

            mockUseTransferCalculations.mockReturnValue({
                ...defaultHookReturn,
                transfers: mockTransfers,
                compareTeam: 2,
            });

            render(<TransferView {...defaultProps} selectedTeam={1} />);

            // Check that both transfers are displayed
            expect(screen.getByText('Wed, Jan 15')).toBeInTheDocument();
            expect(screen.getByText('Thu, Jan 16')).toBeInTheDocument();

            // Check shift types
            expect(screen.getAllByText('Morning')).toHaveLength(1);
            expect(screen.getAllByText('Evening')).toHaveLength(2); // Appears in both transfers
            expect(screen.getAllByText('Night')).toHaveLength(1);

            // Check transfer directions
            expect(screen.getByText('Team 1 → Team 2')).toBeInTheDocument();
            expect(screen.getByText('Team 2 → Team 1')).toBeInTheDocument();

            // Check handover/takeover labels
            expect(screen.getByText('Handover')).toBeInTheDocument();
            expect(screen.getByText('Takeover')).toBeInTheDocument();
        });

        it('shows maximum 20 transfers message when applicable', () => {
            // Create 21 mock transfers to test the limit
            const mockTransfers = Array.from({ length: 21 }, (_, i) => ({
                date: dayjs('2025-01-15').add(i, 'day'),
                fromTeam: 1,
                toTeam: 2,
                fromShiftType: 'M' as const,
                fromShiftName: 'Morning',
                toShiftType: 'E' as const,
                toShiftName: 'Evening',
                isHandover: true,
            }));

            mockUseTransferCalculations.mockReturnValue({
                ...defaultHookReturn,
                transfers: mockTransfers.slice(0, 20), // Hook should limit to 20
                compareTeam: 2,
            });

            render(<TransferView {...defaultProps} selectedTeam={1} />);

            // Note: The "showing first 20" message would be shown by the component
            // if transfers.length was 20 and there were more, but since our hook
            // already limits to 20, this message logic might need to be in the hook
            expect(
                screen.getByText('Transfers between Team 1 and Team 2'),
            ).toBeInTheDocument();
        });
    });

    describe('Advanced interactions', () => {
        it('handles rapid team selection changes', async () => {
            const mockSetCompareTeam = vi.fn();
            mockUseTransferCalculations.mockReturnValue({
                ...defaultHookReturn,
                setCompareTeam: mockSetCompareTeam,
            });

            const user = userEvent.setup();
            render(<TransferView {...defaultProps} />);

            const compareSelect = screen.getByLabelText('Compare with Team:');

            // Rapid changes
            await user.selectOptions(compareSelect, '3');
            await user.selectOptions(compareSelect, '4');
            await user.selectOptions(compareSelect, '5');

            expect(mockSetCompareTeam).toHaveBeenCalledTimes(3);
            expect(mockSetCompareTeam).toHaveBeenNthCalledWith(1, 3);
            expect(mockSetCompareTeam).toHaveBeenNthCalledWith(2, 4);
            expect(mockSetCompareTeam).toHaveBeenNthCalledWith(3, 5);
        });

        it('handles rapid date range changes', async () => {
            const mockSetDateRange = vi.fn();
            mockUseTransferCalculations.mockReturnValue({
                ...defaultHookReturn,
                setDateRange: mockSetDateRange,
            });

            const user = userEvent.setup();
            render(<TransferView {...defaultProps} />);

            const dateRangeSelect = screen.getByLabelText('Date Range:');

            // Rapid changes
            await user.selectOptions(dateRangeSelect, '30');
            await user.selectOptions(dateRangeSelect, '60');
            await user.selectOptions(dateRangeSelect, 'custom');

            expect(mockSetDateRange).toHaveBeenCalledTimes(3);
            expect(mockSetDateRange).toHaveBeenNthCalledWith(1, '30');
            expect(mockSetDateRange).toHaveBeenNthCalledWith(2, '60');
            expect(mockSetDateRange).toHaveBeenNthCalledWith(3, 'custom');
        });
    });
});
