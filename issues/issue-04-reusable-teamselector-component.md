## Reusable TeamSelector Component

**Component**: Extract common team selection logic

### Use Cases
- Reduce code duplication across TransferView, TeamDetailModal, etc.
- Consistent team selection UI/UX
- Easier maintenance and updates

### Implementation
Create `components/common/TeamSelector.tsx` with standardized props

### Files to Modify
- [ ] `src/components/TransferView.tsx` - Replace dropdown with TeamSelector
- [ ] `src/components/TeamDetailModal.tsx` - Use common component
- [ ] Create `src/components/common/TeamSelector.tsx`

### Acceptance Criteria
- [ ] Reduce code duplication across TransferView, TeamDetailModal, etc.
- [ ] Consistent team selection UI/UX
- [ ] Easier maintenance and updates

### Technical Details
- **Estimated Effort**: 2–3 hours
- **Priority**: high
- **Current Status**: 🔲 Planned

### Labels
`enhancement`, `todo-item`, `priority:high`

---
*This issue was auto-generated from TODO.md item #4*
