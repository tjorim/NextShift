import type { Dayjs } from 'dayjs';
import { useEffect, useId, useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { dayjs } from '../utils/dateTimeUtils';
import type { ShiftResult } from '../utils/shiftCalculations';
import { ScheduleView } from './ScheduleView';
import { TeamDetailModal } from './TeamDetailModal';
import { TodayView } from './TodayView';
import { TransferView } from './TransferView';

interface MainTabsProps {
    myTeam: number | null; // The user's team from onboarding
    currentDate: Dayjs;
    setCurrentDate: (date: Dayjs) => void;
    todayShifts: ShiftResult[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    onSettingsToggle?: () => void;
    onTeamSelect?: () => void;
}

/**
 * Displays a tabbed interface for viewing today's shifts, the team schedule, or transfer information.
 *
 * Supports both internal and external control of the active tab, and notifies when the tab changes. Each tab presents a different view relevant to the user's team and date.
 *
 * @param myTeam - The user's team number from onboarding or null
 * @param currentDate - The current date being viewed
 * @param setCurrentDate - Function to update the current date
 * @param todayShifts - Array of shift results for today
 * @param activeTab - The currently active tab (defaults to 'today')
 * @param onTabChange - Callback invoked when the active tab changes
 * @param onSettingsToggle - Optional callback to toggle the settings panel
 * @param onTeamSelect - Optional callback to open team selection dialog
 * @returns The rendered tabbed interface component.
 */
export function MainTabs({
    myTeam,
    currentDate,
    setCurrentDate,
    todayShifts,
    activeTab = 'today',
    onTabChange,
    onSettingsToggle,
    onTeamSelect,
}: MainTabsProps) {
    const tabsId = useId();
    const [activeKey, setActiveKey] = useState<string>(activeTab);
    const [showTeamDetail, setShowTeamDetail] = useState(false);
    const [selectedTeamForDetail, setSelectedTeamForDetail] =
        useState<number>(1);
    const [transferTargetTeam, setTransferTargetTeam] = useState<number | null>(
        null,
    );

    // Sync with external tab changes
    useEffect(() => {
        setActiveKey(activeTab);
    }, [activeTab]);

    const handleTodayClick = () => {
        setCurrentDate(dayjs());
    };

    const handleTeamClick = (teamNumber: number) => {
        setSelectedTeamForDetail(teamNumber);
        setShowTeamDetail(true);
    };

    const handleCloseTeamDetail = () => {
        setShowTeamDetail(false);
    };

    // Keyboard shortcuts for tab navigation and actions
    useKeyboardShortcuts({
        onTabToday: () => {
            setActiveKey('today');
            onTabChange?.('today');
        },
        onTabSchedule: () => {
            setActiveKey('schedule');
            onTabChange?.('schedule');
        },
        onTabTransfer: () => {
            setActiveKey('transfer');
            onTabChange?.('transfer');
        },
        onSettings: () => {
            onSettingsToggle?.();
        },
        onToday: handleTodayClick,
        onTeamSelect: () => {
            onTeamSelect?.();
        },
    });

    return (
        <>
            <Tabs
                activeKey={activeKey}
                onSelect={(k) => {
                    const newKey = k || 'today';
                    setActiveKey(newKey);
                    onTabChange?.(newKey);
                }}
                id={tabsId}
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
                        myTeam={myTeam}
                        onTodayClick={handleTodayClick}
                        onTeamClick={handleTeamClick}
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
                        myTeam={myTeam}
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
                    <TransferView
                        myTeam={myTeam}
                        initialOtherTeam={transferTargetTeam}
                    />
                </Tab>
            </Tabs>

            {/* Team Detail Modal */}
            <TeamDetailModal
                show={showTeamDetail}
                onHide={handleCloseTeamDetail}
                teamNumber={selectedTeamForDetail}
                onViewTransfers={(team) => {
                    setActiveKey('transfer');
                    onTabChange?.('transfer');
                    // Only set initial other team if it's different from user's team
                    if (team !== myTeam) {
                        setTransferTargetTeam(team);
                    }
                    // Close the modal after navigation
                    setShowTeamDetail(false);
                }}
            />
        </>
    );
}
