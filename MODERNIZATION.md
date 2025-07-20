# NextShift Modernization Guide

This document outlines the migration of NextShift PWA from vanilla JavaScript to React with React Bootstrap.

## 🎯 Migration Decision: React + React Bootstrap

**DECISION MADE**: Complete migration to React with React Bootstrap, replacing vanilla JavaScript implementation.

**Why React + React Bootstrap?**
- User has previous React experience
- React Bootstrap provides drop-in replacement for current Bootstrap 5 UI
- Mature ecosystem with excellent TypeScript support
- Better component organization and state management
- Improved developer experience with hot reloading and debugging tools

## 📋 Migration Phase Tracking

### ✅ Completed Phases
- **Analysis & Planning**: Evaluated migration approaches and decided on React + React Bootstrap
- **Current State Assessment**: Documented existing vanilla JS architecture and features

### 🔄 Phase 1: Project Setup & Dependencies
**Status**: ⏳ Pending  
**Tasks**:
- [ ] Install React, React DOM, TypeScript, and React Bootstrap
- [ ] Configure Vite for React build system  
- [ ] Set up ESLint and testing with React Testing Library
- [ ] Update package.json scripts for React development

### ⏳ Phase 2: Core Business Logic Migration
**Status**: ⏳ Pending  
**Tasks**:
- [ ] Port shift calculation functions to pure TypeScript utilities
- [ ] Create React hooks for shift calculations and state management
- [ ] Implement localStorage persistence with React hooks
- [ ] Set up configuration management for reference date/team

### ⏳ Phase 3: Component Development
**Status**: ⏳ Pending  
**Tasks**:
- [ ] **TeamSelector**: React Bootstrap Modal for team selection
- [ ] **Header**: App title, version, connection status  
- [ ] **CurrentStatus**: Display current team shift and next shift
- [ ] **TodayView**: Show all teams' shifts for selected date
- [ ] **ScheduleView**: Weekly schedule overview with navigation
- [ ] **TransferView**: Team handover/transfer analysis

### ⏳ Phase 4: Styling & PWA Integration
**Status**: ⏳ Pending  
**Tasks**:
- [ ] Migrate CSS custom properties and shift color coding
- [ ] Configure React Bootstrap theming to match current design
- [ ] Update Vite PWA plugin for React build structure
- [ ] Implement service worker registration in React app

### ⏳ Phase 5: Testing & Optimization
**Status**: ⏳ Pending  
**Tasks**:
- [ ] Port existing Vitest tests to React Testing Library
- [ ] Add component integration tests
- [ ] Performance optimization and bundle analysis
- [ ] PWA functionality verification

### ⏳ Phase 6: Deployment & Cleanup
**Status**: ⏳ Pending  
**Tasks**:
- [ ] Update GitHub Actions for React build process
- [ ] Clean up old vanilla JS files
- [ ] Update documentation and README
- [ ] Deploy and verify full functionality

## 🚀 React Migration Implementation

### Current Features to Migrate
**From vanilla JavaScript + Bootstrap 5**:
- Team selection modal with localStorage persistence
- Current status display with team highlighting  
- Today's schedule view for all teams
- Weekly schedule overview with navigation
- Transfer/handover analysis between teams
- PWA functionality with offline support
- Date format: YYWW.D (year.week.day)

### React Architecture Overview

**Step 1: Install React Dependencies**
```bash
npm install react react-dom react-bootstrap bootstrap
npm install -D @types/react @types/react-dom @vitejs/plugin-react
npm install -D @testing-library/react @testing-library/jest-dom
```

**Step 2: Port Shift Calculation Logic to TypeScript**
```typescript
// src/utils/shiftCalculations.ts
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

interface ShiftConfig {
  REFERENCE_DATE: Date;
  REFERENCE_TEAM: number;
}

interface ShiftResult {
  team: number;
  date: Date;
  shift: 'M' | 'E' | 'N' | 'OFF';
  code: string;
}

export function calculateShift(date: Date, teamNumber: number, config: ShiftConfig): ShiftResult {
  // Port existing calculation logic here
  // Returns shift information with type safety
}

export function formatDateCode(date: Date): string {
  const dayjs_date = dayjs(date);
  const year = dayjs_date.year().toString().slice(-2);
  const week = dayjs_date.week().toString().padStart(2, '0');
  const day = dayjs_date.day() || 7; // Convert Sunday (0) to 7
  return `${year}${week}.${day}`;
}
```

