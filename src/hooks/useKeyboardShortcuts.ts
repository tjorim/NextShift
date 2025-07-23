import { useEffect } from 'react';

interface KeyboardShortcuts {
    onToday?: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    onTeamSelect?: () => void;
}

/**
 * React hook that enables global keyboard shortcuts for navigation and selection actions.
 *
 * Registers a keydown event listener on the document to trigger the corresponding callback in `shortcuts` when specific keys or key combinations are pressed. Shortcut handling is disabled when the focus is on input, textarea, or select elements.
 *
 * @param shortcuts - Object with optional callbacks for "today", "previous", "next", and "team select" actions, invoked when their respective shortcuts are pressed
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle shortcuts when not in input fields
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement
            ) {
                return;
            }

            // Handle key combinations
            if (event.ctrlKey || event.metaKey) {
                switch (event.key.toLowerCase()) {
                    case 'h':
                        event.preventDefault();
                        shortcuts.onToday?.();
                        break;
                    case 'k':
                        event.preventDefault();
                        shortcuts.onPrevious?.();
                        break;
                    case 'j':
                        event.preventDefault();
                        shortcuts.onNext?.();
                        break;
                    case 't':
                        event.preventDefault();
                        shortcuts.onTeamSelect?.();
                        break;
                }
            }

            // Handle single keys
            switch (event.key) {
                case 'ArrowLeft':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault();
                        shortcuts.onPrevious?.();
                    }
                    break;
                case 'ArrowRight':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault();
                        shortcuts.onNext?.();
                    }
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [shortcuts]);
}
