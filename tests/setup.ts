import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Type augmentation for jest-dom matchers
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
    // biome-ignore lint/suspicious/noExplicitAny: Required for generic type parameter defaults
    interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
    // biome-ignore lint/suspicious/noExplicitAny: Required for generic type parameter defaults
    interface AsymmetricMatchersContaining<T = any>
        extends TestingLibraryMatchers<T, void> {}
}

// Mock window.matchMedia (for responsive design components)
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
    }),
});

// Set up DOM environment
beforeEach(() => {
    // Clear document body
    document.body.innerHTML = '';

    // Reset localStorage
    localStorage.clear();
});

// Note: dayjs plugins are handled by actual imports in components for better compatibility
