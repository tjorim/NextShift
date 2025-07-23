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
        <div className="col-12">
            <Tab.Container
                activeKey={activeKey}
                onSelect={(k) => {
                    const newKey = k || 'today';
                    setActiveKey(newKey);
                    onTabChange?.(newKey);
                }}
            >
                {/* Navigation Tabs */}
                <div className="col-12 mb-4">
                    <Nav variant="tabs" id="mainTabs">
                        <Nav.Item>
                            <Nav.Link eventKey="today">Today</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="schedule">Schedule</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="transfer">Transfers</Nav.Link>
                        </Nav.Item>
                    </Nav>
                </div>

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
        </div>
    );
}
