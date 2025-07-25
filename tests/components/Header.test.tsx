import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '../../src/components/Header';

// Mock the hooks
vi.mock('../../src/hooks/useOnlineStatus', () => ({
    useOnlineStatus: vi.fn(() => true),
}));

vi.mock('../../src/hooks/usePWAInstall', () => ({
    usePWAInstall: vi.fn(() => ({
        isInstallable: false,
        promptInstall: vi.fn(),
    })),
}));

vi.mock('../../src/hooks/useServiceWorkerStatus', () => ({
    useServiceWorkerStatus: vi.fn(() => 'active'),
    getServiceWorkerStatusText: vi.fn(() => 'Service Worker is active'),
}));

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

beforeEach(() => {
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
    mockGetServiceWorkerStatusText.mockReturnValue('Service Worker is active');
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('Header', () => {
    describe('Basic rendering', () => {
        it('renders NextShift title', () => {
            render(<Header />);
            expect(screen.getByText('NextShift')).toBeInTheDocument();
        });

        it('renders About button', () => {
            render(<Header />);
            expect(
                screen.getByLabelText('About NextShift'),
            ).toBeInTheDocument();
        });
    });

    describe('Online status', () => {
        it('shows online badge when online', () => {
            mockUseOnlineStatus.mockReturnValue(true);
            render(<Header />);
            expect(screen.getByText('Online')).toBeInTheDocument();
        });

        it('shows offline badge when offline', () => {
            mockUseOnlineStatus.mockReturnValue(false);
            render(<Header />);
            expect(screen.getByText('Offline')).toBeInTheDocument();
        });
    });

    describe('PWA install', () => {
        it('shows install button when installable', () => {
            const mockPromptInstall = vi.fn();
            mockUsePWAInstall.mockReturnValue({
                isInstallable: true,
                promptInstall: mockPromptInstall,
            });

            render(<Header />);
            expect(screen.getByText('📱 Install')).toBeInTheDocument();
        });

        it('does not show install button when not installable', () => {
            mockUsePWAInstall.mockReturnValue({
                isInstallable: false,
                promptInstall: vi.fn(),
            });

            render(<Header />);
            expect(screen.queryByText('📱 Install')).not.toBeInTheDocument();
        });
    });

    describe('About modal', () => {
        it('opens and closes about modal', async () => {
            const user = userEvent.setup();
            render(<Header />);

            const aboutButton = screen.getByLabelText('About NextShift');
            await user.click(aboutButton);

            // Modal should be open
            expect(screen.getByText('About NextShift')).toBeInTheDocument();

            const closeButton = screen.getByText('Close');
            await user.click(closeButton);

            // Modal should be closed
            expect(
                screen.queryByText('About NextShift'),
            ).not.toBeInTheDocument();
        });
    });
});
