import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '../../src/components/Header';

// Mock the custom hooks used by the Header component
vi.mock('../../src/hooks/useOnlineStatus', () => ({
    useOnlineStatus: vi.fn(),
}));

vi.mock('../../src/hooks/usePWAInstall', () => ({
    usePWAInstall: vi.fn(),
}));

vi.mock('../../src/hooks/useServiceWorkerStatus', () => ({
    useServiceWorkerStatus: vi.fn(),
    getServiceWorkerStatusText: vi.fn(),
}));

vi.mock('../../src/utils/config', () => ({
    CONFIG: {
        VERSION: '1.0.0',
    },
}));

// Mock react-bootstrap components
vi.mock('react-bootstrap', () => ({
    Badge: ({ bg, className, children }: any) => (
        <span className={`badge badge-${bg} ${className}`} data-testid="badge">
            {children}
        </span>
    ),
    Button: ({
        variant,
        size,
        onClick,
        children,
        'aria-label': ariaLabel,
    }: any) => (
        <button
            className={`btn btn-${variant} btn-${size}`}
            onClick={onClick}
            aria-label={ariaLabel}
            data-testid="button"
            type="button"
        >
            {children}
        </button>
    ),
    Modal: ({ show, onHide, children }: any) =>
        show ? (
            <div className="modal" data-testid="modal" onClick={onHide}>
                <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        ) : null,
    'Modal.Header': ({ closeButton, children }: any) => (
        <div className="modal-header" data-testid="modal-header">
            {children}
            {closeButton && (
                <button
                    className="btn-close"
                    data-testid="modal-close"
                    onClick={() => {}}
                    type="button"
                >
                    ×
                </button>
            )}
        </div>
    ),
    'Modal.Title': ({ children }: any) => (
        <h5 className="modal-title" data-testid="modal-title">
            {children}
        </h5>
    ),
    'Modal.Body': ({ children }: any) => (
        <div className="modal-body" data-testid="modal-body">
            {children}
        </div>
    ),
    'Modal.Footer': ({ children }: any) => (
        <div className="modal-footer" data-testid="modal-footer">
            {children}
        </div>
    ),
}));

// Import the mocked hooks
import { useOnlineStatus } from '../../src/hooks/useOnlineStatus';
import { usePWAInstall } from '../../src/hooks/usePWAInstall';
import {
    getServiceWorkerStatusText,
    useServiceWorkerStatus,
} from '../../src/hooks/useServiceWorkerStatus';