**Step 3: Create React Hooks for State Management**
```typescript
// src/hooks/useShiftCalculation.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { calculateShift, type ShiftConfig, type ShiftResult } from '../utils/shiftCalculations';

export function useShiftCalculation(config: ShiftConfig) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const currentShift = useMemo(() => {
    if (!selectedTeam) return null;
    return calculateShift(currentDate, selectedTeam, config);
  }, [selectedTeam, currentDate, config]);
  
  const nextShift = useMemo(() => {
    if (!selectedTeam) return null;
    // Calculate next shift logic
  }, [selectedTeam, currentDate, config]);
  
  return {
    selectedTeam,
    setSelectedTeam,
    currentDate,
    setCurrentDate,
    currentShift,
    nextShift
  };
}
```

**Step 4: Create React Bootstrap Components**
```tsx
// src/components/TeamSelector.tsx
import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';

interface TeamSelectorProps {
  show: boolean;
  onTeamSelect: (team: number) => void;
  onHide: () => void;
}

export function TeamSelector({ show, onTeamSelect, onHide }: TeamSelectorProps) {
  const teams = [1, 2, 3, 4, 5];

  const handleTeamSelect = (team: number) => {
    onTeamSelect(team);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered>
      <Modal.Header>
        <Modal.Title>Select Your Team</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Please select which team you belong to:</p>
        <Row className="g-2">
          {teams.map((team) => (
            <Col key={team} xs={12} sm={6} md={4}>
              <Button
                variant="outline-primary"
                className="w-100 team-btn"
                onClick={() => handleTeamSelect(team)}
              >
                Team {team}
              </Button>
            </Col>
          ))}
        </Row>
      </Modal.Body>
    </Modal>
  );
}
```

**Step 5: Main App Structure**
```tsx
// src/App.tsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { TeamSelector } from './components/TeamSelector';
import { Header } from './components/Header';
import { CurrentStatus } from './components/CurrentStatus';
import { MainTabs } from './components/MainTabs';
import { useShiftCalculation } from './hooks/useShiftCalculation';
import { CONFIG } from './utils/config';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

function App() {
  const [showTeamModal, setShowTeamModal] = useState(false);
  const { selectedTeam, setSelectedTeam, currentDate, setCurrentDate, currentShift } = 
    useShiftCalculation(CONFIG);

  useEffect(() => {
    // Load saved team from localStorage
    const savedTeam = localStorage.getItem('userTeam');
    if (savedTeam) {
      setSelectedTeam(parseInt(savedTeam, 10));
    }
  }, [setSelectedTeam]);

  const handleTeamSelect = (team: number) => {
    setSelectedTeam(team);
    localStorage.setItem('userTeam', team.toString());
    setShowTeamModal(false);
  };

  const handleChangeTeam = () => {
    setShowTeamModal(true);
  };

  return (
    <div className="bg-light min-vh-100">
      <Container fluid>
        <Header onChangeTeam={handleChangeTeam} />
        
        <CurrentStatus 
          selectedTeam={selectedTeam}
          currentShift={currentShift}
          currentDate={currentDate}
          onChangeTeam={handleChangeTeam}
        />
        
        <MainTabs 
          selectedTeam={selectedTeam}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
        
        <TeamSelector
          show={showTeamModal || !selectedTeam}
          onTeamSelect={handleTeamSelect}
          onHide={() => setShowTeamModal(false)}
        />
      </Container>
    </div>
  );
}

export default App;
```

## 📦 Technology Stack

### Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-bootstrap": "^2.10.0",
    "bootstrap": "^5.3.7",
    "dayjs": "^1.11.13"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "typescript": "^5.6.0",
    "vite": "^7.0.5",
    "vite-plugin-pwa": "^1.0.1",
    "vitest": "^3.2.4"
  }
}
```

### Project Structure
```
nextshift-react/
├── src/
│   ├── components/
│   │   ├── TeamSelector.tsx
│   │   ├── Header.tsx
│   │   ├── CurrentStatus.tsx
│   │   ├── MainTabs.tsx
│   │   ├── TodayView.tsx
│   │   ├── ScheduleView.tsx
│   │   └── TransferView.tsx
│   ├── hooks/
│   │   ├── useShiftCalculation.ts
│   │   ├── useLocalStorage.ts
│   │   └── usePWA.ts
│   ├── utils/
│   │   ├── shiftCalculations.ts
│   │   ├── dateFormatting.ts
│   │   └── config.ts
│   ├── styles/
│   │   └── main.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
│   └── assets/
│       └── icons/
├── tests/
│   ├── components/
│   ├── hooks/
│   └── utils/
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 🎨 Styling Strategy

### React Bootstrap + Custom CSS
We'll use React Bootstrap for UI components combined with custom CSS for shift-specific styling:

```css
/* src/styles/main.css - Migrated from current design */
:root {
    --shift-morning: #e3f2fd;
    --shift-morning-text: #0d47a1;
    --shift-evening: #fff3e0;
    --shift-evening-text: #e65100;
    --shift-night: #f3e5f5;
    --shift-night-text: #4a148c;
    --shift-off: #f5f5f5;
    --shift-off-text: #757575;
    --primary-color: #0d6efd;
}

/* React Bootstrap component overrides */
.shift-morning {
    background-color: var(--shift-morning);
    color: var(--shift-morning-text);
    border: 1px solid var(--shift-morning-text);
}

.shift-evening {
    background-color: var(--shift-evening);
    color: var(--shift-evening-text);
    border: 1px solid var(--shift-evening-text);
}

.shift-night {
    background-color: var(--shift-night);
    color: var(--shift-night-text);
    border: 1px solid var(--shift-night-text);
}

.shift-off {
    background-color: var(--shift-off);
    color: var(--shift-off-text);
    border: 1px solid var(--shift-off-text);
}

.my-team {
    border: 2px solid var(--primary-color) !important;
    box-shadow: 0 0 10px color-mix(in srgb, var(--primary-color) 30%, transparent);
}
```

## 🚀 Migration Benefits

### Developer Experience
- **TypeScript Support**: Full type safety for shift calculations and component props
- **Component-based Architecture**: Reusable, testable UI components  
- **Hot Module Replacement**: Instant feedback during development
- **Better Debugging**: React Developer Tools for state inspection
- **Modern Tooling**: ESLint, Prettier, and Vite for optimal development workflow

### User Experience  
- **Faster Load Times**: Optimized React bundle with code splitting
- **Better Performance**: Virtual DOM updates and React optimizations
- **Smoother Interactions**: Proper state management prevents UI flicker
- **Mobile-First**: React Bootstrap responsive components

### Maintainability
- **Type Safety**: Catch errors at compile time instead of runtime
- **Cleaner Code Organization**: Separation of concerns with hooks and utilities
- **Easier Testing**: React Testing Library for component testing
- **Better Error Handling**: React error boundaries and proper error states
- **Predictable State Management**: Controlled state flow with React hooks

### Long-term Advantages
- **Scalability**: Easy to add new features and components
- **Community Support**: Large React ecosystem and learning resources  
- **Performance Monitoring**: React DevTools profiler for optimization
- **PWA Integration**: Seamless service worker integration with Vite PWA plugin

## 📚 Learning Resources

### React + TypeScript
- [React Official Documentation](https://react.dev/learn)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Bootstrap Documentation](https://react-bootstrap.netlify.app/)

### Testing
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest with React](https://vitest.dev/guide/ui.html)

### PWA with React
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [React PWA Guide](https://web.dev/progressive-web-apps/)

## 🏁 Next Steps

1. **Install React Dependencies** - Add React, TypeScript, and React Bootstrap
2. **Configure Vite** - Update vite.config.js for React build
3. **Port Business Logic** - Move shift calculations to TypeScript utilities  
4. **Build Components** - Create React Bootstrap components one by one
5. **Migrate Styling** - Port CSS and integrate with React Bootstrap
6. **Add Testing** - Set up React Testing Library
7. **Deploy & Verify** - Ensure all features work in React version

**Goal**: Complete migration while maintaining all current functionality and improving code quality with TypeScript and modern React patterns.