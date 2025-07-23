import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

interface CountdownResult {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    totalSeconds: number;
    formatted: string;
}

/**
 * React hook that provides a live countdown to a specified target date.
 *
 * Calculates and updates the remaining time until the given `targetDate`, returning days, hours, minutes, seconds, expiration status, total seconds left, and a formatted string. If the target date is null or has passed, the countdown is marked as expired.
 *
 * @param targetDate - The date to count down to, or null to disable the countdown
 * @param updateInterval - How often to update the countdown in milliseconds (default: 1000)
 * @returns An object containing the current countdown state, including time units, expiration status, total seconds remaining, and a formatted string
 */
export function useCountdown(
    targetDate: Dayjs | null,
    updateInterval: number = 1000,
): CountdownResult {
    const [timeLeft, setTimeLeft] = useState<CountdownResult>(() => {
        if (!targetDate) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isExpired: true,
                totalSeconds: 0,
                formatted: '',
            };
        }

        const now = dayjs();
        const diff = targetDate.diff(now, 'second');

        if (diff <= 0) {
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isExpired: true,
                totalSeconds: 0,
                formatted: '',
            };
        }

        const days = Math.floor(diff / (24 * 60 * 60));
        const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((diff % (60 * 60)) / 60);
        const seconds = diff % 60;

        let formatted = '';
        if (days > 0) {
            formatted = `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            formatted = `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            formatted = `${minutes}m ${seconds}s`;
        } else {
            formatted = `${seconds}s`;
        }

        return {
            days,
            hours,
            minutes,
            seconds,
            isExpired: false,
            totalSeconds: diff,
            formatted,
        };
    });

    useEffect(() => {
        if (!targetDate) {
            setTimeLeft({
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                isExpired: true,
                totalSeconds: 0,
                formatted: '',
            });
            return;
        }

        const updateCountdown = () => {
            const now = dayjs();
            const diff = targetDate.diff(now, 'second');

            if (diff <= 0) {
                setTimeLeft({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isExpired: true,
                    totalSeconds: 0,
                    formatted: '',
                });
                return;
            }

            const days = Math.floor(diff / (24 * 60 * 60));
            const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((diff % (60 * 60)) / 60);
            const seconds = diff % 60;

            let formatted = '';
            if (days > 0) {
                formatted = `${days}d ${hours}h ${minutes}m`;
            } else if (hours > 0) {
                formatted = `${hours}h ${minutes}m`;
            } else if (minutes > 0) {
                formatted = `${minutes}m ${seconds}s`;
            } else {
                formatted = `${seconds}s`;
            }

            setTimeLeft({
                days,
                hours,
                minutes,
                seconds,
                isExpired: false,
                totalSeconds: diff,
                formatted,
            });
        };

        // Update immediately
        updateCountdown();

        // Set up interval
        const interval = setInterval(updateCountdown, updateInterval);

        return () => clearInterval(interval);
    }, [targetDate, updateInterval]); // targetDate is stable now

    return timeLeft;
}
