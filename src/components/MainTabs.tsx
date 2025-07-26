import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import type { ShiftResult } from '../utils/shiftCalculations';
import { ScheduleView } from './ScheduleView';
import { TodayView } from './TodayView';
import { TransferView } from './TransferView';

interface MainTabsProps {
    selectedTeam: number | null;
    currentDate: Dayjs;
    setCurrentDate: (date: Dayjs) => void;
    todayShifts: ShiftResult[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

/**
 * Displays a tabbed interface for viewing today's shifts, the team schedule, or transfer information.
 *
 * Supports both internal and external control of the active tab, and notifies when the tab changes. Each tab presents a different view relevant to the selected team and date.
 *
 * @param selectedTeam - The currently selected team number or null
 * @param currentDate - The current date being viewed
 * @param setCurrentDate - Function to update the current date
 * @param todayShifts - Array of shift results for today
 * @param activeTab - The currently active tab (defaults to 'today')
 * @param onTabChange - Callback invoked when the active tab changes
 * @returns The rendered tabbed interface component.
 */
export function MainTabs({
    selectedTeam,
    currentDate,
    setCurrentDate,
    todayShifts,
    activeTab = 'today',
    onTabChange,
}: MainTabsProps) {
    const [activeKey, setActiveKey] = useState<string>(activeTab);

    // Sync with external tab changes
    useEffect(() => {
        setActiveKey(activeTab);
    }, [activeTab]);

    const handleTodayClick = () => {
        setCurrentDate(dayjs());
    };

    return (
        <Tab.Container
            activeKey={activeKey}
            onSelect={(k) => {
                const newKey = k || 'today';
                setActiveKey(newKey);
                onTabChange?.(newKey);
            }}
        >
            {/* Navigation Tabs */}
            <Nav variant="tabs" className="mb-4" id="mainTabs">
                <Nav.Item>
                    <Nav.Link eventKey="today">
                        <i className="bi bi-calendar-day me-1"></i>
                        Today
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="schedule">
                        <i className="bi bi-calendar-week me-1"></i>
                        Schedule
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="transfer">
                        <i className="bi bi-arrow-left-right me-1"></i>
                        Transfers
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            {/* Tab Content */}
            <Tab.Content>
                <Tab.Pane eventKey="today">
                    <TodayView
                        todayShifts={todayShifts}
                        selectedTeam={selectedTeam}
                        onTodayClick={handleTodayClick}
                    />
                </Tab.Pane>

                <Tab.Pane eventKey="schedule">
                    <ScheduleView
                        selectedTeam={selectedTeam}
                        currentDate={currentDate}
                        setCurrentDate={setCurrentDate}
                    />
                </Tab.Pane>

                <Tab.Pane eventKey="transfer">
                    <TransferView selectedTeam={selectedTeam} />
                </Tab.Pane>
            </Tab.Content>
        </Tab.Container>
    );
}
