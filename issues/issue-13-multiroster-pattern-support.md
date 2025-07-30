## Multi-Roster Pattern Support

**Component**: Configurable shift patterns beyond the current 5-team system

### Description
Extract hardcoded 5-team, 2-2-2-4 shift pattern logic into a configurable system supporting 3-team, 4-team, 6-team rosters and custom shift patterns for different organizational needs.

### User Stories
- As an organization with 3 teams, I want to configure the app for our specific roster so we can use NextShift for our schedule
- As a company with multiple departments, I want to support different shift patterns so all teams can use the same tool
- As an administrator, I want to migrate from our current 5-team setup to a 4-team setup without losing data

### Acceptance Criteria
- [ ] Support for 3, 4, 5, and 6 team configurations
- [ ] Configurable shift patterns (2-2-3, 3-3-3-3, 4-4-4-4, custom)
- [ ] Roster pattern can be changed without losing existing user data
- [ ] All calculations adapt automatically to selected pattern
- [ ] UI components adjust to show correct number of teams
- [ ] Backward compatibility with existing 5-team setups
- [ ] Clear migration path for changing patterns

### Technical Requirements
- Configurable shift calculation engine
- Database migration system for pattern changes
- Dynamic UI components that adapt to team count
- Pattern validation and error handling
- Comprehensive testing for all supported patterns

### Implementation
**Approach**: Extract hardcoded logic into configurable pattern system

### Files to Modify
- [ ] src/utils/shiftCalculations.ts - Make shift logic configurable with pattern support
- [ ] src/utils/config.ts - Add roster pattern configuration and validation
- [ ] src/utils/patternMigration.ts - Migration utilities for changing patterns
- [ ] src/components/PatternSelector.tsx - UI for selecting/configuring patterns
- [ ] src/components/WelcomeWizard.tsx - Integrate pattern selection into onboarding
- [ ] src/components/AboutModal.tsx - Update description for multi-pattern support
- [ ] src/types/patterns.ts - TypeScript interfaces for pattern definitions
- [ ] tests/utils/patterns/ - Comprehensive test suite for all patterns
- [ ] CLAUDE.md - Update documentation for multi-pattern support

### Dependencies
- Existing shift calculation system
- LocalStorage migration utilities
- React Bootstrap form components
- Configuration validation logic

### Technical Details
- **Estimated Effort**: 10-12 hours
- **Complexity**: Very High
- **Priority**: low
- **Milestone**: v4.0.0

### Labels
`enhancement`, `todo-item`, `priority:low`, `feature:patterns`, `major-feature`, `effort:xl`

---
*This issue was auto-generated from TODO.md item #13*
