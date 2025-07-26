# Changelog

All notable changes to NextShift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Future Enhancements

### Planned
- Settings panel with preferences
- Team detail modals
- Enhanced data presentation
- Advanced navigation options
- Mobile carousel for team browsing
- Advanced accessibility features
- Floating action buttons
- Accordion for organized data

## [3.1.0] - 2025-07-25

### Added
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

### Changed
- Updated package.json version to 3.1.0
- Enhanced Header component with changelog access button
- Improved user feedback with contextual toast notifications

### Planned
- Settings panel with preferences
- Team detail modals
- Mobile-optimized carousel navigation

### New Components & Enhancements
Added ChangelogModal.tsx - Interactive changelog viewer with accordion layout, ToastContext.tsx - Global toast notification system with React Context. Enhanced CurrentStatus with progress bar visualization, Header with changelog modal trigger, and App with toast provider integration.

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

### v3.2.0 - Interactive Features Phase 2
- Settings panel with preferences
- Team detail modals
- Enhanced data presentation
- Advanced navigation options

### v3.3.0 - Mobile & Advanced UX Phase 3
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
