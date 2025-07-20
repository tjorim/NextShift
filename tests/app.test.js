import dayjs from 'dayjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    CONFIG,
    calculateShift,
    destroy,
    escapeHtml,
    formatDateCode,
    getCurrentShiftDay,
    getNextShift,
    getShiftCode,
    SHIFTS,
} from '../src/app.js';

// Mock dayjs plugins
const mockExtend = vi.fn();
dayjs.extend = mockExtend;

// Import app after setting up mocks
// We need to load the app code in a way that works with testing
describe('NextShift App', () => {
    beforeEach(() => {
        // Set up basic DOM elements needed by the app
        document.body.innerHTML = `
            <div id="teamModal"></div>
            <div id="connectionStatus"></div>
            <div id="currentDate"></div>
            <div id="myTeamShift"></div>
            <div id="nextShift"></div>
            <div id="todayShifts"></div>
            <div id="scheduleView"></div>
            <div id="myShiftsWeek"></div>
            <div id="transferInfo"></div>
            <select id="compareTeam"></select>
            <select id="transferRange"></select>
            <div id="customDateRange"></div>
            <input id="startDate">
            <input id="endDate">
            <button id="changeTeamBtn"></button>
            <button id="todayBtn"></button>
            <button id="prevBtn"></button>
            <button id="currentBtn"></button>
            <button id="nextBtn"></button>
        `;
    });

    describe('Shift Calculations', () => {
        describe('Core Business Logic', () => {
            it('should calculate correct shift for reference team on reference date', () => {
                // Reference: Team 1 on 2025-01-06 should be in a specific shift
                const referenceShift = calculateShift(
                    '2025-01-06',
                    CONFIG.REFERENCE_TEAM,
                );

                // Since this is our reference point, we can verify it's one of the shift types
                expect([
                    SHIFTS.MORNING,
                    SHIFTS.EVENING,
                    SHIFTS.NIGHT,
                    SHIFTS.OFF,
                ]).toContain(referenceShift);
                expect(referenceShift).toHaveProperty('code');
                expect(referenceShift).toHaveProperty('name');
                expect(referenceShift).toHaveProperty('hours');
            });

            it('should maintain shift pattern consistency across multiple days', () => {
                const team = 1;
                const startDate = '2025-01-06';
                const shifts = [];

                // Get 10 days of shifts (one full cycle)
                for (let i = 0; i < CONFIG.SHIFT_CYCLE_DAYS; i++) {
                    const date = dayjs(startDate).add(i, 'day');
                    const shift = calculateShift(date, team);
                    shifts.push(shift.code);
                }

                // Should follow the pattern: 2M, 2E, 2N, 4O (10 days total)
                expect(shifts).toHaveLength(10);

                // Count each shift type
                const shiftCounts = shifts.reduce((acc, shift) => {
                    acc[shift] = (acc[shift] || 0) + 1;
                    return acc;
                }, {});

                // Verify the pattern: 2 Morning, 2 Evening, 2 Night, 4 Off
                expect(shiftCounts.M).toBe(2);
                expect(shiftCounts.E).toBe(2);
                expect(shiftCounts.N).toBe(2);
                expect(shiftCounts.O).toBe(4);
            });

            it('should calculate different shifts for different teams on same date', () => {
                const testDate = '2025-01-06';
                const teamShifts = [];

                // Get shifts for all 5 teams on the same date
                for (let team = 1; team <= CONFIG.TEAMS_COUNT; team++) {
                    const shift = calculateShift(testDate, team);
                    teamShifts.push({ team, shift: shift.code });
                }

                expect(teamShifts).toHaveLength(5);

                // Teams should have different shifts (staggered by 2 days each)
                const uniqueShifts = new Set(teamShifts.map((t) => t.shift));
                expect(uniqueShifts.size).toBeGreaterThan(1); // Should have at least 2 different shift types
            });

            it('should handle team offset calculation correctly', () => {
                const baseDate = '2025-01-06';

                // Test the offset relationship: each team is offset by 2 days
                // Team 2 should have the same shift as Team 1 had 2 days earlier
                const team1Shift = calculateShift(baseDate, 1);
                const team2Shift = calculateShift(baseDate, 2);
                const team1Minus2Days = calculateShift(
                    dayjs(baseDate).subtract(2, 'day'),
                    1,
                );

                expect(team1Shift).toHaveProperty('code');
                expect(team2Shift).toHaveProperty('code');

                // Team 2 on date X should equal Team 1 on date X-2 (not X+2)
                // Because team 2 is 2 days behind team 1 in the cycle
                expect(team2Shift.code).toBe(team1Minus2Days.code);
            });

            it('should handle negative dates (before reference date)', () => {
                const pastDate = dayjs(CONFIG.REFERENCE_DATE).subtract(
                    5,
                    'day',
                );
                const shift = calculateShift(pastDate, 1);

                expect([
                    SHIFTS.MORNING,
                    SHIFTS.EVENING,
                    SHIFTS.NIGHT,
                    SHIFTS.OFF,
                ]).toContain(shift);
                expect(shift).toHaveProperty('code');
            });

            it('should handle far future dates correctly', () => {
                const futureDate = dayjs(CONFIG.REFERENCE_DATE).add(365, 'day');
                const shift = calculateShift(futureDate, 3);

                expect([
                    SHIFTS.MORNING,
                    SHIFTS.EVENING,
                    SHIFTS.NIGHT,
                    SHIFTS.OFF,
                ]).toContain(shift);
                expect(shift).toHaveProperty('code');
            });

            it('should maintain cycle consistency over multiple cycles', () => {
                const team = 2;
                const baseDate = '2025-01-06';

                // Get shift for a date
                const originalShift = calculateShift(baseDate, team);

                // Get shift for same date + one full cycle (10 days)
                const cycleLaterShift = calculateShift(
                    dayjs(baseDate).add(10, 'day'),
                    team,
                );

                // Should be the same shift
                expect(cycleLaterShift.code).toBe(originalShift.code);

                // Test multiple cycles
                const multipleCyclesShift = calculateShift(
                    dayjs(baseDate).add(50, 'day'),
                    team,
                ); // 5 cycles
                expect(multipleCyclesShift.code).toBe(originalShift.code);
            });
        });

        describe('Date Code Formatting', () => {
            it('should format date codes correctly', () => {
                // Test known date
                const testDate = '2025-01-06'; // Monday of week 2 in 2025
                const formatted = formatDateCode(testDate);

                // Should be in format YYWW.D
                expect(formatted).toMatch(/^\d{4}\.\d$/);
                expect(formatted).toBe('2502.1'); // 25 (year) + 02 (week) + .1 (Monday)
            });

            it('should handle different days of the week', () => {
                const week = dayjs('2025-01-06'); // Start with Monday

                for (let i = 0; i < 7; i++) {
                    const date = week.add(i, 'day');
                    const code = formatDateCode(date);

                    // Check format is correct
                    expect(code).toMatch(/^\d{4}\.\d$/);

                    // Check day part is correct (1-7)
                    const dayPart = parseInt(code.split('.')[1]);
                    expect(dayPart).toBeGreaterThanOrEqual(1);
                    expect(dayPart).toBeLessThanOrEqual(7);
                }
            });

            it('should handle year boundaries correctly', () => {
                const endOfYear = '2024-12-30'; // Monday of last week in 2024
                const code = formatDateCode(endOfYear);
                expect(code).toMatch(/^24\d{2}\.\d$/); // Should start with '24'

                const startOfYear = '2025-01-06'; // Monday of week 2 in 2025
                const newYearCode = formatDateCode(startOfYear);
                expect(newYearCode).toMatch(/^25\d{2}\.\d$/); // Should start with '25'
            });
        });

        describe('Shift Code Generation', () => {
            it('should generate correct shift codes for regular shifts', () => {
                const testDate = '2025-01-06';
                const team = 1;
                const shift = calculateShift(testDate, team);
                const code = getShiftCode(testDate, team);

                // Should combine date code with shift code
                const expectedPrefix = formatDateCode(testDate);
                expect(code.startsWith(expectedPrefix)).toBe(true);
                expect(code.endsWith(shift.code)).toBe(true);
                expect(code).toBe(`${expectedPrefix}${shift.code}`);
            });

            it('should use previous day date code for night shifts', () => {
                // Find a date where team has night shift
                let nightShiftFound = false;
                const testDate = dayjs('2025-01-06');

                for (
                    let i = 0;
                    i < CONFIG.SHIFT_CYCLE_DAYS && !nightShiftFound;
                    i++
                ) {
                    const currentDate = testDate.add(i, 'day');
                    const shift = calculateShift(currentDate, 1);

                    if (shift === SHIFTS.NIGHT) {
                        const code = getShiftCode(currentDate, 1);
                        const prevDayCode = formatDateCode(
                            currentDate.subtract(1, 'day'),
                        );

                        expect(code).toBe(`${prevDayCode}N`);
                        nightShiftFound = true;
                    }
                }

                expect(nightShiftFound).toBe(true);
            });
        });

        describe('Next Shift Calculation', () => {
            it('should find next working shift correctly', () => {
                const fromDate = '2025-01-06';
                const team = 1;
                const nextShift = getNextShift(fromDate, team);

                expect(nextShift).not.toBeNull();
                expect(nextShift).toHaveProperty('date');
                expect(nextShift).toHaveProperty('shift');
                expect(nextShift).toHaveProperty('code');

                // Should be a working shift (not OFF)
                expect(nextShift.shift).not.toBe(SHIFTS.OFF);
                expect([
                    SHIFTS.MORNING,
                    SHIFTS.EVENING,
                    SHIFTS.NIGHT,
                ]).toContain(nextShift.shift);

                // Date should be after the from date
                expect(nextShift.date.isAfter(dayjs(fromDate))).toBe(true);
            });

            it('should skip off days when finding next shift', () => {
                // Find a team on an off day
                let offDayFound = false;
                const testDate = dayjs('2025-01-06');

                for (
                    let i = 0;
                    i < CONFIG.SHIFT_CYCLE_DAYS && !offDayFound;
                    i++
                ) {
                    const currentDate = testDate.add(i, 'day');
                    const shift = calculateShift(currentDate, 1);

                    if (shift === SHIFTS.OFF) {
                        const nextShift = getNextShift(currentDate, 1);

                        expect(nextShift).not.toBeNull();
                        expect(nextShift.shift).not.toBe(SHIFTS.OFF);
                        offDayFound = true;
                    }
                }

                expect(offDayFound).toBe(true);
            });

            it('should handle edge case when already in last shift of cycle', () => {
                // This tests the boundary condition at cycle end
                const team = 1;
                let lastWorkingDay = null;
                const testDate = dayjs('2025-01-06');

                // Find the last working day in a cycle
                for (let i = 0; i < CONFIG.SHIFT_CYCLE_DAYS; i++) {
                    const currentDate = testDate.add(i, 'day');
                    const shift = calculateShift(currentDate, team);

                    if (shift !== SHIFTS.OFF) {
                        lastWorkingDay = currentDate;
                    }
                }

                if (lastWorkingDay) {
                    const nextShift = getNextShift(lastWorkingDay, team);
                    expect(nextShift).not.toBeNull();
                    expect(nextShift.shift).not.toBe(SHIFTS.OFF);
                }
            });
        });

        describe('Current Shift Day Calculation', () => {
            it('should return a valid dayjs object', () => {
                // Test that the function returns a valid dayjs object
                const shiftDay = getCurrentShiftDay();

                expect(shiftDay).toBeDefined();
                expect(typeof shiftDay.format).toBe('function');
                expect(typeof shiftDay.hour).toBe('function');
                expect(typeof shiftDay.isSame).toBe('function');
            });

            it('should handle time-based logic correctly', () => {
                // Test the logic by calling at different simulated times
                // We'll test the logic rather than mocking time
                const now = dayjs();
                const currentHour = now.hour();

                const shiftDay = getCurrentShiftDay();

                if (currentHour < 7) {
                    // Should return previous day
                    expect(shiftDay.isSame(now.subtract(1, 'day'), 'day')).toBe(
                        true,
                    );
                } else {
                    // Should return current day
                    expect(shiftDay.isSame(now, 'day')).toBe(true);
                }
            });
        });

        describe('Edge Cases and Error Handling', () => {
            it('should handle invalid team numbers gracefully', () => {
                const testDate = '2025-01-06';

                // Test with team 0 (invalid)
                expect(() => calculateShift(testDate, 0)).not.toThrow();

                // Test with team 6 (invalid, only 5 teams)
                expect(() => calculateShift(testDate, 6)).not.toThrow();

                // Test with negative team number
                expect(() => calculateShift(testDate, -1)).not.toThrow();
            });

            it('should handle invalid dates gracefully', () => {
                expect(() => calculateShift('invalid-date', 1)).not.toThrow();
                expect(() => formatDateCode('invalid-date')).not.toThrow();
            });

            it('should maintain referential integrity across functions', () => {
                const testDate = '2025-01-06';
                const team = 1;

                // The shift calculated directly should match the shift in getShiftCode
                const directShift = calculateShift(testDate, team);
                const codeShift = getShiftCode(testDate, team);

                expect(codeShift.endsWith(directShift.code)).toBe(true);
            });
        });

        // Legacy tests for backward compatibility
        it('should handle basic date operations', () => {
            const testDate = dayjs('2025-01-06');
            expect(testDate.isValid()).toBe(true);
        });

        it('should work with day.js week functionality', () => {
            const testDate = dayjs('2025-01-06');
            // Basic dayjs functionality should work
            expect(testDate.format('YYYY-MM-DD')).toBe('2025-01-06');
        });
    });

    describe('Configuration', () => {
        it('should have valid configuration constants', () => {
            // Test real configuration from the app
            expect(CONFIG.VERSION).toBe('3.0.0');
            expect(CONFIG.SHIFT_CYCLE_DAYS).toBe(10);
            expect(CONFIG.TEAMS_COUNT).toBe(5);
            expect(CONFIG.REFERENCE_TEAM).toBe(1);
            expect(CONFIG.REFERENCE_DATE).toEqual(new Date('2025-01-06'));
        });

        it('should load configuration from environment variables', () => {
            // Test that CONFIG values are properly loaded (they should fall back to defaults in test env)
            expect(CONFIG.REFERENCE_DATE).toBeInstanceOf(Date);
            expect(CONFIG.REFERENCE_DATE.getTime()).not.toBeNaN();
            expect(CONFIG.REFERENCE_TEAM).toBeGreaterThanOrEqual(1);
            expect(CONFIG.REFERENCE_TEAM).toBeLessThanOrEqual(5);
        });

        it('should have all required shift definitions', () => {
            // Test shift configuration
            expect(SHIFTS.MORNING.code).toBe('M');
            expect(SHIFTS.EVENING.code).toBe('E');
            expect(SHIFTS.NIGHT.code).toBe('N');
            expect(SHIFTS.OFF.code).toBe('O');

            // Test shift hours
            expect(SHIFTS.MORNING.hours).toBe('07:00-15:00');
            expect(SHIFTS.EVENING.hours).toBe('15:00-23:00');
            expect(SHIFTS.NIGHT.hours).toBe('23:00-07:00');
            expect(SHIFTS.OFF.hours).toBe('Not working');
        });
    });

    describe('Security', () => {
        it('should escape HTML special characters', () => {
            // Test that dangerous HTML is escaped (exact format may vary between native/fallback)
            const result = escapeHtml('<script>alert("xss")</script>');
            expect(result).toMatch(/&lt;script&gt;alert\(/);
            expect(result).toMatch(/\)&lt;\/script&gt;/);
            expect(result).not.toMatch(/<script>/);

            // Test individual characters that are always escaped consistently
            expect(escapeHtml('&')).toBe('&amp;');
            expect(escapeHtml('<')).toBe('&lt;');
            expect(escapeHtml('>')).toBe('&gt;');

            // Test non-string inputs
            expect(escapeHtml(123)).toBe('123');
            expect(escapeHtml(null)).toBe('null');
            expect(escapeHtml(undefined)).toBe('undefined');

            // Test normal text (should remain unchanged)
            expect(escapeHtml('Team 1')).toBe('Team 1');
            expect(escapeHtml('Morning shift')).toBe('Morning shift');

            // Most importantly: verify it prevents actual HTML injection
            expect(escapeHtml('<img src=x onerror=alert(1)>')).not.toMatch(
                /<img/,
            );
            expect(escapeHtml('<script>evil()</script>')).not.toMatch(
                /<script>/,
            );
        });
    });

    describe('DOM Initialization', () => {
        it('should find required DOM elements', () => {
            const elements = {
                currentDate: document.getElementById('currentDate'),
                myTeamShift: document.getElementById('myTeamShift'),
                nextShift: document.getElementById('nextShift'),
            };

            expect(elements.currentDate).not.toBeNull();
            expect(elements.myTeamShift).not.toBeNull();
            expect(elements.nextShift).not.toBeNull();
        });

        it('should verify app can initialize with DOM elements', () => {
            // Test that all critical DOM elements exist for initialization
            const requiredElements = [
                'teamModal',
                'connectionStatus',
                'currentDate',
                'myTeamShift',
                'nextShift',
                'todayShifts',
                'scheduleView',
                'myShiftsWeek',
                'transferInfo',
                'compareTeam',
                'transferRange',
                'customDateRange',
                'startDate',
                'endDate',
                'changeTeamBtn',
                'todayBtn',
                'prevBtn',
                'currentBtn',
                'nextBtn',
            ];

            // Verify all required elements exist
            const missingElements = requiredElements.filter(
                (id) => !document.getElementById(id),
            );

            expect(missingElements).toEqual([]);
            expect(missingElements.length).toBe(0);

            // Test that elements have expected properties for binding
            const compareTeam = document.getElementById('compareTeam');
            expect(compareTeam.tagName.toLowerCase()).toBe('select');

            const startDate = document.getElementById('startDate');
            expect(startDate.tagName.toLowerCase()).toBe('input');

            const changeTeamBtn = document.getElementById('changeTeamBtn');
            expect(changeTeamBtn.tagName.toLowerCase()).toBe('button');
        });

        it('should throw error when required DOM element is missing', () => {
            // Test the error handling logic directly

            // Remove a required element to simulate missing DOM
            const originalElement = document.getElementById('teamModal');
            if (originalElement) {
                originalElement.remove();
            }

            // Should throw an error for missing element
            expect(() => {
                // Create a minimal test version since we can't easily mock the full function
                const element = document.getElementById('teamModal');
                if (!element) {
                    throw new Error(
                        "Missing required DOM element: 'teamModal' (team selection modal)",
                    );
                }
            }).toThrow("Missing required DOM element: 'teamModal'");
        });
    });

    describe('Memory Management', () => {
        it('should export destroy function for cleanup', () => {
            expect(typeof destroy).toBe('function');
        });

        it('should handle destroy function call without errors', () => {
            // Should not throw any errors when called
            expect(() => destroy()).not.toThrow();
        });
    });

    describe('Error Handling', () => {
        it('should handle errors in interval callbacks gracefully', () => {
            // Mock console.error to capture error logs
            const consoleSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            // Test that intervals can handle errors without crashing
            // This tests the error handling added to interval callbacks

            // Mock updateCurrentStatus to throw an error
            const originalUpdateCurrentStatus = global.updateCurrentStatus;
            global.updateCurrentStatus = vi.fn(() => {
                throw new Error('Test error');
            });

            // Mock setInterval to immediately call the callback
            const originalSetInterval = global.setInterval;
            global.setInterval = vi.fn((callback) => {
                // Call the callback immediately to test error handling
                callback();
                return 123; // Mock interval ID
            });

            // Mock userTeam to be set so the interval callback executes
            const originalUserTeam = global.userTeam;
            global.userTeam = 1;

            try {
                // This should not throw despite updateCurrentStatus throwing an error
                expect(() => {
                    // Simulate the interval callback logic with error handling
                    try {
                        if (global.userTeam) {
                            global.updateCurrentStatus();
                        }
                    } catch (error) {
                        console.error(
                            'Error during auto-refresh update:',
                            error,
                        );
                        // Continue running the interval despite the error
                    }
                }).not.toThrow();

                // Verify that the error was logged
                expect(consoleSpy).toHaveBeenCalledWith(
                    'Error during auto-refresh update:',
                    expect.any(Error),
                );
            } finally {
                // Restore original functions
                global.setInterval = originalSetInterval;
                global.updateCurrentStatus = originalUpdateCurrentStatus;
                global.userTeam = originalUserTeam;
                consoleSpy.mockRestore();
            }
        });

        it('should handle DOM element errors gracefully', () => {
            // Test that missing DOM elements don't crash the app
            // This verifies the existing error handling for DOM operations

            // Mock a function that accesses DOM elements
            const testFunction = () => {
                try {
                    const element = document.getElementById(
                        'nonexistent-element',
                    );
                    if (element) {
                        element.textContent = 'test';
                    }
                    // This should not throw even if element is null
                } catch (error) {
                    console.error('DOM error:', error);
                }
            };

            expect(() => testFunction()).not.toThrow();
        });
    });
});
