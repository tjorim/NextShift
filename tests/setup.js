import { beforeEach } from 'vitest';

// Set up DOM environment
beforeEach(() => {
    // Clear document body
    document.body.innerHTML = '';

    // Reset localStorage
    localStorage.clear();

    // Mock bootstrap Modal
    global.bootstrap = {
        Modal: class MockModal {
            show() {}
            hide() {}
        },
    };
});

// Mock dayjs plugins
const mockPlugin = {};
global.dayjs_plugin_weekOfYear = mockPlugin;
global.dayjs_plugin_timezone = mockPlugin;
global.dayjs_plugin_utc = mockPlugin;
global.dayjs_plugin_isSameOrBefore = mockPlugin;
global.dayjs_plugin_isSameOrAfter = mockPlugin;
global.dayjs_plugin_localizedFormat = mockPlugin;
