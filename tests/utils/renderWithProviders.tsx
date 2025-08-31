import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { CookieConsentProvider } from '../../src/contexts/CookieConsentContext';
import { SettingsProvider } from '../../src/contexts/SettingsContext';
import { ToastProvider } from '../../src/contexts/ToastContext';

/**
 * Wrapper component that provides all necessary contexts for testing.
 * Use this with rerender() calls.
 */
export function AllTheProviders({ children }: { children: ReactNode }) {
    return (
        <CookieConsentProvider>
            <ToastProvider>
                <SettingsProvider>{children}</SettingsProvider>
            </ToastProvider>
        </CookieConsentProvider>
    );
}

/**
 * Test utility that renders components with all necessary providers.
 * Provides consistent test setup across all component tests.
 *
 * @param ui - The React element to render
 * @param options - Optional render options (container, baseElement, etc.)
 * @returns The result from @testing-library/react render function
 */
export function renderWithProviders(
    ui: ReactElement,
    options?: Parameters<typeof render>[1],
) {
    return render(ui, { wrapper: AllTheProviders, ...options });
}
