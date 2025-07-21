import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

// Ensure UTC plugin is loaded for consistent date parsing
dayjs.extend(utc);

/**
 * Parse date string in UTC to avoid timezone interpretation issues
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object parsed in UTC
 */
function parseUTCDate(dateString: string): Date {
    return dayjs.utc(dateString).toDate();
}

export interface NextShiftConfig {
    REFERENCE_DATE: Date;
    REFERENCE_TEAM: number;
}

declare global {
    interface Window {
        NEXTSHIFT_CONFIG?: {
            REFERENCE_DATE?: string;
            REFERENCE_TEAM?: number;
        };
    }
}

export const CONFIG = {
    VERSION: '3.0.0',
    REFERENCE_DATE: (() => {
        // Try to load from environment variable first
        if (import.meta.env.VITE_REFERENCE_DATE) {
            try {
                const envDate = parseUTCDate(
                    import.meta.env.VITE_REFERENCE_DATE,
                );
                if (!Number.isNaN(envDate.getTime())) {
                    return envDate;
                }
            } catch {
                // Fall through to warning
            }
            console.warn('Invalid VITE_REFERENCE_DATE format, using default');
        }

        // Try to load from window config (for runtime configuration)
        if (
            typeof window !== 'undefined' &&
            window.NEXTSHIFT_CONFIG?.REFERENCE_DATE
        ) {
            try {
                const windowDate = parseUTCDate(
                    window.NEXTSHIFT_CONFIG.REFERENCE_DATE,
                );
                if (!Number.isNaN(windowDate.getTime())) {
                    return windowDate;
                }
            } catch {
                // Fall through to warning
            }
            console.warn(
                'Invalid window.NEXTSHIFT_CONFIG.REFERENCE_DATE format, using default',
            );
        }

        // Fallback to default date
        return parseUTCDate('2025-01-06');
    })(),
    REFERENCE_TEAM: (() => {
        // Try to load from environment variable first
        if (import.meta.env.VITE_REFERENCE_TEAM) {
            const envTeam = parseInt(import.meta.env.VITE_REFERENCE_TEAM, 10);
            if (envTeam >= 1 && envTeam <= 5) {
                return envTeam;
            }
            console.warn('Invalid VITE_REFERENCE_TEAM value, using default');
        }

        // Try to load from window config (for runtime configuration)
        if (
            typeof window !== 'undefined' &&
            window.NEXTSHIFT_CONFIG?.REFERENCE_TEAM
        ) {
            const windowTeam = parseInt(
                String(window.NEXTSHIFT_CONFIG.REFERENCE_TEAM),
                10,
            );
            if (windowTeam >= 1 && windowTeam <= 5) {
                return windowTeam;
            }
            console.warn(
                'Invalid window.NEXTSHIFT_CONFIG.REFERENCE_TEAM value, using default',
            );
        }

        // Fallback to default team
        return 1;
    })(),
    SHIFT_CYCLE_DAYS: 10,
    TEAMS_COUNT: 5,
} as const;
