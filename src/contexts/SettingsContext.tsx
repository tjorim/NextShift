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

export const defaultSettings: UserSettings = {
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
 * GDPR Compliance:
 * - Onboarding completion is stored as "necessary" (required for app functionality)
 * - User preferences are stored as "functional" (requires user consent)
 * - All settings are persisted to localStorage with appropriate consent checking
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

    // Separate necessary state (necessary) from preferences (functional)
    const [onboardingState, setOnboardingState] = useLocalStorage<{
        hasCompletedOnboarding: boolean;
    }>(
        'nextshift_necessary_onboarding_state',
        { hasCompletedOnboarding: false },
        'necessary',
    );

    const [userPreferences, setUserPreferences] = useLocalStorage<{
        myTeam: number | null;
        settings: UserSettings;
    }>(
        'nextshift_user_preferences',
        {
            myTeam: null,
            settings: defaultSettings,
        },
        'functional',
    );

    // Reconstruct the full user state for backward compatibility
    const rawUserState: NextShiftUserState = {
        hasCompletedOnboarding: onboardingState.hasCompletedOnboarding,
        myTeam: userPreferences.myTeam,
        settings: userPreferences.settings,
    };

    const userState: NextShiftUserState = validateUserState(rawUserState)
        ? rawUserState
        : defaultUserState;

    // Helper to update user preferences
    const updateUserPreferences = useCallback(
        (updater: (prev: typeof userPreferences) => typeof userPreferences) => {
            setUserPreferences(updater);
        },
        [setUserPreferences],
    );

    const updateTimeFormat = useCallback(
        (format: TimeFormat) => {
            updateUserPreferences((prev) => ({
                ...prev,
                settings: { ...prev.settings, timeFormat: format },
            }));
        },
        [updateUserPreferences],
    );

    const updateTheme = useCallback(
        (theme: Theme) => {
            updateUserPreferences((prev) => ({
                ...prev,
                settings: { ...prev.settings, theme },
            }));
        },
        [updateUserPreferences],
    );

    const updateNotifications = useCallback(
        (notifications: NotificationSetting) => {
            updateUserPreferences((prev) => ({
                ...prev,
                settings: { ...prev.settings, notifications },
            }));
        },
        [updateUserPreferences],
    );

    const resetSettings = useCallback(() => {
        setOnboardingState({ hasCompletedOnboarding: false });
        setUserPreferences({
            myTeam: null,
            settings: defaultSettings,
        });
    }, [setOnboardingState, setUserPreferences]);

    const setMyTeam = useCallback(
        (team: number | null) => {
            updateUserPreferences((prev) => ({
                ...prev,
                myTeam: team,
            }));
        },
        [updateUserPreferences],
    );

    const setHasCompletedOnboarding = useCallback(
        (completed: boolean) => {
            setOnboardingState({ hasCompletedOnboarding: completed });
        },
        [setOnboardingState],
    );

    const completeOnboardingWithTeam = useCallback(
        (team: number | null) => {
            setOnboardingState({ hasCompletedOnboarding: true });
            updateUserPreferences((prev) => ({
                ...prev,
                myTeam: team,
            }));
        },
        [setOnboardingState, updateUserPreferences],
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
