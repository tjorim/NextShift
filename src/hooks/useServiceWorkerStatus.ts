import { useEffect, useState } from 'react';

interface ServiceWorkerStatus {
    isRegistered: boolean;
    isInstalling: boolean;
    isWaiting: boolean;
    isActive: boolean;
    version?: string;
    error?: string;
}

/**
 * Custom hook to monitor service worker status and communicate with it
 * @returns Current service worker status and version information
 */
export function useServiceWorkerStatus(): ServiceWorkerStatus {
    const [status, setStatus] = useState<ServiceWorkerStatus>({
        isRegistered: false,
        isInstalling: false,
        isWaiting: false,
        isActive: false,
    });

    useEffect(() => {
        if (!('serviceWorker' in navigator) || !navigator.serviceWorker) {
            setStatus((prev) => ({
                ...prev,
                error: 'Service Worker not supported',
            }));
            return;
        }

        const updateStatus = () => {
            navigator.serviceWorker
                .getRegistration()
                .then((registration) => {
                    if (!registration) {
                        setStatus((prev) => ({ ...prev, isRegistered: false }));
                        return;
                    }

                    const sw =
                        registration.active ||
                        registration.waiting ||
                        registration.installing;

                    setStatus((prev) => ({
                        ...prev,
                        isRegistered: true,
                        isInstalling: !!registration.installing,
                        isWaiting: !!registration.waiting,
                        isActive: !!registration.active,
                    }));

                    // Try to get version from service worker
                    if (sw && sw.state === 'activated') {
                        // Send message to service worker to get version
                        const messageChannel = new MessageChannel();
                        messageChannel.port1.onmessage = (event) => {
                            if (event.data?.type === 'VERSION_RESPONSE') {
                                setStatus((prev) => ({
                                    ...prev,
                                    version: event.data.version,
                                }));
                            }
                        };

                        sw.postMessage({ type: 'GET_VERSION' }, [
                            messageChannel.port2,
                        ]);
                    }
                })
                .catch((error) => {
                    setStatus((prev) => ({ ...prev, error: error.message }));
                });
        };

        // Initial status check
        updateStatus();

        // Listen for service worker updates
        navigator.serviceWorker.addEventListener(
            'controllerchange',
            updateStatus,
        );

        // Listen for registration updates
        navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
                registration.addEventListener('updatefound', updateStatus);

                if (registration.installing) {
                    registration.installing.addEventListener(
                        'statechange',
                        updateStatus,
                    );
                }
                if (registration.waiting) {
                    registration.waiting.addEventListener(
                        'statechange',
                        updateStatus,
                    );
                }
                if (registration.active) {
                    registration.active.addEventListener(
                        'statechange',
                        updateStatus,
                    );
                }
            }
        });

        return () => {
            navigator.serviceWorker.removeEventListener(
                'controllerchange',
                updateStatus,
            );
        };
    }, []);

    return status;
}

/**
 * Get a human-readable status string for the service worker
 * @param status ServiceWorkerStatus object
 * @returns Formatted status string
 */
export function getServiceWorkerStatusText(
    status: ServiceWorkerStatus,
): string {
    if (status.error) {
        return `Service Worker Error: ${status.error}`;
    }

    if (!status.isRegistered) {
        return 'Service Worker: Not Registered';
    }

    if (status.isInstalling) {
        return 'Service Worker: Installing...';
    }

    if (status.isWaiting) {
        return 'Service Worker: Update Available';
    }

    if (status.isActive) {
        const versionText = status.version ? ` (v${status.version})` : '';
        return `Service Worker: Active${versionText}`;
    }

    return 'Service Worker: Loading...';
}
