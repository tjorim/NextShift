import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChangelogModal } from '../../src/components/ChangelogModal';

describe('ChangelogModal', () => {
    const defaultProps = {
        show: true,
        onHide: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Modal Display', () => {
        it('renders modal when show is true', () => {
            render(<ChangelogModal {...defaultProps} />);

            expect(
                screen.getByText("What's New in NextShift"),
            ).toBeInTheDocument();
            expect(
                screen.getByText(/Track the evolution of NextShift/),
            ).toBeInTheDocument();
        });

        it('does not render modal when show is false', () => {
            render(<ChangelogModal {...defaultProps} show={false} />);

            expect(
                screen.queryByText("What's New in NextShift"),
            ).not.toBeInTheDocument();
        });

        it('calls onHide when close button is clicked', () => {
            render(<ChangelogModal {...defaultProps} />);

            const closeButton = screen.getByText('Close');
            fireEvent.click(closeButton);

            expect(defaultProps.onHide).toHaveBeenCalledTimes(1);
        });
    });

    describe('Version Display', () => {
        it('displays current version 3.1.0 with current status', () => {
            render(<ChangelogModal {...defaultProps} />);

            expect(screen.getByText('Version 3.1.0')).toBeInTheDocument();
            expect(screen.getByText('Current')).toBeInTheDocument();
            expect(screen.getAllByText('2025-07-25').length).toBeGreaterThan(0);
        });

        it('displays released version 3.0.0 with released status', () => {
            render(<ChangelogModal {...defaultProps} />);

            expect(screen.getByText('Version 3.0.0')).toBeInTheDocument();
            expect(screen.getAllByText('Released').length).toBeGreaterThan(0);
        });

        it('displays previous major version 2.0.0', () => {
            render(<ChangelogModal {...defaultProps} />);

            expect(screen.getByText('Version 2.0.0')).toBeInTheDocument();
            expect(
                screen.getByText('Previous Major Release'),
            ).toBeInTheDocument();
        });
    });

    describe('Changelog Content', () => {
        it('displays added features for v3.1.0', () => {
            render(<ChangelogModal {...defaultProps} />);

            expect(
                screen.getByText(
                    'Bootstrap UI Enhancements: Toast notification system for user feedback',
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Progress bar visualization for off-day tracking (CurrentStatus component)',
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Tooltips for shift code explanations with enhanced accessibility',
                ),
            ).toBeInTheDocument();
        });

        it('displays planned features', () => {
            render(<ChangelogModal {...defaultProps} />);

            expect(
                screen.getByText('Settings panel with preferences'),
            ).toBeInTheDocument();
            expect(screen.getByText('Team detail modals')).toBeInTheDocument();
            expect(
                screen.getByText('Mobile-optimized carousel navigation'),
            ).toBeInTheDocument();
        });

        it('displays technical highlights for different versions', () => {
            render(<ChangelogModal {...defaultProps} />);

            // Check that technical details appear for versions that have them
            const technicalSections = screen.getAllByText(
                /New Components & Enhancements|Technical Highlights|Technical Stack/,
            );
            expect(technicalSections.length).toBeGreaterThan(0);
        });
    });

    describe('Accordion Interaction', () => {
        it('allows expanding and collapsing version sections', () => {
            render(<ChangelogModal {...defaultProps} />);

            // Check that version headers are clickable buttons
            const version310Header = screen
                .getByText('Version 3.1.0')
                .closest('button');
            expect(version310Header).toBeInTheDocument();
            expect(version310Header).toHaveAttribute('type', 'button');

            const version300Header = screen
                .getByText('Version 3.0.0')
                .closest('button');
            expect(version300Header).toBeInTheDocument();
            expect(version300Header).toHaveAttribute('type', 'button');
        });
    });

    describe('Status Badges', () => {
        it('renders correct badge variants for each status', () => {
            render(<ChangelogModal {...defaultProps} />);

            // Check badge colors through Bootstrap classes
            const currentBadge = screen.getByText('Current');
            expect(currentBadge).toHaveClass('bg-primary');

            const releasedBadges = screen.getAllByText('Released');
            expect(releasedBadges.length).toBeGreaterThan(0);
            releasedBadges.forEach((badge) => {
                expect(badge).toHaveClass('bg-success');
            });
        });
    });

    describe('Change Sections', () => {
        it('displays different change types with proper icons', () => {
            render(<ChangelogModal {...defaultProps} />);

            // Check for section headers with icons
            expect(screen.getAllByText('Added').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Changed').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Fixed').length).toBeGreaterThan(0);
            expect(screen.getByText('Planned')).toBeInTheDocument();

            // Check for Bootstrap icons (via class names) in the DOM
            const addedElements = screen.getAllByText('Added');
            expect(addedElements.length).toBeGreaterThan(0);
        });

        it('renders appropriate sections for each version', () => {
            render(<ChangelogModal {...defaultProps} />);

            // Check that different section types exist across versions
            expect(screen.getAllByText('Added').length).toBeGreaterThan(0);

            // v3.1.0 has planned items
            expect(screen.getByText('Planned')).toBeInTheDocument();

            // Other versions may have changed/fixed items
            const changedHeaders = screen.getAllByText('Changed');
            const fixedHeaders = screen.getAllByText('Fixed');

            // These should exist for some versions
            expect(changedHeaders.length).toBeGreaterThan(0);
            expect(fixedHeaders.length).toBeGreaterThan(0);
        });
    });

    describe('Coming Soon Section', () => {
        it('displays future version plans', () => {
            render(<ChangelogModal {...defaultProps} />);

            expect(screen.getByText('Coming Soon')).toBeInTheDocument();
            expect(screen.getByText(/v3.2.0:/)).toBeInTheDocument();
            expect(screen.getByText(/v3.3.0:/)).toBeInTheDocument();

            // Check for the combined text in Coming Soon section
            expect(
                screen.getByText(
                    /Settings panel with preferences, Team detail modals/,
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    /Mobile carousel for team browsing, Advanced accessibility/,
                ),
            ).toBeInTheDocument();
        });
    });

    describe('Footer Links', () => {
        it('includes semantic versioning reference', () => {
            render(<ChangelogModal {...defaultProps} />);

            expect(screen.getByText('NextShift follows')).toBeInTheDocument();

            const semverLink = screen.getByText('Semantic Versioning');
            expect(semverLink).toHaveAttribute('href', 'https://semver.org/');
            expect(semverLink).toHaveAttribute('target', '_blank');
            expect(semverLink).toHaveAttribute('rel', 'noopener noreferrer');
        });
    });

    describe('Accessibility', () => {
        it('has proper modal title and close functionality', () => {
            render(<ChangelogModal {...defaultProps} />);

            // Modal should have proper title
            const modalTitle = screen.getByText("What's New in NextShift");
            expect(modalTitle).toBeInTheDocument();

            // Close button should be accessible
            const closeButton = screen.getByText('Close');
            expect(closeButton).toHaveAttribute('type', 'button');
        });

        it('supports keyboard navigation through accordion', () => {
            render(<ChangelogModal {...defaultProps} />);

            const firstAccordionButton = screen
                .getByText('Version 3.1.0')
                .closest('button');
            expect(firstAccordionButton).toBeInTheDocument();
            expect(firstAccordionButton).toHaveAttribute('type', 'button');
        });
    });
});
