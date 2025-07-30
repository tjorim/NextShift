## Multi-Roster Pattern Support

**Component**: Configurable shift patterns beyond 5-team 2-2-2-4 cycle

### Use Cases
- Support 3-team, 4-team, 6-team rosters
- Different shift patterns (3-3-3-3, 4-4-4-4, custom patterns)
- Multiple roster types in same organization
- Dynamic team count and shift cycle configuration

### Implementation
Extract hardcoded pattern logic into configurable system

### Files to Modify
- [ ] `src/utils/shiftCalculations.ts` - Make SHIFTS and cycle logic configurable
- [ ] `src/utils/config.ts` - Add roster pattern configuration
- [ ] `src/components/WelcomeWizard.tsx` - Dynamic team count references
- [ ] `src/components/AboutModal.tsx` - Dynamic roster description
- [ ] `CLAUDE.md` - Update documentation for multiple patterns
- [ ] **Technical Requirements**:
- [ ] Roster pattern schema (teams, shifts per team, cycle length)
- [ ] Migration system for existing localStorage data
- [ ] UI for roster selection/configuration
- [ ] Backward compatibility with current 5-team setup

### Acceptance Criteria
- [ ] Support 3-team, 4-team, 6-team rosters
- [ ] Different shift patterns (3-3-3-3, 4-4-4-4, custom patterns)
- [ ] Multiple roster types in same organization
- [ ] Dynamic team count and shift cycle configuration

### Technical Details
- **Estimated Effort**: 8–12 hours (Major feature)
- **Priority**: future
- **Current Status**: 🔲 Future

### Labels
`enhancement`, `todo-item`, `priority:low`

---
*This issue was auto-generated from TODO.md item #14*
