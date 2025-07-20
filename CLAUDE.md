# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextShift is a Team Shift Tracker PWA for a continuous (24/7) 5-team shift schedule. This lightweight, offline-capable Progressive Web App allows users to quickly check which teams are working on any given day, see when their team's next shift is, and identify transfer/handover points between teams.

## File Structure

```text
NextShift/
├── index.html           # Main HTML file with Bootstrap 5 UI
├── style.css           # Custom styles and shift color coding
├── app.js              # Core application logic and shift calculations
├── manifest.json       # PWA manifest with embedded SVG icons
├── serviceWorker.js    # Offline functionality and caching strategy
├── create-icons.html   # Icon generator utility
└── assets/
    └── icons/          # Directory for additional icon assets
```

## Core Logic & Architecture

### Shift Pattern
Each team works a repeating cycle:
- 2 mornings (7h-15h) - Code: M
- 2 evenings (15h-23h) - Code: E  
- 2 nights (23h-7h) - Code: N
- 4 days off
Total cycle: 10 days per team

### Team Numbers
Teams are numbered 1-5, with each team offset in the schedule cycle.

### Date Format
Uses weeknumber.weekday format (YYWW.D):
- Format: **YYWW.D** where YY=year, WW=week number, D=weekday (1=Monday, 7=Sunday)
- Today (Tuesday 13 May 2025) = **2520.2** (year 2025, week 20, Tuesday)
- Night shifts use previous day (2520.1N for night starting Monday 23h)
- Full shift codes: **2520.2M**, **2520.2E**, **2520.1N**

### Reference Variables (Configurable)
The app supports configurable reference values for shift calculations:

**Environment Variables (Build-time):**
```bash
# Set in .env file or build environment
VITE_REFERENCE_DATE=2025-01-06
VITE_REFERENCE_TEAM=1
```

**Runtime Configuration:**
```javascript
// Add to index.html before main script
window.NEXTSHIFT_CONFIG = {
    REFERENCE_DATE: '2025-01-06',
    REFERENCE_TEAM: 1
};
```

**Deployment Examples:**
```bash
# Development
echo "VITE_REFERENCE_DATE=2025-01-06" > .env
echo "VITE_REFERENCE_TEAM=1" >> .env

# Production build
VITE_REFERENCE_DATE=2025-01-13 VITE_REFERENCE_TEAM=3 npm run build

# Docker
ENV VITE_REFERENCE_DATE=2025-01-06
ENV VITE_REFERENCE_TEAM=1
```

These variables anchor all shift calculations. If not configured, defaults to `2025-01-06` and team `1`.

## Key Features

- **Team Shift View**: Show all 5 teams and their shifts for any selected date
- **My Team Selection**: User selects their team on first visit (stored in localStorage)
- **Next Shift Lookup**: See when any team's next shift is scheduled
- **My Team Next Shift**: Quickly see when user's team works next
- **Transfer/Handover View**: See when user's team transfers with any other team (works before/after)
- **Date Navigation**: Today button, date picker, previous/next day
- **Date Format**: Display in YYWW.D format (e.g., 2520.2M = year 2025, week 20, Tuesday Morning)
- **Offline Support**: Full PWA functionality without internet connection

## Technology Stack

- **Frontend**: Vanilla JavaScript with ES modules
- **Build Tool**: Vite with PWA plugin for modern development and optimization
- **UI Framework**: Bootstrap 5 responsive and mobile-first design
- **Date Handling**: Day.js for date calculations and week number formatting
- **PWA**: Auto-generated Service Worker with Workbox for offline functionality
- **Storage**: localStorage for user team preference and offline data
- **Icons**: Embedded SVG icons in auto-generated manifest
- **Code Quality**: Biome for fast linting and formatting (JS, CSS, JSON)
- **Testing**: Vitest with jsdom for unit testing

## Development Commands

This PWA uses Vite for modern development and build processes:

1. **Development Server**: Fast development with hot module replacement
   ```bash
   npm run dev          # Start Vite dev server at http://localhost:8000
   ```

2. **Production Build**: Optimized build with automatic PWA generation
   ```bash
   npm run build        # Build for production in dist/ directory
   npm run preview      # Preview production build locally
   ```

3. **Code Quality**: Modern linting with Biome
   ```bash
   npm run lint         # Lint JavaScript, CSS, and JSON with Biome
   npm run lint:fix     # Auto-fix all linting and formatting issues
   npm run format       # Format code with consistent style
   npm run test         # Run Vitest test suite
   ```

4. **PWA Testing**: 
   - Use development server for service worker testing
   - Test offline functionality with built version
   - Verify PWA installability in browser dev tools

## PWA Configuration

- **vite.config.js**: Vite PWA plugin configuration for automatic generation
- **manifest.webmanifest**: Auto-generated PWA manifest with proper metadata
- **Service Worker**: Auto-generated with Workbox for optimal caching strategies
- **Icons**: Local PNG icons (192px and 512px) for installation
- **Shortcuts**: Quick access to "Today's Schedule" and "My Next Shift"
- **Auto-updates**: Built-in service worker update mechanism

## Future Extensions

- Multi-day calendar overview
- Export schedule as .ics calendar
- Shift notifications
- Internationalization (EN/NL)