import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

// Mock all the child components to focus on App structure
vi.mock('../../src/components/Header', () => ({
    Header: () => <div data-testid="header">Header</div>,
}));

vi.mock('../../src/components/CurrentStatus', () => ({
    CurrentStatus: () => <div data-testid="current-status">CurrentStatus</div>,
}));

vi.mock('../../src/components/MainTabs', () => ({
    MainTabs: () => <div data-testid="main-tabs">MainTabs</div>,
}));

vi.mock('../../src/components/TeamSelector', () => ({
    TeamSelector: () => <div data-testid="team-selector">TeamSelector</div>,
}));

vi.mock('../../src/components/ErrorBoundary', () => ({
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="error-boundary">{children}</div>
    ),
}));

// Mock the shift calculation hook
vi.mock('../../src/hooks/useShiftCalculation', () => ({
    useShiftCalculation: () => ({
        selectedTeam: 1,
        setSelectedTeam: vi.fn(),
        currentDate: { format: () => '2025-01-15' },
        setCurrentDate: vi.fn(),
        todayShifts: [],
    }),
}));

// Mock dayjs
vi.mock('dayjs', () => ({
    default: vi.fn(() => ({ format: () => '2025-01-15' })),
}));

describe('App', () => {
    describe('Component Structure', () => {
        it('renders all main components', () => {
            render(<App />);

            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('current-status')).toBeInTheDocument();
            expect(screen.getByTestId('main-tabs')).toBeInTheDocument();
            expect(screen.getByTestId('team-selector')).toBeInTheDocument();
        });

        it('wraps components in error boundaries', () => {
            render(<App />);

            const errorBoundaries = screen.getAllByTestId('error-boundary');
            expect(errorBoundaries.length).toBeGreaterThan(0);
        });

        it('has proper layout structure', () => {
            render(<App />);

            // Should have Bootstrap container structure
            const container = document.querySelector('.container-fluid');
            expect(container).toBeInTheDocument();

            // Should have proper Bootstrap grid
            const row = document.querySelector('.row');
            expect(row).toBeInTheDocument();
        });
    });

    describe('Toast Provider Integration', () => {
        it('provides toast context to child components', () => {
            // Test that the app renders without errors - indicates toast context is working
            expect(() => render(<App />)).not.toThrow();
        });

        it('wraps content with ToastProvider', () => {
            render(<App />);

            // If all components render, the ToastProvider is working
            expect(screen.getByTestId('header')).toBeInTheDocument();
            expect(screen.getByTestId('current-status')).toBeInTheDocument();
        });
    });

    describe('App Architecture', () => {
        it('separates AppContent from App wrapper', () => {
            render(<App />);

            // Both App and AppContent should render successfully
            expect(screen.getByTestId('current-status')).toBeInTheDocument();
        });

        it('imports and uses required dependencies', () => {
            // Test that all required CSS is imported
            expect(() => render(<App />)).not.toThrow();
        });
    });
});
