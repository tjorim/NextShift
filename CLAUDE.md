# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**NextShift** - Created by **[Jorim Tielemans](https://github.com/tjorim)**

NextShift is a Team Shift Tracker PWA for a continuous (24/7) 5-team shift schedule. This lightweight, offline-capable Progressive Web App allows users to quickly check which teams are working on any given day, see when their team's next shift is, and identify transfer/handover points between teams.

**Repository**: [https://github.com/tjorim/NextShift](https://github.com/tjorim/NextShift)  
**Issues & Feature Requests**: [GitHub Issues](https://github.com/tjorim/NextShift/issues)

## File Structure

```text
NextShift/
├── index.html              # Main HTML entry point
├── src/
│   ├── App.tsx            # Main React application component
│   ├── main.tsx           # React app entry point and initialization
│   ├── vite-env.d.ts      # TypeScript environment declarations
│   ├── components/        # React components
│   │   ├── ChangelogModal.tsx   # Interactive changelog viewer with accordion layout
│   │   ├── CurrentStatus.tsx    # Current team shift and status display with timeline
│   │   ├── ErrorBoundary.tsx    # Error boundary wrapper for graceful error handling
│   │   ├── Header.tsx           # App header with title and controls
│   │   ├── MainTabs.tsx         # Main tabbed interface container
│   │   ├── ScheduleView.tsx     # Weekly schedule overview
│   │   ├── ShiftTimeline.tsx    # Today's shift timeline component (extracted from CurrentStatus)
│   │   ├── TeamSelector.tsx     # Team selection modal
│   │   ├── TodayView.tsx        # Today's schedule for all teams
│   │   └── TransferView.tsx     # Team handover/transfer analysis
│   ├── contexts/          # React contexts for global state
│   │   └── ToastContext.tsx        # Global toast notification system with React Context
│   ├── data/              # Static data and configurations
│   │   └── changelog.ts            # Changelog data structure for in-app viewer
│   ├── hooks/             # Custom React hooks
│   │   ├── useCountdown.ts         # Countdown timer hook for next shift timing
│   │   ├── useKeyboardShortcuts.ts # Keyboard shortcuts functionality
│   │   ├── useLiveTime.ts          # Live updating time with configurable frequency
│   │   ├── useLocalStorage.ts      # LocalStorage persistence hook
│   │   ├── useOnlineStatus.ts      # Online/offline status hook
│   │   ├── usePWAInstall.ts        # PWA installation prompt hook
│   │   ├── useServiceWorkerStatus.ts # Service worker status hook
│   │   ├── useShiftCalculation.ts  # Shift calculation logic hook
│   │   └── useTransferCalculations.ts # Team transfer analysis hook
│   ├── utils/             # TypeScript utilities and business logic
│   │   ├── config.ts           # App configuration and constants
│   │   ├── shiftCalculations.ts # Core shift calculation functions
│   │   └── shiftStyles.ts      # Shift styling utilities
│   └── styles/
│       └── main.css       # Custom styles and shift color coding
├── tests/                 # Test files
│   ├── components/        # Component tests
│   ├── hooks/            # Hook tests
│   ├── setup.ts          # Test environment setup
│   └── shiftCalculations.test.ts # Business logic tests
├── public/
│   ├── assets/icons/      # PWA and favicon icons
│   └── sw.js             # Custom service worker
├── scripts/               # Build and utility scripts
│   ├── generate-changelog.ts   # Automatic changelog generation from data
│   └── generate-icons.js       # PWA icon generator script
├── vite.config.ts         # Vite build configuration with React and PWA
├── vitest.config.ts       # Vitest testing configuration
├── tsconfig.json          # TypeScript project references
├── tsconfig.app.json      # TypeScript app configuration
├── tsconfig.node.json     # TypeScript Node.js configuration
├── tsconfig.test.json     # TypeScript test configuration
└── dist/                  # Production build output
    ├── sw.js             # Built service worker (Workbox)
    ├── manifest.webmanifest # Auto-generated PWA manifest
    └── assets/           # Built and optimized assets
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

## Recent Improvements (v3.1+)

### Component Architecture Enhancements
- **ShiftTimeline Component**: Extracted timeline logic from CurrentStatus into dedicated component for better separation of concerns
- **Enhanced CurrentStatus**: Optimized layout with datetime moved to header area and improved timeline display
- **Cross-day Timeline**: Fixed timeline to show next shift from tomorrow when current shift is last of day (e.g., T1 M after T4 N)

### Performance Optimizations
- **useLiveTime Hook**: Configurable update frequency with minute-level default (60x fewer re-renders)
- **Precision Control**: Second-level updates available when needed for precise timing
- **Memoized Calculations**: Better performance for shift day computations

### Date Code Accuracy
- **Night Shift Fix**: Date codes now correctly use shift day instead of calendar day (2530.5N instead of 2530.6N)
- **Enhanced Display**: Current status shows combined format "2530.5N • Saturday, Jul 26 • 02:24"
- **Tooltip Context**: Shows both calendar day and shift day for user clarity

### User Experience
- **Interactive Changelog**: In-app changelog viewer with accordion interface
- **Toast Notifications**: Global notification system with React Context
- **Error Boundaries**: Graceful error handling and recovery
- **Enhanced Testing**: Comprehensive test coverage with data-driven patterns

## Technology Stack

- **Frontend**: React 19 with TypeScript and modern JSX transform
- **Build Tool**: Vite with PWA plugin for modern development and optimization
- **UI Framework**: React Bootstrap (Bootstrap 5 components) for responsive design
- **Date Handling**: Day.js for date calculations and week number formatting
- **PWA**: Auto-generated Service Worker with Workbox for offline functionality
- **Storage**: Custom React hooks for localStorage persistence and state management
- **Icons**: PNG icons in auto-generated manifest
- **Code Quality**: Biome for fast linting and formatting (TS, JS, CSS, JSON)
- **Testing**: Vitest with React Testing Library for component and unit testing

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

   **⚠️ IMPORTANT**: ALWAYS run `npm run build` BEFORE `npm run preview`. The preview command serves the built files from the dist/ directory, so any code changes won't be visible until you build first.

3. **Code Quality**: Modern linting with Biome
   ```bash
   npm run lint         # Lint JavaScript, CSS, and JSON with Biome
   npm run lint:fix     # Auto-fix all linting and formatting issues
   npm run format       # Format code with consistent style
   npm run test         # Run Vitest test suite
   ```

4. **Utility Scripts**: Development and build utilities
   ```bash
   npm run generate-changelog  # Generate CHANGELOG.md from data
   npm run generate-icons      # Generate all PWA and favicon icons
   ```

5. **PWA Testing**: 
   - Use development server for service worker testing
   - Test offline functionality with built version
   - Verify PWA installability in browser dev tools

## PWA Configuration

- **vite.config.ts**: Vite PWA plugin configuration for automatic generation
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