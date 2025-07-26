import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
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
        <Tabs
            activeKey={activeKey}
            onSelect={(k) => {
                const newKey = k || 'today';
                setActiveKey(newKey);
                onTabChange?.(newKey);
            }}
            id="mainTabs"
            className="mb-3"
        >
            <Tab
                eventKey="today"
                title={
                    <>
                        <i
                            className="bi bi-calendar-day me-1"
                            aria-hidden="true"
                        ></i>
                        Today
                    </>
                }
            >
                <TodayView
                    todayShifts={todayShifts}
                    selectedTeam={selectedTeam}
                    onTodayClick={handleTodayClick}
                />
            </Tab>

            <Tab
                eventKey="schedule"
                title={
                    <>
                        <i
                            className="bi bi-calendar-week me-1"
                            aria-hidden="true"
                        ></i>
                        Schedule
                    </>
                }
            >
                <ScheduleView
                    selectedTeam={selectedTeam}
                    currentDate={currentDate}
                    setCurrentDate={setCurrentDate}
                />
            </Tab>

            <Tab
                eventKey="transfer"
                title={
                    <>
                        <i
                            className="bi bi-arrow-left-right me-1"
                            aria-hidden="true"
                        ></i>
                        Transfers
                    </>
                }
            >
                <TransferView selectedTeam={selectedTeam} />
            </Tab>
        </Tabs>
    );
}
