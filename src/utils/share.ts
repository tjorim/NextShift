// src/utils/share.ts
// Generic and context-aware sharing utility for NextShift

export interface ShareOptions {
    title?: string;
    text?: string;
    url?: string;
}

/**
 * Attempts to share using the Web Share API, falling back to clipboard.
 * @param options ShareOptions (title, text, url)
 * @param onSuccess Optional callback for success
 * @param onError Optional callback for error
 */
export async function share(
    options: ShareOptions,
    onSuccess?: () => void,
    onError?: (err: unknown) => void,
) {
    try {
        if (navigator.share) {
            await navigator.share(options);
            onSuccess?.();
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(
                options.url || options.text || window.location.href,
            );
            onSuccess?.();
        } else {
            // Fallback: prompt
            window.prompt(
                'Copy this link:',
                options.url || options.text || window.location.href,
            );
            onSuccess?.();
        }
    } catch (err) {
        onError?.(err);
    }
}

/**
 * Shares the app's main URL and title.
 */
export function shareApp(
    onSuccess?: () => void,
    onError?: (err: unknown) => void,
) {
    share(
        {
            title: 'NextShift',
            text: 'Check out NextShift for 24/7 rotating shift schedules!',
            url: window.location.origin,
        },
        onSuccess,
        onError,
    );
}

/**
 * Shares the app with additional context (e.g., team, date, view).
 * @param contextText Additional context to include in the share text
 */
export function shareAppWithContext(
    contextText: string,
    onSuccess?: () => void,
    onError?: (err: unknown) => void,
) {
    share(
        {
            title: 'NextShift',
            text: `NextShift: ${contextText}`,
            url: window.location.href,
        },
        onSuccess,
        onError,
    );
}
