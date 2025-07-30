import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useMemo } from 'react';
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
            setConsentData({
                preferences: {
                    ...preferences,
                    necessary: true, // Always ensure necessary is true
                },
                consentGiven: true,
                consentDate: new Date().toISOString(),
            });
        },
        [setConsentData],
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
