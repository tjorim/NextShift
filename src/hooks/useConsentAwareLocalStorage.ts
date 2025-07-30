import { useState } from 'react';
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
 * @param key - The localStorage key
 * @param initialValue - The initial value if nothing is stored
 * @param category - The consent category ('necessary', 'functional', 'analytics')
 * @returns [value, setValue] tuple similar to useState
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
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

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
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
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
                window.localStorage.removeItem(key);
            }
        }
    } catch (error) {
        console.warn('Error clearing non-essential storage:', error);
    }
}

// Re-export the original useLocalStorage for backward compatibility
// and for cases where consent checking isn't needed
export { useLocalStorage } from './useLocalStorage';
