import { act, renderHook } from '@testing-library/react';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { useShiftCalculation } from '../../src/hooks/useShiftCalculation';

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
    getAllTeamsShifts: vi.fn((date: string) => [
        {
            teamNumber: 1,
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
        },
        {
            teamNumber: 2,
            shift: {
                type: 'E',
                code: 'E',
                name: 'Evening',
                start: 15,
                end: 23,
                isWorking: true,
            },
            date: dayjs(date),
            dateCode: '2503.1E',
        },
    ]),
    getCurrentShiftDay: vi.fn((date: string) => dayjs(date)),
    getNextShift: vi.fn((teamNumber: number) => ({
        shift: {
            type: 'M',
            code: 'M',
            name: 'Morning',
            start: 7,
            end: 15,
            isWorking: true,
        },
        date: dayjs().add(1, 'day'),
        dateCode: '2503.2M',
        teamNumber,
        daysUntil: 1,
    })),
    getShiftCode: vi.fn((_date: string, _teamNumber: number) => 'M'),
}));

vi.mock('../../src/hooks/useLocalStorage', () => ({
    useLocalStorage: vi.fn((_key: string, defaultValue: unknown) => {
        const mockState = vi.fn();
        const mockSetState = vi.fn();
        mockState.mockReturnValue(defaultValue);
        return [mockState(), mockSetState];
    }),
}));

import { useLocalStorage } from '../../src/hooks/useLocalStorage';
import {
    calculateShift,
    getAllTeamsShifts,
    getCurrentShiftDay,
    getNextShift,
} from '../../src/utils/shiftCalculations';

const mockUseLocalStorage = vi.mocked(useLocalStorage);
const mockCalculateShift = vi.mocked(calculateShift);
const mockGetAllTeamsShifts = vi.mocked(getAllTeamsShifts);
const mockGetCurrentShiftDay = vi.mocked(getCurrentShiftDay);
const mockGetNextShift = vi.mocked(getNextShift);

describe('useShiftCalculation', () => {
    describe('Initialization', () => {
        it('initializes with default values', () => {
            mockUseLocalStorage.mockReturnValue([null, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            expect(result.current.selectedTeam).toBeNull();
            expect(result.current.currentDate).toBeDefined();
            expect(result.current.todayShifts).toBeDefined();
            expect(result.current.currentShiftDay).toBeDefined();
        });

        it('initializes with team from localStorage', () => {
            const mockSetTeam = vi.fn();
            mockUseLocalStorage.mockReturnValue([2, mockSetTeam]);

            const { result } = renderHook(() => useShiftCalculation());

            expect(result.current.selectedTeam).toBe(2);
        });
    });

    describe('Team selection', () => {
        it('allows setting selected team', () => {
            const mockSetTeam = vi.fn();
            mockUseLocalStorage.mockReturnValue([null, mockSetTeam]);

            const { result } = renderHook(() => useShiftCalculation());

            act(() => {
                result.current.setSelectedTeam(3);
            });

            expect(mockSetTeam).toHaveBeenCalledWith(3);
        });

        it('allows clearing selected team', () => {
            const mockSetTeam = vi.fn();
            mockUseLocalStorage.mockReturnValue([1, mockSetTeam]);

            const { result } = renderHook(() => useShiftCalculation());

            act(() => {
                result.current.setSelectedTeam(null);
            });

            expect(mockSetTeam).toHaveBeenCalledWith(null);
        });
    });

    describe('Date management', () => {
        it('allows setting current date', () => {
            mockUseLocalStorage.mockReturnValue([null, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());
            const newDate = dayjs('2025-01-20');

            act(() => {
                result.current.setCurrentDate(newDate);
            });

            expect(result.current.currentDate.isSame(newDate, 'day')).toBe(
                true,
            );
        });

        it('updates shift calculations when date changes', () => {
            mockUseLocalStorage.mockReturnValue([1, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());
            const newDate = dayjs('2025-01-20');

            act(() => {
                result.current.setCurrentDate(newDate);
            });

            // Should call shift calculation functions with new date
            expect(mockGetAllTeamsShifts).toHaveBeenCalled();
            expect(mockGetCurrentShiftDay).toHaveBeenCalled();
        });
    });

    describe('Shift calculations', () => {
        it('calculates current shift for selected team', () => {
            mockUseLocalStorage.mockReturnValue([1, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            expect(result.current.currentShift).toBeDefined();
            expect(mockCalculateShift).toHaveBeenCalled();
        });

        it('calculates next shift for selected team', () => {
            mockUseLocalStorage.mockReturnValue([1, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            expect(result.current.nextShift).toBeDefined();
            expect(mockGetNextShift).toHaveBeenCalled();
        });

        it('provides today shifts for all teams', () => {
            mockUseLocalStorage.mockReturnValue([null, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            expect(result.current.todayShifts).toBeDefined();
            expect(Array.isArray(result.current.todayShifts)).toBe(true);
            expect(mockGetAllTeamsShifts).toHaveBeenCalled();
        });

        it('calculates current shift day', () => {
            mockUseLocalStorage.mockReturnValue([null, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            expect(result.current.currentShiftDay).toBeDefined();
            expect(mockGetCurrentShiftDay).toHaveBeenCalled();
        });
    });

    describe('No team selected', () => {
        it('handles no selected team gracefully', () => {
            mockUseLocalStorage.mockReturnValue([null, vi.fn()]);

            const { result } = renderHook(() => useShiftCalculation());

            expect(result.current.selectedTeam).toBeNull();
            expect(result.current.currentShift).toBeNull();
            expect(result.current.nextShift).toBeNull();
            // todayShifts should still be available
            expect(result.current.todayShifts).toBeDefined();
        });
    });

    describe('Memoization', () => {
        it('memoizes shift calculations', () => {
            mockUseLocalStorage.mockReturnValue([1, vi.fn()]);

            const { rerender } = renderHook(() => useShiftCalculation());

            const initialCallCount = mockCalculateShift.mock.calls.length;

            // Rerender without changing props should not trigger new calculations
            rerender();

            expect(mockCalculateShift.mock.calls.length).toBe(initialCallCount);
        });
    });
});
