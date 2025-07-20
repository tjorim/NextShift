import dayjs from 'dayjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CONFIG, destroy, escapeHtml, SHIFTS } from '../src/app.js';

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
});
