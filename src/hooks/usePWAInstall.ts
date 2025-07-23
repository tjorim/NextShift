import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * React hook for managing Progressive Web App (PWA) installation prompts in modern browsers.
 *
 * Listens for browser events to determine when the app is installable, exposes a boolean indicating installability, and provides a function to trigger the install prompt and await the user's choice.
 *
 * @returns An object with `isInstallable` (boolean) indicating if the app can be installed, and `promptInstall` (function) to trigger the install prompt and return whether the user accepted.
 */
export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent default mini-infobar
            e.preventDefault();
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
            window.removeEventListener(
                'beforeinstallprompt',
                handleBeforeInstallPrompt,
            );
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return false;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            setDeferredPrompt(null);
            setIsInstallable(false);
            return outcome === 'accepted';
        } catch (error) {
            console.error('Install prompt failed:', error);
            return false;
        }
    };

    return {
        isInstallable,
        promptInstall,
    };
}
