import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
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
}

const defaultSettings: UserSettings = {
    timeFormat: '24h',
    theme: 'light',
    notifications: 'off',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

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
    const [settings, setSettings] = useLocalStorage<UserSettings>('userSettings', defaultSettings);

    const updateTimeFormat = (format: TimeFormat) => {
        setSettings(prev => ({ ...prev, timeFormat: format }));
    };

    const updateTheme = (theme: Theme) => {
        setSettings(prev => ({ ...prev, theme }));
    };

    const updateNotifications = (notifications: NotificationSetting) => {
        setSettings(prev => ({ ...prev, notifications }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
    };

    const contextValue: SettingsContextType = {
        settings,
        updateTimeFormat,
        updateTheme,
        updateNotifications,
        resetSettings,
    };

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