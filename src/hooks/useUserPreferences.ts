import { useLocalStorage } from './useLocalStorage';

/**
 * User preferences interface - ready for future expansion
 */
export interface UserPreferences {
    selectedTeam: number | null;
    // Future preferences:
    // darkMode?: boolean;
    // timeFormat?: '12h' | '24h';
    // notifications?: boolean;
    // language?: 'en' | 'nl';
}

const DEFAULT_PREFERENCES: UserPreferences = {
    selectedTeam: null,
};

/**
 * Hook for managing user preferences with future account-sync compatibility
 *
 * Current: localStorage only
 * Future: Can be extended to sync with user accounts
 */
export function useUserPreferences() {
    const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
        'nextshift_user_preferences',
        DEFAULT_PREFERENCES,
    );

    const updateTeam = (team: number | null) => {
        setPreferences((prev) => ({ ...prev, selectedTeam: team }));
    };

    // Future: Add methods for other preferences
    // const updateDarkMode = (darkMode: boolean) => {
    //     setPreferences(prev => ({ ...prev, darkMode }));
    // };

    return {
        preferences,
        selectedTeam: preferences.selectedTeam,
        updateTeam,
        // Future account sync methods would go here:
        // syncWithAccount: (userId: string) => Promise<void>
        // exportPreferences: () => UserPreferences
        // importPreferences: (prefs: UserPreferences) => void
    };
}
