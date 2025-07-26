# NextShift Development Roadmap

**Current Version**: 3.1.0  
**Branch**: `feat/optional-team-selection`  
**Status**: Active Development  

## Overview

This document serves as a general to-do list and development roadmap for NextShift improvements, covering UI enhancements, features, and user experience improvements.

## Development To-dos

### 🚀 High-Priority Items
Critical features and improvements that significantly impact user experience.

#### 1. Optional Team Selection ✅
- **Feature**: Allow users to skip team selection and view generic shift information
- **Use Cases**: 
  - New users can explore the app before committing to a team ✅
  - A manager can view all teams without selecting one ✅
  - General shift information display without personalization ✅
  - Temporary users who don't want to store team preference ✅
- **Implementation Details**: 
  - Add "Skip" or "View All Teams" button in TeamSelector modal ✅
  - Modify CurrentStatus component to handle null selectedTeam gracefully ✅
  - Show generic "Who's Working Today" instead of personalized status ✅
  - Timeline should still show current working team ✅
  - Disable team-specific features (next shift, off-day progress) ✅
  - Add subtle prompt to select team for personalized experience ✅
- **Files Modified**: 
  - `src/components/TeamSelector.tsx` - Added skip option ✅
  - `src/components/CurrentStatus.tsx` - Handles null team state ✅
  - `src/components/App.tsx` - Updated team selection logic ✅
  - Tests updated for new behavior ✅
- **Estimated Effort**: 2–3 hours
- **Status**: ✅ **Completed**

#### 2. Offcanvas Settings Panel
- **Component**: `react-bootstrap/Offcanvas`
- **Use Cases**:
  - App preferences (24-hour format, team colors)
  - About/help information
  - Changelog viewer
- **Implementation**: New settings context + panel
- **Estimated Effort**: 4–5 hours
- **Status**: 🔲 Planned

#### 3. Modal for Team Details
- **Component**: `react-bootstrap/Modal`
- **Use Cases**:
  - Click team card to see detailed 7-day schedule
  - Transfer history for specific team
- **Implementation**: New TeamDetailModal component
- **Estimated Effort**: 3–4 hours
- **Status**: 🔲 Planned

### 🎯 Medium-Priority Items
Features that enhance functionality with moderate development effort.

#### 4. Enhanced List Groups
- **Component**: `react-bootstrap/ListGroup`
- **Use Cases**:
  - Upcoming shifts list
  - Recent transfers list
  - Clean, organized data display
- **Implementation**: New components for data lists
- **Estimated Effort**: 2–3 hours
- **Status**: 🔲 Future

### 🎨 Future Enhancements
Advanced features for future development phases.

#### 5. Carousel for Mobile Team View
- **Component**: `react-bootstrap/Carousel`
- **Use Cases**:
  - Swipe through teams on mobile
  - Better mobile navigation
- **Implementation**: Responsive team display
- **Estimated Effort**: 5–6 hours
- **Status**: 🔲 Future

#### 6. Accordion for Transfer History
- **Component**: `react-bootstrap/Accordion`
- **Use Cases**:
  - Collapsible transfer sections by date range
  - Organized historical data
- **Implementation**: Update TransferView component
- **Estimated Effort**: 3–4 hours
- **Status**: 🔲 Future

#### 7. Floating Action Button
- **Component**: Custom positioned `react-bootstrap/Button`
- **Use Cases**:
  - Quick team switch
  - Add to calendar
  - Quick actions overlay
- **Implementation**: Fixed positioned button system
- **Estimated Effort**: 2–3 hours

## Current To-do Status

### 🔲 Next Up
1. **Offcanvas Settings Panel** - App preferences and settings
2. **Team Detail Modals** - Detailed team information and schedules
3. **Enhanced List Groups** - Better data organization

### 📋 Backlog
4. **Mobile Carousel** - Improved mobile navigation
5. **Transfer History Accordion** - Organized historical data
6. **Floating Action Button** - Quick actions overlay

### ✅ Completed
1. **Optional Team Selection** - Allow skipping team selection for generic view

## Technical Requirements

### Dependencies
- All components use existing `react-bootstrap` - no new dependencies
- Maintain existing responsive design
- Preserve accessibility standards
- Keep PWA functionality intact

### Testing Strategy
- Unit tests for all new components
- Integration tests for complex interactions
- Visual regression testing for UI changes
- Accessibility testing with screen readers

### Performance Considerations
- Lazy load modals and heavy components
- Optimize carousel for smooth animations
- Minimize re-renders with proper memoization
- Keep bundle size impact minimal

## Success Metrics

### User Experience
- Reduced cognitive load with visual progress indicators
- Improved discoverability with tooltips
- Enhanced mobile usability with touch-friendly components
- Better feedback with toast notifications

### Technical Quality
- Maintain 100% test coverage
- Zero accessibility regressions
- No performance degradation
- Clean, maintainable code architecture

## Changelog Integration

### In-App Changelog Viewer
- Accessible via settings panel
- Formatted changelog display
- Version history with dates
- Feature highlights with screenshots

### Version Tracking
- Semantic versioning (3.x.x)
- Git tags for releases
- Automated changelog generation
- Release notes in GitHub

## Risk Assessment

### Low-Risk
- Toast notifications (isolated feature)
- Progress bars (simple UI update)
- Tooltips (non-intrusive enhancement)

### Medium Risk
- Offcanvas settings (new navigation pattern)
- Modal components (focus management)

### High-Risk
- Carousel implementation (complex touch handling)
- Major layout changes (potential responsive issues)

## Future Considerations

### Potential Extensions
- Customizable themes
- Advanced notification preferences
- Keyboard shortcuts panel
- Export/import settings
- Integration with calendar apps

### User Account System (Future Phase)
- **Current**: localStorage-based preferences (device-bound, privacy-first)
- **Migration Path**: Hybrid localStorage + cloud sync approach
- **Benefits**: Multi-device sync, backup/restore, team sharing
- **Implementation Strategy**:
  - Phase 1: Keep current localStorage foundation ✅
  - Phase 2: Add optional account sync (hybrid approach)
  - Phase 3: Full multi-device real-time sync
- **Considerations**: 
  - Maintain offline-first PWA capabilities
  - Preserve zero-infrastructure-cost option
  - Smooth migration without breaking changes

### Accessibility Enhancements
- High contrast mode
- Font size preferences
- Motion reduction settings
- Keyboard navigation improvements

---

**Last Updated**: 2025-07-25  
**Next Review**: After Phase 1 completion