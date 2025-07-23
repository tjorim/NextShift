import { renderHook, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import dayjs, { type Dayjs } from 'dayjs';
import { useCountdown } from '../../src/hooks/useCountdown';

describe('useCountdown', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with correct countdown when target date is in future', () => {
            const futureDate = dayjs().add(10, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.totalSeconds).toBe(10);
            expect(result.current.seconds).toBe(10);
            expect(result.current.minutes).toBe(0);
            expect(result.current.hours).toBe(0);
            expect(result.current.days).toBe(0);
            expect(result.current.isExpired).toBe(false);
            expect(result.current.formatted).toBe('10s');
        });

        it('should initialize as expired when target date is null', () => {
            const { result } = renderHook(() => useCountdown(null));

            expect(result.current.totalSeconds).toBe(0);
            expect(result.current.seconds).toBe(0);
            expect(result.current.minutes).toBe(0);
            expect(result.current.hours).toBe(0);
            expect(result.current.days).toBe(0);
            expect(result.current.isExpired).toBe(true);
            expect(result.current.formatted).toBe('');
        });

        it('should initialize as expired when target date is in the past', () => {
            const pastDate = dayjs().subtract(10, 'seconds');
            const { result } = renderHook(() => useCountdown(pastDate));

            expect(result.current.totalSeconds).toBe(0);
            expect(result.current.isExpired).toBe(true);
            expect(result.current.formatted).toBe('');
        });

        it('should handle target date exactly at current time', () => {
            const currentDate = dayjs();
            const { result } = renderHook(() => useCountdown(currentDate));

            expect(result.current.isExpired).toBe(true);
            expect(result.current.totalSeconds).toBe(0);
        });
    });

    describe('time calculations', () => {
        it('should calculate seconds correctly', () => {
            const futureDate = dayjs().add(45, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.seconds).toBe(45);
            expect(result.current.minutes).toBe(0);
            expect(result.current.hours).toBe(0);
            expect(result.current.days).toBe(0);
            expect(result.current.totalSeconds).toBe(45);
        });

        it('should calculate minutes and seconds correctly', () => {
            const futureDate = dayjs().add(125, 'seconds'); // 2m 5s
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.seconds).toBe(5);
            expect(result.current.minutes).toBe(2);
            expect(result.current.hours).toBe(0);
            expect(result.current.days).toBe(0);
            expect(result.current.totalSeconds).toBe(125);
        });

        it('should calculate hours, minutes and seconds correctly', () => {
            const futureDate = dayjs().add(3665, 'seconds'); // 1h 1m 5s
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.seconds).toBe(5);
            expect(result.current.minutes).toBe(1);
            expect(result.current.hours).toBe(1);
            expect(result.current.days).toBe(0);
            expect(result.current.totalSeconds).toBe(3665);
        });

        it('should calculate days, hours, minutes and seconds correctly', () => {
            const futureDate = dayjs().add(90061, 'seconds'); // 1d 1h 1m 1s
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.seconds).toBe(1);
            expect(result.current.minutes).toBe(1);
            expect(result.current.hours).toBe(1);
            expect(result.current.days).toBe(1);
            expect(result.current.totalSeconds).toBe(90061);
        });

        it('should handle very large time differences', () => {
            const futureDate = dayjs().add(1000000, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.totalSeconds).toBe(1000000);
            expect(result.current.isExpired).toBe(false);
        });
    });

    describe('formatting', () => {
        it('should format seconds only', () => {
            const futureDate = dayjs().add(30, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.formatted).toBe('30s');
        });

        it('should format minutes and seconds', () => {
            const futureDate = dayjs().add(125, 'seconds'); // 2m 5s
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.formatted).toBe('2m 5s');
        });

        it('should format hours and minutes (no seconds)', () => {
            const futureDate = dayjs().add(3660, 'seconds'); // 1h 1m
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.formatted).toBe('1h 1m');
        });

        it('should format days, hours and minutes (no seconds)', () => {
            const futureDate = dayjs().add(90060, 'seconds'); // 1d 1h 1m
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.formatted).toBe('1d 1h 1m');
        });

        it('should format single units correctly', () => {
            const futureDate = dayjs().add(1, 'second');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.formatted).toBe('1s');
        });

        it('should return empty string when expired', () => {
            const pastDate = dayjs().subtract(10, 'seconds');
            const { result } = renderHook(() => useCountdown(pastDate));

            expect(result.current.formatted).toBe('');
        });

        it('should handle zero time correctly', () => {
            const { result } = renderHook(() => useCountdown(null));

            expect(result.current.formatted).toBe('');
        });
    });

    describe('real-time updates', () => {
        it('should update countdown every second by default', () => {
            const futureDate = dayjs().add(5, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.totalSeconds).toBe(5);

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            expect(result.current.totalSeconds).toBe(4);

            act(() => {
                vi.advanceTimersByTime(2000);
            });

            expect(result.current.totalSeconds).toBe(2);
        });

        it('should respect custom update interval', () => {
            const futureDate = dayjs().add(5, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate, 500));

            expect(result.current.totalSeconds).toBe(5);

            act(() => {
                vi.advanceTimersByTime(500);
            });

            expect(result.current.totalSeconds).toBe(4);

            act(() => {
                vi.advanceTimersByTime(1000);
            });

            expect(result.current.totalSeconds).toBe(2);
        });

        it('should handle very fast update intervals', () => {
            const futureDate = dayjs().add(3, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate, 100));

            expect(result.current.totalSeconds).toBe(3);

            act(() => {
                vi.advanceTimersByTime(100);
            });

            expect(result.current.totalSeconds).toBe(2);
        });

        it('should handle slow update intervals', () => {
            const futureDate = dayjs().add(10, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate, 5000));

            expect(result.current.totalSeconds).toBe(10);

            act(() => {
                vi.advanceTimersByTime(2500);
            });

            // Should not update yet
            expect(result.current.totalSeconds).toBe(10);

            act(() => {
                vi.advanceTimersByTime(2500);
            });

            // Now should update
            expect(result.current.totalSeconds).toBe(5);
        });
    });

    describe('countdown expiration', () => {
        it('should become expired when countdown reaches zero', () => {
            const futureDate = dayjs().add(2, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.isExpired).toBe(false);

            act(() => {
                vi.advanceTimersByTime(2000);
            });

            expect(result.current.isExpired).toBe(true);
            expect(result.current.totalSeconds).toBe(0);
            expect(result.current.formatted).toBe('');
        });

        it('should stay expired after reaching zero', () => {
            const futureDate = dayjs().add(1, 'second');
            const { result } = renderHook(() => useCountdown(futureDate));

            act(() => {
                vi.advanceTimersByTime(2000);
            });

            expect(result.current.isExpired).toBe(true);

            act(() => {
                vi.advanceTimersByTime(5000);
            });

            expect(result.current.isExpired).toBe(true);
            expect(result.current.totalSeconds).toBe(0);
        });

        it('should handle countdown that expires during interval', () => {
            const futureDate = dayjs().add(1500, 'milliseconds'); // 1.5 seconds
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.isExpired).toBe(false);

            act(() => {
                vi.advanceTimersByTime(2000);
            });

            expect(result.current.isExpired).toBe(true);
            expect(result.current.totalSeconds).toBe(0);
        });
    });

    describe('target date changes', () => {
        it('should update countdown when target date changes', () => {
            let targetDate = dayjs().add(5, 'seconds');
            const { result, rerender } = renderHook(
                ({ date }) => useCountdown(date),
                { initialProps: { date: targetDate } }
            );

            expect(result.current.totalSeconds).toBe(5);

            // Change target date
            targetDate = dayjs().add(10, 'seconds');
            rerender({ date: targetDate });

            expect(result.current.totalSeconds).toBe(10);
        });

        it('should handle changing from valid date to null', () => {
            let targetDate: Dayjs | null = dayjs().add(5, 'seconds');
            const { result, rerender } = renderHook(
                ({ date }) => useCountdown(date),
                { initialProps: { date: targetDate } }
            );

            expect(result.current.isExpired).toBe(false);

            targetDate = null;
            rerender({ date: targetDate });

            expect(result.current.isExpired).toBe(true);
            expect(result.current.totalSeconds).toBe(0);
        });

        it('should handle changing from null to valid date', () => {
            let targetDate: Dayjs | null = null;
            const { result, rerender } = renderHook(
                ({ date }) => useCountdown(date),
                { initialProps: { date: targetDate } }
            );

            expect(result.current.isExpired).toBe(true);

            targetDate = dayjs().add(5, 'seconds');
            rerender({ date: targetDate });

            expect(result.current.isExpired).toBe(false);
            expect(result.current.totalSeconds).toBe(5);
        });

        it('should update interval when updateInterval changes', () => {
            const targetDate = dayjs().add(10, 'seconds');
            let interval = 1000;
            const { result, rerender } = renderHook(
                ({ updateInterval }) => useCountdown(targetDate, updateInterval),
                { initialProps: { updateInterval: interval } }
            );

            expect(result.current.totalSeconds).toBe(10);

            // Change interval to 500ms
            interval = 500;
            rerender({ updateInterval: interval });

            act(() => {
                vi.advanceTimersByTime(500);
            });

            expect(result.current.totalSeconds).toBe(9);
        });
    });

    describe('memory management and cleanup', () => {
        it('should clear interval on unmount', () => {
            const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
            const futureDate = dayjs().add(5, 'seconds');
            const { unmount } = renderHook(() => useCountdown(futureDate));

            unmount();

            expect(clearIntervalSpy).toHaveBeenCalled();
        });

        it('should clear previous interval when dependencies change', () => {
            const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
            let targetDate = dayjs().add(5, 'seconds');
            const { rerender } = renderHook(
                ({ date }) => useCountdown(date),
                { initialProps: { date: targetDate } }
            );

            const initialCallCount = clearIntervalSpy.mock.calls.length;

            targetDate = dayjs().add(10, 'seconds');
            rerender({ date: targetDate });

            expect(clearIntervalSpy.mock.calls.length).toBeGreaterThan(initialCallCount);
        });

        it('should not cause memory leaks after unmount', () => {
            const futureDate = dayjs().add(5, 'seconds');
            const { unmount } = renderHook(() => useCountdown(futureDate));

            unmount();

            // Advancing timers should not cause any updates
            act(() => {
                vi.advanceTimersByTime(10000);
            });

            // Test passes if no errors are thrown
        });
    });

    describe('edge cases and error handling', () => {
        it('should handle invalid dayjs objects gracefully', () => {
            const invalidDate = dayjs('invalid-date');
            const { result } = renderHook(() => useCountdown(invalidDate));

            expect(result.current.isExpired).toBe(true);
            expect(result.current.totalSeconds).toBe(0);
        });

        it('should handle very short countdowns', () => {
            const futureDate = dayjs().add(100, 'milliseconds');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.totalSeconds).toBe(0); // Rounds down to 0 seconds
            expect(result.current.isExpired).toBe(true);
        });

        it('should handle negative update intervals by using default', () => {
            const futureDate = dayjs().add(5, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate, -1000));

            // Should still work with default interval (1000ms)
            act(() => {
                vi.advanceTimersByTime(1000);
            });

            expect(result.current.totalSeconds).toBe(4);
        });

        it('should handle zero update interval', () => {
            const futureDate = dayjs().add(5, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate, 0));

            // Should handle gracefully (may use default or minimal interval)
            expect(result.current.totalSeconds).toBe(5);
        });

        it('should handle extremely large update intervals', () => {
            const futureDate = dayjs().add(5, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate, 1000000));

            expect(result.current.totalSeconds).toBe(5);

            act(() => {
                vi.advanceTimersByTime(100000);
            });

            // Should not update yet due to large interval
            expect(result.current.totalSeconds).toBe(5);
        });
    });

    describe('boundary conditions', () => {
        it('should handle countdown at exactly 1 day', () => {
            const futureDate = dayjs().add(1, 'day');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.days).toBe(1);
            expect(result.current.hours).toBe(0);
            expect(result.current.minutes).toBe(0);
            expect(result.current.seconds).toBe(0);
            expect(result.current.formatted).toBe('1d 0h 0m');
        });

        it('should handle countdown at exactly 1 hour', () => {
            const futureDate = dayjs().add(1, 'hour');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.days).toBe(0);
            expect(result.current.hours).toBe(1);
            expect(result.current.minutes).toBe(0);
            expect(result.current.seconds).toBe(0);
            expect(result.current.formatted).toBe('1h 0m');
        });

        it('should handle countdown at exactly 1 minute', () => {
            const futureDate = dayjs().add(1, 'minute');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.days).toBe(0);
            expect(result.current.hours).toBe(0);
            expect(result.current.minutes).toBe(1);
            expect(result.current.seconds).toBe(0);
            expect(result.current.formatted).toBe('1m 0s');
        });

        it('should handle maximum safe integer seconds', () => {
            const futureDate = dayjs().add(Number.MAX_SAFE_INTEGER, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.totalSeconds).toBe(Number.MAX_SAFE_INTEGER);
            expect(result.current.isExpired).toBe(false);
        });
    });

    describe('real-world scenarios', () => {
        it('should handle typical countdown scenarios (5 minute timer)', () => {
            const futureDate = dayjs().add(5, 'minutes');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.minutes).toBe(5);
            expect(result.current.seconds).toBe(0);
            expect(result.current.formatted).toBe('5m 0s');

            // Advance 2 minutes
            act(() => {
                vi.advanceTimersByTime(120000);
            });

            expect(result.current.minutes).toBe(3);
            expect(result.current.seconds).toBe(0);
        });

        it('should handle event countdown (1 week)', () => {
            const futureDate = dayjs().add(1, 'week');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.days).toBe(7);
            expect(result.current.hours).toBe(0);
            expect(result.current.minutes).toBe(0);
            expect(result.current.seconds).toBe(0);
            expect(result.current.formatted).toBe('7d 0h 0m');
        });

        it('should handle flash sale countdown (30 seconds)', () => {
            const futureDate = dayjs().add(30, 'seconds');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.seconds).toBe(30);
            expect(result.current.formatted).toBe('30s');

            // Advance to final 10 seconds
            act(() => {
                vi.advanceTimersByTime(20000);
            });

            expect(result.current.seconds).toBe(10);
            expect(result.current.formatted).toBe('10s');

            // Advance to expiration
            act(() => {
                vi.advanceTimersByTime(10000);
            });

            expect(result.current.isExpired).toBe(true);
            expect(result.current.formatted).toBe('');
        });
    });

    describe('calculateTimeLeft function edge cases', () => {
        it('should handle time differences at millisecond boundaries', () => {
            // Test with 999ms - should round down to 0 seconds
            const futureDate = dayjs().add(999, 'milliseconds');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.totalSeconds).toBe(0);
            expect(result.current.isExpired).toBe(true);
        });

        it('should handle time differences at second boundaries', () => {
            // Test with exactly 1000ms - should be 1 second
            const futureDate = dayjs().add(1000, 'milliseconds');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.totalSeconds).toBe(1);
            expect(result.current.seconds).toBe(1);
            expect(result.current.isExpired).toBe(false);
        });

        it('should handle complex time calculations correctly', () => {
            const futureDate = dayjs().add(90061, 'seconds'); // 1d 1h 1m 1s
            const { result } = renderHook(() => useCountdown(futureDate));

            // Verify the math: 90061 seconds = 1 day (86400s) + 1 hour (3600s) + 1 minute (60s) + 1 second
            const expectedDays = Math.floor(90061 / (24 * 60 * 60)); // 1
            const remaining = 90061 % (24 * 60 * 60); // 3661
            const expectedHours = Math.floor(remaining / (60 * 60)); // 1
            const remaining2 = remaining % (60 * 60); // 61
            const expectedMinutes = Math.floor(remaining2 / 60); // 1
            const expectedSeconds = remaining2 % 60; // 1

            expect(result.current.days).toBe(expectedDays);
            expect(result.current.hours).toBe(expectedHours);
            expect(result.current.minutes).toBe(expectedMinutes);
            expect(result.current.seconds).toBe(expectedSeconds);
        });
    });

    describe('formatting edge cases', () => {
        it('should format zero values correctly', () => {
            const futureDate = dayjs().add(86400, 'seconds'); // Exactly 1 day
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.formatted).toBe('1d 0h 0m');
        });

        it('should format large values correctly', () => {
            const futureDate = dayjs().add(999, 'days').add(23, 'hours').add(59, 'minutes');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.days).toBe(999);
            expect(result.current.hours).toBe(23);
            expect(result.current.minutes).toBe(59);
            expect(result.current.formatted).toBe('999d 23h 59m');
        });

        it('should handle single digit formatting', () => {
            const futureDate = dayjs().add(1, 'day').add(1, 'hour').add(1, 'minute').add(1, 'second');
            const { result } = renderHook(() => useCountdown(futureDate));

            expect(result.current.formatted).toBe('1d 1h 1m');
        });
    });
});