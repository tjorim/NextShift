import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useLocalStorage } from '../../src/hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('should return initial value when no stored value exists', () => {
        const { result } = renderHook(() =>
            useLocalStorage('test-key', 'initial'),
        );

        expect(result.current[0]).toBe('initial');
    });

    it('should return stored value when it exists', () => {
        localStorage.setItem('test-key', JSON.stringify('stored-value'));

        const { result } = renderHook(() =>
            useLocalStorage('test-key', 'initial'),
        );

        expect(result.current[0]).toBe('stored-value');
    });

    it('should update localStorage when value changes', () => {
        const { result } = renderHook(() =>
            useLocalStorage('test-key', 'initial'),
        );

        act(() => {
            result.current[1]('new-value');
        });

        expect(result.current[0]).toBe('new-value');
        expect(localStorage.getItem('test-key')).toBe('"new-value"');
    });

    it('should handle complex objects', () => {
        const initialValue = { name: 'test', count: 0 };
        const { result } = renderHook(() =>
            useLocalStorage('test-object', initialValue),
        );

        const newValue = { name: 'updated', count: 5 };

        act(() => {
            result.current[1](newValue);
        });

        expect(result.current[0]).toEqual(newValue);
        expect(JSON.parse(localStorage.getItem('test-object') || '{}')).toEqual(
            newValue,
        );
    });

    it('should handle malformed JSON gracefully', () => {
        localStorage.setItem('test-key', 'invalid-json');

        const { result } = renderHook(() =>
            useLocalStorage('test-key', 'fallback'),
        );

        expect(result.current[0]).toBe('fallback');
    });
});
