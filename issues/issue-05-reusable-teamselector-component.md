## Reusable TeamSelector Component

**Component**: Extract common team selection logic into reusable component

### Description
Create a standardized, reusable TeamSelector component to replace duplicated team selection dropdowns across the application, improving code maintainability and ensuring consistent UI/UX for team selection.

### User Stories
- As a developer, I want a reusable TeamSelector component so I don't have to duplicate team selection logic across multiple components
- As a user, I want consistent team selection behavior so the interface feels cohesive across different views
- As a maintainer, I want centralized team selection logic so updates only need to be made in one place

### Acceptance Criteria
- [ ] Single reusable TeamSelector component with standardized props interface
- [ ] Consistent styling and behavior across all usage locations
- [ ] Support for different selection modes (single team, team filtering, etc.)
- [ ] Proper accessibility attributes (ARIA labels, keyboard navigation)
- [ ] Integration with existing team validation and state management
- [ ] Backwards compatibility with current team selection functionality
- [ ] Clear documentation and TypeScript interfaces

### Technical Requirements
- Flexible props interface to handle different use cases
- Integration with React Bootstrap Form components
- Support for controlled and uncontrolled component patterns
- Proper event handling for team selection changes
- Validation for team number ranges (1-5)
- Optional filtering capabilities for specific team subsets

### Implementation
**Approach**: Create flexible TeamSelector component, then replace existing implementations

**Component API**:
Props:
- `selectedTeam`: number | null
- `onTeamSelect`: (team: number | null) => void
- `teams`: number[] (optional, defaults to [1,2,3,4,5])
- `placeholder`: string (optional)
- `includeNoneOption`: boolean (optional)
- `disabled`: boolean (optional)
- `size`: 'sm' | 'lg' (optional)
- `variant`: 'primary' | 'secondary' | 'outline' (optional)

### Files to Modify
- [ ] src/components/common/TeamSelector.tsx - New reusable component with comprehensive API
- [ ] src/components/TransferView.tsx - Replace existing dropdown with TeamSelector
- [ ] src/components/TeamDetailModal.tsx - Integrate TeamSelector component
- [ ] src/components/WelcomeWizard.tsx - Use TeamSelector for initial team selection (if applicable)
- [ ] src/types/components.ts - Add TeamSelector prop interfaces
- [ ] tests/components/common/TeamSelector.test.tsx - Comprehensive test suite
- [ ] tests/components/TransferView.test.tsx - Update tests for new component integration

### Dependencies
- React Bootstrap Form components
- Existing team validation logic
- Current styling and theme system

### Technical Details
- **Estimated Effort**: 3-4 hours
- **Complexity**: Medium
- **Priority**: high
- **Milestone**: v3.3.0

### Labels
`enhancement`, `todo-item`, `priority:high`, `code-quality`, `reusability`, `effort:medium`

---
*This issue was auto-generated from TODO.md item #5*
