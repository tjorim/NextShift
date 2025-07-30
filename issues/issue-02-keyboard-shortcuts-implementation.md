## Keyboard Shortcuts Implementation

**Component**: Enhanced navigation with comprehensive keyboard shortcuts

### Description
Integrate the existing useKeyboardShortcuts hook throughout the application to provide power users with efficient keyboard-based navigation and control, improving accessibility and user experience.

### User Stories
- As a power user, I want to navigate between tabs using keyboard shortcuts so I can quickly access different views without using the mouse
- As an accessibility-focused user, I want to use arrow keys to navigate dates so I can efficiently browse schedules
- As a frequent user, I want to quickly open settings with a keyboard shortcut so I can access preferences without mouse navigation
- As a mobile user with a bluetooth keyboard, I want keyboard shortcuts to work on mobile so I can navigate efficiently

### Acceptance Criteria
- [ ] Tab navigation shortcuts work: T (Today), S (Schedule), R (Transfers)
- [ ] Date navigation with arrow keys (← previous day/week, → next day/week) works in relevant views
- [ ] Settings panel toggle with Ctrl+, (Cmd+, on Mac) works from any view
- [ ] Team selection shortcut Ctrl+T (Cmd+T on Mac) opens team selection
- [ ] Shortcuts are disabled when focus is in input fields, textareas, or contentEditable elements
- [ ] Visual feedback shows which shortcuts are available (tooltip or help modal)
- [ ] Shortcuts work consistently across all major browsers and mobile devices with keyboards
- [ ] No conflicts with browser shortcuts or accessibility tools

### Technical Requirements
- Integration of existing useKeyboardShortcuts hook across all relevant components
- Proper focus management to prevent shortcut conflicts with form inputs
- Cross-platform compatibility (Windows Ctrl vs Mac Cmd key handling)
- State management for shortcut availability per view
- Accessibility compliance with screen reader shortcuts

### Implementation
**Approach**: Incrementally integrate useKeyboardShortcuts hook into main components with proper callback handlers

**Key Mappings**:
- `Ctrl+H / Cmd+H`: Jump to today
- `Ctrl+K / Cmd+K`: Previous day/week
- `Ctrl+J / Cmd+J`: Next day/week
- `Ctrl+T / Cmd+T`: Team selection
- `ArrowLeft`: Previous (context-aware)
- `ArrowRight`: Next (context-aware)

### Files to Modify
- [ ] src/components/MainTabs.tsx - Integrate useKeyboardShortcuts for tab switching and settings
- [ ] src/components/ScheduleView.tsx - Add date navigation shortcuts with proper date state management
- [ ] src/components/Header.tsx - Add settings panel toggle shortcut
- [ ] src/components/TodayView.tsx - Add team selection shortcut integration
- [ ] src/components/KeyboardShortcutsHelp.tsx - New component for shortcuts help modal
- [ ] tests/hooks/useKeyboardShortcuts.test.ts - Enhanced tests for new integrations

### Dependencies
- Existing useKeyboardShortcuts hook
- React Bootstrap Modal for help display
- Existing navigation state management

### Technical Details
- **Estimated Effort**: 3-4 hours
- **Complexity**: Low-Medium
- **Priority**: high
- **Milestone**: v3.3.0

### Labels
`enhancement`, `todo-item`, `priority:high`, `feature:shortcuts`, `a11y:keyboard-navigation`, `effort:medium`

---
*This issue was auto-generated from TODO.md item #2*
