import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTransferCalculations } from '../../src/hooks/useTransferCalculations';

describe('useTransferCalculations', () => {
    describe('Initial state and team management', () => {
        it('initializes with correct default values', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({ selectedTeam: 1 }),
            );

            expect(result.current.availableTeams).toEqual([2, 3, 4, 5]);
            expect(result.current.compareTeam).toBe(2); // First available team
            expect(result.current.dateRange).toBe('14');
            expect(result.current.customStartDate).toBe('');
            expect(result.current.customEndDate).toBe('');
            expect(Array.isArray(result.current.transfers)).toBe(true);
        });

        it('excludes selected team from available teams', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({ selectedTeam: 3 }),
            );

            expect(result.current.availableTeams).toEqual([1, 2, 4, 5]);
            expect(result.current.compareTeam).toBe(1); // First available team
        });

        it('handles null selected team', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({ selectedTeam: null }),
            );

            expect(result.current.availableTeams).toEqual([1, 2, 3, 4, 5]);
            expect(result.current.transfers).toEqual([]);
        });

        it('accepts initial props', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({
                    selectedTeam: 1,
                    compareTeam: 3,
                    dateRange: '30',
                    customStartDate: '2025-01-01',
                    customEndDate: '2025-01-31',
                }),
            );

            expect(result.current.compareTeam).toBe(3);
            expect(result.current.dateRange).toBe('30');
            expect(result.current.customStartDate).toBe('2025-01-01');
            expect(result.current.customEndDate).toBe('2025-01-31');
        });
    });

    describe('State management', () => {
        it('updates compare team', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({ selectedTeam: 1 }),
            );

            act(() => {
                result.current.setCompareTeam(4);
            });

            expect(result.current.compareTeam).toBe(4);
        });

        it('updates date range', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({ selectedTeam: 1 }),
            );

            act(() => {
                result.current.setDateRange('30');
            });

            expect(result.current.dateRange).toBe('30');
        });

        it('updates custom dates', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({ selectedTeam: 1 }),
            );

            act(() => {
                result.current.setCustomStartDate('2025-01-01');
                result.current.setCustomEndDate('2025-01-31');
            });

            expect(result.current.customStartDate).toBe('2025-01-01');
            expect(result.current.customEndDate).toBe('2025-01-31');
        });
    });

    describe('Transfer calculations', () => {
        it('returns empty transfers when no selected team', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({ selectedTeam: null }),
            );

            expect(result.current.transfers).toEqual([]);
        });

        it('returns empty transfers for custom range without dates', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({
                    selectedTeam: 1,
                    dateRange: 'custom',
                }),
            );

            expect(result.current.transfers).toEqual([]);
        });

        it('calculates transfers for valid teams and date range', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({
                    selectedTeam: 1,
                    compareTeam: 2,
                    dateRange: '14',
                }),
            );

            // Using real shift calculations, transfers array should be defined
            expect(result.current.transfers).toBeDefined();
            expect(Array.isArray(result.current.transfers)).toBe(true);
        });

        it('handles custom date range', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({
                    selectedTeam: 1,
                    compareTeam: 2,
                    dateRange: 'custom',
                    customStartDate: '2025-01-01',
                    customEndDate: '2025-01-02',
                }),
            );

            expect(result.current.transfers).toBeDefined();
            expect(Array.isArray(result.current.transfers)).toBe(true);
        });

        it('limits transfers to 20 maximum', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({
                    selectedTeam: 1,
                    compareTeam: 2,
                    dateRange: '365', // Long range to potentially get many transfers
                }),
            );

            expect(result.current.transfers.length).toBeLessThanOrEqual(20);
        });
    });

    describe('Team updates and effects', () => {
        it('updates compare team when selected team changes and compare team becomes unavailable', () => {
            const { result, rerender } = renderHook(
                ({ selectedTeam }) =>
                    useTransferCalculations({
                        selectedTeam,
                        compareTeam: 3,
                    }),
                {
                    initialProps: { selectedTeam: 1 },
                },
            );

            expect(result.current.compareTeam).toBe(3);

            // Change selected team to 3, making compare team 3 unavailable
            rerender({ selectedTeam: 3 });

            expect(result.current.compareTeam).toBe(1); // Should switch to first available
        });

        it('maintains compare team when it remains available after selected team change', () => {
            const { result, rerender } = renderHook(
                ({ selectedTeam }) =>
                    useTransferCalculations({
                        selectedTeam,
                        compareTeam: 4,
                    }),
                {
                    initialProps: { selectedTeam: 1 },
                },
            );

            expect(result.current.compareTeam).toBe(4);

            // Change selected team to 2, compare team 4 should still be available
            rerender({ selectedTeam: 2 });

            expect(result.current.compareTeam).toBe(4); // Should remain the same
        });
    });

    describe('Transfer info structure', () => {
        it('returns transfers with correct structure', () => {
            const { result } = renderHook(() =>
                useTransferCalculations({
                    selectedTeam: 1,
                    compareTeam: 2,
                    dateRange: '7',
                }),
            );

            // Verify transfers array has correct type structure
            expect(Array.isArray(result.current.transfers)).toBe(true);

            // If transfers exist, they should have the correct structure
            result.current.transfers.forEach((transfer) => {
                expect(transfer).toHaveProperty('date');
                expect(transfer).toHaveProperty('fromTeam');
                expect(transfer).toHaveProperty('toTeam');
                expect(transfer).toHaveProperty('fromShiftType');
                expect(transfer).toHaveProperty('toShiftType');
                expect(transfer).toHaveProperty('isHandover');
            });
        });
    });
});
