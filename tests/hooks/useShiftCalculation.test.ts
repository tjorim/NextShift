import { act, renderHook } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { useShiftCalculation } from '../../src/hooks/useShiftCalculation';
import { CONFIG } from '../../src/utils/config';

// Only mock the localStorage hook since it's an external dependency
vi.mock('../../src/hooks/useLocalStorage', () => ({
    useLocalStorage: vi.fn(),
}));

import { useLocalStorage } from '../../src/hooks/useLocalStorage';

const mockUseLocalStorage = vi.mocked(useLocalStorage);

describe('useShiftCalculation', () => {
    describe('Initialization', () => {
        it('initializes with default values', () => {
            mockUseLocalStorage.mockReturnValue([null, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            expect(result.current.selectedTeam).toBeNull();
            expect(dayjs.isDayjs(result.current.currentDate)).toBe(true);
            expect(result.current.currentShift).toBeNull();
        });

        it('initializes with stored team from localStorage', () => {
            const setStoredTeam = vi.fn();
            mockUseLocalStorage.mockReturnValue([3, setStoredTeam]);

            const { result } = renderHook(() => useShiftCalculation());

            expect(result.current.selectedTeam).toBe(3);
        });
    });

    describe('Team Selection', () => {
        it('updates selected team', () => {
            const setStoredTeam = vi.fn();
            mockUseLocalStorage.mockReturnValue([1, setStoredTeam]);

            const { result } = renderHook(() => useShiftCalculation());

            act(() => {
                result.current.setSelectedTeam(2);
            });

            expect(setStoredTeam).toHaveBeenCalledWith(2);
        });

        it('clears selected team', () => {
            const setStoredTeam = vi.fn();
            mockUseLocalStorage.mockReturnValue([1, setStoredTeam]);

            const { result } = renderHook(() => useShiftCalculation());

            act(() => {
                result.current.setSelectedTeam(null);
            });

            expect(setStoredTeam).toHaveBeenCalledWith(null);
        });
    });

    describe('Date Management', () => {
        it('updates current date', () => {
            mockUseLocalStorage.mockReturnValue([1, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());
            const newDate = dayjs('2025-01-15');

            act(() => {
                result.current.setCurrentDate(newDate);
            });

            expect(result.current.currentDate.isSame(newDate, 'day')).toBe(
                true,
            );
        });
    });

    describe('Shift Data Integration', () => {
        it('calculates current shift for selected team', () => {
            mockUseLocalStorage.mockReturnValue([1, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            // Since we're using real shift calculations, we should get actual shift data
            expect(result.current.currentShift).toBeDefined();
            if (result.current.currentShift) {
                expect(result.current.currentShift.teamNumber).toBe(1);
                expect(result.current.currentShift.shift).toBeDefined();
                expect(dayjs.isDayjs(result.current.currentShift.date)).toBe(
                    true,
                );
            }
        });

        it('calculates today shifts for all teams', () => {
            mockUseLocalStorage.mockReturnValue([1, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            // Should return shifts for all teams
            expect(result.current.todayShifts).toHaveLength(CONFIG.TEAMS_COUNT);
            result.current.todayShifts.forEach((shiftResult, index) => {
                expect(shiftResult.teamNumber).toBe(index + 1);
                expect(shiftResult.shift).toBeDefined();
            });
        });

        it('calculates next shift for selected team', () => {
            mockUseLocalStorage.mockReturnValue([1, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            // Should calculate next shift
            expect(result.current.nextShift).toBeDefined();
            if (result.current.nextShift) {
                expect(dayjs.isDayjs(result.current.nextShift.date)).toBe(true);
                expect(result.current.nextShift.shift).toBeDefined();
            }
        });

        it('returns null for current shift when no team selected', () => {
            mockUseLocalStorage.mockReturnValue([null, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            expect(result.current.currentShift).toBeNull();
            expect(result.current.nextShift).toBeNull();
        });

        it('provides current shift day', () => {
            mockUseLocalStorage.mockReturnValue([1, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            expect(dayjs.isDayjs(result.current.currentShiftDay)).toBe(true);
        });
    });
});
