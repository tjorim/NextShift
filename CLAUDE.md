# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NextShift is a Team Shift Tracker PWA for a volcontinu (24/7) 5-team shift schedule. This lightweight, offline-capable Progressive Web App allows users to quickly check which teams are working on any given day, see when their team's next shift is, and identify transfer/handover points between teams.

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
Uses weeknumber.weekday format:
- Today (Tuesday 13 May 2025) = 2520.2
- Night shifts use previous day (2520.1N for night starting Monday 23h)
- Full shift codes: 2520.2M, 2520.2E, 2520.1N

### Reference Variables (Configurable)
```javascript
const REFERENCE_DATE = new Date('2025-01-06'); // Currently set, configure during setup
const REFERENCE_TEAM = 1; // Currently set, configure during setup
```
These variables anchor all shift calculations and should be set during initial deployment.

## Key Features

- **Team Shift View**: Show all 5 teams and their shifts for any selected date
- **My Team Selection**: User selects their team on first visit (stored in localStorage)
- **Next Shift Lookup**: See when any team's next shift is scheduled
- **My Team Next Shift**: Quickly see when user's team works next
- **Transfer/Handover View**: See when user's team transfers with any other team (works before/after)
- **Date Navigation**: Today button, date picker, previous/next day
- **Date Format**: Display in weeknumber.weekday format (e.g., 2520.2M, 2520.1N)
- **Offline Support**: Full PWA functionality without internet connection

## Technology Stack

- **Frontend**: Vanilla JavaScript (implemented)
- **UI Framework**: Bootstrap 5 responsive and mobile-first design
- **Date Handling**: day.js for date calculations and week number formatting
- **PWA**: Service Worker + Cache API for offline functionality
- **Storage**: localStorage for user team preference and offline data
- **Icons**: Embedded SVG icons in manifest for PWA installation

## Development Commands

This is a static PWA with no build process required. Development involves:

1. **Local Development**: Serve files with any HTTP server
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (if http-server installed)
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```

2. **Testing PWA Features**: Use HTTPS or localhost for service worker testing

3. **Validation**: 
   - Test offline functionality
   - Verify PWA installability
   - Check responsive design on mobile devices

## PWA Configuration

- **manifest.json**: Defines app metadata for installation with embedded SVG icons
- **serviceWorker.js**: Handles caching strategy for offline use with CDN fallbacks
- **Icons**: Embedded base64-encoded SVG icons for 192px and 512px sizes
- **Shortcuts**: Quick access to "Today's Schedule" and "My Next Shift"

## Future Extensions

- Multi-day calendar overview
- Export schedule as .ics calendar
- Shift notifications
- Internationalization (EN/NL)