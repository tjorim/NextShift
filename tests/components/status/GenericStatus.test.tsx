import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GenericStatus } from '../../../src/components/status/GenericStatus';
import { dayjs } from '../../../src/utils/dateTimeUtils';
import * as shiftCalculations from '../../../src/utils/shiftCalculations';
import { renderWithProviders } from '../../utils/renderWithProviders';

// Mock dependencies
vi.mock('../../../src/utils/shiftCalculations', () => ({
    getShiftByCode: vi.fn(),
}));

describe('GenericStatus Component', () => {
    const mockCurrentWorkingTeam = {
        date: dayjs('2024-01-15'),
        shift: {
            code: 'M' as const,
            name: 'Morning',
            hours: '07:00-15:00',
            start: 7,
            end: 15,
            isWorking: true,
        },
        code: '2401.1M',
        teamNumber: 1,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(shiftCalculations.getShiftByCode).mockReturnValue({
            code: 'M' as const,
            emoji: '🌅',
            name: 'Morning',
            hours: '07:00-15:00',
            start: 7,
            end: 15,
            isWorking: true,
            className: 'shift-morning',
        });
    });

    describe('Current Working Team Display', () => {
        it('should render current working team when provided', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            expect(screen.getByText('👥 Current Status')).toBeInTheDocument();
            expect(screen.getByText('Team 1: Morning')).toBeInTheDocument();
            expect(screen.getByText('07:00–15:00')).toBeInTheDocument();
            expect(
                screen.getByText('✅ Currently working'),
            ).toBeInTheDocument();
        });

        it('should show team selection prompt with working team', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            expect(
                screen.getByText(
                    '💡 Select your team above for personalized shift tracking and countdown timers',
                ),
            ).toBeInTheDocument();
        });

        it('should render no teams working when currentWorkingTeam is null', () => {
            renderWithProviders(<GenericStatus currentWorkingTeam={null} />);

            expect(screen.getByText('👥 Current Status')).toBeInTheDocument();
            expect(screen.getByText('No teams working')).toBeInTheDocument();
            expect(
                screen.getByText('All teams are currently off duty'),
            ).toBeInTheDocument();
        });

        it('should display correct shift badge styling', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            const badge = screen.getByText('Team 1: Morning');
            expect(badge).toHaveClass('shift-code', 'shift-badge-lg');
        });

        it('should handle different team numbers correctly', () => {
            const workingTeam3 = {
                ...mockCurrentWorkingTeam,
                teamNumber: 3,
            };

            renderWithProviders(
                <GenericStatus currentWorkingTeam={workingTeam3} />,
            );

            expect(screen.getByText('Team 3: Morning')).toBeInTheDocument();
        });

        it('should handle shifts without start/end times', () => {
            const offTeam = {
                ...mockCurrentWorkingTeam,
                shift: {
                    ...mockCurrentWorkingTeam.shift,
                    start: null,
                    end: null,
                    hours: 'Off',
                    isWorking: false,
                },
            };

            renderWithProviders(<GenericStatus currentWorkingTeam={offTeam} />);

            expect(screen.getByText('Off')).toBeInTheDocument();
        });

        it('should handle midnight shift correctly (start: 0)', () => {
            const midnightShift = {
                ...mockCurrentWorkingTeam,
                shift: {
                    ...mockCurrentWorkingTeam.shift,
                    code: 'N' as const,
                    name: 'Night',
                    start: 0,
                    end: 7,
                    hours: '00:00-07:00',
                },
            };

            renderWithProviders(
                <GenericStatus currentWorkingTeam={midnightShift} />,
            );

            // Should render localized time instead of fallback hours
            expect(screen.getByText('00:00–07:00')).toBeInTheDocument();
            expect(screen.queryByText('00:00-07:00')).not.toBeInTheDocument();
        });
    });

    describe('Next Activity Display', () => {
        it('should show next shift change message when team is working', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            expect(screen.getByText('Next Activity')).toBeInTheDocument();
            expect(
                screen.getByText('Next shift change coming soon'),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Check the timeline above or view all teams in the "Today" tab',
                ),
            ).toBeInTheDocument();
        });

        it('should show next shift tomorrow message when no team is working', () => {
            renderWithProviders(<GenericStatus currentWorkingTeam={null} />);

            expect(screen.getByText('Next Activity')).toBeInTheDocument();
            expect(
                screen.getByText('Next shift starts tomorrow'),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'View the schedule in other tabs for detailed timing',
                ),
            ).toBeInTheDocument();
        });

        it('should show team selection encouragement in next activity', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            expect(
                screen.getByText(
                    'Select your team for countdown timers and personalized notifications',
                ),
            ).toBeInTheDocument();
        });
    });

    describe('Component Structure', () => {
        it('should render correct Bootstrap layout structure', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            // Check for Bootstrap card elements
            const cards = document.querySelectorAll('.card');
            expect(cards).toHaveLength(2); // Two cards in the layout
        });

        it('should have proper card structure with flex layout', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            const statusCard = screen
                .getByText('👥 Current Status')
                .closest('.card');
            const nextActivityCard = screen
                .getByText('Next Activity')
                .closest('.card');

            expect(statusCard).toHaveClass('h-100');
            expect(nextActivityCard).toHaveClass('h-100');
        });

        it('should include separator lines for visual organization', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            const separators = document.querySelectorAll('hr.my-3');
            expect(separators).toHaveLength(2); // One in each card
        });
    });

    describe('Badge Styling', () => {
        it('should apply correct badge styling for working team', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            const workingBadge = screen.getByText('Team 1: Morning');
            expect(workingBadge).toHaveClass('badge');
            expect(workingBadge).toHaveClass('shift-morning'); // from mock
        });

        it('should apply secondary badge for no teams working', () => {
            renderWithProviders(<GenericStatus currentWorkingTeam={null} />);

            const noTeamsBadge = screen.getByText('No teams working');
            expect(noTeamsBadge).toHaveClass('badge');
            expect(noTeamsBadge).toHaveClass('bg-secondary');
        });
    });

    describe('Integration with Settings', () => {
        it('should use settings for time format display', () => {
            // The component uses useSettings hook and formatters
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            // Verify that time is displayed in localized format (en-dash)
            expect(screen.getByText('07:00–15:00')).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should provide meaningful content structure', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            // Check for heading structure
            expect(screen.getByText('👥 Current Status')).toBeInTheDocument();
            expect(screen.getByText('Next Activity')).toBeInTheDocument();
        });

        it('should provide clear status indicators', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            expect(
                screen.getByText('✅ Currently working'),
            ).toBeInTheDocument();
        });

        it('should provide clear guidance when no teams working', () => {
            renderWithProviders(<GenericStatus currentWorkingTeam={null} />);

            expect(
                screen.getByText('All teams are currently off duty'),
            ).toBeInTheDocument();
        });
    });

    describe('Content Consistency', () => {
        it('should show consistent team selection messaging', () => {
            renderWithProviders(
                <GenericStatus currentWorkingTeam={mockCurrentWorkingTeam} />,
            );

            // Both cards should have team selection encouragement
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

        it('should maintain consistent messaging when no teams working', () => {
            renderWithProviders(<GenericStatus currentWorkingTeam={null} />);

            // Should still show team selection encouragement
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
    });
});
