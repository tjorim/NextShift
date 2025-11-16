import { useEffect, useState } from 'react';
import { CONFIG } from '../../utils/config';
import { dayjs } from '../../utils/dateTimeUtils';
import { getCurrentShiftDay } from '../../utils/shiftCalculations';
import TerminalHeader from './TerminalHeader';
import TerminalNextShift from './TerminalNextShift';
import TerminalTeamList from './TerminalTeamList';
import TerminalTransfers from './TerminalTransfers';
import '../../styles/terminal.css';

type TerminalViewType = 'today' | 'next-shift' | 'transfers';

interface TerminalViewProps {
    initialTeam?: number;
    onExitTerminal?: () => void;
}

export default function TerminalView({
    initialTeam = 1,
    onExitTerminal,
}: TerminalViewProps) {
    const [selectedTeam, setSelectedTeam] = useState<number>(initialTeam);
    const [currentDate, setCurrentDate] = useState(getCurrentShiftDay(dayjs()));
    const [view, setView] = useState<TerminalViewType>('today');
    const [currentTime, setCurrentTime] = useState(dayjs());

    // Sync selectedTeam with initialTeam prop changes (e.g., from localStorage)
    useEffect(() => {
        setSelectedTeam(initialTeam);
    }, [initialTeam]);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Exit terminal view with Escape or q
            if (e.key === 'Escape' || e.key === 'q') {
                e.preventDefault();
                onExitTerminal?.();
                return;
            }

            // Team selection with number keys (1 through CONFIG.TEAMS_COUNT)
            const teamNum = Number.parseInt(e.key, 10);
            if (
                e.key >= '1' &&
                e.key <= String(CONFIG.TEAMS_COUNT) &&
                !Number.isNaN(teamNum)
            ) {
                e.preventDefault();
                setSelectedTeam(teamNum);
            }

            // View navigation with Tab
            if (e.key === 'Tab') {
                e.preventDefault();
                setView((prev) => {
                    if (prev === 'today') return 'next-shift';
                    if (prev === 'next-shift') return 'transfers';
                    return 'today';
                });
            }

            // Date navigation (horizontal: left=past, right=future)
            if (e.key === 'j' || e.key === 'ArrowLeft') {
                e.preventDefault();
                setCurrentDate((prev) => prev.subtract(1, 'day'));
            }
            if (e.key === 'k' || e.key === 'ArrowRight') {
                e.preventDefault();
                setCurrentDate((prev) => prev.add(1, 'day'));
            }
            if (e.key === 't') {
                e.preventDefault();
                setCurrentDate(getCurrentShiftDay(dayjs()));
            }

            // Team navigation (vertical: up/down through team list)
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedTeam((prev) =>
                    prev > 1 ? prev - 1 : CONFIG.TEAMS_COUNT,
                );
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedTeam((prev) =>
                    prev < CONFIG.TEAMS_COUNT ? prev + 1 : 1,
                );
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onExitTerminal]);

    return (
        <div
            className="terminal-view"
            role="application"
            aria-label="Terminal interface for shift tracking"
        >
            <TerminalHeader currentTime={currentTime} />

            <div style={{ marginBottom: '1rem', textAlign: 'right' }}>
                <button
                    type="button"
                    onClick={onExitTerminal}
                    className="terminal-exit-button"
                    aria-label="Exit terminal view"
                >
                    [Exit Terminal]
                </button>
            </div>

            <div className="terminal-view-selector">
                <button
                    type="button"
                    onClick={() => setView('today')}
                    className={`view-item ${view === 'today' ? 'active' : ''}`}
                    aria-pressed={view === 'today'}
                >
                    [{view === 'today' ? '●' : '○'} Today]
                </button>
                <button
                    type="button"
                    onClick={() => setView('next-shift')}
                    className={`view-item ${view === 'next-shift' ? 'active' : ''}`}
                    aria-pressed={view === 'next-shift'}
                >
                    [{view === 'next-shift' ? '●' : '○'} Next Shift]
                </button>
                <button
                    type="button"
                    onClick={() => setView('transfers')}
                    className={`view-item ${view === 'transfers' ? 'active' : ''}`}
                    aria-pressed={view === 'transfers'}
                >
                    [{view === 'transfers' ? '●' : '○'} Transfers]
                </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <span className="terminal-text dim">Selected Team: </span>
                <span className="terminal-text bold cyan">
                    Team {selectedTeam}
                </span>
            </div>

            {view === 'today' && (
                <TerminalTeamList
                    date={currentDate}
                    selectedTeam={selectedTeam}
                    currentTime={currentTime}
                />
            )}

            {view === 'next-shift' && (
                <TerminalNextShift
                    selectedTeam={selectedTeam}
                    fromDate={currentDate}
                />
            )}

            {view === 'transfers' && (
                <TerminalTransfers
                    selectedTeam={selectedTeam}
                    fromDate={currentDate}
                />
            )}

            <div className="terminal-help">
                Keys: [1-{CONFIG.TEAMS_COUNT}] Select team | [↑↓] Switch team |
                [Tab] Change view | [j/k or ←→] ±1 day | [t] Today | [q/Esc]
                Exit
            </div>
        </div>
    );
}
