import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                cleanupOutdatedCaches: true,
                skipWaiting: true,
            },
            includeAssets: ['assets/icons/*.png'],
            manifest: {
                name: 'NextShift - Team Shift Tracker',
                short_name: 'NextShift',
                description:
                    'Team Shift Tracker PWA for 5-team continuous (24/7) schedule',
                theme_color: '#0d6efd',
                background_color: '#ffffff',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'assets/icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'assets/icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
                shortcuts: [
                    {
                        name: "Today's Schedule",
                        short_name: 'Today',
                        url: '/?tab=today',
                        icons: [
                            {
                                src: 'assets/icons/icon-192.png',
                                sizes: '192x192',
                            },
                        ],
                    },
                    {
                        name: 'My Next Shift',
                        short_name: 'Next Shift',
                        url: '/?tab=schedule',
                        icons: [
                            {
                                src: 'assets/icons/icon-192.png',
                                sizes: '192x192',
                            },
                        ],
                    },
                ],
            },
        }),
    ],
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        rollupOptions: {
            input: {
                main: 'index.html',
            },
        },
    },
    server: {
        port: 8000,
        open: true,
        cors: true,
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.js'],
    },
});
