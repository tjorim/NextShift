// Unified user state (implemented):
// - hasCompletedOnboarding: boolean
// - myTeam: number | null (the user's team from onboarding)
// - settings: {
//     timeFormat: '12h' | '24h',
//     theme: 'light' | 'dark' | 'auto',
//     notifications: 'on' | 'off'
//   }
// Future expansion:
// - language?: 'en' | 'nl'
// - darkMode?: boolean (if separate from theme)
// - Account sync methods
// - Export/import preferences
// Keep all user state in SettingsContext or unified user state.

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type TimeFormat = '12h' | '24h';
export type Theme = 'light' | 'dark' | 'auto';
export type NotificationSetting = 'on' | 'off';

interface UserSettings {
    timeFormat: TimeFormat;
    theme: Theme;
    notifications: NotificationSetting;
}

interface SettingsContextType {
    settings: UserSettings;
    updateTimeFormat: (format: TimeFormat) => void;
    updateTheme: (theme: Theme) => void;
    updateNotifications: (setting: NotificationSetting) => void;
    resetSettings: () => void;
    // Unified user state additions:
    myTeam: number | null; // The user's team from onboarding
    setMyTeam: (team: number | null) => void;
    hasCompletedOnboarding: boolean;
    setHasCompletedOnboarding: (completed: boolean) => void;
    // Atomic update for onboarding completion with team selection
    completeOnboardingWithTeam: (team: number | null) => void;
}

const defaultSettings: UserSettings = {
    timeFormat: '24h',
    theme: 'auto',
    notifications: 'off',
};

interface NextShiftUserState {
    hasCompletedOnboarding: boolean;
    myTeam: number | null; // The user's team from onboarding
    settings: UserSettings;
}

const defaultUserState: NextShiftUserState = {
    hasCompletedOnboarding: false,
    myTeam: null,
    settings: defaultSettings,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
    undefined,
);

interface SettingsProviderProps {
    children: ReactNode;
}

/**
 * Settings provider that manages user preferences using localStorage.
 *
 * Provides a context for managing app-wide settings including:
 * - Time format (12h/24h)
 * - Theme preference (light/dark/auto)
 * - Notification settings (on/off)
 *
 * All settings are persisted to localStorage and restored on app load.
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
    function validateUserState(state: unknown): state is NextShiftUserState {
        if (typeof state !== 'object' || state === null) return false;
        const s = state as Record<string, unknown>;
        if (typeof s.hasCompletedOnboarding !== 'boolean') return false;
        if (!(typeof s.myTeam === 'number' || s.myTeam === null)) return false;
        if (typeof s.settings !== 'object' || s.settings === null) return false;
        const settings = s.settings as Record<string, unknown>;
        if (!['12h', '24h'].includes(settings.timeFormat as string))
            return false;
        if (!['light', 'dark', 'auto'].includes(settings.theme as string))
            return false;
        if (!['on', 'off'].includes(settings.notifications as string))
            return false;
        return true;
    }

    const [rawUserState, setUserState] = useLocalStorage<NextShiftUserState>(
        'nextshift_user_state',
        defaultUserState,
    );
    const userState: NextShiftUserState = validateUserState(rawUserState)
        ? rawUserState
        : defaultUserState;

    const updateTimeFormat = useCallback(
        (format: TimeFormat) => {
            setUserState((prev: NextShiftUserState) => ({
                ...prev,
                settings: { ...prev.settings, timeFormat: format },
            }));
        },
        [setUserState],
    );

    const updateTheme = useCallback(
        (theme: Theme) => {
            setUserState((prev: NextShiftUserState) => ({
                ...prev,
                settings: { ...prev.settings, theme },
            }));
        },
        [setUserState],
    );

    const updateNotifications = useCallback(
        (notifications: NotificationSetting) => {
            setUserState((prev: NextShiftUserState) => ({
                ...prev,
                settings: { ...prev.settings, notifications },
            }));
        },
        [setUserState],
    );

    const resetSettings = useCallback(() => {
        setUserState(defaultUserState);
    }, [setUserState]);

    const setMyTeam = useCallback(
        (team: number | null) => {
            setUserState((prev: NextShiftUserState) => ({
                ...prev,
                myTeam: team,
            }));
        },
        [setUserState],
    );

    const setHasCompletedOnboarding = useCallback(
        (completed: boolean) => {
            setUserState((prev: NextShiftUserState) => ({
                ...prev,
                hasCompletedOnboarding: completed,
            }));
        },
        [setUserState],
    );

    const completeOnboardingWithTeam = useCallback(
        (team: number | null) => {
            setUserState((prev: NextShiftUserState) => ({
                ...prev,
                myTeam: team,
                hasCompletedOnboarding: true,
            }));
        },
        [setUserState],
    );

    const contextValue: SettingsContextType = useMemo(
        () => ({
            settings: userState.settings,
            updateTimeFormat,
            updateTheme,
            updateNotifications,
            resetSettings,
            myTeam: userState.myTeam,
            setMyTeam,
            hasCompletedOnboarding: userState.hasCompletedOnboarding,
            setHasCompletedOnboarding,
            completeOnboardingWithTeam,
        }),
        [
            userState,
            updateTimeFormat,
            updateTheme,
            updateNotifications,
            resetSettings,
            setMyTeam,
            setHasCompletedOnboarding,
            completeOnboardingWithTeam,
        ],
    );

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
}

/**
 * Hook to access settings context.
 * Must be used within a SettingsProvider.
 */
export function useSettings(): SettingsContextType {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
