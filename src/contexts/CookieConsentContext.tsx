import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
import { clearNonEssentialStorage } from '../hooks/useConsentAwareLocalStorage';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type ConsentCategory = 'necessary' | 'functional' | 'analytics';

export interface ConsentPreferences {
    necessary: boolean; // Always true, but kept for consistency
    functional: boolean;
    analytics: boolean;
}

export interface CookieConsentContextType {
    consentPreferences: ConsentPreferences;
    hasConsentBeenSet: boolean;
    setConsentPreferences: (preferences: ConsentPreferences) => void;
    acceptAllCookies: () => void;
    rejectAllCookies: () => void;
    resetConsent: () => void;
    canUseStorage: (category: ConsentCategory) => boolean;
}

const defaultConsentPreferences: ConsentPreferences = {
    necessary: true, // Always true for strictly necessary storage
    functional: false,
    analytics: false,
};

interface ConsentData {
    preferences: ConsentPreferences;
    consentGiven: boolean;
    consentDate: string;
}

/**
 * Migrates existing user data from the old storage structure to the new split structure.
 * This prevents data loss when users update from versions before the GDPR consent system.
 */
function migrateExistingUserData(): void {
    if (typeof window === 'undefined') return;

    try {
        // Check if migration is needed
        const oldUserState = window.localStorage.getItem(
            'nextshift_user_state',
        );
        const onboardingState = window.localStorage.getItem(
            'nextshift_onboarding_state',
        );
        const userPreferences = window.localStorage.getItem(
            'nextshift_user_preferences',
        );

        // Only migrate if old data exists and new structure doesn't
        if (oldUserState && (!onboardingState || !userPreferences)) {
            const parsed = JSON.parse(oldUserState);

            // Migrate onboarding state to the new key
            if (
                !onboardingState &&
                parsed.hasCompletedOnboarding !== undefined
            ) {
                window.localStorage.setItem(
                    'nextshift_onboarding_state',
                    JSON.stringify({
                        hasCompletedOnboarding: parsed.hasCompletedOnboarding,
                    }),
                );
            }

            // Migrate user preferences to the new key (only if consent will be granted)
            if (
                !userPreferences &&
                (parsed.myTeam !== undefined || parsed.settings !== undefined)
            ) {
                const preferences = {
                    myTeam: parsed.myTeam || null,
                    settings: parsed.settings || {},
                };
                window.localStorage.setItem(
                    'nextshift_user_preferences',
                    JSON.stringify(preferences),
                );
            }

            // Remove old data after successful migration
            window.localStorage.removeItem('nextshift_user_state');

            console.log(
                'Successfully migrated user data to new GDPR-compliant storage structure',
            );
        }
    } catch (error) {
        console.warn('Failed to migrate existing user data:', error);
    }
}

const CookieConsentContext = createContext<
    CookieConsentContextType | undefined
>(undefined);

interface CookieConsentProviderProps {
    children: ReactNode;
}

/**
 * Cookie consent provider that manages GDPR compliance for localStorage usage.
 *
 * Categorizes storage into:
 * - Necessary: Required for app functionality (always allowed)
 * - Functional: User preferences and settings (requires consent)
 * - Analytics: Usage tracking (requires consent, not currently used)
 *
 * Stores consent preferences separately from other app data to ensure
 * consent can be checked before accessing any other storage.
 */
export function CookieConsentProvider({
    children,
}: CookieConsentProviderProps) {
    // Use a separate localStorage key for consent that is always allowed
    const [consentData, setConsentData] = useLocalStorage<ConsentData | null>(
        'nextshift_cookie_consent',
        null,
    );

    const hasConsentBeenSet = Boolean(consentData?.consentGiven);
    const consentPreferences =
        consentData?.preferences || defaultConsentPreferences;

    const setConsentPreferences = useCallback(
        (preferences: ConsentPreferences) => {
            // Run migration before setting consent if this is the first time
            if (!hasConsentBeenSet && preferences.functional) {
                migrateExistingUserData();
            }

            setConsentData({
                preferences: {
                    ...preferences,
                    necessary: true, // Always ensure necessary is true
                },
                consentGiven: true,
                consentDate: new Date().toISOString(),
            });
        },
        [setConsentData, hasConsentBeenSet],
    );

    const acceptAllCookies = useCallback(() => {
        setConsentPreferences({
            necessary: true,
            functional: true,
            analytics: true,
        });
    }, [setConsentPreferences]);

    const rejectAllCookies = useCallback(() => {
        setConsentPreferences({
            necessary: true,
            functional: false,
            analytics: false,
        });
        // Clear any existing functional data when consent is withdrawn
        clearNonEssentialStorage();
    }, [setConsentPreferences]);

    const resetConsent = useCallback(() => {
        setConsentData(null);
    }, [setConsentData]);

    const canUseStorage = useCallback(
        (category: ConsentCategory): boolean => {
            if (category === 'necessary') {
                return true; // Necessary storage is always allowed
            }

            // If consent hasn't been set yet, don't allow non-necessary storage
            if (!hasConsentBeenSet) {
                return false;
            }

            return consentPreferences[category];
        },
        [consentPreferences, hasConsentBeenSet],
    );

    const contextValue: CookieConsentContextType = useMemo(
        () => ({
            consentPreferences,
            hasConsentBeenSet,
            setConsentPreferences,
            acceptAllCookies,
            rejectAllCookies,
            resetConsent,
            canUseStorage,
        }),
        [
            consentPreferences,
            hasConsentBeenSet,
            setConsentPreferences,
            acceptAllCookies,
            rejectAllCookies,
            resetConsent,
            canUseStorage,
        ],
    );

    return (
        <CookieConsentContext.Provider value={contextValue}>
            {children}
        </CookieConsentContext.Provider>
    );
}

/**
 * Hook to access cookie consent context.
 * Must be used within a CookieConsentProvider.
 */
export function useCookieConsent(): CookieConsentContextType {
    const context = useContext(CookieConsentContext);
    if (context === undefined) {
        throw new Error(
            'useCookieConsent must be used within a CookieConsentProvider',
        );
    }
    return context;
}
