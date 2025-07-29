# Changelog

All notable changes to NextShift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Future Enhancements

### Planned
- Enhanced data presentation
- Advanced navigation options
- Calendar integration features
- Mobile carousel for team browsing
- Advanced accessibility features
- Floating action buttons
- Accordion for organized data

## [3.2.0] - 2025-07-27

### Added
- Welcome Wizard: Interactive onboarding experience for new users
- Optional Team Selection: Users can skip team selection and browse all teams
- Settings Panel: Complete Offcanvas settings with preferences, theme, and time format
- Enhanced Theme Support: Auto/Light/Dark theme switching with system preference detection
- Notification Settings: User-configurable shift reminders and alerts
- Share Functionality: Share app or current view with colleagues
- Settings Reset: Option to clear all preferences and start fresh
- Enhanced User Preferences: Persistent team selection with localStorage
- Bootstrap UI Enhancements: Toast notification system for user feedback
- Progress bar visualization for off-day tracking (CurrentStatus component)
- Tooltips for shift code explanations with enhanced accessibility
- In-app changelog viewer with interactive accordion interface
- Bootstrap Icons integration for improved visual consistency
- Documentation & Planning: Bootstrap UI Enhancement Plan documentation with phased approach
- Comprehensive changelog system following Keep a Changelog format
- Version tracking infrastructure with semantic versioning
- Enhanced component composition patterns
- Context API integration for toast notifications
- Improved accessibility with ARIA labels and tooltips
- Consistent styling with Bootstrap component integration
- React Bootstrap component consistency across all UI elements
- Transfer type badges with explanatory tooltips for better UX
- Seamless tab-content styling for professional appearance
- TeamDetailModal: Complete modal for detailed team information and 7-day schedules

### Changed
- Updated package.json version to 3.2.0
- App.tsx: Complete onboarding flow with welcome wizard integration
- CurrentStatus component: Enhanced to handle null team selection gracefully
- Header component: Added Settings panel trigger and enhanced navigation
- Enhanced Header component with changelog access button
- Improved user feedback with contextual toast notifications
- Centralized dayjs configuration with ISO week numbering support
- Unified date/time formatting utilities across the application
- TransferView: Reorganized controls layout for better space utilization and UX
- TransferInfo interface: Refactored from isHandover boolean to semantic TransferType union
- Shift display: Implemented single source of truth using getShiftDisplayName utility
- TodayView: Converted HTML button cards to proper React Bootstrap Card components
- ScheduleView: Replaced HTML fieldset btn-group with React Bootstrap ButtonGroup
- Component architecture: Improved semantic variable naming and accessibility

### Fixed
- Critical: Sunday week number calculation using ISO week standard (#13)
- Year boundary bug: December 31, 2024 now correctly shows as week 2501.2
- ISO week consistency: All date codes now use ISO week numbering
- Date code accuracy: Night shifts now use correct shift day instead of calendar day
- Cross-day timeline: Fixed timeline to show next shift from tomorrow when needed
- Test environment: dayjs plugin loading and configuration in test suite

### Major Architecture & Component Updates
Added WelcomeWizard.tsx for onboarding, SettingsPanel.tsx with Offcanvas UI, SettingsContext.tsx for global preferences, dateTimeUtils.ts for centralized date handling. Enhanced App.tsx with complete onboarding flow, CurrentStatus.tsx with null team support, Header.tsx with settings integration. Critical fixes to ISO week numbering and date code calculations.

## [3.1.0] - 2025-07-25

### Added
- Initial Bootstrap UI foundation and component integration
- Toast notification system prototype
- Progress bar visualization for shift tracking
- Enhanced tooltips and accessibility features
- Changelog infrastructure and version tracking

### Changed
- Improved component composition patterns
- Enhanced user interface consistency

### Fixed
- Component testing and integration issues

### UI Foundation
Established Bootstrap UI component integration and accessibility improvements.

## [3.0.0] - 2025-07-25

### Added
- Weekday display in transfer dates (e.g., "Wed, Jan 15, 2025")
- Currently working team indicator in Current Status view
- Off-day progress tracking ("Day X of 4 off days")
- Consistent card heights across all team displays
- Refactored off-day progress calculation to utils layer
- New getOffDayProgress() utility function with comprehensive tests
- Improved separation of concerns between UI and business logic
- Added comprehensive test coverage (228 tests total)
- Updated test mocks to match actual shift names with emojis
- Resolved test conflicts with multiple team elements
- Enhanced TypeScript type safety

### Changed
- TodayView component now shows consistent content for all teams
- Off teams display "Not working today" instead of empty space
- Transfer dates include weekday context for better planning
- CurrentStatus component shows both working team and user's team status

### Fixed
- Inconsistent card heights between working and off teams
- Test failures due to multiple identical text elements
- Code formatting and linting issues
- Unicode emoji compatibility in test patterns

### Technical Highlights
This release focused on UX improvements and code quality, adding 42 comprehensive tests for shift calculations, updating component tests for new UI elements, and refactoring business logic for better maintainability.

## [2.0.0] - Previous Major Release

### Added
- Progressive Web App (PWA) functionality
- Offline support with service worker
- Team shift tracking and calculations
- Transfer/handover detection between teams
- Responsive Bootstrap UI design
- Date navigation and shift visualization
- 5-team continuous shift schedule (M/E/N/Off pattern)
- Today's team overview with active shift highlighting
- Next shift calculation with countdown timer
- Transfer point detection between teams
- Date picker with custom range selection
- Installation prompts for mobile/desktop
- Offline functionality with cached data
- App shortcuts for quick access
- Service worker for background updates
- Bootstrap 5 responsive design
- Color-coded shift badges
- Team highlighting for user's selected team
- Mobile-optimized touch interface

### Technical Stack
Built with React 19 with TypeScript, Vite build system with PWA plugin, Day.js for date handling, React Bootstrap components, Vitest testing framework, and Biome for linting and formatting.

---

## Version Planning

### v3.3.0 - Interactive Features Phase 2
- Enhanced data presentation
- Advanced navigation options
- Calendar integration features

### v3.4.0 - Mobile & Advanced UX Phase 3
- Mobile carousel for team browsing
- Advanced accessibility features
- Floating action buttons
- Accordion for organized data

### Future Releases
- Calendar integration
- Notification system
- Theme customization
- Multi-language support
- Data export capabilities
