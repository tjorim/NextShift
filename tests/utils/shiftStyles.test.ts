import { describe, expect, it } from 'vitest';
import type { ShiftType } from '../../src/utils/shiftCalculations';
import { getShiftClassName } from '../../src/utils/shiftStyles';

describe('shiftStyles', () => {
    describe('getShiftClassName', () => {
        it('returns correct class for Morning shift', () => {
            expect(getShiftClassName('M')).toBe('shift-morning');
        });

        it('returns correct class for Evening shift', () => {
            expect(getShiftClassName('E')).toBe('shift-evening');
        });

        it('returns correct class for Night shift', () => {
            expect(getShiftClassName('N')).toBe('shift-night');
        });

        it('returns correct class for Off shift', () => {
            expect(getShiftClassName('O')).toBe('shift-off');
        });

        it('handles invalid inputs gracefully', () => {
            expect(getShiftClassName('X' as ShiftType)).toBe('shift-off');
            expect(getShiftClassName(undefined as unknown as ShiftType)).toBe(
                'shift-off',
            );
            expect(getShiftClassName(null as unknown as ShiftType)).toBe(
                'shift-off',
            );
        });

        it('handles all valid ShiftType values', () => {
            const validShiftTypes: ShiftType[] = ['M', 'E', 'N', 'O'];
            const expectedClasses = [
                'shift-morning',
                'shift-evening',
                'shift-night',
                'shift-off',
            ];

            validShiftTypes.forEach((shiftType, index) => {
                expect(getShiftClassName(shiftType)).toBe(
                    expectedClasses[index],
                );
            });
        });

        it('returns consistent results for same input', () => {
            // Test idempotency
            expect(getShiftClassName('M')).toBe(getShiftClassName('M'));
            expect(getShiftClassName('E')).toBe(getShiftClassName('E'));
            expect(getShiftClassName('N')).toBe(getShiftClassName('N'));
            expect(getShiftClassName('O')).toBe(getShiftClassName('O'));
        });

        it('returns string type for all inputs', () => {
            expect(typeof getShiftClassName('M')).toBe('string');
            expect(typeof getShiftClassName('E')).toBe('string');
            expect(typeof getShiftClassName('N')).toBe('string');
            expect(typeof getShiftClassName('O')).toBe('string');
            expect(typeof getShiftClassName('X' as ShiftType)).toBe('string');
        });
    });
});
