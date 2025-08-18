import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    CookieConsentProvider,
    useCookieConsent,
} from '../../src/contexts/CookieConsentContext';

describe('CookieConsentContext', () => {
    function wrapper({ children }: { children: ReactNode }) {
        return <CookieConsentProvider>{children}</CookieConsentProvider>;
    }

    afterEach(() => {
        window.localStorage.clear();
    });

    it('provides default values when no consent has been given', () => {
        const { result } = renderHook(() => useCookieConsent(), { wrapper });

        expect(result.current.hasConsentBeenSet).toBe(false);
        expect(result.current.consentPreferences.necessary).toBe(true);
        expect(result.current.consentPreferences.functional).toBe(false);
        expect(result.current.consentPreferences.analytics).toBe(false);
        expect(result.current.canUseStorage('necessary')).toBe(true);
        expect(result.current.canUseStorage('functional')).toBe(false);
        expect(result.current.canUseStorage('analytics')).toBe(false);
    });

    it('loads existing consent from localStorage', () => {
        // Set up existing consent
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

        const { result } = renderHook(() => useCookieConsent(), { wrapper });

        expect(result.current.hasConsentBeenSet).toBe(true);
        expect(result.current.consentPreferences.functional).toBe(true);
        expect(result.current.canUseStorage('functional')).toBe(true);
    });

    it('accepts all cookies', () => {
        const { result } = renderHook(() => useCookieConsent(), { wrapper });

        act(() => {
            result.current.acceptAllCookies();
        });

        expect(result.current.hasConsentBeenSet).toBe(true);
        expect(result.current.consentPreferences.necessary).toBe(true);
        expect(result.current.consentPreferences.functional).toBe(true);
        expect(result.current.consentPreferences.analytics).toBe(true);
        expect(result.current.canUseStorage('functional')).toBe(true);
    });

    it('rejects all non-necessary cookies', () => {
        const { result } = renderHook(() => useCookieConsent(), { wrapper });

        act(() => {
            result.current.rejectAllCookies();
        });

        expect(result.current.hasConsentBeenSet).toBe(true);
        expect(result.current.consentPreferences.necessary).toBe(true);
        expect(result.current.consentPreferences.functional).toBe(false);
        expect(result.current.consentPreferences.analytics).toBe(false);
        expect(result.current.canUseStorage('functional')).toBe(false);
    });

    it('sets custom consent preferences', () => {
        const { result } = renderHook(() => useCookieConsent(), { wrapper });

        act(() => {
            result.current.setConsentPreferences({
                necessary: true,
                functional: true,
                analytics: false,
            });
        });

        expect(result.current.hasConsentBeenSet).toBe(true);
        expect(result.current.consentPreferences.functional).toBe(true);
        expect(result.current.consentPreferences.analytics).toBe(false);
    });

    it('always allows necessary storage', () => {
        const { result } = renderHook(() => useCookieConsent(), { wrapper });

        // Even without consent, necessary storage should be allowed
        expect(result.current.canUseStorage('necessary')).toBe(true);

        act(() => {
            result.current.rejectAllCookies();
        });

        // Even after rejecting all, necessary should still be allowed
        expect(result.current.canUseStorage('necessary')).toBe(true);
    });

    it('ensures necessary is always true in preferences', () => {
        const { result } = renderHook(() => useCookieConsent(), { wrapper });

        act(() => {
            result.current.setConsentPreferences({
                necessary: false, // Try to set to false
                functional: true,
                analytics: true,
            });
        });

        // Should be forced to true
        expect(result.current.consentPreferences.necessary).toBe(true);
    });

    it('resets consent', () => {
        const { result } = renderHook(() => useCookieConsent(), { wrapper });

        // First set some consent
        act(() => {
            result.current.acceptAllCookies();
        });

        expect(result.current.hasConsentBeenSet).toBe(true);

        // Then reset it
        act(() => {
            result.current.resetConsent();
        });

        expect(result.current.hasConsentBeenSet).toBe(false);
        expect(result.current.canUseStorage('functional')).toBe(false);
    });

    it('persists consent to localStorage', () => {
        const { result } = renderHook(() => useCookieConsent(), { wrapper });

        act(() => {
            result.current.acceptAllCookies();
        });

        const stored = window.localStorage.getItem('nextshift_cookie_consent');
        expect(stored).not.toBeNull();

        if (stored) {
            const parsed = JSON.parse(stored);
            expect(parsed.consentGiven).toBe(true);
            expect(parsed.preferences.functional).toBe(true);
            expect(parsed.consentDate).toBeDefined();
        }
    });
});
