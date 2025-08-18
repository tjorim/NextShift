import { useEffect, useState } from 'react';
import type { ConsentCategory } from '../contexts/CookieConsentContext';

/**
 * Check if storage is allowed for a given category
 */
function checkStoragePermission(
    key: string,
    category: ConsentCategory,
): boolean {
    // Always allow necessary storage and consent storage itself
    if (category === 'necessary' || key === 'nextshift_cookie_consent') {
        return true;
    }

    // In SSR or when localStorage isn't available, be conservative
    if (typeof window === 'undefined') {
        return false;
    }

    // Check if consent has been given by looking directly at localStorage
    try {
        const consentData = window.localStorage.getItem(
            'nextshift_cookie_consent',
        );
        if (!consentData) {
            return false; // No consent given yet
        }

        const parsed = JSON.parse(consentData);
        return parsed?.consentGiven && parsed?.preferences?.[category];
    } catch {
        return false;
    }
}

/**
 * Consent-aware localStorage hook that respects GDPR cookie preferences.
 *
 * This hook always updates React state for optimal UX, but only persists to localStorage
 * when the user has granted consent for the specified category. This allows the app to
 * function normally even when storage consent is denied, while respecting user preferences.
 *
 * @param key - The localStorage key
 * @param initialValue - The initial value if nothing is stored
 * @param category - The consent category ('necessary', 'functional', 'analytics')
 * @returns [value, setValue] tuple similar to useState
 *
 * @example
 * // For user preferences (functional data)
 * const [theme, setTheme] = useConsentAwareLocalStorage('theme', 'light', 'functional');
 *
 * // For essential app data (necessary data)
 * const [onboarding, setOnboarding] = useConsentAwareLocalStorage('onboarding', false, 'necessary');
 */
export function useConsentAwareLocalStorage<T>(
    key: string,
    initialValue: T,
    category: ConsentCategory = 'functional',
): [T, (value: T | ((prev: T) => T)) => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        // Check if we have permission to read this storage
        if (!checkStoragePermission(key, category)) {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            // Return initial value if localStorage is corrupted or unavailable
            return initialValue;
        }
    });

    // React to consent changes by listening to storage events and re-checking permissions
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleStorageChange = (e: StorageEvent) => {
            // Only react to consent changes
            if (e.key === 'nextshift_cookie_consent') {
                // Re-check permission and potentially clear data if consent withdrawn
                if (!checkStoragePermission(key, category)) {
                    // If permission is withdrawn, revert to initial value
                    setStoredValue(initialValue);
                    // Also remove from localStorage if it exists
                    try {
                        window.localStorage.removeItem(key);
                    } catch {
                        // Ignore errors
                    }
                } else {
                    // If permission is granted, try to load from localStorage
                    try {
                        const item = window.localStorage.getItem(key);
                        if (item) {
                            setStoredValue(JSON.parse(item));
                        }
                    } catch {
                        // Ignore errors
                    }
                }
            }
        };

        // Listen for storage changes (including consent changes)
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key, category, initialValue]);

    const setValue = (value: T | ((prev: T) => T)) => {
        try {
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            // Always update state
            setStoredValue(valueToStore);

            // Only persist to localStorage if we have permission
            if (
                typeof window !== 'undefined' &&
                checkStoragePermission(key, category)
            ) {
                try {
                    window.localStorage.setItem(
                        key,
                        JSON.stringify(valueToStore),
                    );
                } catch {
                    // Handle storage quota exceeded or other localStorage errors silently
                    // App continues to function normally even if storage fails
                }
            }
        } catch {
            // Handle any other errors silently - app continues to function
        }
    };

    return [storedValue, setValue];
}

/**
 * Utility function to clear non-essential localStorage data when consent is withdrawn
 */
export function clearNonEssentialStorage(): void {
    if (typeof window === 'undefined') return;

    try {
        // List of essential keys that should never be cleared
        const essentialKeys = [
            'nextshift_cookie_consent', // Consent preferences themselves
            'nextshift_onboarding_state', // Essential for app functionality
        ];

        // Get all localStorage keys
        const allKeys = Object.keys(window.localStorage);

        // Clear non-essential keys
        for (const key of allKeys) {
            if (!essentialKeys.includes(key) && key.startsWith('nextshift_')) {
                try {
                    window.localStorage.removeItem(key);
                } catch {
                    // Handle individual key removal errors silently
                }
            }
        }
    } catch {
        // Handle storage clearing errors silently - app continues to function
    }
}

/**
 * Re-export the original useLocalStorage hook for backward compatibility.
 *
 * @remarks
 * - Use `useLocalStorage` for scenarios where consent checking is not required,
 *   such as for non-GDPR-sensitive data or legacy code that does not involve
 *   user preferences.
 * - Use `useConsentAwareLocalStorage` for GDPR-sensitive data to ensure compliance
 *   with user consent preferences. This hook respects cookie consent categories
 *   and prevents unauthorized storage or retrieval of data.
 */
export { useLocalStorage } from './useLocalStorage';
