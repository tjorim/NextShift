import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Set up DOM environment
beforeEach(() => {
    // Clear document body
    document.body.innerHTML = '';

    // Reset localStorage
    localStorage.clear();
});

// Mock dayjs plugins are handled by actual imports in components
