import { beforeEach } from 'vitest';
import '@testing-library/jest-dom';

// Set up DOM environment
beforeEach(() => {
    // Clear document body
    document.body.innerHTML = '';

    // Reset localStorage
    localStorage.clear();
});

// Mock dayjs plugins
const mockPlugin = {};
(global as any).dayjs_plugin_weekOfYear = mockPlugin;
(global as any).dayjs_plugin_timezone = mockPlugin;
(global as any).dayjs_plugin_utc = mockPlugin;
(global as any).dayjs_plugin_isSameOrBefore = mockPlugin;
(global as any).dayjs_plugin_isSameOrAfter = mockPlugin;
(global as any).dayjs_plugin_localizedFormat = mockPlugin;
