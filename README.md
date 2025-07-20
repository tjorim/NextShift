# NextShift - Team Shift Tracker

A lightweight, offline-capable Progressive Web App (PWA) for tracking 5-team continuous (24/7) shift schedules.

## Overview

NextShift helps teams working in a 5-team rotating shift system to quickly check:
- Which teams are working on any given day
- When their next shift is scheduled
- Transfer/handover points between teams
- Complete schedule overview with easy navigation

## Features

### 🕐 Current Status
- Real-time display of your team's current shift
- Next shift countdown and scheduling
- Date display in YYWW.D format (e.g., 2520.2M = year 2025, week 20, Tuesday Morning)

### 👥 Team Management
- Team selection on first visit (stored locally)
- Highlight your team across all views
- Easy team switching

### 📅 Schedule Views
- **Today**: All 5 teams' current shifts
- **Schedule**: 7-day calendar view with navigation
- **Transfers**: Find handover/takeover points between teams

### 📱 PWA Features
- **Offline Support**: Works without internet connection
- **Installable**: Add to home screen on mobile devices
- **Responsive**: Mobile-first design with Bootstrap 5
- **Fast**: Cached for instant loading

## Shift Pattern

Each team follows a 10-day repeating cycle:
- **Days 1-2**: Morning shift (07:00-15:00) - Code: M
- **Days 3-4**: Evening shift (15:00-23:00) - Code: E
- **Days 5-6**: Night shift (23:00-07:00) - Code: N
- **Days 7-10**: Off days

Teams are numbered 1-5, with each team starting their cycle 2 days after the previous team.

## Date Format

Dates are displayed in **YYWW.D** format where:
- **YY** = Last 2 digits of year (25 = 2025)
- **WW** = Week number (20 = week 20)  
- **D** = Weekday (1=Monday, 2=Tuesday...7=Sunday)

Examples:
- Tuesday, May 13, 2025 = `2520.2` (year 2025, week 20, Tuesday)
- Morning shift: `2520.2M`
- Evening shift: `2520.2E` 
- Night shift: `2520.1N` (uses previous day for night starting at 23:00)

## Getting Started

### Local Development

1. Clone the repository
2. Serve the files with any HTTP server:

```bash
# Python 3
python -m http.server 8000

# Node.js (if http-server installed)
npx http-server

# PHP
php -S localhost:8000
```

3. Open `http://localhost:8000` in your browser
4. Select your team when prompted
5. Start tracking your shifts!

### PWA Installation

- **Desktop**: Click the installation button in your browser's address bar
- **Mobile**: Use "Add to Home Screen" from your browser menu
- **Offline**: Once installed, the app works completely offline

## Configuration

For deployment, configure the reference variables in `app.js`:

```javascript
const CONFIG = {
    REFERENCE_DATE: new Date('2025-01-06'), // Anchor date for calculations
    REFERENCE_TEAM: 1, // Reference team number
    SHIFT_CYCLE_DAYS: 10,
    TEAMS_COUNT: 5
};
```

These variables anchor all shift calculations to your specific schedule.

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **UI Framework**: Bootstrap 5 (responsive, mobile-first)
- **Date Handling**: day.js with timezone support
- **PWA**: Service Worker + Cache API
- **Storage**: localStorage for preferences
- **Icons**: Embedded SVG for reliability

## Browser Support

Works on all modern browsers with:
- Service Worker support
- localStorage support
- ES6+ JavaScript features

## Licence

Apache License 2.0 - see LICENSE file for details.