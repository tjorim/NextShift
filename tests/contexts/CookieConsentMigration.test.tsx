import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import {
    CookieConsentProvider,
    useCookieConsent,
} from '../../src/contexts/CookieConsentContext';

// Test component that can trigger consent
function TestComponent() {
    const { acceptAllCookies } = useCookieConsent();

    return (
        <div>
            <button type="button" onClick={acceptAllCookies}>
                Accept All
            </button>
            <div>Test Content</div>
        </div>
    );
}

// Wrapper component
function TestWrapper() {
    return (
        <CookieConsentProvider>
            <TestComponent />
        </CookieConsentProvider>
    );
}

describe('Cookie Consent Migration', () => {
    beforeEach(() => {
        cleanup();
        localStorage.clear();
    });

    it('migrates existing user data when functional consent is granted for the first time', async () => {
        const user = userEvent.setup();

        // Setup: Add old-style user data
        const oldUserState = {
            hasCompletedOnboarding: true,
            myTeam: 3,
            settings: {
                timeFormat: '24h',
                theme: 'dark',
                notifications: 'on',
            },
        };
        localStorage.setItem(
            'nextshift_user_state',
            JSON.stringify(oldUserState),
        );

        // Verify old data exists and new data doesn't
        expect(localStorage.getItem('nextshift_user_state')).toBeTruthy();
        expect(
            localStorage.getItem('nextshift_necessary_onboarding_state'),
        ).toBeNull();
        expect(localStorage.getItem('nextshift_user_preferences')).toBeNull();

        // Render component
        render(<TestWrapper />);

        // Click to accept all cookies (which triggers migration)
        const acceptButton = screen.getByText('Accept All');
        await user.click(acceptButton);

        // Verify migration occurred
        expect(localStorage.getItem('nextshift_user_state')).toBeNull(); // Old data should be removed

        const migratedOnboarding = localStorage.getItem(
            'nextshift_necessary_onboarding_state',
        );
        expect(migratedOnboarding).toBeTruthy();
        expect(JSON.parse(migratedOnboarding as string)).toEqual({
            hasCompletedOnboarding: true,
        });

        const migratedPreferences = localStorage.getItem(
            'nextshift_user_preferences',
        );
        expect(migratedPreferences).toBeTruthy();
        expect(JSON.parse(migratedPreferences as string)).toEqual({
            myTeam: 3,
            settings: {
                timeFormat: '24h',
                theme: 'dark',
                notifications: 'on',
            },
        });
    });

    it('does not migrate when functional consent is not granted', () => {
        // Setup: Add old-style user data
        const oldUserState = {
            hasCompletedOnboarding: true,
            myTeam: 3,
        };
        localStorage.setItem(
            'nextshift_user_state',
            JSON.stringify(oldUserState),
        );

        render(<TestWrapper />);

        // Don't click accept - no migration should happen
        expect(localStorage.getItem('nextshift_user_state')).toBeTruthy(); // Old data should remain
        expect(
            localStorage.getItem('nextshift_necessary_onboarding_state'),
        ).toBeNull();
        expect(localStorage.getItem('nextshift_user_preferences')).toBeNull();
    });

    it('does not migrate data if new structure already exists', async () => {
        const user = userEvent.setup();

        // Setup: Add both old and new data
        const oldUserState = {
            hasCompletedOnboarding: false,
            myTeam: 1,
            settings: { timeFormat: '12h' },
        };
        const newOnboarding = { hasCompletedOnboarding: true };
        const newPreferences = { myTeam: 2, settings: { timeFormat: '24h' } };

        localStorage.setItem(
            'nextshift_user_state',
            JSON.stringify(oldUserState),
        );
        localStorage.setItem(
            'nextshift_necessary_onboarding_state',
            JSON.stringify(newOnboarding),
        );
        localStorage.setItem(
            'nextshift_user_preferences',
            JSON.stringify(newPreferences),
        );

        render(<TestWrapper />);

        const acceptButton = screen.getByText('Accept All');
        await user.click(acceptButton);

        // Verify old data is preserved and new data is not overwritten
        expect(localStorage.getItem('nextshift_user_state')).toBeTruthy(); // Old data should remain
        expect(
            JSON.parse(
                localStorage.getItem(
                    'nextshift_necessary_onboarding_state',
                ) as string,
            ),
        ).toEqual(newOnboarding);
        expect(
            JSON.parse(
                localStorage.getItem('nextshift_user_preferences') as string,
            ),
        ).toEqual(newPreferences);
    });

    it('handles migration gracefully when old data is malformed', async () => {
        const user = userEvent.setup();

        // Setup: Add malformed old data
        localStorage.setItem('nextshift_user_state', 'invalid-json');

        // This should not throw an error
        expect(() => render(<TestWrapper />)).not.toThrow();

        const acceptButton = screen.getByText('Accept All');
        await user.click(acceptButton);

        // Malformed data should be left alone (migration fails gracefully)
        expect(localStorage.getItem('nextshift_user_state')).toBe(
            'invalid-json',
        );
    });

    it('migrates only onboarding state when user preferences are missing', async () => {
        const user = userEvent.setup();

        // Setup: Add old data with only onboarding
        const oldUserState = {
            hasCompletedOnboarding: true,
            // No myTeam or settings
        };
        localStorage.setItem(
            'nextshift_user_state',
            JSON.stringify(oldUserState),
        );

        render(<TestWrapper />);

        const acceptButton = screen.getByText('Accept All');
        await user.click(acceptButton);

        // Verify migration occurred
        expect(localStorage.getItem('nextshift_user_state')).toBeNull();

        const migratedOnboarding = localStorage.getItem(
            'nextshift_necessary_onboarding_state',
        );
        expect(migratedOnboarding).toBeTruthy();
        expect(JSON.parse(migratedOnboarding as string)).toEqual({
            hasCompletedOnboarding: true,
        });

        // User preferences should not be created if no meaningful data to migrate
        expect(localStorage.getItem('nextshift_user_preferences')).toBeNull();
    });
});
