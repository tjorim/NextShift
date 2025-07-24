import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * React hook that manages Progressive Web App (PWA) installation prompts.
 *
 * Detects when the app becomes installable, exposes a boolean indicating installability, and provides a function to trigger the install prompt and await the user's response.
 *
 * @returns An object containing `isInstallable`, a boolean indicating if the app can be installed, and `promptInstall`, a function that prompts the user to install the app and returns a boolean indicating if the user accepted.
 */
export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isPrompting, setIsPrompting] = useState(false);

    useEffect(() => {
        // Early return if window or necessary methods are not available
        if (typeof window === 'undefined' || !window.addEventListener || !window.removeEventListener) {
            return;
        }

        const handleBeforeInstallPrompt = (e: Event | null) => {
            if (!e) return;
            
            // Prevent default mini-infobar
            if (e.preventDefault) {
                e.preventDefault();
            }
            // Save the event for later use
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
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
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt || isPrompting) return false;

        const promptToUse = deferredPrompt;
        setIsPrompting(true);
        setDeferredPrompt(null); // Clear immediately to prevent concurrent access
        setIsInstallable(false);
        
        try {
            await promptToUse.prompt();
            const { outcome } = await promptToUse.userChoice;
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
