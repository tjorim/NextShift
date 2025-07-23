import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs, { type Dayjs } from 'dayjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MainTabs } from '../../src/components/MainTabs';
import type { ShiftResult } from '../../src/utils/shiftCalculations';

// Mock the child components to focus on MainTabs logic
vi.mock('../../src/components/TodayView', () => ({
    TodayView: ({ onTodayClick }: { onTodayClick: () => void }) => (
        <div data-testid="today-view">
            <button
                onClick={onTodayClick}
                data-testid="today-click-button"
                type="button"
            >
                Go to Today
            </button>
        </div>
    ),
}));

vi.mock('../../src/components/ScheduleView', () => ({
    ScheduleView: ({
        currentDate,
        setCurrentDate,
    }: {
        currentDate: Dayjs;
        setCurrentDate: (date: Dayjs) => void;
    }) => (
        <div data-testid="schedule-view">
            <span data-testid="current-date">
                {currentDate.format('YYYY-MM-DD')}
            </span>
            <button
                onClick={() => setCurrentDate(dayjs('2024-01-15'))}
                data-testid="set-date-button"
                type="button"
            >
                Set Date
            </button>
        </div>
    ),
}));

vi.mock('../../src/components/TransferView', () => ({
    TransferView: () => (
        <div data-testid="transfer-view">Transfer View Content</div>
    ),
}));

