import { useEffect } from 'react';

interface KeyboardShortcuts {
    onToday?: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    onTeamSelect?: () => void;
}

/**
 * React hook that registers global keyboard shortcuts and invokes provided callbacks for specific actions.
 *
 * Installs a keydown event listener on the document to handle shortcut keys for navigation and selection actions. Ignores events originating from input, textarea, or select elements to prevent interfering with user input.
 *
 * @param shortcuts - Object containing optional callback functions for handling "today", "previous", "next", and "team select" shortcut actions
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
