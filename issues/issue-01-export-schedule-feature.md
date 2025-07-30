## Export Schedule Feature

**Component**: Calendar export functionality for shift schedules

### Description
Implement comprehensive calendar export functionality to allow users to download their shift schedules as .ics files and share them with external calendar applications like Google Calendar, Outlook, and Apple Calendar.

### User Stories
- As a shift worker, I want to export my team's schedule as a calendar file so that I can import it into my personal calendar app
- As a team lead, I want to share our team's schedule with new members so they can quickly add it to their calendars
- As a manager, I want to export multiple team schedules to coordinate coverage and planning across teams

### Acceptance Criteria
- [ ] User can download a .ics calendar file containing their team's shifts for a configurable date range (default: next 3 months)
- [ ] Calendar file includes proper event details: shift type, time, location metadata, and team information
- [ ] Export functionality is accessible from both Settings Panel and Team Detail Modal
- [ ] Calendar events include proper timezone information and recurrence patterns where applicable
- [ ] File naming follows convention: 'NextShift_Team{N}_{YYYY-MM-DD}.ics'
- [ ] Progress indicator shows during calendar generation for large date ranges
- [ ] Error handling for invalid date ranges or generation failures

### Technical Requirements
- Create iCalendar (.ics) generation utility with proper RFC 5545 compliance
- Support for timezone conversion and daylight saving time handling
- Efficient batch processing for large date ranges
- File download mechanism compatible with all major browsers
- Integration with existing shift calculation logic
- Configurable export settings (date range, team selection, event details)

### Implementation
**Approach**: Create exportCalendar utility using existing shift calculations and implement UI controls

### Files to Modify
- [ ] src/utils/exportCalendar.ts - New utility for iCalendar generation and download
- [ ] src/components/SettingsPanel.tsx - Remove 'Coming Soon' badge, enable export button, add click handler
- [ ] src/components/TeamDetailModal.tsx - Enable export button with team-specific functionality
- [ ] src/components/ExportModal.tsx - New modal for export configuration (date range, options)
- [ ] src/types/export.ts - TypeScript interfaces for export functionality
- [ ] tests/utils/exportCalendar.test.ts - Comprehensive test suite for export functionality

### Dependencies
- dayjs for date manipulation
- Existing shift calculation utilities
- Browser File API for downloads
- React Bootstrap Modal for export configuration

### Technical Details
- **Estimated Effort**: 4-5 hours
- **Complexity**: Medium
- **Priority**: high
- **Milestone**: v3.3.0

### Labels
`enhancement`, `todo-item`, `priority:high`, `feature:export`, `effort:medium`

---
*This issue was auto-generated from TODO.md item #1*
