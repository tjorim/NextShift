import reactPlugin from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Read version from package.json for injection in tests
import packageJson from './package.json';

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    plugins: [reactPlugin()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            reporter: ['text', 'lcov'],
        },
    },
});
