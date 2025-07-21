import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import {
    calculateShift,
    formatDateCode,
    getCurrentShiftDay,
    getNextShift,
    getShiftCode,
    SHIFTS,
} from '../src/utils/shiftCalculations';

describe('Shift Calculations', () => {
    describe('Core Business Logic', () => {
        it('should calculate correct shift for reference team on reference date', () => {
            // Reference: Team 1 on 2025-01-06 should be in morning shift (cycle start)
            const referenceDate = new Date('2025-01-06');
            const shift = calculateShift(referenceDate, 1);
            expect(shift).toBe(SHIFTS.MORNING);
        });

        it('should calculate different shifts for different teams on same date', () => {
            const testDate = new Date('2025-01-06');
            const team1Shift = calculateShift(testDate, 1);
            const team2Shift = calculateShift(testDate, 2);

            // Teams should have different shifts due to offset
            expect(team1Shift).not.toBe(team2Shift);
        });

        it('should handle shift progression correctly', () => {
            const baseDate = new Date('2025-01-06');
            const team = 1;

            // Test 10-day cycle
            const shifts = [];
            for (let i = 0; i < 10; i++) {
                const date = dayjs(baseDate).add(i, 'day').toDate();
                const shift = calculateShift(date, team);
                shifts.push(shift.code);
            }

            // Should see pattern: M, M, E, E, N, N, O, O, O, O
            expect(shifts.slice(0, 6)).toEqual(['M', 'M', 'E', 'E', 'N', 'N']);
            expect(shifts.slice(6)).toEqual(['O', 'O', 'O', 'O']);
        });
    });

    describe('Date Code Formatting', () => {
        it('should format date code correctly', () => {
            const testDate = new Date('2025-05-13'); // Tuesday, Week 20 of 2025
            const formatted = formatDateCode(testDate);
            expect(formatted).toBe('2520.2'); // 25=2025, 20=week, 2=Tuesday
        });

        it('should handle Sunday as day 7', () => {
            const sunday = new Date('2025-05-18'); // Sunday
            const formatted = formatDateCode(sunday);
            expect(formatted).toMatch(/\.7$/); // Should end with .7
        });
    });

    describe('Shift Code Generation', () => {
        it('should generate correct shift codes', () => {
            const testDate = new Date('2025-01-06');
            const code = getShiftCode(testDate, 1);
            expect(code).toMatch(/^\d{4}\.\d[MEN]$/); // Format: YYWW.DX
        });

        it('should adjust date for night shifts', () => {
            // Find a date where team has night shift
            const baseDate = new Date('2025-01-06');
            let nightDate = null;

            for (let i = 0; i < 10; i++) {
                const date = dayjs(baseDate).add(i, 'day').toDate();
                const shift = calculateShift(date, 1);
                if (shift.code === 'N') {
                    nightDate = date;
                    break;
                }
            }

            // Ensure we found a night shift date, fail the test if not
            expect(nightDate).not.toBeNull();
            if (!nightDate) {
                throw new Error(
                    'No night shift found in test range - test setup is invalid',
                );
            }

            const code = getShiftCode(nightDate, 1);
            const expectedPrevDay = dayjs(nightDate).subtract(1, 'day');
            const expectedCode = `${formatDateCode(expectedPrevDay)}N`;
            expect(code).toBe(expectedCode);
        });
    });

    describe('Next Shift Calculation', () => {
        it('should find next working shift', () => {
            const testDate = new Date('2025-01-06');
            const nextShift = getNextShift(testDate, 1);

            expect(nextShift).toBeTruthy();
            if (nextShift) {
                expect(nextShift.shift.code).not.toBe('O'); // Should not be off
                expect(nextShift.date.isAfter(dayjs(testDate))).toBe(true);
            }
        });

        it('should return null for team with no upcoming shifts in cycle', () => {
            // This is edge case - should not happen in normal 10-day cycle
            // but tests the boundary condition
            const result = getNextShift(new Date('2025-01-06'), 999); // Invalid team
            // Implementation should handle this gracefully by returning null
            expect(result).toBeNull();
        });
    });

    describe('Current Shift Day', () => {
        it('should return same day for times after 7 AM', () => {
            const testDate = dayjs('2025-01-06 10:00');
            const shiftDay = getCurrentShiftDay(testDate);
            expect(shiftDay.isSame(testDate, 'day')).toBe(true);
        });

        it('should return previous day for times before 7 AM', () => {
            const testDate = dayjs('2025-01-06 05:00');
            const shiftDay = getCurrentShiftDay(testDate);
            const expectedDay = testDate.subtract(1, 'day');
            expect(shiftDay.isSame(expectedDay, 'day')).toBe(true);
        });
    });

    describe('Night shift midnight crossing consistency', () => {
        it('should have consistent shift calculation and code for night shifts crossing midnight', () => {
            // Test at 2 AM during a night shift
            const nightTime = dayjs('2025-01-08 02:00'); // 2 AM on Jan 8
            
            const shiftDay = getCurrentShiftDay(nightTime); // Should be Jan 7
            const shift = calculateShift(shiftDay, 1);
            const code = getShiftCode(shiftDay, 1);
            
            // All calculations should be based on the same day (shiftDay)
            expect(shiftDay.isSame(nightTime.subtract(1, 'day'), 'day')).toBe(true);
            
            // If this is a night shift, the code should reflect the previous day
            if (shift.code === 'N') {
                // Code should use previous day format
                const expectedCode = `${formatDateCode(shiftDay)}N`;
                expect(code).toBe(expectedCode);
            }
        });
    });
});