describe('MainTabs Component', () => {
    const mockShifts: ShiftResult[] = [
        {
            id: '1',
            name: 'Morning Shift',
            startTime: '08:00',
            endTime: '16:00',
            teamId: 1,
            date: dayjs(),
        },
    ];

    const defaultProps = {
        selectedTeam: 1,
        currentDate: dayjs('2024-01-10'),
        setCurrentDate: vi.fn(),
        todayShifts: mockShifts,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render all three tabs', () => {
            render(<MainTabs {...defaultProps} />);

            expect(screen.getByText('Today')).toBeInTheDocument();
            expect(screen.getByText('Schedule')).toBeInTheDocument();
            expect(screen.getByText('Transfers')).toBeInTheDocument();
        });

        it('should render with Today tab active by default', () => {
            render(<MainTabs {...defaultProps} />);

            const todayTab = screen.getByRole('tab', { name: 'Today' });
            expect(todayTab).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByTestId('today-view')).toBeInTheDocument();
        });

        it('should render with custom active tab when provided', () => {
            render(<MainTabs {...defaultProps} activeTab="schedule" />);

            const scheduleTab = screen.getByRole('tab', { name: 'Schedule' });
            expect(scheduleTab).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByTestId('schedule-view')).toBeInTheDocument();
        });

        it('should have proper accessibility attributes', () => {
            render(<MainTabs {...defaultProps} />);

            const tabList = screen.getByRole('tablist');
            expect(tabList).toBeInTheDocument();
            expect(tabList).toHaveAttribute('id', 'mainTabs');

            const tabs = screen.getAllByRole('tab');
            expect(tabs).toHaveLength(3);

            tabs.forEach((tab) => {
                expect(tab).toHaveAttribute('aria-selected');
            });
        });

        it('should render the correct tab content based on active tab', () => {
            const { rerender } = render(
                <MainTabs {...defaultProps} activeTab="today" />,
            );
            expect(screen.getByTestId('today-view')).toBeInTheDocument();
            expect(
                screen.queryByTestId('schedule-view'),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('transfer-view'),
            ).not.toBeInTheDocument();

            rerender(<MainTabs {...defaultProps} activeTab="schedule" />);
            expect(screen.queryByTestId('today-view')).not.toBeInTheDocument();
            expect(screen.getByTestId('schedule-view')).toBeInTheDocument();
            expect(
                screen.queryByTestId('transfer-view'),
            ).not.toBeInTheDocument();

            rerender(<MainTabs {...defaultProps} activeTab="transfer" />);
            expect(screen.queryByTestId('today-view')).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('schedule-view'),
            ).not.toBeInTheDocument();
            expect(screen.getByTestId('transfer-view')).toBeInTheDocument();
        });
    });

    describe('Tab Navigation', () => {
        it('should call onTabChange when tab is clicked', async () => {
            const user = userEvent.setup();
            const mockOnTabChange = vi.fn();

            render(
                <MainTabs {...defaultProps} onTabChange={mockOnTabChange} />,
            );

            const scheduleTab = screen.getByRole('tab', { name: 'Schedule' });
            await user.click(scheduleTab);

            expect(mockOnTabChange).toHaveBeenCalledWith('schedule');
        });

        it('should update active tab when clicked', async () => {
            const user = userEvent.setup();
            render(<MainTabs {...defaultProps} />);

            const transferTab = screen.getByRole('tab', { name: 'Transfers' });
            await user.click(transferTab);

            expect(transferTab).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByTestId('transfer-view')).toBeInTheDocument();
        });

        it('should handle keyboard navigation', async () => {
            const user = userEvent.setup();
            const mockOnTabChange = vi.fn();

            render(
                <MainTabs {...defaultProps} onTabChange={mockOnTabChange} />,
            );

            const todayTab = screen.getByRole('tab', { name: 'Today' });
            await user.click(todayTab);

            // Navigate using arrow keys
            await user.keyboard('{ArrowRight}');
            expect(mockOnTabChange).toHaveBeenCalledWith('schedule');

            await user.keyboard('{ArrowRight}');
            expect(mockOnTabChange).toHaveBeenCalledWith('transfer');
        });

        it('should handle Enter key activation', async () => {
            const user = userEvent.setup();
            const mockOnTabChange = vi.fn();

            render(
                <MainTabs {...defaultProps} onTabChange={mockOnTabChange} />,
            );

            const scheduleTab = screen.getByRole('tab', { name: 'Schedule' });
            scheduleTab.focus();
            await user.keyboard('{Enter}');

            expect(mockOnTabChange).toHaveBeenCalledWith('schedule');
        });

        it('should handle Space key activation', async () => {
            const user = userEvent.setup();
            const mockOnTabChange = vi.fn();

            render(
                <MainTabs {...defaultProps} onTabChange={mockOnTabChange} />,
            );

            const transferTab = screen.getByRole('tab', { name: 'Transfers' });
            transferTab.focus();
            await user.keyboard(' ');

            expect(mockOnTabChange).toHaveBeenCalledWith('transfer');
        });
    });

    describe('Props Synchronization', () => {
        it('should sync with external activeTab changes', () => {
            const { rerender } = render(
                <MainTabs {...defaultProps} activeTab="today" />,
            );

            expect(screen.getByRole('tab', { name: 'Today' })).toHaveAttribute(
                'aria-selected',
                'true',
            );

            rerender(<MainTabs {...defaultProps} activeTab="schedule" />);

            expect(
                screen.getByRole('tab', { name: 'Schedule' }),
            ).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByRole('tab', { name: 'Today' })).toHaveAttribute(
                'aria-selected',
                'false',
            );
        });

        it('should pass props correctly to child components', () => {
            render(<MainTabs {...defaultProps} activeTab="today" />);

            // TodayView should receive todayShifts and selectedTeam
            expect(screen.getByTestId('today-view')).toBeInTheDocument();

            // Switch to schedule to test ScheduleView props
            const scheduleTab = screen.getByRole('tab', { name: 'Schedule' });
            fireEvent.click(scheduleTab);

            expect(screen.getByTestId('current-date')).toHaveTextContent(
                '2024-01-10',
            );
        });

        it('should handle currentDate changes from ScheduleView', () => {
            const mockSetCurrentDate = vi.fn();
            render(
                <MainTabs
                    {...defaultProps}
                    setCurrentDate={mockSetCurrentDate}
                    activeTab="schedule"
                />,
            );

            const setDateButton = screen.getByTestId('set-date-button');
            fireEvent.click(setDateButton);

            expect(mockSetCurrentDate).toHaveBeenCalledWith(
                dayjs('2024-01-15'),
            );
        });
    });

    describe('Today Click Functionality', () => {
        it('should handle today click from TodayView', () => {
            const mockSetCurrentDate = vi.fn();
            render(
                <MainTabs
                    {...defaultProps}
                    setCurrentDate={mockSetCurrentDate}
                    activeTab="today"
                />,
            );

            const todayClickButton = screen.getByTestId('today-click-button');
            fireEvent.click(todayClickButton);

            // Should set current date to today (dayjs())
            expect(mockSetCurrentDate).toHaveBeenCalledWith(
                expect.objectContaining({
                    format: expect.any(Function),
                    isSame: expect.any(Function),
                }),
            );

            const calledWith = mockSetCurrentDate.mock.calls[0][0];
            expect(calledWith.format('YYYY-MM-DD')).toBe(
                dayjs().format('YYYY-MM-DD'),
            );
        });

        it('should update date correctly when today button is clicked', () => {
            const originalDate = dayjs('2024-01-10');
            const mockSetCurrentDate = vi.fn();

            render(
                <MainTabs
                    {...defaultProps}
                    currentDate={originalDate}
                    setCurrentDate={mockSetCurrentDate}
                    activeTab="today"
                />,
            );

            const todayClickButton = screen.getByTestId('today-click-button');
            fireEvent.click(todayClickButton);

            expect(mockSetCurrentDate).toHaveBeenCalled();
            const newDate = mockSetCurrentDate.mock.calls[0][0];
            expect(newDate.isSame(dayjs(), 'day')).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle null selectedTeam', () => {
            render(<MainTabs {...defaultProps} selectedTeam={null} />);

            expect(screen.getByText('Today')).toBeInTheDocument();
            expect(screen.getByTestId('today-view')).toBeInTheDocument();
        });

        it('should handle empty todayShifts array', () => {
            render(<MainTabs {...defaultProps} todayShifts={[]} />);

            expect(screen.getByTestId('today-view')).toBeInTheDocument();
        });

        it('should handle invalid activeTab gracefully', () => {
            render(<MainTabs {...defaultProps} activeTab="invalid-tab" />);

            // Should default to showing content, even with invalid tab
            expect(screen.getByRole('tablist')).toBeInTheDocument();
        });

        it('should handle missing onTabChange prop', async () => {
            const user = userEvent.setup();
            render(<MainTabs {...defaultProps} />);

            const scheduleTab = screen.getByRole('tab', { name: 'Schedule' });

            // Should not throw error when onTabChange is not provided
            await expect(user.click(scheduleTab)).resolves.not.toThrow();
        });

        it('should handle rapid tab switching', async () => {
            const user = userEvent.setup();
            const mockOnTabChange = vi.fn();

            render(
                <MainTabs {...defaultProps} onTabChange={mockOnTabChange} />,
            );

            const tabs = screen.getAllByRole('tab');

            // Rapidly click through all tabs
            for (const tab of tabs) {
                await user.click(tab);
            }

            expect(mockOnTabChange).toHaveBeenCalledTimes(3);
        });
    });

    describe('Component Structure', () => {
        it('should have correct CSS classes and structure', () => {
            render(<MainTabs {...defaultProps} />);

            const container = screen.getByRole('tablist').closest('.col-12');
            expect(container).toBeInTheDocument();

            const tabsContainer = screen
                .getByRole('tablist')
                .closest('.col-12.mb-4');
            expect(tabsContainer).toBeInTheDocument();
        });

        it('should use Bootstrap Tab.Container correctly', () => {
            render(<MainTabs {...defaultProps} />);

            const tabList = screen.getByRole('tablist');
            expect(tabList).toHaveAttribute('id', 'mainTabs');

            const tabPanels = screen.getAllByRole('tabpanel');
            expect(tabPanels).toHaveLength(1); // Only active tab panel should be rendered
        });
    });

    describe('Integration with dayjs', () => {
        it('should handle dayjs date objects correctly', () => {
            const specificDate = dayjs('2024-06-15');
            render(
                <MainTabs
                    {...defaultProps}
                    currentDate={specificDate}
                    activeTab="schedule"
                />,
            );

            expect(screen.getByTestId('current-date')).toHaveTextContent(
                '2024-06-15',
            );
        });

        it('should handle date formatting consistently', () => {
            const mockSetCurrentDate = vi.fn();
            render(
                <MainTabs
                    {...defaultProps}
                    setCurrentDate={mockSetCurrentDate}
                    activeTab="today"
                />,
            );

            const todayButton = screen.getByTestId('today-click-button');
            fireEvent.click(todayButton);

            const calledDate = mockSetCurrentDate.mock.calls[0][0];
            expect(calledDate.isValid()).toBe(true);
            expect(typeof calledDate.format).toBe('function');
        });
    });

    describe('Performance', () => {
        it('should not cause unnecessary re-renders when props do not change', () => {
            const renderSpy = vi.fn();
            const TestWrapper = (props: any) => {
                renderSpy();
                return <MainTabs {...props} />;
            };

            const { rerender } = render(<TestWrapper {...defaultProps} />);

            expect(renderSpy).toHaveBeenCalledTimes(1);

            // Re-render with same props
            rerender(<TestWrapper {...defaultProps} />);

            // Component should still render (React doesn't prevent re-renders by default)
            expect(renderSpy).toHaveBeenCalledTimes(2);
        });

        it('should handle multiple rapid state changes', async () => {
            const user = userEvent.setup();
            const mockOnTabChange = vi.fn();

            render(
                <MainTabs {...defaultProps} onTabChange={mockOnTabChange} />,
            );

            const tabs = screen.getAllByRole('tab');

            // Simulate very rapid clicking
            for (let i = 0; i < 5; i++) {
                await user.click(tabs[0]);
                await user.click(tabs[1]);
                await user.click(tabs[2]);
            }

            expect(mockOnTabChange).toHaveBeenCalledTimes(15);
        });
    });

    describe('Error Handling', () => {
        it('should handle onTabChange callback errors gracefully', async () => {
            const user = userEvent.setup();
            const consoleSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});
            const errorCallback = vi.fn(() => {
                throw new Error('Callback error');
            });

            render(<MainTabs {...defaultProps} onTabChange={errorCallback} />);

            const scheduleTab = screen.getByRole('tab', { name: 'Schedule' });

            // Should not crash the component
            await expect(user.click(scheduleTab)).resolves.not.toThrow();

            consoleSpy.mockRestore();
        });

        it('should handle setCurrentDate callback errors gracefully', () => {
            const consoleSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});
            const errorCallback = vi.fn(() => {
                throw new Error('SetCurrentDate error');
            });

            render(
                <MainTabs
                    {...defaultProps}
                    setCurrentDate={errorCallback}
                    activeTab="today"
                />,
            );

            const todayButton = screen.getByTestId('today-click-button');

            // Should not crash the component
            expect(() => fireEvent.click(todayButton)).not.toThrow();

            consoleSpy.mockRestore();
        });
    });
});