const mockUseOnlineStatus = vi.mocked(useOnlineStatus);
const mockUsePWAInstall = vi.mocked(usePWAInstall);
const mockUseServiceWorkerStatus = vi.mocked(useServiceWorkerStatus);
const mockGetServiceWorkerStatusText = vi.mocked(getServiceWorkerStatusText);

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Set default mock return values
        mockUseOnlineStatus.mockReturnValue(true);
        mockUsePWAInstall.mockReturnValue({
            isInstallable: false,
            promptInstall: vi.fn(),
        });
        mockUseServiceWorkerStatus.mockReturnValue('active');
        mockGetServiceWorkerStatusText.mockReturnValue(
            'Service Worker: Active',
        );
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Basic Rendering', () => {
        it('should render the header element with correct structure', () => {
            render(<Header />);

            const headerElement = screen.getByRole('banner');
            expect(headerElement).toBeInTheDocument();
            expect(headerElement).toHaveClass(
                'sticky-top',
                'bg-primary',
                'text-white',
                'py-2',
                'mb-3',
                'shadow-sm',
            );
        });

        it('should render the NextShift title', () => {
            render(<Header />);

            const title = screen.getByRole('heading', { name: 'NextShift' });
            expect(title).toBeInTheDocument();
            expect(title).toHaveClass('h4', 'mb-0');
        });

        it('should render the about button with correct aria-label', () => {
            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            expect(aboutButton).toBeInTheDocument();
            expect(aboutButton).toHaveTextContent('?');
        });
    });

    describe('Online Status Badge', () => {
        it('should show online badge when connected', () => {
            mockUseOnlineStatus.mockReturnValue(true);
            render(<Header />);

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveTextContent('Online');
            expect(badge).toHaveClass('badge-success', 'connection-online');
        });

        it('should show offline badge when disconnected', () => {
            mockUseOnlineStatus.mockReturnValue(false);
            render(<Header />);

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveTextContent('Offline');
            expect(badge).toHaveClass('badge-danger', 'connection-offline');
        });

        it('should update badge when online status changes', () => {
            mockUseOnlineStatus.mockReturnValue(true);
            const { rerender } = render(<Header />);

            let badge = screen.getByTestId('badge');
            expect(badge).toHaveTextContent('Online');

            // Simulate going offline
            mockUseOnlineStatus.mockReturnValue(false);
            rerender(<Header />);

            badge = screen.getByTestId('badge');
            expect(badge).toHaveTextContent('Offline');
        });
    });

    describe('PWA Install Button', () => {
        it('should show install button when PWA is installable', () => {
            const mockPromptInstall = vi.fn();
            mockUsePWAInstall.mockReturnValue({
                isInstallable: true,
                promptInstall: mockPromptInstall,
            });

            render(<Header />);

            const installButton = screen.getByRole('button', {
                name: 'Install NextShift App',
            });
            expect(installButton).toBeInTheDocument();
            expect(installButton).toHaveTextContent('📱 Install');
        });

        it('should not show install button when PWA is not installable', () => {
            mockUsePWAInstall.mockReturnValue({
                isInstallable: false,
                promptInstall: vi.fn(),
            });

            render(<Header />);

            const installButton = screen.queryByRole('button', {
                name: 'Install NextShift App',
            });
            expect(installButton).not.toBeInTheDocument();
        });

        it('should call promptInstall when install button is clicked', async () => {
            const user = userEvent.setup();
            const mockPromptInstall = vi.fn();
            mockUsePWAInstall.mockReturnValue({
                isInstallable: true,
                promptInstall: mockPromptInstall,
            });

            render(<Header />);

            const installButton = screen.getByRole('button', {
                name: 'Install NextShift App',
            });
            await user.click(installButton);

            expect(mockPromptInstall).toHaveBeenCalledTimes(1);
        });

        it('should handle install button styling correctly', () => {
            mockUsePWAInstall.mockReturnValue({
                isInstallable: true,
                promptInstall: vi.fn(),
            });

            render(<Header />);

            const installButton = screen.getByRole('button', {
                name: 'Install NextShift App',
            });
            expect(installButton).toHaveClass('btn-outline-light', 'btn-sm');
        });
    });

    describe('About Modal Functionality', () => {
        it('should open modal when about button is clicked', async () => {
            const user = userEvent.setup();
            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            const modal = screen.getByTestId('modal');
            expect(modal).toBeInTheDocument();
        });

        it('should display correct modal content', async () => {
            const user = userEvent.setup();
            mockGetServiceWorkerStatusText.mockReturnValue(
                'Service Worker: Active',
            );

            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            expect(screen.getByTestId('modal-title')).toHaveTextContent(
                'About NextShift',
            );
            expect(
                screen.getByText('NextShift - Team Shift Tracker'),
            ).toBeInTheDocument();
            expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
            expect(
                screen.getByText('Service Worker: Active'),
            ).toBeInTheDocument();
        });

        it('should display feature list in modal', async () => {
            const user = userEvent.setup();
            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            const features = [
                '5-team continuous (24/7) shift tracking',
                'Offline PWA functionality',
                'Transfer/handover detection',
                'YYWW.D date format (year.week.day)',
            ];

            features.forEach((feature) => {
                expect(screen.getByText(feature)).toBeInTheDocument();
            });
        });

        it('should display license and technology information', async () => {
            const user = userEvent.setup();
            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            expect(
                screen.getByText('Licensed under Apache 2.0'),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Built with React, TypeScript & React Bootstrap',
                ),
            ).toBeInTheDocument();
        });

        it('should close modal when close button is clicked', async () => {
            const user = userEvent.setup();
            render(<Header />);

            // Open modal
            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            expect(screen.getByTestId('modal')).toBeInTheDocument();

            // Close modal
            const closeButton = screen.getByRole('button', { name: 'Close' });
            await user.click(closeButton);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('should close modal when clicking outside modal content', async () => {
            const user = userEvent.setup();
            render(<Header />);

            // Open modal
            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            const modal = screen.getByTestId('modal');
            expect(modal).toBeInTheDocument();

            // Click on modal backdrop
            await user.click(modal);

            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });

        it('should not close modal when clicking on modal content', async () => {
            const user = userEvent.setup();
            render(<Header />);

            // Open modal
            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            const modalContent = screen.getByTestId('modal-body');
            await user.click(modalContent);

            // Modal should still be open
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });
    });

    describe('Service Worker Status Integration', () => {
        it('should display service worker status in modal', async () => {
            const user = userEvent.setup();
            mockUseServiceWorkerStatus.mockReturnValue('installing');
            mockGetServiceWorkerStatusText.mockReturnValue(
                'Service Worker: Installing',
            );

            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            expect(
                screen.getByText('Service Worker: Installing'),
            ).toBeInTheDocument();
        });

        it('should call getServiceWorkerStatusText with correct status', async () => {
            const user = userEvent.setup();
            const mockStatus = 'activated';
            mockUseServiceWorkerStatus.mockReturnValue(mockStatus);

            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            expect(mockGetServiceWorkerStatusText).toHaveBeenCalledWith(
                mockStatus,
            );
        });

        it('should handle different service worker states', async () => {
            const user = userEvent.setup();
            const states = [
                { status: 'installing', text: 'Service Worker: Installing' },
                { status: 'waiting', text: 'Service Worker: Waiting' },
                { status: 'active', text: 'Service Worker: Active' },
                { status: 'redundant', text: 'Service Worker: Redundant' },
            ];

            for (const state of states) {
                mockUseServiceWorkerStatus.mockReturnValue(state.status);
                mockGetServiceWorkerStatusText.mockReturnValue(state.text);

                const { rerender } = render(<Header />);

                const aboutButton = screen.getByRole('button', {
                    name: 'About NextShift',
                });
                await user.click(aboutButton);

                expect(screen.getByText(state.text)).toBeInTheDocument();

                // Close modal for next iteration
                const closeButton = screen.getByRole('button', {
                    name: 'Close',
                });
                await user.click(closeButton);

                rerender(<></>); // Clean up
            }
        });
    });

    describe('Accessibility Features', () => {
        it('should have proper ARIA labels for all interactive elements', () => {
            mockUsePWAInstall.mockReturnValue({
                isInstallable: true,
                promptInstall: vi.fn(),
            });

            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            expect(aboutButton).toHaveAttribute(
                'aria-label',
                'About NextShift',
            );

            const installButton = screen.getByRole('button', {
                name: 'Install NextShift App',
            });
            expect(installButton).toHaveAttribute(
                'aria-label',
                'Install NextShift App',
            );
        });

        it('should have proper heading hierarchy', () => {
            render(<Header />);

            const mainTitle = screen.getByRole('heading', { level: 1 });
            expect(mainTitle).toHaveTextContent('NextShift');
        });

        it('should support keyboard navigation', async () => {
            const user = userEvent.setup();
            mockUsePWAInstall.mockReturnValue({
                isInstallable: true,
                promptInstall: vi.fn(),
            });

            render(<Header />);

            // Tab through interactive elements
            await user.tab();
            const installButton = screen.getByRole('button', {
                name: 'Install NextShift App',
            });
            expect(installButton).toHaveFocus();

            await user.tab();
            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            expect(aboutButton).toHaveFocus();
        });

        it('should handle modal keyboard interactions', async () => {
            const user = userEvent.setup();
            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            aboutButton.focus();

            // Open modal with Enter key
            await user.keyboard('{Enter}');
            expect(screen.getByTestId('modal')).toBeInTheDocument();

            // Close modal with Escape key
            await user.keyboard('{Escape}');
            expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle hook errors gracefully', () => {
            mockUseOnlineStatus.mockImplementation(() => {
                throw new Error('Online status hook failed');
            });

            const consoleSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            expect(() => render(<Header />)).not.toThrow();

            consoleSpy.mockRestore();
        });

        it('should handle PWA install errors gracefully', async () => {
            const user = userEvent.setup();
            const mockPromptInstall = vi
                .fn()
                .mockRejectedValue(new Error('Install failed'));
            mockUsePWAInstall.mockReturnValue({
                isInstallable: true,
                promptInstall: mockPromptInstall,
            });

            render(<Header />);

            const installButton = screen.getByRole('button', {
                name: 'Install NextShift App',
            });

            // Should not throw when install fails
            await expect(user.click(installButton)).resolves.not.toThrow();
            expect(mockPromptInstall).toHaveBeenCalledTimes(1);
        });

        it('should handle missing CONFIG values', async () => {
            const user = userEvent.setup();
            vi.doMock('../../src/utils/config', () => ({
                CONFIG: {
                    VERSION: undefined,
                },
            }));

            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            // Should still render modal even with missing version
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('should handle rapid modal open/close operations', async () => {
            const user = userEvent.setup();
            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });

            // Rapidly open and close modal
            for (let i = 0; i < 5; i++) {
                await user.click(aboutButton);
                expect(screen.getByTestId('modal')).toBeInTheDocument();

                const closeButton = screen.getByRole('button', {
                    name: 'Close',
                });
                await user.click(closeButton);
                expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
            }
        });
    });

    describe('Performance Considerations', () => {
        it('should not re-render unnecessarily when hook values do not change', () => {
            const renderSpy = vi.fn();

            const TestWrapper = () => {
                renderSpy();
                return <Header />;
            };

            const { rerender } = render(<TestWrapper />);
            expect(renderSpy).toHaveBeenCalledTimes(1);

            // Re-render with same hook values
            rerender(<TestWrapper />);
            expect(renderSpy).toHaveBeenCalledTimes(1);
        });

        it('should handle multiple state updates efficiently', async () => {
            const user = userEvent.setup();
            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });

            // Multiple rapid interactions should be handled smoothly
            await user.click(aboutButton);
            await user.click(aboutButton);
            await user.click(aboutButton);

            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });
    });

    describe('Integration with External Dependencies', () => {
        it('should integrate properly with react-bootstrap components', () => {
            render(<Header />);

            const headerElement = screen.getByRole('banner');
            expect(headerElement).toHaveClass('container-fluid');

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveClass('badge');

            const buttons = screen.getAllByTestId('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('btn');
            });
        });

        it('should work with different service worker registration states', () => {
            const states = [
                'installing',
                'installed',
                'waiting',
                'active',
                'redundant',
            ];

            states.forEach((state) => {
                mockUseServiceWorkerStatus.mockReturnValue(state);
                mockGetServiceWorkerStatusText.mockReturnValue(
                    `Service Worker: ${state}`,
                );

                const { unmount } = render(<Header />);

                expect(mockUseServiceWorkerStatus).toHaveBeenCalled();

                unmount();
            });
        });

        it('should handle version information from config correctly', async () => {
            const user = userEvent.setup();
            vi.doMock('../../src/utils/config', () => ({
                CONFIG: {
                    VERSION: '2.1.0-beta',
                },
            }));

            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            expect(screen.getByText('Version 2.1.0-beta')).toBeInTheDocument();
        });
    });
});
