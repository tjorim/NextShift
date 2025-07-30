## Carousel for Mobile Team View

**Component**: Mobile-optimized team navigation with swipe gestures

### Description
Implement a React Bootstrap Carousel component to provide intuitive swipe-based navigation between teams on mobile devices, improving the mobile user experience significantly.

### User Stories
- As a mobile user, I want to swipe between teams so I can quickly navigate without tapping small buttons
- As a touch device user, I want smooth gesture-based navigation so the app feels native and responsive
- As a user with multiple teams to track, I want visual indicators of which team I'm viewing so I don't get confused

### Acceptance Criteria
- [ ] Carousel displays team schedules with smooth swipe transitions on mobile
- [ ] Touch gestures (swipe left/right) navigate between teams
- [ ] Visual indicators show current team and total team count
- [ ] Carousel automatically adapts to screen size (mobile vs desktop)
- [ ] Proper accessibility support for screen readers and keyboard navigation
- [ ] Performance optimized for smooth animations on lower-end devices
- [ ] Fallback to standard navigation on devices without touch support

### Technical Requirements
- React Bootstrap Carousel with touch gesture support
- Responsive design that activates only on mobile breakpoints
- Integration with existing team data and shift calculations
- Performance optimization for smooth touch interactions
- Accessibility compliance with ARIA attributes

### Implementation
**Approach**: Create responsive carousel that activates on mobile breakpoints

### Files to Modify
- [ ] src/components/mobile/MobileTeamCarousel.tsx - New carousel component
- [ ] src/components/mobile/TeamCarouselItem.tsx - Individual team slide component
- [ ] src/components/TeamView.tsx - Integrate carousel for mobile breakpoints
- [ ] src/styles/mobile-carousel.scss - Mobile-specific styles and animations
- [ ] tests/components/mobile/MobileTeamCarousel.test.tsx - Comprehensive test suite

### Dependencies
- React Bootstrap Carousel
- CSS media queries for responsive behavior
- Existing team data and calculations
- Touch event handling

### Technical Details
- **Estimated Effort**: 5-6 hours
- **Complexity**: High
- **Priority**: low
- **Milestone**: v4.0.0

### Labels
`enhancement`, `todo-item`, `priority:low`, `feature:mobile`, `feature:carousel`, `effort:large`

---
*This issue was auto-generated from TODO.md item #10*
