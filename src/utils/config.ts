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
            const envDate = new Date(import.meta.env.VITE_REFERENCE_DATE);
            if (!Number.isNaN(envDate.getTime())) {
                return envDate;
            }
            console.warn('Invalid VITE_REFERENCE_DATE format, using default');
        }

        // Try to load from window config (for runtime configuration)
        if (
            typeof window !== 'undefined' &&
            window.NEXTSHIFT_CONFIG?.REFERENCE_DATE
        ) {
            const windowDate = new Date(window.NEXTSHIFT_CONFIG.REFERENCE_DATE);
            if (!Number.isNaN(windowDate.getTime())) {
                return windowDate;
            }
            console.warn(
                'Invalid window.NEXTSHIFT_CONFIG.REFERENCE_DATE format, using default',
            );
        }

        // Fallback to default date
        return new Date('2025-01-06');
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
