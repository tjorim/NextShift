import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Initialize dayjs plugins
dayjs.extend(weekOfYear);

// Register service worker for PWA functionality (production only)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('./sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

const container = document.getElementById('root');
if (!container) {
    throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
    <StrictMode>
        <App />
    </StrictMode>,
);
