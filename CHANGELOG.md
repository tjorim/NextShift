# Changelog

All notable changes to NextShift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Bootstrap UI Enhancements

### Added
- Bootstrap UI Enhancement Plan documentation
- Comprehensive changelog system
- Version tracking infrastructure

### Planned
- Toast notification system for user feedback
- Progress bar visualization for off-day tracking
- Tooltips for shift code explanations
- Settings panel with preferences
- Team detail modals
- Mobile-optimized carousel navigation

## [3.0.0] - 2025-07-25

### Added
- **UX Improvements**
  - Weekday display in transfer dates (e.g., "Wed, Jan 15, 2025")
  - Currently working team indicator in Current Status view
  - Off-day progress tracking ("Day X of 4 off days")
  - Consistent card heights across all team displays
  
- **Architecture Enhancements**
  - Refactored off-day progress calculation to utils layer
  - New `getOffDayProgress()` utility function with comprehensive tests
  - Improved separation of concerns between UI and business logic
  
- **Code Quality**
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

### Technical Details
- **New Utility Functions**
  - `getOffDayProgress(date, teamNumber)` - Calculate off-day position
  - Enhanced shift calculation functions with better error handling
  
- **Component Updates**
  - CurrentStatus: Added working team display and off-day progress
  - TodayView: Standardized card content structure
  - TransferView: Enhanced date formatting with weekdays
  
- **Test Improvements**
  - 42 comprehensive tests for shift calculations
  - Updated component tests for new UI elements
  - Proper handling of emoji text in test assertions

## [2.0.0] - Previous Major Release

### Added
- Progressive Web App (PWA) functionality
- Offline support with service worker
- Team shift tracking and calculations
- Transfer/handover detection between teams
- Responsive Bootstrap UI design
- Date navigation and shift visualization

### Features
- **Core Functionality**
  - 5-team continuous shift schedule (M/E/N/Off pattern)
  - Today's team overview with active shift highlighting
  - Next shift calculation with countdown timer
  - Transfer point detection between teams
  - Date picker with custom range selection
  
- **PWA Features**
  - Installation prompts for mobile/desktop
  - Offline functionality with cached data
  - App shortcuts for quick access
  - Service worker for background updates
  
- **UI/UX**
  - Bootstrap 5 responsive design
  - Color-coded shift badges
  - Team highlighting for user's selected team
  - Mobile-optimized touch interface

### Technical Stack
- React 19 with TypeScript
- Vite build system with PWA plugin
- Day.js for date handling
- React Bootstrap components
- Vitest testing framework
- Biome for linting and formatting

---

## Version Planning

### v3.1.0 - Bootstrap UI Enhancements Phase 1
- Toast notification system
- Progress bar visualizations
- Tooltip help system
- Enhanced user feedback

### v3.2.0 - Interactive Features Phase 2
- Settings panel with preferences
- Team detail modals
- Enhanced data presentation
- Advanced navigation options

### v3.3.0 - Mobile & Advanced UX Phase 3
- Carousel for mobile team browsing
- Accordion for organized data
- Floating action buttons
- Advanced accessibility features

### Future Releases
- Calendar integration
- Notification system
- Theme customization
- Multi-language support
- Data export capabilities