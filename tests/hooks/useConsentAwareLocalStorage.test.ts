import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    clearNonEssentialStorage,
    useConsentAwareLocalStorage,
} from '../../src/hooks/useConsentAwareLocalStorage';

describe('useConsentAwareLocalStorage', () => {
    afterEach(() => {
        window.localStorage.clear();
    });

    const setFunctionalConsent = () => {
        const consentData = {
            preferences: {
                necessary: true,
                functional: true,
                analytics: false,
            },
            consentGiven: true,
            consentDate: new Date().toISOString(),
        };
        window.localStorage.setItem(
            'nextshift_cookie_consent',
            JSON.stringify(consentData),
        );
    };

    it('allows necessary storage without consent', () => {
        const { result } = renderHook(() =>
            useConsentAwareLocalStorage(
                'test_necessary',
                'default',
                'necessary',
            ),
        );

        expect(result.current[0]).toBe('default');

        // Should allow storing
        act(() => {
            result.current[1]('new value');
        });

        expect(result.current[0]).toBe('new value');
        expect(window.localStorage.getItem('test_necessary')).toBe(
            '"new value"',
        );
    });

    it('blocks functional storage without consent', () => {
        const { result } = renderHook(() =>
            useConsentAwareLocalStorage(
                'test_functional',
                'default',
                'functional',
            ),
        );

        expect(result.current[0]).toBe('default');

        // Should not store to localStorage without consent
        act(() => {
            result.current[1]('new value');
        });

        expect(result.current[0]).toBe('new value'); // State updated
        expect(window.localStorage.getItem('test_functional')).toBeNull(); // Not persisted
    });

    it('allows functional storage with consent', () => {
        setFunctionalConsent();

        const { result } = renderHook(() =>
            useConsentAwareLocalStorage(
                'test_functional',
                'default',
                'functional',
            ),
        );

        expect(result.current[0]).toBe('default');

        // Should allow storing with consent
        act(() => {
            result.current[1]('new value');
        });

        expect(result.current[0]).toBe('new value');
        expect(window.localStorage.getItem('test_functional')).toBe(
            '"new value"',
        );
    });

    it('loads existing data when consent is given', () => {
        // Set up existing data
        window.localStorage.setItem('test_existing', '"existing value"');
        setFunctionalConsent();

        const { result } = renderHook(() =>
            useConsentAwareLocalStorage(
                'test_existing',
                'default',
                'functional',
            ),
        );

        expect(result.current[0]).toBe('existing value');
    });

    it('ignores existing data when consent is not given', () => {
        // Set up existing data
        window.localStorage.setItem('test_existing', '"existing value"');
        // No consent given

        const { result } = renderHook(() =>
            useConsentAwareLocalStorage(
                'test_existing',
                'default',
                'functional',
            ),
        );

        expect(result.current[0]).toBe('default'); // Should use default, not existing
    });

    it('always allows consent storage itself', () => {
        const { result } = renderHook(() =>
            useConsentAwareLocalStorage(
                'nextshift_cookie_consent',
                {},
                'functional',
            ),
        );

        // Should allow storing even without consent
        act(() => {
            result.current[1]({ test: 'data' });
        });

        expect(window.localStorage.getItem('nextshift_cookie_consent')).toBe(
            '{"test":"data"}',
        );
    });

    it('supports functional updates', () => {
        setFunctionalConsent();

        const { result } = renderHook(() =>
            useConsentAwareLocalStorage(
                'test_functional_update',
                0,
                'functional',
            ),
        );

        act(() => {
            result.current[1]((prev) => prev + 1);
        });

        expect(result.current[0]).toBe(1);
        expect(window.localStorage.getItem('test_functional_update')).toBe('1');
    });
});

describe('clearNonEssentialStorage', () => {
    afterEach(() => {
        window.localStorage.clear();
    });

    it('clears non-essential storage but preserves essential keys', () => {
        // Set up various storage keys
        window.localStorage.setItem('nextshift_cookie_consent', 'consent data');
        window.localStorage.setItem(
            'nextshift_onboarding_state',
            'onboarding data',
        );
        window.localStorage.setItem(
            'nextshift_user_preferences',
            'preferences data',
        );
        window.localStorage.setItem('nextshift_pwa_dismissed', 'pwa data');
        window.localStorage.setItem('other_app_data', 'other data');

        clearNonEssentialStorage();

        // Essential keys should be preserved
        expect(window.localStorage.getItem('nextshift_cookie_consent')).toBe(
            'consent data',
        );
        expect(window.localStorage.getItem('nextshift_onboarding_state')).toBe(
            'onboarding data',
        );

        // Non-essential NextShift keys should be cleared
        expect(
            window.localStorage.getItem('nextshift_user_preferences'),
        ).toBeNull();
        expect(
            window.localStorage.getItem('nextshift_pwa_dismissed'),
        ).toBeNull();

        // Other app data should be preserved
        expect(window.localStorage.getItem('other_app_data')).toBe(
            'other data',
        );
    });

    it('handles localStorage errors gracefully', () => {
        // Mock localStorage to throw an error on both getItem and removeItem
        const originalLocalStorage = window.localStorage;
        Object.defineProperty(window, 'localStorage', {
            value: {
                ...originalLocalStorage,
                getItem: () => {
                    throw new Error('Storage getItem error');
                },
                removeItem: () => {
                    throw new Error('Storage removeItem error');
                },
            },
            writable: true,
        });

        // Should not throw even when both operations fail
        expect(() => clearNonEssentialStorage()).not.toThrow();

        // Restore localStorage
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            writable: true,
        });
    });

    it('handles removeItem errors gracefully during clearing', () => {
        // Set up some nextshift data
        window.localStorage.setItem(
            'nextshift_user_preferences',
            '{"test":true}',
        );
        window.localStorage.setItem('nextshift_pwa_dismissed', 'true');

        const originalLocalStorage = window.localStorage;

        // Mock localStorage to throw errors only on removeItem
        Object.defineProperty(window, 'localStorage', {
            value: {
                ...originalLocalStorage,
                removeItem: () => {
                    throw new Error('Storage removeItem error');
                },
            },
            writable: true,
        });

        // Should not throw despite removeItem failing
        expect(() => clearNonEssentialStorage()).not.toThrow();

        // Restore localStorage
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            writable: true,
        });
    });
});
