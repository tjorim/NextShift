import { useEffect } from 'react';

interface KeyboardShortcuts {
    onToday?: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    onTeamSelect?: () => void;
    onSettings?: () => void;
    onTabToday?: () => void;
    onTabSchedule?: () => void;
    onTabTransfer?: () => void;
}

/**
 * React hook that enables global keyboard shortcuts for navigation and selection actions.
 *
 * Registers a keydown event listener on the document to trigger the corresponding callback in `shortcuts` when specific keys or key combinations are pressed. Shortcut handling is disabled when the focus is on input, textarea, select, or contentEditable elements.
 *
 * Supported shortcuts:
 * - Ctrl/Cmd+H: Jump to today (onToday)
 * - Ctrl/Cmd+K: Previous day/week (onPrevious)
 * - Ctrl/Cmd+J: Next day/week (onNext)
 * - Ctrl/Cmd+T: Team selection (onTeamSelect)
 * - Ctrl/Cmd+,: Settings panel toggle (onSettings)
 * - T: Switch to Today tab (onTabToday)
 * - S: Switch to Schedule tab (onTabSchedule)
 * - R: Switch to Transfers tab (onTabTransfer)
 * - ArrowLeft: Previous (context-aware) (onPrevious)
 * - ArrowRight: Next (context-aware) (onNext)
 *
 * @param shortcuts - Object with optional callbacks for various keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only handle shortcuts when not in input fields or contentEditable elements
            const target = event.target as HTMLElement;
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement ||
                (target instanceof HTMLElement &&
                    target.contentEditable === 'true') ||
                // Support mock elements in tests
                target?.tagName === 'INPUT' ||
                target?.tagName === 'TEXTAREA' ||
                target?.tagName === 'SELECT' ||
                target?.contentEditable === 'true'
            ) {
                return;
            }

            // Guard against null/undefined key
            if (!event.key) {
                return;
            }

            // Handle key combinations
            if (event.ctrlKey || event.metaKey) {
                switch (event.key.toLowerCase()) {
                    case 'h':
                        event.preventDefault?.();
                        try {
                            shortcuts.onToday?.();
                        } catch (error) {
                            console.error('Error in onToday callback:', error);
                        }
                        break;
                    case 'k':
                        event.preventDefault?.();
                        try {
                            shortcuts.onPrevious?.();
                        } catch (error) {
                            console.error(
                                'Error in onPrevious callback:',
                                error,
                            );
                        }
                        break;
                    case 'j':
                        event.preventDefault?.();
                        try {
                            shortcuts.onNext?.();
                        } catch (error) {
                            console.error('Error in onNext callback:', error);
                        }
                        break;
                    case 't':
                        event.preventDefault?.();
                        try {
                            shortcuts.onTeamSelect?.();
                        } catch (error) {
                            console.error(
                                'Error in onTeamSelect callback:',
                                error,
                            );
                        }
                        break;
                    case ',':
                        event.preventDefault?.();
                        try {
                            shortcuts.onSettings?.();
                        } catch (error) {
                            console.error(
                                'Error in onSettings callback:',
                                error,
                            );
                        }
                        break;
                }
            }

            // Handle single keys
            switch (event.key) {
                case 'ArrowLeft':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault?.();
                        try {
                            shortcuts.onPrevious?.();
                        } catch (error) {
                            console.error(
                                'Error in onPrevious callback:',
                                error,
                            );
                        }
                    }
                    break;
                case 'ArrowRight':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault?.();
                        try {
                            shortcuts.onNext?.();
                        } catch (error) {
                            console.error('Error in onNext callback:', error);
                        }
                    }
                    break;
                case 't':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault?.();
                        try {
                            shortcuts.onTabToday?.();
                        } catch (error) {
                            console.error(
                                'Error in onTabToday callback:',
                                error,
                            );
                        }
                    }
                    break;
                case 's':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault?.();
                        try {
                            shortcuts.onTabSchedule?.();
                        } catch (error) {
                            console.error(
                                'Error in onTabSchedule callback:',
                                error,
                            );
                        }
                    }
                    break;
                case 'r':
                    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
                        event.preventDefault?.();
                        try {
                            shortcuts.onTabTransfer?.();
                        } catch (error) {
                            console.error(
                                'Error in onTabTransfer callback:',
                                error,
                            );
                        }
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
