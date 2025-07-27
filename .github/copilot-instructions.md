# Copilot Instructions for NextShift

## Project Overview
- **NextShift** is a PWA for tracking 5-team, 24/7 rotating shift schedules. It is built with React 18, TypeScript, Vite, and React Bootstrap, and is designed for offline use and mobile/desktop installation.
- The app's core logic revolves around shift calculations, team selection, and schedule/timeline display. All shift math is anchored to a configurable reference date/team (see below).

## Architecture & Key Patterns
- **src/components/**: All major UI is split into focused React components (e.g., `CurrentStatus.tsx`, `ScheduleView.tsx`, `ShiftTimeline.tsx`). Each view is a self-contained component, with shared logic extracted to hooks or utils.
- **src/hooks/**: Custom hooks encapsulate business logic (e.g., `useShiftCalculation.ts`, `useTransferCalculations.ts`, `useLiveTime.ts`). Hooks are preferred for stateful or reusable logic.
- **src/contexts/**: Global state (e.g., toast notifications, settings) is managed via React Contexts.
- **src/utils/**: Core business logic (e.g., `shiftCalculations.ts`) and configuration constants (`config.ts`).
- **src/data/changelog.ts**: Structured changelog data for in-app display.
- **public/sw.js**: Service worker for PWA offline support and asset caching.

## Developer Workflows
- **Install dependencies:** `npm install`
- **Start dev server:** `npm run dev` (Vite, HMR, runs at <http://localhost:8000>)
- **Run tests:** `npm run test` (Vitest + React Testing Library)
- **Lint/format:** `npm run lint` / `npm run lint:fix` / `npm run format` (Biome)
- **Build for production:** `npm run build`
- **Preview build:** `npm run preview`

## Configuration & Environment
- **Reference Date/Team:** All shift calculations are anchored to `VITE_REFERENCE_DATE` and `VITE_REFERENCE_TEAM` (set in `.env` or as runtime config via `window.NEXTSHIFT_CONFIG`). Defaults: `2025-01-06`, team `1`.
- **Date Format:** Dates use `YYWW.D` (e.g., `2520.2M` = 2025, week 20, Tuesday Morning). Night shifts use previous day for code.
- **PWA:** Uses Vite PWA plugin and Workbox. Service worker is in `public/sw.js`.

## Project Conventions
- **Component-first:** All UI logic is in React components; business logic is in hooks or utils, not in components.
- **Testing:** Tests mirror the source structure under `tests/` (e.g., `tests/components/ComponentName.test.tsx`).
- **Styling:** Uses Bootstrap 5 and custom SCSS in `src/styles/main.scss`.
- **Icons:** PNG icons are generated via `scripts/generate-icons.js`.
- **Error Handling:** Use `ErrorBoundary.tsx` for graceful error recovery.
- **Changelog:** In-app changelog is sourced from `src/data/changelog.ts` and displayed via `ChangelogModal.tsx`.

## Integration Points
- **LocalStorage:** User preferences (e.g., team selection) are persisted via `useLocalStorage.ts`.
- **Service Worker:** Handles offline support and caching. Update `public/sw.js` for changes to caching strategy.
- **Day.js:** Used for all date/time logic (with timezone/week plugins).

## Examples
- To add a new schedule view, create a component in `src/components/`, add logic to a hook if needed, and register it in `MainTabs.tsx`.
- To change shift logic, update `src/utils/shiftCalculations.ts` and corresponding tests in `tests/utils/shiftCalculations.test.ts`.

---
For more details, see `README.md` and `CLAUDE.md`. When in doubt, follow the structure and patterns of existing components and hooks.
