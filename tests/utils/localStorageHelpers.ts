/**
 * Test utilities for localStorage setup to reduce duplication in tests
 */

interface LocalStorageTestSetupOptions {
    myTeam?: number;
    timeFormat?: '12h' | '24h';
    theme?: 'auto' | 'light' | 'dark';
    notifications?: 'on' | 'off';
    hasCompletedOnboarding?: boolean;
    functionalConsent?: boolean;
    analyticsConsent?: boolean;
}

/**
 * Sets up localStorage with common test data structure
 * Reduces duplication in component tests that need localStorage state
 */
export function setupLocalStorage(options: LocalStorageTestSetupOptions = {}) {
    const {
        myTeam,
        timeFormat = '24h',
        theme = 'auto',
        notifications = 'off',
        hasCompletedOnboarding = true,
        functionalConsent = true,
        analyticsConsent = false,
    } = options;

    // Set up cookie consent
    const consentData = {
        preferences: {
            necessary: true,
            functional: functionalConsent,
            analytics: analyticsConsent,
        },
        consentGiven: true,
        consentDate: new Date().toISOString(),
    };
    window.localStorage.setItem(
        'nextshift_cookie_consent',
        JSON.stringify(consentData),
    );

    // Set up onboarding state
    window.localStorage.setItem(
        'nextshift_necessary_onboarding_state',
        JSON.stringify({
            hasCompletedOnboarding,
        }),
    );

    // Set up user preferences (only if myTeam is provided)
    if (myTeam !== undefined) {
        window.localStorage.setItem(
            'nextshift_user_preferences',
            JSON.stringify({
                myTeam,
                settings: {
                    timeFormat,
                    theme,
                    notifications,
                },
            }),
        );
    }
}

/**
 * Clears all NextShift-related localStorage entries
 * Useful for test cleanup
 */
export function clearLocalStorage() {
    const keys = [
        'nextshift_cookie_consent',
        'nextshift_necessary_onboarding_state',
        'nextshift_user_preferences',
    ];

    for (const key of keys) {
        window.localStorage.removeItem(key);
    }
}
