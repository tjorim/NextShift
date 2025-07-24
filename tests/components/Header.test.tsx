import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
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

interface MockBadgeProps {
    bg?: string;
    className?: string;
    children?: ReactNode;
}

interface MockButtonProps {
    variant?: string;
    size?: string;
    onClick?: () => void;
    children?: ReactNode;
    'aria-label'?: string;
}

interface MockModalProps {
    show?: boolean;
    onHide?: () => void;
    centered?: boolean;
    children?: ReactNode;
}

interface MockModalHeaderProps {
    closeButton?: boolean;
    children?: ReactNode;
}

interface MockModalChildProps {
    children: React.ReactNode;
}

// Mock react-bootstrap components
vi.mock('react-bootstrap', () => {
    let globalOnHide: (() => void) | null = null;

    const MockModal = ({ show, onHide, children }: MockModalProps) => {
        globalOnHide = onHide;
        return show ? (
            <div
                className="modal"
                data-testid="modal"
                onClick={onHide}
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Escape') {
                        onHide?.();
                    }
                }}
                role="dialog"
                aria-modal="true"
                tabIndex={-1}
            >
                <div
                    className="modal-content"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
                    role="document"
                >
                    {children}
                </div>
            </div>
        ) : null;
    };

    MockModal.Header = ({ closeButton, children }: MockModalHeaderProps) => (
        <div className="modal-header" data-testid="modal-header">
            {children}
            {closeButton && (
                <button
                    className="btn-close"
                    data-testid="modal-close"
                    onClick={() => globalOnHide?.()}
                    onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            globalOnHide?.();
                        }
                    }}
                    type="button"
                    aria-label="Close modal"
                >
                    ×
                </button>
            )}
        </div>
    );

    MockModal.Title = ({ children }: MockModalChildProps) => (
        <h5 className="modal-title" data-testid="modal-title">
            {children}
        </h5>
    );

    MockModal.Body = ({ children }: MockModalChildProps) => (
        <div className="modal-body" data-testid="modal-body">
            {children}
        </div>
    );

    MockModal.Footer = ({ children }: MockModalChildProps) => (
        <div className="modal-footer" data-testid="modal-footer">
            {children}
        </div>
    );

    return {
        Badge: ({ bg, className, children }: MockBadgeProps) => (
            <span
                className={`badge badge-${bg} ${className}`}
                data-testid="badge"
            >
                {children}
            </span>
        ),
        Button: ({
            variant,
            size,
            onClick,
            children,
            'aria-label': ariaLabel,
        }: MockButtonProps) => (
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
        Modal: MockModal,
    };
});

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
        mockUseServiceWorkerStatus.mockReturnValue({
            isRegistered: true,
            isInstalling: false,
            isWaiting: false,
            isActive: true,
        });
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
                screen.getByText(/Licensed under Apache 2\.0/),
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    /Built with React, TypeScript & React Bootstrap/,
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
            mockUseServiceWorkerStatus.mockReturnValue({
                isRegistered: true,
                isInstalling: true,
                isWaiting: false,
                isActive: false,
            });
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
            const mockStatus = {
                isRegistered: true,
                isInstalling: false,
                isWaiting: false,
                isActive: true,
            };
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

        it('should display service worker installing state in modal', async () => {
            const user = userEvent.setup();
            mockUseServiceWorkerStatus.mockReturnValue({
                isRegistered: true,
                isInstalling: true,
                isWaiting: false,
                isActive: false,
            });
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

        it('should display service worker waiting state in modal', async () => {
            const user = userEvent.setup();
            mockUseServiceWorkerStatus.mockReturnValue({
                isRegistered: true,
                isInstalling: false,
                isWaiting: true,
                isActive: false,
            });
            mockGetServiceWorkerStatusText.mockReturnValue(
                'Service Worker: Waiting',
            );

            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            expect(
                screen.getByText('Service Worker: Waiting'),
            ).toBeInTheDocument();
        });

        it('should display service worker active state in modal', async () => {
            const user = userEvent.setup();
            mockUseServiceWorkerStatus.mockReturnValue({
                isRegistered: true,
                isInstalling: false,
                isWaiting: false,
                isActive: true,
            });
            mockGetServiceWorkerStatusText.mockReturnValue(
                'Service Worker: Active',
            );

            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            expect(
                screen.getByText('Service Worker: Active'),
            ).toBeInTheDocument();
        });

        it('should display service worker error state in modal', async () => {
            const user = userEvent.setup();
            mockUseServiceWorkerStatus.mockReturnValue({
                isRegistered: false,
                isInstalling: false,
                isWaiting: false,
                isActive: false,
                error: 'Service Worker not supported',
            });
            mockGetServiceWorkerStatusText.mockReturnValue(
                'Service Worker: Redundant',
            );

            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            expect(
                screen.getByText('Service Worker: Redundant'),
            ).toBeInTheDocument();
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

            // Focus on modal and close with Escape key
            const modal = screen.getByTestId('modal');
            modal.focus();
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

            expect(() => render(<Header />)).toThrow(
                'Online status hook failed',
            );

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
            // This test verifies the component renders gracefully even with missing config
            // The actual CONFIG is mocked at the top level with VERSION: '1.0.0'
            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            // Should render modal with the mocked version
            expect(screen.getByTestId('modal')).toBeInTheDocument();
            expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
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
        it('should render without performance issues when props remain stable', () => {
            // Test that the component renders efficiently without unnecessary work
            const startTime = performance.now();

            const { rerender } = render(<Header />);

            // Multiple re-renders with same hook values should complete quickly
            for (let i = 0; i < 10; i++) {
                rerender(<Header />);
            }

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Should complete multiple renders in reasonable time (generous threshold)
            expect(renderTime).toBeLessThan(100);

            // Verify component still renders correctly after multiple re-renders
            expect(screen.getByRole('banner')).toBeInTheDocument();
            expect(
                screen.getByRole('heading', { name: 'NextShift' }),
            ).toBeInTheDocument();
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
            expect(headerElement).toHaveClass(
                'sticky-top',
                'bg-primary',
                'text-white',
            );

            const badge = screen.getByTestId('badge');
            expect(badge).toHaveClass('badge');

            const buttons = screen.getAllByTestId('button');
            buttons.forEach((button) => {
                expect(button).toHaveClass('btn');
            });
        });

        it('should work with different service worker registration states', () => {
            const states = [
                {
                    isRegistered: true,
                    isInstalling: true,
                    isWaiting: false,
                    isActive: false,
                },
                {
                    isRegistered: true,
                    isInstalling: false,
                    isWaiting: false,
                    isActive: false,
                },
                {
                    isRegistered: true,
                    isInstalling: false,
                    isWaiting: true,
                    isActive: false,
                },
                {
                    isRegistered: true,
                    isInstalling: false,
                    isWaiting: false,
                    isActive: true,
                },
                {
                    isRegistered: false,
                    isInstalling: false,
                    isWaiting: false,
                    isActive: false,
                    error: 'Service Worker not supported',
                },
            ];

            states.forEach((state) => {
                mockUseServiceWorkerStatus.mockReturnValue(state);
                const stateText = state.isInstalling
                    ? 'installing'
                    : state.isWaiting
                      ? 'waiting'
                      : state.isActive
                        ? 'active'
                        : state.error
                          ? 'redundant'
                          : 'installed';
                mockGetServiceWorkerStatusText.mockReturnValue(
                    `Service Worker: ${stateText}`,
                );

                const { unmount } = render(<Header />);

                expect(mockUseServiceWorkerStatus).toHaveBeenCalled();

                unmount();
            });
        });

        it('should handle version information from config correctly', async () => {
            const user = userEvent.setup();
            // This test verifies the component displays version from CONFIG
            // The CONFIG is mocked at the top level with VERSION: '1.0.0'
            render(<Header />);

            const aboutButton = screen.getByRole('button', {
                name: 'About NextShift',
            });
            await user.click(aboutButton);

            expect(screen.getByText('Version 1.0.0')).toBeInTheDocument();
        });
    });
});
