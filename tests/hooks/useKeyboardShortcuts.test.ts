import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useKeyboardShortcuts } from '../../src/hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
    const mockShortcuts = {
        onToday: vi.fn(),
        onPrevious: vi.fn(),
        onNext: vi.fn(),
        onTeamSelect: vi.fn(),
        onSettings: vi.fn(),
        onTabToday: vi.fn(),
        onTabSchedule: vi.fn(),
        onTabTransfer: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('registers keyboard event listeners', () => {
        const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
        const removeEventListenerSpy = vi.spyOn(
            document,
            'removeEventListener',
        );

        const { unmount } = renderHook(() =>
            useKeyboardShortcuts(mockShortcuts),
        );

        expect(addEventListenerSpy).toHaveBeenCalledWith(
            'keydown',
            expect.any(Function),
        );

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith(
            'keydown',
            expect.any(Function),
        );

        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
    });

    it('triggers onToday when Ctrl+H is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockShortcuts));

        const event = new KeyboardEvent('keydown', { key: 'h', ctrlKey: true });
        document.dispatchEvent(event);

        expect(mockShortcuts.onToday).toHaveBeenCalledTimes(1);
    });

    it('triggers onPrevious when left arrow is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockShortcuts));

        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        document.dispatchEvent(event);

        expect(mockShortcuts.onPrevious).toHaveBeenCalledTimes(1);
    });

    it('triggers onNext when right arrow is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockShortcuts));

        const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        document.dispatchEvent(event);

        expect(mockShortcuts.onNext).toHaveBeenCalledTimes(1);
    });

    it('triggers onTeamSelect when Ctrl+T is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockShortcuts));

        const event = new KeyboardEvent('keydown', { key: 't', ctrlKey: true });
        document.dispatchEvent(event);

        expect(mockShortcuts.onTeamSelect).toHaveBeenCalledTimes(1);
    });

    it('ignores shortcuts when focus is on input elements', () => {
        renderHook(() => useKeyboardShortcuts(mockShortcuts));

        // Create a mock input element
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        const event = new KeyboardEvent('keydown', { key: 'h', ctrlKey: true });
        Object.defineProperty(event, 'target', { value: input });
        document.dispatchEvent(event);

        expect(mockShortcuts.onToday).not.toHaveBeenCalled();

        document.body.removeChild(input);
    });

    it('handles missing callbacks gracefully', () => {
        const partialShortcuts = { onToday: mockShortcuts.onToday };

        renderHook(() => useKeyboardShortcuts(partialShortcuts));

        // Should not throw when other callbacks are missing
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        expect(() => document.dispatchEvent(event)).not.toThrow();
    });

    it('triggers onSettings when Ctrl+, is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockShortcuts));

        const event = new KeyboardEvent('keydown', { key: ',', ctrlKey: true });
        document.dispatchEvent(event);

        expect(mockShortcuts.onSettings).toHaveBeenCalledTimes(1);
    });

    it('triggers onTabToday when T is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockShortcuts));

        const event = new KeyboardEvent('keydown', { key: 't' });
        document.dispatchEvent(event);

        expect(mockShortcuts.onTabToday).toHaveBeenCalledTimes(1);
    });

    it('triggers onTabSchedule when S is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockShortcuts));

        const event = new KeyboardEvent('keydown', { key: 's' });
        document.dispatchEvent(event);

        expect(mockShortcuts.onTabSchedule).toHaveBeenCalledTimes(1);
    });

    it('triggers onTabTransfer when R is pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockShortcuts));

        const event = new KeyboardEvent('keydown', { key: 'r' });
        document.dispatchEvent(event);

        expect(mockShortcuts.onTabTransfer).toHaveBeenCalledTimes(1);
    });

    it('does not trigger tab shortcuts when modifier keys are pressed', () => {
        renderHook(() => useKeyboardShortcuts(mockShortcuts));

        // Test with Ctrl key
        const eventWithCtrl = new KeyboardEvent('keydown', { key: 't', ctrlKey: true });
        document.dispatchEvent(eventWithCtrl);

        // Should trigger onTeamSelect, not onTabToday
        expect(mockShortcuts.onTeamSelect).toHaveBeenCalledTimes(1);
        expect(mockShortcuts.onTabToday).not.toHaveBeenCalled();

        vi.clearAllMocks();

        // Test with Alt key
        const eventWithAlt = new KeyboardEvent('keydown', { key: 's', altKey: true });
        document.dispatchEvent(eventWithAlt);

        // Should not trigger onTabSchedule
        expect(mockShortcuts.onTabSchedule).not.toHaveBeenCalled();
    });
});
