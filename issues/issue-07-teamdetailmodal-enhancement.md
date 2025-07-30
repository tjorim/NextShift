## TeamDetailModal Enhancement

**Component**: Improve existing team detail modal functionality

### Description
Enhance the TeamDetailModal component by activating disabled features, improving the 7-day schedule view, and adding better team information display with export functionality integration.

### User Stories
- As a user, I want to export a specific team's schedule from their detail modal so I can share it with colleagues
- As a team member, I want to see an enhanced 7-day view in the team modal so I can better understand the team's schedule pattern
- As a supervisor, I want detailed team information displayed clearly so I can make informed scheduling decisions

### Acceptance Criteria
- [ ] Export functionality is fully enabled and functional within the modal
- [ ] 7-day schedule view shows clear shift patterns with proper formatting
- [ ] Team information section includes comprehensive team details
- [ ] Modal is responsive and works well on mobile devices
- [ ] Loading states are handled properly for async operations
- [ ] Error handling for failed export or data loading operations

### Technical Requirements
- Integration with export calendar functionality
- Enhanced schedule visualization within modal constraints
- Proper state management for team-specific data
- Accessibility improvements for modal navigation

### Implementation
**Approach**: Activate existing disabled features and enhance UI components

### Files to Modify
- [ ] src/components/TeamDetailModal.tsx - Enable export functionality and enhance UI
- [ ] src/components/TeamScheduleGrid.tsx - Enhanced 7-day schedule component (if separate)
- [ ] tests/components/TeamDetailModal.test.tsx - Update tests for new functionality

### Dependencies
- Export calendar functionality
- React Bootstrap Modal components
- Existing team data and shift calculations

### Technical Details
- **Estimated Effort**: 2-3 hours
- **Complexity**: Low-Medium
- **Priority**: medium
- **Milestone**: v3.4.0

### Labels
`enhancement`, `todo-item`, `priority:medium`, `feature:modal`, `effort:small`

---
*This issue was auto-generated from TODO.md item #7*
