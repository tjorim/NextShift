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
global.dayjs_plugin_weekOfYear = {};
global.dayjs_plugin_timezone = {};
global.dayjs_plugin_utc = {};
global.dayjs_plugin_isSameOrBefore = {};
global.dayjs_plugin_isSameOrAfter = {};
global.dayjs_plugin_localizedFormat = {};
