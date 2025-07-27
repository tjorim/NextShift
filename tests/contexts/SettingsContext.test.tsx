import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import {
    SettingsProvider,
    useSettings,
} from '../../src/contexts/SettingsContext';

describe('SettingsContext unified user state', () => {
    function wrapper({ children }: { children: ReactNode }) {
        return <SettingsProvider>{children}</SettingsProvider>;
    }

    afterEach(() => {
        window.localStorage.clear();
        document.body.removeAttribute('data-bs-theme');
    });

    it('provides default values and mutators', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.timeFormat).toBe('24h');
        expect(result.current.settings.theme).toBe('auto');
        expect(result.current.settings.notifications).toBe('off');
        expect(result.current.selectedTeam).toBe(null);
        expect(result.current.hasCompletedOnboarding).toBe(false);
    });

    it('updates settings and user state', async () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        await act(async () => {
            result.current.updateTimeFormat('12h');
        });
        expect(result.current.settings.timeFormat).toBe('12h');
        await act(async () => {
            result.current.updateTheme('dark');
        });
        expect(result.current.settings.theme).toBe('dark');
        await act(async () => {
            result.current.updateNotifications('on');
        });
        expect(result.current.settings.notifications).toBe('on');
        await act(async () => {
            result.current.setSelectedTeam(3);
        });
        expect(result.current.selectedTeam).toBe(3);
        await act(async () => {
            result.current.setHasCompletedOnboarding(true);
        });
        expect(result.current.hasCompletedOnboarding).toBe(true);
    });

    it('resets all user state', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => {
            result.current.setSelectedTeam(2);
            result.current.setHasCompletedOnboarding(true);
            result.current.resetSettings();
        });
        expect(result.current.selectedTeam).toBe(null);
        expect(result.current.hasCompletedOnboarding).toBe(false);
        expect(result.current.settings.timeFormat).toBe('24h');
    });

    it('validates and falls back to default state if corrupted', () => {
        // Simulate corrupted state in localStorage
        window.localStorage.setItem(
            'nextshift_user_state',
            JSON.stringify({ foo: 'bar' }),
        );
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.selectedTeam).toBe(null);
        expect(result.current.hasCompletedOnboarding).toBe(false);
        expect(result.current.settings.timeFormat).toBe('24h');
    });

    it('migrates from old keys to unified state (documented gap)', () => {
        window.localStorage.setItem('hasCompletedOnboarding', 'true');
        window.localStorage.setItem(
            'nextshift_user_preferences',
            JSON.stringify({ selectedTeam: 2 }),
        );
        window.localStorage.setItem(
            'userSettings',
            JSON.stringify({
                timeFormat: '12h',
                theme: 'dark',
                notifications: 'on',
            }),
        );
        // Simulate first load with legacy keys
        const { result } = renderHook(() => useSettings(), { wrapper });
        // Should fallback to default, as migration is not implemented, but this test documents the gap
        expect(result.current.hasCompletedOnboarding).toBe(false);
        expect(result.current.selectedTeam).toBe(null);
        expect(result.current.settings.timeFormat).toBe('24h');
    });

    it('resetSettings clears unified key and does not leave old keys', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        act(() => {
            result.current.setSelectedTeam(1);
            result.current.setHasCompletedOnboarding(true);
            result.current.updateTimeFormat('12h');
        });
        act(() => {
            result.current.resetSettings();
        });
        const stored = window.localStorage.getItem('nextshift_user_state');
        expect(stored).not.toBeNull();
        expect(JSON.parse(stored || '{}')).toEqual({
            hasCompletedOnboarding: false,
            selectedTeam: null,
            settings: {
                timeFormat: '24h',
                theme: 'auto',
                notifications: 'off',
            },
        });
        expect(
            window.localStorage.getItem('hasCompletedOnboarding'),
        ).toBeNull();
        expect(
            window.localStorage.getItem('nextshift_user_preferences'),
        ).toBeNull();
        expect(window.localStorage.getItem('userSettings')).toBeNull();
    });

    it('applies theme to document.body', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        // Theme should not be set by default
        expect(document.body.getAttribute('data-bs-theme')).toBeNull();
        act(() => {
            result.current.updateTheme('dark');
        });
        expect(document.body.getAttribute('data-bs-theme')).toBe('dark');
        act(() => {
            result.current.updateTheme('light');
        });
        expect(document.body.getAttribute('data-bs-theme')).toBe('light');
    });
});
