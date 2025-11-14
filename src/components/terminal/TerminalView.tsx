import { useState, useEffect } from 'react';
import { dayjs } from '../../utils/dateTimeUtils';
import TerminalHeader from './TerminalHeader';
import TerminalTeamList from './TerminalTeamList';
import TerminalNextShift from './TerminalNextShift';
import TerminalTransfers from './TerminalTransfers';
import '../../styles/terminal.css';

type TerminalViewType = 'today' | 'next-shift' | 'transfers';

interface TerminalViewProps {
	initialTeam?: number;
}

export default function TerminalView({ initialTeam = 1 }: TerminalViewProps) {
	const [selectedTeam, setSelectedTeam] = useState<number>(initialTeam);
	const [currentDate, setCurrentDate] = useState(dayjs());
	const [view, setView] = useState<TerminalViewType>('today');
	const [currentTime, setCurrentTime] = useState(dayjs());

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
			// Team selection with number keys
			if (e.key >= '1' && e.key <= '5') {
				e.preventDefault();
				setSelectedTeam(Number.parseInt(e.key, 10));
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

			// Date navigation
			if (e.key === 'j' || e.key === 'ArrowDown') {
				e.preventDefault();
				setCurrentDate((prev) => prev.subtract(1, 'day'));
			}
			if (e.key === 'k' || e.key === 'ArrowUp') {
				e.preventDefault();
				setCurrentDate((prev) => prev.add(1, 'day'));
			}
			if (e.key === 't') {
				e.preventDefault();
				setCurrentDate(dayjs());
			}

			// Team navigation with arrow keys
			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				setSelectedTeam((prev) => (prev > 1 ? prev - 1 : 5));
			}
			if (e.key === 'ArrowRight') {
				e.preventDefault();
				setSelectedTeam((prev) => (prev < 5 ? prev + 1 : 1));
			}
		};

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	}, []);

	return (
		<div className="terminal-view" tabIndex={0}>
			<TerminalHeader currentTime={currentTime} />

			<div className="terminal-view-selector">
				<span className={`view-item ${view === 'today' ? 'active' : ''}`}>
					[{view === 'today' ? '●' : '○'} Today]
				</span>
				<span className={`view-item ${view === 'next-shift' ? 'active' : ''}`}>
					[{view === 'next-shift' ? '●' : '○'} Next Shift]
				</span>
				<span className={`view-item ${view === 'transfers' ? 'active' : ''}`}>
					[{view === 'transfers' ? '●' : '○'} Transfers]
				</span>
			</div>

			<div style={{ marginBottom: '1rem' }}>
				<span className="terminal-text dim">Selected Team: </span>
				<span className="terminal-text bold cyan">Team {selectedTeam}</span>
			</div>

			{view === 'today' && (
				<TerminalTeamList
					date={currentDate}
					selectedTeam={selectedTeam}
					currentTime={currentTime}
				/>
			)}

			{view === 'next-shift' && (
				<TerminalNextShift selectedTeam={selectedTeam} fromDate={currentDate} />
			)}

			{view === 'transfers' && (
				<TerminalTransfers selectedTeam={selectedTeam} fromDate={currentDate} />
			)}

			<div className="terminal-help">
				Keys: [1-5] Select team | [←→] Switch team | [Tab] Change view | [j/k or
				↓/↑] ±1 day | [t] Today
			</div>
		</div>
	);
}
