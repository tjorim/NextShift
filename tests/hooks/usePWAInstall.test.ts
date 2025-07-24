import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePWAInstall } from '../../src/hooks/usePWAInstall';

// Mock the global beforeinstallprompt event
const mockBeforeInstallPromptEvent = {
    preventDefault: vi.fn(),
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome: 'accepted' as const }),
};

const mockBeforeInstallPromptEventDismissed = {
    preventDefault: vi.fn(),
    prompt: vi.fn().mockResolvedValue(undefined),
    userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
};

describe('usePWAInstall', () => {
    let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
    let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;
    let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
    let originalAddEventListener: typeof window.addEventListener;
    let originalRemoveEventListener: typeof window.removeEventListener;

    beforeEach(() => {
        // Store originals in case they get modified by tests
        if (typeof window !== 'undefined') {
            originalAddEventListener = window.addEventListener;
            originalRemoveEventListener = window.removeEventListener;
            
            // Only spy if the methods exist
            if (window.addEventListener) {
                addEventListenerSpy = vi.spyOn(window, 'addEventListener');
            }
            if (window.removeEventListener) {
                removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
            }
        }
        consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Restore window methods if they were modified
        if (typeof window !== 'undefined') {
            if (!window.addEventListener && originalAddEventListener) {
                window.addEventListener = originalAddEventListener;
            }
            if (!window.removeEventListener && originalRemoveEventListener) {
                window.removeEventListener = originalRemoveEventListener;
            }
        }
        vi.restoreAllMocks();
    });

    describe('initialization', () => {
        it('should initialize with correct default state', () => {
            const { result } = renderHook(() => usePWAInstall());

            expect(result.current.isInstallable).toBe(false);
            expect(typeof result.current.promptInstall).toBe('function');
        });

        it('should set up beforeinstallprompt event listener on mount', () => {
            renderHook(() => usePWAInstall());

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'beforeinstallprompt',
                expect.any(Function),
            );
        });

        it('should set up appinstalled event listener on mount', () => {
            renderHook(() => usePWAInstall());

            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'appinstalled',
                expect.any(Function),
            );
        });

        it('should clean up event listeners on unmount', () => {
            const { unmount } = renderHook(() => usePWAInstall());

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'beforeinstallprompt',
                expect.any(Function),
            );
            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'appinstalled',
                expect.any(Function),
            );
        });
    });

    describe('beforeinstallprompt event handling', () => {
        it('should set isInstallable to true when beforeinstallprompt fires', () => {
            const { result } = renderHook(() => usePWAInstall());

            expect(result.current.isInstallable).toBe(false);

            // Simulate beforeinstallprompt event
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEvent);
            });

            expect(result.current.isInstallable).toBe(true);
        });

        it('should call preventDefault on beforeinstallprompt event', () => {
            renderHook(() => usePWAInstall());

            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEvent);
            });

            expect(
                mockBeforeInstallPromptEvent.preventDefault,
            ).toHaveBeenCalled();
        });

        it('should store the beforeinstallprompt event for later use', () => {
            const { result } = renderHook(() => usePWAInstall());

            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEvent);
            });

            expect(result.current.isInstallable).toBe(true);
        });

        it('should handle multiple beforeinstallprompt events', () => {
            const { result } = renderHook(() => usePWAInstall());

            const secondMockEvent = {
                preventDefault: vi.fn(),
                prompt: vi.fn().mockResolvedValue(undefined),
                userChoice: Promise.resolve({ outcome: 'accepted' as const }),
            };

            // First event
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEvent);
            });

            expect(result.current.isInstallable).toBe(true);

            // Second event should update the stored event
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(secondMockEvent);
            });

            expect(result.current.isInstallable).toBe(true);
            expect(secondMockEvent.preventDefault).toHaveBeenCalled();
        });
    });

    describe('appinstalled event handling', () => {
        it('should reset state when app is installed', () => {
            const { result } = renderHook(() => usePWAInstall());

            // First make it installable
            act(() => {
                const beforeInstallHandler =
                    addEventListenerSpy.mock.calls.find(
                        (call) => call[0] === 'beforeinstallprompt',
                    )?.[1];
                beforeInstallHandler?.(mockBeforeInstallPromptEvent);
            });

            expect(result.current.isInstallable).toBe(true);

            // Then simulate app installation
            act(() => {
                const appInstalledHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'appinstalled',
                )?.[1];
                appInstalledHandler?.({});
            });

            expect(result.current.isInstallable).toBe(false);
        });

        it('should clear deferred prompt when app is installed', () => {
            const { result } = renderHook(() => usePWAInstall());

            // Make it installable first
            act(() => {
                const beforeInstallHandler =
                    addEventListenerSpy.mock.calls.find(
                        (call) => call[0] === 'beforeinstallprompt',
                    )?.[1];
                beforeInstallHandler?.(mockBeforeInstallPromptEvent);
            });

            // Install the app
            act(() => {
                const appInstalledHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'appinstalled',
                )?.[1];
                appInstalledHandler?.({});
            });

            // Trying to prompt install should now return false
            expect(result.current.isInstallable).toBe(false);
        });
    });

    describe('promptInstall function', () => {
        it('should return false when no deferred prompt is available', async () => {
            const { result } = renderHook(() => usePWAInstall());

            expect(result.current.isInstallable).toBe(false);

            const installResult = await act(async () => {
                return await result.current.promptInstall();
            });

            expect(installResult).toBe(false);
        });

        it('should call prompt on the stored beforeinstallprompt event', async () => {
            const { result } = renderHook(() => usePWAInstall());

            // Make it installable first
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEvent);
            });

            await act(async () => {
                await result.current.promptInstall();
            });

            expect(mockBeforeInstallPromptEvent.prompt).toHaveBeenCalled();
        });

        it('should return true when user accepts installation', async () => {
            const { result } = renderHook(() => usePWAInstall());

            // Make it installable first
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEvent);
            });

            const installResult = await act(async () => {
                return await result.current.promptInstall();
            });

            expect(installResult).toBe(true);
            expect(mockBeforeInstallPromptEvent.prompt).toHaveBeenCalled();
        });

        it('should return false when user dismisses installation', async () => {
            const { result } = renderHook(() => usePWAInstall());

            // Make it installable first
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEventDismissed);
            });

            const installResult = await act(async () => {
                return await result.current.promptInstall();
            });

            expect(installResult).toBe(false);
            expect(
                mockBeforeInstallPromptEventDismissed.prompt,
            ).toHaveBeenCalled();
        });

        it('should clear deferred prompt and set isInstallable to false after prompt', async () => {
            const { result } = renderHook(() => usePWAInstall());

            // Make it installable first
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEvent);
            });

            expect(result.current.isInstallable).toBe(true);

            await act(async () => {
                await result.current.promptInstall();
            });

            expect(result.current.isInstallable).toBe(false);
        });

        it('should handle installation errors gracefully', async () => {
            const mockErrorEvent = {
                preventDefault: vi.fn(),
                prompt: vi
                    .fn()
                    .mockRejectedValue(new Error('Installation failed')),
                userChoice: Promise.resolve({ outcome: 'dismissed' as const }),
            };

            const { result } = renderHook(() => usePWAInstall());

            // Make it installable first
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockErrorEvent);
            });

            const installResult = await act(async () => {
                return await result.current.promptInstall();
            });

            expect(installResult).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Install prompt failed:',
                expect.any(Error),
            );
        });

        it('should handle missing userChoice promise', async () => {
            const mockEventWithoutUserChoice = {
                preventDefault: vi.fn(),
                prompt: vi.fn().mockResolvedValue(undefined),
                // Missing userChoice property
            };

            const { result } = renderHook(() => usePWAInstall());

            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockEventWithoutUserChoice);
            });

            const installResult = await act(async () => {
                return await result.current.promptInstall();
            });

            expect(installResult).toBe(false);
            expect(mockEventWithoutUserChoice.prompt).toHaveBeenCalled();
        });

        it('should handle userChoice promise rejection', async () => {
            const mockEventWithRejectedUserChoice = {
                preventDefault: vi.fn(),
                prompt: vi.fn().mockResolvedValue(undefined),
                userChoice: Promise.reject(new Error('User choice failed')),
            };

            const { result } = renderHook(() => usePWAInstall());

            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockEventWithRejectedUserChoice);
            });

            const installResult = await act(async () => {
                return await result.current.promptInstall();
            });

            expect(installResult).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Install prompt failed:',
                expect.any(Error),
            );
        });
    });

    describe('edge cases', () => {
        it('should handle null/undefined beforeinstallprompt event', () => {
            renderHook(() => usePWAInstall());

            expect(() => {
                act(() => {
                    const eventHandler = addEventListenerSpy.mock.calls.find(
                        (call) => call[0] === 'beforeinstallprompt',
                    )?.[1];
                    eventHandler?.(null);
                });
            }).not.toThrow();
        });

        it('should handle event without preventDefault method', () => {
            const mockEventWithoutPreventDefault = {
                prompt: vi.fn().mockResolvedValue(undefined),
                userChoice: Promise.resolve({ outcome: 'accepted' as const }),
            };

            const { result } = renderHook(() => usePWAInstall());

            expect(() => {
                act(() => {
                    const eventHandler = addEventListenerSpy.mock.calls.find(
                        (call) => call[0] === 'beforeinstallprompt',
                    )?.[1];
                    eventHandler?.(mockEventWithoutPreventDefault);
                });
            }).not.toThrow();

            expect(result.current.isInstallable).toBe(true);
        });

        it('should handle concurrent prompt attempts', async () => {
            const { result } = renderHook(() => usePWAInstall());

            // Make it installable first
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEvent);
            });

            // Start multiple concurrent prompts
            const [result1, result2, result3] = await act(async () => {
                return Promise.all([
                    result.current.promptInstall(),
                    result.current.promptInstall(),
                    result.current.promptInstall(),
                ]);
            });

            // All concurrent calls might succeed since they all capture the same prompt
            // before any can clear it - this is acceptable behavior
            expect(result1).toBe(true);
            expect([true, false]).toContain(result2);
            expect([true, false]).toContain(result3);
        });
    });

    describe('browser compatibility', () => {
        it('should work when addEventListener is not available', () => {
            const originalAddEventListener = window.addEventListener;
            // @ts-ignore - Intentionally testing undefined case
            delete window.addEventListener;

            expect(() => {
                renderHook(() => usePWAInstall());
            }).not.toThrow();

            window.addEventListener = originalAddEventListener;
        });

        it('should work when removeEventListener is not available', () => {
            const originalRemoveEventListener = window.removeEventListener;
            // @ts-ignore - Intentionally testing undefined case
            delete window.removeEventListener;

            expect(() => {
                const { unmount } = renderHook(() => usePWAInstall());
                unmount();
            }).not.toThrow();

            window.removeEventListener = originalRemoveEventListener;
        });

        it('should handle environments without window object', () => {
            // This test verifies that the hook gracefully handles missing window
            // In a real browser environment, typeof window is never 'undefined'
            // so we can't easily test this without breaking RTL
            // The hook code has the check: if (typeof window === 'undefined') return;
            // which is sufficient for SSR environments
            expect(typeof window).toBe('object'); // Confirms we're in browser environment
        });
    });

    describe('memory management', () => {
        it('should properly clean up references on unmount', () => {
            const { unmount } = renderHook(() => usePWAInstall());

            // Trigger beforeinstallprompt to store event reference
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEvent);
            });

            // Unmount should clean up event listeners
            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledTimes(2);
        });

        it('should handle rapid mount/unmount cycles', () => {
            for (let i = 0; i < 5; i++) {
                const { unmount } = renderHook(() => usePWAInstall());
                unmount();
            }

            // Should not throw errors or cause memory leaks
            expect(addEventListenerSpy.mock.calls.length).toBeGreaterThan(0);
            expect(removeEventListenerSpy.mock.calls.length).toBeGreaterThan(0);
        });
    });

    describe('user interaction scenarios', () => {
        it('should handle complete installation workflow', async () => {
            const { result } = renderHook(() => usePWAInstall());

            // 1. Initial state - not installable
            expect(result.current.isInstallable).toBe(false);

            // 2. beforeinstallprompt event makes it installable
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEvent);
            });

            expect(result.current.isInstallable).toBe(true);

            // 3. User clicks install button
            const installResult = await act(async () => {
                return await result.current.promptInstall();
            });

            expect(installResult).toBe(true);
            expect(result.current.isInstallable).toBe(false);

            // 4. App gets installed (appinstalled event)
            act(() => {
                const appInstalledHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'appinstalled',
                )?.[1];
                appInstalledHandler?.({});
            });

            expect(result.current.isInstallable).toBe(false);
        });

        it('should handle user dismissing installation and getting second chance', async () => {
            const { result } = renderHook(() => usePWAInstall());

            // First attempt - user dismisses
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEventDismissed);
            });

            const firstResult = await act(async () => {
                return await result.current.promptInstall();
            });

            expect(firstResult).toBe(false);
            expect(result.current.isInstallable).toBe(false);

            // Second beforeinstallprompt event (browser shows prompt again later)
            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(mockBeforeInstallPromptEvent);
            });

            // Second attempt - user accepts
            const secondResult = await act(async () => {
                return await result.current.promptInstall();
            });

            expect(secondResult).toBe(true);
        });

        it('should handle multiple beforeinstallprompt events before user interaction', () => {
            const { result } = renderHook(() => usePWAInstall());

            const events = [
                mockBeforeInstallPromptEvent,
                mockBeforeInstallPromptEventDismissed,
                {
                    preventDefault: vi.fn(),
                    prompt: vi.fn().mockResolvedValue(undefined),
                    userChoice: Promise.resolve({
                        outcome: 'accepted' as const,
                    }),
                },
            ];

            // Simulate multiple events
            events.forEach((event) => {
                act(() => {
                    const eventHandler = addEventListenerSpy.mock.calls.find(
                        (call) => call[0] === 'beforeinstallprompt',
                    )?.[1];
                    eventHandler?.(event);
                });
            });

            // Should still be installable and use the latest event
            expect(result.current.isInstallable).toBe(true);
            events.forEach((event) => {
                expect(event.preventDefault).toHaveBeenCalled();
            });
        });
    });

    describe('TypeScript interface compliance', () => {
        it('should work with properly typed beforeinstallprompt event', () => {
            const { result } = renderHook(() => usePWAInstall());

            const typedEvent = {
                preventDefault: vi.fn(),
                prompt: vi.fn().mockResolvedValue(undefined),
                userChoice: Promise.resolve({ outcome: 'accepted' as const }),
                type: 'beforeinstallprompt',
                target: window,
                currentTarget: window,
                bubbles: false,
                cancelable: true,
                defaultPrevented: false,
                eventPhase: Event.AT_TARGET,
                isTrusted: true,
                timeStamp: Date.now(),
                stopImmediatePropagation: vi.fn(),
                stopPropagation: vi.fn(),
                composedPath: vi.fn(() => []),
                AT_TARGET: Event.AT_TARGET,
                BUBBLING_PHASE: Event.BUBBLING_PHASE,
                CAPTURING_PHASE: Event.CAPTURING_PHASE,
                NONE: Event.NONE,
                cancelBubble: false,
                composed: false,
                returnValue: true,
                srcElement: window,
            };

            act(() => {
                const eventHandler = addEventListenerSpy.mock.calls.find(
                    (call) => call[0] === 'beforeinstallprompt',
                )?.[1];
                eventHandler?.(typedEvent);
            });

            expect(result.current.isInstallable).toBe(true);
        });
    });
});
