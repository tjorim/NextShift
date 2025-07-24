import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardShortcuts } from '../../src/hooks/useKeyboardShortcuts';

// Mock DOM elements
const createMockElement = (tagName: string) => ({
    tagName: tagName.toUpperCase(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
});

// Mock the global document
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

beforeEach(() => {
    mockAddEventListener.mockClear();
    mockRemoveEventListener.mockClear();

    Object.defineProperty(document, 'addEventListener', {
        value: mockAddEventListener,
        writable: true,
    });

    Object.defineProperty(document, 'removeEventListener', {
        value: mockRemoveEventListener,
        writable: true,
    });
});

describe('useKeyboardShortcuts', () => {
    describe('Hook Registration', () => {
        it('should register keyboard event listener on mount', () => {
            const shortcuts = {
                onToday: vi.fn(),
                onPrevious: vi.fn(),
                onNext: vi.fn(),
                onTeamSelect: vi.fn(),
            };

            renderHook(() => useKeyboardShortcuts(shortcuts));

            expect(mockAddEventListener).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function),
            );
            expect(mockAddEventListener).toHaveBeenCalledTimes(2); // React StrictMode causes double rendering
        });

        it('should remove keyboard event listener on unmount', () => {
            const shortcuts = {
                onToday: vi.fn(),
            };

            const { unmount } = renderHook(() =>
                useKeyboardShortcuts(shortcuts),
            );

            expect(mockAddEventListener).toHaveBeenCalledTimes(1);

            unmount();

            expect(mockRemoveEventListener).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function),
            );
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
        });

        it('should work with empty shortcuts object', () => {
            expect(() => {
                renderHook(() => useKeyboardShortcuts({}));
            }).not.toThrow();

            expect(mockAddEventListener).toHaveBeenCalledTimes(1);
        });
    });

    describe('Ctrl/Meta Key Combinations', () => {
        it('should execute onToday callback for Ctrl+H', () => {
            const onToday = vi.fn();
            const shortcuts = { onToday };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockEvent = {
                key: 'h',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: document.body,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onToday).toHaveBeenCalledTimes(1);
            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
        });

        it('should execute onToday callback for Meta+H (Mac)', () => {
            const onToday = vi.fn();
            const shortcuts = { onToday };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockEvent = {
                key: 'h',
                ctrlKey: false,
                metaKey: true,
                altKey: false,
                shiftKey: false,
                target: document.body,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onToday).toHaveBeenCalledTimes(1);
            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
        });

        it('should execute onPrevious callback for Ctrl+K', () => {
            const onPrevious = vi.fn();
            const shortcuts = { onPrevious };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockEvent = {
                key: 'k',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: document.body,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onPrevious).toHaveBeenCalledTimes(1);
            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
        });

        it('should execute onNext callback for Ctrl+J', () => {
            const onNext = vi.fn();
            const shortcuts = { onNext };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockEvent = {
                key: 'j',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: document.body,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onNext).toHaveBeenCalledTimes(1);
            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
        });

        it('should execute onTeamSelect callback for Ctrl+T', () => {
            const onTeamSelect = vi.fn();
            const shortcuts = { onTeamSelect };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockEvent = {
                key: 't',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: document.body,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onTeamSelect).toHaveBeenCalledTimes(1);
            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
        });

        it('should handle uppercase keys correctly', () => {
            const onToday = vi.fn();
            const shortcuts = { onToday };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockEvent = {
                key: 'H',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: document.body,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onToday).toHaveBeenCalledTimes(1);
            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
        });

        it('should handle multiple shortcuts in single test', () => {
            const onToday = vi.fn();
            const onPrevious = vi.fn();
            const onNext = vi.fn();
            const onTeamSelect = vi.fn();

            const shortcuts = { onToday, onPrevious, onNext, onTeamSelect };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            // Test Ctrl+H
            act(() => {
                eventHandler({
                    key: 'h',
                    ctrlKey: true,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            // Test Ctrl+K
            act(() => {
                eventHandler({
                    key: 'k',
                    ctrlKey: true,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            expect(onToday).toHaveBeenCalledTimes(1);
            expect(onPrevious).toHaveBeenCalledTimes(1);
            expect(onNext).not.toHaveBeenCalled();
            expect(onTeamSelect).not.toHaveBeenCalled();
        });
    });

    describe('Arrow Key Navigation', () => {
        it('should execute onPrevious callback for ArrowLeft', () => {
            const onPrevious = vi.fn();
            const shortcuts = { onPrevious };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockEvent = {
                key: 'ArrowLeft',
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: document.body,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onPrevious).toHaveBeenCalledTimes(1);
            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
        });

        it('should execute onNext callback for ArrowRight', () => {
            const onNext = vi.fn();
            const shortcuts = { onNext };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockEvent = {
                key: 'ArrowRight',
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: document.body,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onNext).toHaveBeenCalledTimes(1);
            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
        });

        it('should NOT execute arrow callbacks when modifier keys are pressed', () => {
            const onPrevious = vi.fn();
            const onNext = vi.fn();
            const shortcuts = { onPrevious, onNext };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            // Test ArrowLeft with Ctrl
            act(() => {
                eventHandler({
                    key: 'ArrowLeft',
                    ctrlKey: true,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            // Test ArrowRight with Meta
            act(() => {
                eventHandler({
                    key: 'ArrowRight',
                    ctrlKey: false,
                    metaKey: true,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            // Test ArrowLeft with Alt
            act(() => {
                eventHandler({
                    key: 'ArrowLeft',
                    ctrlKey: false,
                    metaKey: false,
                    altKey: true,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            expect(onPrevious).not.toHaveBeenCalled();
            expect(onNext).not.toHaveBeenCalled();
        });
    });

    describe('Input Field Blocking', () => {
        it('should NOT execute shortcuts when focused on input element', () => {
            const onToday = vi.fn();
            const shortcuts = { onToday };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockInputElement = createMockElement('input');
            const mockEvent = {
                key: 'h',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: mockInputElement,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onToday).not.toHaveBeenCalled();
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        it('should NOT execute shortcuts when focused on textarea element', () => {
            const onNext = vi.fn();
            const shortcuts = { onNext };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockTextareaElement = createMockElement('textarea');
            const mockEvent = {
                key: 'j',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: mockTextareaElement,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onNext).not.toHaveBeenCalled();
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        it('should NOT execute shortcuts when focused on select element', () => {
            const onPrevious = vi.fn();
            const shortcuts = { onPrevious };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockSelectElement = createMockElement('select');
            const mockEvent = {
                key: 'ArrowLeft',
                ctrlKey: false,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: mockSelectElement,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onPrevious).not.toHaveBeenCalled();
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });

        it('should execute shortcuts when focused on other elements', () => {
            const onToday = vi.fn();
            const shortcuts = { onToday };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockDivElement = createMockElement('div');
            const mockEvent = {
                key: 'h',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: mockDivElement,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onToday).toHaveBeenCalledTimes(1);
            expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle undefined callbacks gracefully', () => {
            const shortcuts = {
                onToday: undefined,
                onPrevious: vi.fn(),
            };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            expect(() => {
                act(() => {
                    eventHandler({
                        key: 'h',
                        ctrlKey: true,
                        metaKey: false,
                        altKey: false,
                        shiftKey: false,
                        target: document.body,
                        preventDefault: vi.fn(),
                    });
                });
            }).not.toThrow();

            // onPrevious should still work
            act(() => {
                eventHandler({
                    key: 'k',
                    ctrlKey: true,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            expect(shortcuts.onPrevious).toHaveBeenCalledTimes(1);
        });

        it('should handle callbacks that throw errors gracefully', () => {
            const errorCallback = vi.fn(() => {
                throw new Error('Test error');
            });

            const normalCallback = vi.fn();
            const shortcuts = {
                onToday: errorCallback,
                onPrevious: normalCallback,
            };

            const consoleSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            expect(() => {
                act(() => {
                    eventHandler({
                        key: 'h',
                        ctrlKey: true,
                        metaKey: false,
                        altKey: false,
                        shiftKey: false,
                        target: document.body,
                        preventDefault: vi.fn(),
                    });
                });
            }).not.toThrow();

            expect(errorCallback).toHaveBeenCalledTimes(1);

            // Other shortcuts should still work
            act(() => {
                eventHandler({
                    key: 'k',
                    ctrlKey: true,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            expect(normalCallback).toHaveBeenCalledTimes(1);

            consoleSpy.mockRestore();
        });

        it('should handle events without preventDefault method', () => {
            const onToday = vi.fn();
            const shortcuts = { onToday };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockEvent = {
                key: 'h',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: document.body,
                // Missing preventDefault method
            };

            expect(() => {
                act(() => {
                    eventHandler(mockEvent);
                });
            }).not.toThrow();

            expect(onToday).toHaveBeenCalledTimes(1);
        });

        it('should handle events with null/undefined key', () => {
            const onToday = vi.fn();
            const shortcuts = { onToday };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            // Test with null key
            act(() => {
                eventHandler({
                    key: null,
                    ctrlKey: true,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            // Test with undefined key
            act(() => {
                eventHandler({
                    key: undefined,
                    ctrlKey: true,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            expect(onToday).not.toHaveBeenCalled();
        });

        it('should ignore unknown key combinations', () => {
            const onToday = vi.fn();
            const shortcuts = { onToday };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockEvent = {
                key: 'z',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: document.body,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            expect(onToday).not.toHaveBeenCalled();
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });
    });

    describe('Re-render and Dependencies', () => {
        it('should update event listeners when shortcuts change', () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            let shortcuts = { onToday: callback1 };

            const { rerender } = renderHook(
                ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
                { initialProps: { shortcuts } },
            );

            expect(mockAddEventListener).toHaveBeenCalledTimes(1);

            // Update shortcuts
            shortcuts = { onToday: callback2 };
            rerender({ shortcuts });

            // Should remove old listener and add new one
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
            expect(mockAddEventListener).toHaveBeenCalledTimes(2);

            // Test that new callback is used
            const eventHandler = mockAddEventListener.mock.calls[1][1];
            act(() => {
                eventHandler({
                    key: 'h',
                    ctrlKey: true,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            expect(callback1).not.toHaveBeenCalled();
            expect(callback2).toHaveBeenCalledTimes(1);
        });

        it('should handle rapid shortcut changes without memory leaks', () => {
            const callback = vi.fn();
            let shortcuts = { onToday: callback };

            const { rerender } = renderHook(
                ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
                { initialProps: { shortcuts } },
            );

            // Simulate rapid changes
            for (let i = 1; i <= 10; i++) {
                shortcuts = { onToday: callback };
                rerender({ shortcuts });
            }

            // Should have equal number of add and remove calls (minus the initial)
            expect(mockAddEventListener).toHaveBeenCalledTimes(11);
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(10);
        });

        it('should work correctly when callbacks reference changing variables', () => {
            let counter = 0;

            const createCallback = () =>
                vi.fn(() => {
                    counter++;
                });

            let shortcuts = { onToday: createCallback() };

            const { rerender } = renderHook(
                ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
                { initialProps: { shortcuts } },
            );

            const eventHandler1 = mockAddEventListener.mock.calls[0][1];

            // Call first callback
            act(() => {
                eventHandler1({
                    key: 'h',
                    ctrlKey: true,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            expect(counter).toBe(1);

            // Update shortcuts with new callback
            shortcuts = { onToday: createCallback() };
            rerender({ shortcuts });

            const eventHandler2 = mockAddEventListener.mock.calls[1][1];

            // Call second callback
            act(() => {
                eventHandler2({
                    key: 'h',
                    ctrlKey: true,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            expect(counter).toBe(2);
        });
    });

    describe('Performance Tests', () => {
        it('should handle rapid key presses efficiently', () => {
            const callback = vi.fn();
            const shortcuts = { onToday: callback };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const startTime = performance.now();

            // Simulate rapid key presses
            for (let i = 0; i < 100; i++) {
                act(() => {
                    eventHandler({
                        key: 'h',
                        ctrlKey: true,
                        metaKey: false,
                        altKey: false,
                        shiftKey: false,
                        target: document.body,
                        preventDefault: vi.fn(),
                    });
                });
            }

            const endTime = performance.now();

            expect(endTime - startTime).toBeLessThan(100);
            expect(callback).toHaveBeenCalledTimes(100);
        });

        it('should not cause memory leaks with frequent re-renders', () => {
            const callback = vi.fn();
            let shortcuts = { onToday: callback };

            const { rerender, unmount } = renderHook(
                ({ shortcuts }) => useKeyboardShortcuts(shortcuts),
                { initialProps: { shortcuts } },
            );

            // Simulate many re-renders
            for (let i = 0; i < 50; i++) {
                shortcuts = { onToday: callback };
                rerender({ shortcuts });
            }

            unmount();

            // Should have cleaned up properly (50 re-renders + 1 final unmount)
            expect(mockRemoveEventListener).toHaveBeenCalledTimes(51);
        });
    });

    describe('Accessibility and Usability', () => {
        it('should work with async callbacks', async () => {
            const asyncCallback = vi.fn().mockResolvedValue(undefined);
            const shortcuts = { onToday: asyncCallback };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            act(() => {
                eventHandler({
                    key: 'h',
                    ctrlKey: true,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                });
            });

            expect(asyncCallback).toHaveBeenCalledTimes(1);
        });

        it('should prevent default for all registered shortcuts', () => {
            const shortcuts = {
                onToday: vi.fn(),
                onPrevious: vi.fn(),
                onNext: vi.fn(),
                onTeamSelect: vi.fn(),
            };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const testCases = [
                { key: 'h', ctrlKey: true },
                { key: 'k', ctrlKey: true },
                { key: 'j', ctrlKey: true },
                { key: 't', ctrlKey: true },
                { key: 'ArrowLeft', ctrlKey: false },
                { key: 'ArrowRight', ctrlKey: false },
            ];

            testCases.forEach((testCase) => {
                const mockEvent = {
                    ...testCase,
                    metaKey: false,
                    altKey: false,
                    shiftKey: false,
                    target: document.body,
                    preventDefault: vi.fn(),
                };

                act(() => {
                    eventHandler(mockEvent);
                });

                expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
            });
        });

        it('should not trigger shortcuts when focused on contentEditable elements', () => {
            const onToday = vi.fn();
            const shortcuts = { onToday };

            renderHook(() => useKeyboardShortcuts(shortcuts));
            const eventHandler = mockAddEventListener.mock.calls[0][1];

            const mockContentEditableElement = {
                ...createMockElement('div'),
                contentEditable: 'true',
            };

            const mockEvent = {
                key: 'h',
                ctrlKey: true,
                metaKey: false,
                altKey: false,
                shiftKey: false,
                target: mockContentEditableElement,
                preventDefault: vi.fn(),
            };

            act(() => {
                eventHandler(mockEvent);
            });

            // Should not trigger shortcuts in contentEditable elements
            expect(onToday).not.toHaveBeenCalled();
            expect(mockEvent.preventDefault).not.toHaveBeenCalled();
        });
    });
});
