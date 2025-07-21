import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
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
    currentShift: ShiftResult | null;
}

export function MainTabs({
    selectedTeam,
    currentDate,
    setCurrentDate,
    todayShifts,
    currentShift,
}: MainTabsProps) {
    const [activeKey, setActiveKey] = useState<string>('today');

    const handleTodayClick = () => {
        setCurrentDate(dayjs());
    };

    return (
        <div className="col-12">
            <Tab.Container
                activeKey={activeKey}
                onSelect={(k) => setActiveKey(k || 'today')}
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
                            currentShift={currentShift}
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
                        <TransferView
                            selectedTeam={selectedTeam}
                            currentDate={currentDate}
                        />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </div>
    );
}
