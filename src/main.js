// NextShift - Main application entry point
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

// Import Day.js and plugins
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';

// Import Bootstrap JavaScript
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Extend Day.js with plugins
dayjs.extend(weekOfYear);
dayjs.extend(timezone);
dayjs.extend(utc);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(localizedFormat);

// Make dayjs and plugins globally available (same as before)
window.dayjs = dayjs;
window.dayjs_plugin_weekOfYear = weekOfYear;
window.dayjs_plugin_timezone = timezone;
window.dayjs_plugin_utc = utc;
window.dayjs_plugin_isSameOrBefore = isSameOrBefore;
window.dayjs_plugin_isSameOrAfter = isSameOrAfter;
window.dayjs_plugin_localizedFormat = localizedFormat;

// PWA service worker registration (Vite PWA plugin will handle this automatically)
console.log('NextShift PWA loaded');

// Import our main application logic after globals are set
import './app.js';
