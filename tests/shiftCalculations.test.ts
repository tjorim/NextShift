import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { CONFIG } from '../src/utils/config';
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
            // Reference: Team 1 on 2025-07-16 should be in morning shift (cycle start)
            const referenceDate = new Date('2025-07-16');
            const shift = calculateShift(referenceDate, 1);
            expect(shift).toBe(SHIFTS.MORNING);
        });

        it('should calculate different shifts for different teams on same date', () => {
            const testDate = new Date('2025-07-16');
            const team1Shift = calculateShift(testDate, 1);
            const team2Shift = calculateShift(testDate, 2);

            // Teams should have different shifts due to offset
            expect(team1Shift).not.toBe(team2Shift);
        });

        it('should handle shift progression correctly', () => {
            const baseDate = new Date('2025-07-16');
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

        it('should use correct default reference date', () => {
            // Test that the configuration uses July 16, 2025 as the reference date
            // This ensures Team 1's cycle aligns with August 1, 2022 historic start
            const referenceDate = CONFIG.REFERENCE_DATE;

            // Convert to comparable format
            const referenceDateString = referenceDate
                .toISOString()
                .split('T')[0];
            expect(referenceDateString).toBe('2025-07-16');

            // Verify Team 1 has morning shift on reference date
            const shift = calculateShift(referenceDate, 1);
            expect(shift).toBe(SHIFTS.MORNING);
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
            const testDate = new Date('2025-07-16');
            const code = getShiftCode(testDate, 1);
            expect(code).toMatch(/^\d{4}\.\d[MEN]$/); // Format: YYWW.DX
        });

        it('should adjust date for night shifts', () => {
            // Find a date where team has night shift
            const baseDate = new Date('2025-07-16');
            let nightDate: Date | null = null;

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
            const testDate = new Date('2025-07-16');
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
            const result = getNextShift(new Date('2025-07-16'), 999); // Invalid team
            // Implementation should handle this gracefully by returning null
            expect(result).toBeNull();
        });
    });

    describe('Current Shift Day', () => {
        it('should return same day for times after 7 AM', () => {
            const testDate = dayjs('2025-07-16 10:00');
            const shiftDay = getCurrentShiftDay(testDate);
            expect(shiftDay.isSame(testDate, 'day')).toBe(true);
        });

        it('should return previous day for times before 7 AM', () => {
            const testDate = dayjs('2025-07-16 05:00');
            const shiftDay = getCurrentShiftDay(testDate);
            const expectedDay = testDate.subtract(1, 'day');
            expect(shiftDay.isSame(expectedDay, 'day')).toBe(true);
        });
    });

    describe('Night shift midnight crossing consistency', () => {
        it('should have consistent shift calculation and code for night shifts crossing midnight', () => {
            // Test at 2 AM during a night shift (using date with known night shift)
            const nightTime = dayjs('2025-07-20 02:00'); // 2 AM on July 20 (team 1 night shift period)

            const shiftDay = getCurrentShiftDay(nightTime); // Should be July 19
            const shift = calculateShift(shiftDay, 1);
            const code = getShiftCode(shiftDay, 1);

            // All calculations should be based on the same day (shiftDay)
            expect(shiftDay.isSame(nightTime.subtract(1, 'day'), 'day')).toBe(
                true,
            );

            // If this is a night shift, the code should reflect the previous day
            if (shift.code === 'N') {
                // Code should use previous day format
                const expectedCode = `${formatDateCode(shiftDay)}N`;
                expect(code).toBe(expectedCode);
            }
        });
    });
});

    describe('getAllTeamsShifts Function Tests', () => {
        it('should return shifts for all teams on a given date', () => {
            const testDate = new Date('2025-07-16');
            const allShifts = getAllTeamsShifts(testDate);
            
            expect(allShifts).toHaveLength(CONFIG.TEAMS_COUNT);
            
            // Each result should have the required properties
            allShifts.forEach((result, index) => {
                expect(result.teamNumber).toBe(index + 1);
                expect(result.shift).toBeDefined();
                expect(result.code).toBeDefined();
                expect(result.date).toBeDefined();
                expect(result.shift.code).toMatch(/^[MENO]$/);
                expect(result.code).toMatch(/^\d{4}\.\d[MENO]$/);
            });
        });

        it('should return different shifts for different teams on same date', () => {
            const testDate = new Date('2025-07-16');
            const allShifts = getAllTeamsShifts(testDate);
            
            // Not all teams should have the same shift (due to offset)
            const shiftCodes = allShifts.map(s => s.shift.code);
            const uniqueShifts = new Set(shiftCodes);
            
            // Should have more than one unique shift type
            expect(uniqueShifts.size).toBeGreaterThan(1);
        });

        it('should maintain consistency with individual calculateShift calls', () => {
            const testDate = new Date('2025-07-16');
            const allShifts = getAllTeamsShifts(testDate);
            
            // Verify each team's shift matches individual calculation
            allShifts.forEach(result => {
                const individualShift = calculateShift(testDate, result.teamNumber);
                const individualCode = getShiftCode(testDate, result.teamNumber);
                
                expect(result.shift).toEqual(individualShift);
                expect(result.code).toBe(individualCode);
            });
        });

        it('should handle edge dates correctly for all teams', () => {
            const edgeDates = [
                new Date('2024-02-29'), // Leap year
                new Date('2024-12-31'), // Year end
                new Date('2025-01-01'), // Year start
                new Date('2025-07-16'), // Reference date
            ];
            
            edgeDates.forEach(date => {
                const allShifts = getAllTeamsShifts(date);
                expect(allShifts).toHaveLength(CONFIG.TEAMS_COUNT);
                
                allShifts.forEach(result => {
                    expect(result.shift).toBeDefined();
                    expect(['M', 'E', 'N', 'O']).toContain(result.shift.code);
                });
            });
        });
    });

    describe('SHIFTS Constant Validation', () => {
        it('should have properly defined SHIFTS constants', () => {
            expect(SHIFTS.MORNING.code).toBe('M');
            expect(SHIFTS.MORNING.name).toBe('🌅 Morning');
            expect(SHIFTS.MORNING.hours).toBe('07:00-15:00');
            expect(SHIFTS.MORNING.start).toBe(7);
            expect(SHIFTS.MORNING.end).toBe(15);
            expect(SHIFTS.MORNING.isWorking).toBe(true);
            
            expect(SHIFTS.EVENING.code).toBe('E');
            expect(SHIFTS.EVENING.name).toBe('🌆 Evening');
            expect(SHIFTS.EVENING.hours).toBe('15:00-23:00');
            expect(SHIFTS.EVENING.start).toBe(15);
            expect(SHIFTS.EVENING.end).toBe(23);
            expect(SHIFTS.EVENING.isWorking).toBe(true);
            
            expect(SHIFTS.NIGHT.code).toBe('N');
            expect(SHIFTS.NIGHT.name).toBe('🌙 Night');
            expect(SHIFTS.NIGHT.hours).toBe('23:00-07:00');
            expect(SHIFTS.NIGHT.start).toBe(23);
            expect(SHIFTS.NIGHT.end).toBe(7);
            expect(SHIFTS.NIGHT.isWorking).toBe(true);
            
            expect(SHIFTS.OFF.code).toBe('O');
            expect(SHIFTS.OFF.name).toBe('🏠 Off');
            expect(SHIFTS.OFF.hours).toBe('Not working');
            expect(SHIFTS.OFF.start).toBe(null);
            expect(SHIFTS.OFF.end).toBe(null);
            expect(SHIFTS.OFF.isWorking).toBe(false);
        });

        it('should have immutable SHIFTS object', () => {
            // Test that SHIFTS is read-only
            expect(() => {
                // @ts-expect-error Testing immutability
                SHIFTS.MORNING.code = 'X';
            }).toThrow();
        });
    });

    describe('Input Type Flexibility Tests', () => {
        it('should accept string dates in calculateShift', () => {
            const stringDate = '2025-07-16';
            const shift = calculateShift(stringDate, 1);
            expect(shift).toBeDefined();
            expect(shift.code).toMatch(/^[MENO]$/);
        });

        it('should accept dayjs objects in calculateShift', () => {
            const dayjsDate = dayjs('2025-07-16');
            const shift = calculateShift(dayjsDate, 1);
            expect(shift).toBeDefined();
            expect(shift.code).toMatch(/^[MENO]$/);
        });

        it('should accept different date formats in formatDateCode', () => {
            const testDate = new Date('2025-07-16');
            const stringDate = '2025-07-16';
            const dayjsDate = dayjs('2025-07-16');
            
            const code1 = formatDateCode(testDate);
            const code2 = formatDateCode(stringDate);
            const code3 = formatDateCode(dayjsDate);
            
            expect(code1).toBe(code2);
            expect(code2).toBe(code3);
        });

        it('should accept different date formats in getCurrentShiftDay', () => {
            const testDate = new Date('2025-07-16 10:00');
            const stringDate = '2025-07-16 10:00';
            const dayjsDate = dayjs('2025-07-16 10:00');
            
            const day1 = getCurrentShiftDay(testDate);
            const day2 = getCurrentShiftDay(stringDate);
            const day3 = getCurrentShiftDay(dayjsDate);
            
            expect(day1.isSame(day2, 'day')).toBe(true);
            expect(day2.isSame(day3, 'day')).toBe(true);
        });
    });

    describe('Configuration Integration Tests', () => {
        it('should use CONFIG values correctly', () => {
            const testDate = new Date('2025-07-16');
            
            // Test that functions respect CONFIG.TEAMS_COUNT
            const allShifts = getAllTeamsShifts(testDate);
            expect(allShifts).toHaveLength(CONFIG.TEAMS_COUNT);
            
            // Test that getNextShift respects team count bounds
            const validTeamNext = getNextShift(testDate, CONFIG.TEAMS_COUNT);
            const invalidTeamNext = getNextShift(testDate, CONFIG.TEAMS_COUNT + 1);
            
            expect(validTeamNext).not.toBeNull();
            expect(invalidTeamNext).toBeNull();
        });

        it('should use reference date and team from CONFIG', () => {
            // Test that reference team has expected shift on reference date
            const referenceShift = calculateShift(CONFIG.REFERENCE_DATE, CONFIG.REFERENCE_TEAM);
            expect(referenceShift).toBe(SHIFTS.MORNING);
        });

        it('should respect SHIFT_CYCLE_DAYS from CONFIG', () => {
            const baseDate = new Date('2025-07-16');
            const team = 1;
            
            // Test that pattern repeats after CONFIG.SHIFT_CYCLE_DAYS
            const shifts1: string[] = [];
            const shifts2: string[] = [];
            
            for (let i = 0; i < CONFIG.SHIFT_CYCLE_DAYS; i++) {
                const date1 = dayjs(baseDate).add(i, 'day').toDate();
                const date2 = dayjs(baseDate).add(i + CONFIG.SHIFT_CYCLE_DAYS, 'day').toDate();
                
                shifts1.push(calculateShift(date1, team).code);
                shifts2.push(calculateShift(date2, team).code);
            }
            
            expect(shifts1).toEqual(shifts2);
        });
    });

    describe('Error Handling and Robustness', () => {
        it('should handle NaN dates gracefully', () => {
            const nanDate = new Date(NaN);
            expect(() => calculateShift(nanDate, 1)).not.toThrow();
            expect(() => formatDateCode(nanDate)).not.toThrow();
            expect(() => getCurrentShiftDay(nanDate)).not.toThrow();
        });

        it('should handle extreme team numbers without crashing', () => {
            const testDate = new Date('2025-07-16');
            const extremeTeams = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, 0, -1000, 1000];
            
            extremeTeams.forEach(team => {
                expect(() => calculateShift(testDate, team)).not.toThrow();
                expect(() => getShiftCode(testDate, team)).not.toThrow();
            });
        });

        it('should return null for invalid teams in getNextShift', () => {
            const testDate = new Date('2025-07-16');
            
            expect(getNextShift(testDate, 0)).toBeNull();
            expect(getNextShift(testDate, -1)).toBeNull();
            expect(getNextShift(testDate, CONFIG.TEAMS_COUNT + 1)).toBeNull();
            expect(getNextShift(testDate, 999)).toBeNull();
        });

        it('should handle malformed date strings', () => {
            const malformedDates = ['invalid', '2025-13-01', '2025-02-30', ''];
            
            malformedDates.forEach(dateStr => {
                expect(() => calculateShift(dateStr, 1)).not.toThrow();
                expect(() => formatDateCode(dateStr)).not.toThrow();
                expect(() => getCurrentShiftDay(dateStr)).not.toThrow();
            });
        });
    });

    describe('Real-world Scenario Tests', () => {
        it('should handle typical shift scheduling scenarios', () => {
            const today = dayjs();
            const team = 1;
            
            // Current shift
            const currentShift = calculateShift(today, team);
            expect(currentShift).toBeDefined();
            
            // Next shift
            const nextShift = getNextShift(today, team);
            if (nextShift) {
                expect(nextShift.date.isAfter(today)).toBe(true);
                expect(nextShift.shift.isWorking).toBe(true);
            }
            
            // Shift code generation
            const shiftCode = getShiftCode(today, team);
            expect(shiftCode).toMatch(/^\d{4}\.\d[MENO]$/);
        });

        it('should handle week boundaries correctly in shift calculations', () => {
            // Test across week boundaries
            const sunday = dayjs('2025-07-20'); // Sunday
            const monday = dayjs('2025-07-21'); // Monday
            
            const sundayShift = calculateShift(sunday, 1);
            const mondayShift = calculateShift(monday, 1);
            
            expect(sundayShift).toBeDefined();
            expect(mondayShift).toBeDefined();
            
            // Codes should reflect correct week numbers
            const sundayCode = getShiftCode(sunday, 1);
            const mondayCode = getShiftCode(monday, 1);
            
            expect(sundayCode).toMatch(/^\d{4}\.\d[MENO]$/);
            expect(mondayCode).toMatch(/^\d{4}\.\d[MENO]$/);
        });

        it('should maintain shift consistency during night shift transitions', () => {
            // Test night shift handling across midnight
            const lateNight = dayjs('2025-07-20 23:30');
            const earlyMorning = dayjs('2025-07-21 02:00');
            const morning = dayjs('2025-07-21 08:00');
            
            const lateShiftDay = getCurrentShiftDay(lateNight);
            const earlyShiftDay = getCurrentShiftDay(earlyMorning);
            const morningShiftDay = getCurrentShiftDay(morning);
            
            // Late night and early morning should be same shift day
            expect(lateShiftDay.isSame(lateNight, 'day')).toBe(true);
            expect(earlyShiftDay.isSame(earlyMorning.subtract(1, 'day'), 'day')).toBe(true);
            expect(morningShiftDay.isSame(morning, 'day')).toBe(true);
        });
    });

    describe('Type Safety and Interface Compliance', () => {
        it('should return proper Shift interface from calculateShift', () => {
            const testDate = new Date('2025-07-16');
            const shift = calculateShift(testDate, 1);
            
            // Check all required properties exist and have correct types
            expect(typeof shift.code).toBe('string');
            expect(typeof shift.name).toBe('string');
            expect(typeof shift.hours).toBe('string');
            expect(typeof shift.isWorking).toBe('boolean');
            
            // start and end can be number or null
            expect(shift.start === null || typeof shift.start === 'number').toBe(true);
            expect(shift.end === null || typeof shift.end === 'number').toBe(true);
        });

        it('should return proper ShiftResult interface from getAllTeamsShifts', () => {
            const testDate = new Date('2025-07-16');
            const results = getAllTeamsShifts(testDate);
            
            results.forEach(result => {
                expect(dayjs.isDayjs(result.date)).toBe(true);
                expect(typeof result.shift).toBe('object');
                expect(typeof result.code).toBe('string');
                expect(typeof result.teamNumber).toBe('number');
                
                // Verify shift object structure
                expect(typeof result.shift.code).toBe('string');
                expect(typeof result.shift.name).toBe('string');
                expect(typeof result.shift.hours).toBe('string');
                expect(typeof result.shift.isWorking).toBe('boolean');
            });
        });

        it('should return proper NextShiftResult interface from getNextShift', () => {
            const testDate = new Date('2025-07-16');
            const nextShift = getNextShift(testDate, 1);
            
            if (nextShift) {
                expect(dayjs.isDayjs(nextShift.date)).toBe(true);
                expect(typeof nextShift.shift).toBe('object');
                expect(typeof nextShift.code).toBe('string');
                
                // Verify shift object structure
                expect(typeof nextShift.shift.code).toBe('string');
                expect(typeof nextShift.shift.name).toBe('string');
                expect(typeof nextShift.shift.hours).toBe('string');
                expect(typeof nextShift.shift.isWorking).toBe('boolean');
            }
        });
    });
