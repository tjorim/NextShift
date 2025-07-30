## CurrentStatus Component Refactoring ⭐️

**Component**: Simplify complex conditional rendering in CurrentStatus

### Description
Refactor the CurrentStatus component to address code complexity by extracting conditional rendering logic into separate, focused components. This addresses code review feedback about the component's complexity and improves maintainability.

### User Stories
- As a developer, I want the CurrentStatus component to be easier to understand so I can maintain and extend it more effectively
- As a code reviewer, I want clear separation of concerns so I can review personalized vs generic status logic independently
- As a QA engineer, I want simpler components so I can write more focused and reliable unit tests

### Acceptance Criteria
- [ ] CurrentStatus becomes a simple router component that decides which view to render
- [ ] PersonalizedStatus component handles all user team-specific status display
- [ ] GenericStatus component handles no-team-selected view with team selection encouragement
- [ ] All existing functionality is preserved (no regression in features)
- [ ] Component props are clearly defined with TypeScript interfaces
- [ ] Test coverage is maintained or improved for new component structure
- [ ] No visual changes to end-user experience

### Technical Requirements
- Extract conditional rendering logic into separate components
- Maintain existing prop interfaces and callback functions
- Preserve all existing functionality and styling
- Create clear component boundaries with single responsibilities
- Ensure proper TypeScript typing for all new interfaces

### Implementation
**Approach**: Extract existing conditional logic into focused sub-components

**Example Structure**:
```tsx
export function CurrentStatus({ myTeam, currentDate, todayShifts, onTodayClick }) {
  return myTeam ? (
    <PersonalizedStatus myTeam={myTeam} currentDate={currentDate} todayShifts={todayShifts} />
  ) : (
    <GenericStatus currentDate={currentDate} todayShifts={todayShifts} onTodayClick={onTodayClick} />
  );
}
```

### Files to Modify
- [ ] src/components/CurrentStatus.tsx - Simplify to simple router component (~15 lines)
- [ ] src/components/status/PersonalizedStatus.tsx - New component for user's team view
- [ ] src/components/status/GenericStatus.tsx - New component for no-team-selected view
- [ ] src/components/status/index.ts - Export barrel for new status components
- [ ] tests/components/CurrentStatus.test.tsx - Update tests for new structure
- [ ] tests/components/status/PersonalizedStatus.test.tsx - New comprehensive test suite
- [ ] tests/components/status/GenericStatus.test.tsx - New comprehensive test suite

### Dependencies
- Existing CurrentStatus component logic
- React Bootstrap components (Card, ProgressBar, Button)
- Existing hooks (useCountdown, useLiveTime)
- Shift calculation utilities

### Technical Details
- **Estimated Effort**: 3-4 hours
- **Complexity**: Medium
- **Priority**: high
- **Milestone**: v3.3.0

### Labels
`refactoring`, `todo-item`, `priority:high`, `code-quality`, `maintainability`, `effort:medium`

---
*This issue was auto-generated from TODO.md item #4*
