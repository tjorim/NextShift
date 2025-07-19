// NextShift - Main application entry point
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style.css';

// Import Day.js and plugins
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Import Bootstrap JavaScript
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Extend Day.js with plugins
dayjs.extend(weekOfYear);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(localizedFormat);

// Make dayjs globally available (same as before)
window.dayjs = dayjs;

// Import our main application logic
import '../app.js';

// PWA service worker registration (Vite PWA plugin will handle this automatically)
console.log('NextShift PWA loaded');
