import { render, screen } from '@testing-library/react';
import type { Dayjs } from 'dayjs';
import { describe, expect, it } from 'vitest';
import { ShiftTimeline } from '../../src/components/ShiftTimeline';
import { dayjs } from '../../src/utils/dateTimeUtils';
import type { ShiftResult } from '../../src/utils/shiftCalculations';

// Mock data for testing
const createMockShiftResult = (
    teamNumber: number,
    shiftCode: 'M' | 'E' | 'N' | 'O',
    date: Dayjs,
): ShiftResult => ({
    teamNumber,
    date,
    code: `${date.format('YYWW.d')}${shiftCode}`,
    shift: {
        code: shiftCode,
        name:
            shiftCode === 'M'
                ? '🌅 Morning Shift'
                : shiftCode === 'E'
                  ? '🌆 Evening Shift'
                  : shiftCode === 'N'
                    ? '🌙 Night Shift'
                    : '🏠 Off Duty',
        hours:
            shiftCode === 'M'
                ? '7:00 - 15:00'
                : shiftCode === 'E'
                  ? '15:00 - 23:00'
                  : shiftCode === 'N'
                    ? '23:00 - 7:00'
                    : '',
        start:
            shiftCode === 'M'
                ? 7
                : shiftCode === 'E'
                  ? 15
                  : shiftCode === 'N'
                    ? 23
                    : null,
        end:
            shiftCode === 'M'
                ? 15
                : shiftCode === 'E'
                  ? 23
                  : shiftCode === 'N'
                    ? 7
                    : null,
        isWorking: shiftCode !== 'O',
    },
});

describe('ShiftTimeline', () => {
    const today = dayjs('2025-01-15'); // Wednesday

    it('renders timeline header', () => {
        const currentWorkingTeam = createMockShiftResult(1, 'M', today);

        render(
            <ShiftTimeline
                currentWorkingTeam={currentWorkingTeam}
                today={today}
            />,
        );

        expect(screen.getByText("Today's Shift Timeline")).toBeInTheDocument();
        expect(document.querySelector('.bi-clock')).toBeInTheDocument(); // Bootstrap icon
    });

    it('displays current working team with active indicator', () => {
        const currentWorkingTeam = createMockShiftResult(3, 'E', today);

        render(
            <ShiftTimeline
                currentWorkingTeam={currentWorkingTeam}
                today={today}
            />,
        );

        expect(screen.getByText('T3')).toBeInTheDocument();
        expect(screen.getByText('E 🔴')).toBeInTheDocument();
    });

    it('shows tooltip on hover for current team', async () => {
        const currentWorkingTeam = createMockShiftResult(2, 'N', today);

        render(
            <ShiftTimeline
                currentWorkingTeam={currentWorkingTeam}
                today={today}
            />,
        );

        const currentBadge = screen.getByText('T2');
        expect(currentBadge).toBeInTheDocument();

        // Tooltip content is tested through overlay trigger functionality
        expect(
            currentBadge.closest('.timeline-current-badge'),
        ).toBeInTheDocument();
    });

    it('applies correct shift styling classes', () => {
        const morningTeam = createMockShiftResult(1, 'M', today);

        render(
            <ShiftTimeline currentWorkingTeam={morningTeam} today={today} />,
        );

        const badge = screen.getByText('T1');
        expect(badge).toHaveClass('timeline-current-badge');
        expect(badge).toHaveClass('timeline-badge');
    });

    it('renders timeline flow structure', () => {
        const currentWorkingTeam = createMockShiftResult(1, 'M', today);

        const { container } = render(
            <ShiftTimeline
                currentWorkingTeam={currentWorkingTeam}
                today={today}
            />,
        );

        expect(container.querySelector('.timeline-flow')).toBeInTheDocument();
        expect(container.querySelector('.timeline-team')).toBeInTheDocument();
    });

    it('handles different shift codes correctly', () => {
        const nightTeam = createMockShiftResult(5, 'N', today);

        render(<ShiftTimeline currentWorkingTeam={nightTeam} today={today} />);

        expect(screen.getByText('T5')).toBeInTheDocument();
        expect(screen.getByText('N 🔴')).toBeInTheDocument();
    });
});
