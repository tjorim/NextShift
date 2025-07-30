import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * React hook that manages Progressive Web App (PWA) installation prompts.
 *
 * Detects when the app becomes installable, exposes a boolean indicating installability, and provides a function to trigger the install prompt and await the user's response.
 *
 * Uses consent-aware storage for remembering user dismissal preferences.
 *
 * @returns An object containing `isInstallable`, a boolean indicating if the app can be installed, and `promptInstall`, a function that prompts the user to install the app and returns a boolean indicating if the user accepted.
 */
export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isPrompting, setIsPrompting] = useState(false);

    // Check if user previously dismissed auto-prompts (with consent checking)
    const hasUserDismissedAutoPrompt = useCallback(() => {
        try {
            // Check if we have functional consent for storing this preference
            const consentData = window.localStorage.getItem(
                'nextshift_cookie_consent',
            );
            if (!consentData) {
                return false; // No consent given, don't remember dismissals
            }

            const parsed = JSON.parse(consentData);
            if (!parsed?.consentGiven || !parsed?.preferences?.functional) {
                return false; // No functional consent
            }

            return localStorage.getItem('nextshift_pwa_dismissed') === 'true';
        } catch {
            return false;
        }
    }, []);

    // Store dismissal preference (with consent checking)
    const setUserDismissedAutoPrompt = useCallback((dismissed: boolean) => {
        try {
            // Check if we have functional consent for storing this preference
            const consentData = window.localStorage.getItem(
                'nextshift_cookie_consent',
            );
            if (!consentData) {
                return; // No consent given, don't store
            }

            const parsed = JSON.parse(consentData);
            if (!parsed?.consentGiven || !parsed?.preferences?.functional) {
                return; // No functional consent
            }

            if (dismissed) {
                localStorage.setItem('nextshift_pwa_dismissed', 'true');
            } else {
                localStorage.removeItem('nextshift_pwa_dismissed');
            }
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    useEffect(() => {
        // Early return if window or necessary methods are not available
        if (
            typeof window === 'undefined' ||
            !window.addEventListener ||
            !window.removeEventListener
        ) {
            return;
        }

        const handleBeforeInstallPrompt = (e: Event | null) => {
            if (!e) return;

            // Save the event for manual triggering
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);

            // Only prevent auto-prompt if user previously dismissed it
            // Otherwise, let the browser show its smart auto-prompt
            if (hasUserDismissedAutoPrompt() && e.preventDefault) {
                e.preventDefault();
            }
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setIsInstallable(false);
        };

        window.addEventListener(
            'beforeinstallprompt',
            handleBeforeInstallPrompt,
        );
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            if (window.removeEventListener) {
                window.removeEventListener(
                    'beforeinstallprompt',
                    handleBeforeInstallPrompt,
                );
                window.removeEventListener('appinstalled', handleAppInstalled);
            }
        };
    }, [hasUserDismissedAutoPrompt]);

    const promptInstall = async () => {
        if (!deferredPrompt || isPrompting) return false;

        const promptToUse = deferredPrompt;
        setIsPrompting(true);
        setDeferredPrompt(null); // Clear immediately to prevent concurrent access
        setIsInstallable(false);

        try {
            await promptToUse.prompt();
            const { outcome } = await promptToUse.userChoice;

            // If user dismisses our manual prompt, remember this for future auto-prompts
            if (outcome === 'dismissed') {
                setUserDismissedAutoPrompt(true);
            }

            return outcome === 'accepted';
        } catch (error) {
            console.error('Install prompt failed:', error);
            return false;
        } finally {
            setIsPrompting(false);
        }
    };

    return {
        isInstallable,
        promptInstall,
    };
}
