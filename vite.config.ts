import reactPlugin from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// Read version from package.json for injection
import packageJson from './package.json';

export default defineConfig({
    base: '/NextShift/',
    define: {
        __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    plugins: [
        reactPlugin(),
        VitePWA({
            registerType: 'autoUpdate',
            srcDir: 'public',
            filename: 'sw.js',
            strategies: 'injectManifest',
            injectManifest: {
                globPatterns: [
                    '**/*.{js,css,html,ico,png,svg,webmanifest,json}',
                ],
            },
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
                        src: '/assets/icons/icon-16.png',
                        sizes: '16x16',
                        type: 'image/png',
                    },
                    {
                        src: '/assets/icons/icon-32.png',
                        sizes: '32x32',
                        type: 'image/png',
                    },
                    {
                        src: '/assets/icons/icon-48.png',
                        sizes: '48x48',
                        type: 'image/png',
                    },
                    {
                        src: '/assets/icons/icon-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                    {
                        src: '/assets/icons/icon-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
                shortcuts: [
                    {
                        name: "Today's Schedule",
                        short_name: 'Today',
                        url: '/?tab=today',
                        icons: [
                            {
                                src: '/assets/icons/icon-192.png',
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
                                src: '/assets/icons/icon-192.png',
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
});
