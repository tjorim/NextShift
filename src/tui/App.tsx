import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { dayjs } from '../utils/dateTimeUtils';
import Header from './components/Header';
import TeamList from './components/TeamList';
import NextShiftView from './components/NextShiftView';
import TransfersView from './components/TransfersView';

type View = 'today' | 'next-shift' | 'transfers';

interface AppProps {
	initialTeam?: number;
}

export default function App({ initialTeam = 1 }: AppProps) {
	const { exit } = useApp();
	const [selectedTeam, setSelectedTeam] = useState<number>(initialTeam);
	const [currentDate, setCurrentDate] = useState(dayjs());
	const [view, setView] = useState<View>('today');
	const [currentTime, setCurrentTime] = useState(dayjs());

	// Update time every second
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentTime(dayjs());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	useInput((input, key) => {
		// Team selection with number keys
		if (input >= '1' && input <= '5') {
			setSelectedTeam(Number.parseInt(input, 10));
		}

		// View navigation with Tab
		if (key.tab) {
			setView((prev) => {
				if (prev === 'today') return 'next-shift';
				if (prev === 'next-shift') return 'transfers';
				return 'today';
			});
		}

		// Date navigation
		if (input === 'j' || key.downArrow) {
			setCurrentDate((prev) => prev.subtract(1, 'day'));
		}
		if (input === 'k' || key.upArrow) {
			setCurrentDate((prev) => prev.add(1, 'day'));
		}
		if (input === 't') {
			setCurrentDate(dayjs());
		}

		// Team navigation with arrow keys
		if (key.leftArrow) {
			setSelectedTeam((prev) => (prev > 1 ? prev - 1 : 5));
		}
		if (key.rightArrow) {
			setSelectedTeam((prev) => (prev < 5 ? prev + 1 : 1));
		}

		// Quit
		if (input === 'q' || (key.ctrl && input === 'c')) {
			exit();
		}
	});

	return (
		<Box flexDirection="column" padding={1}>
			<Header currentTime={currentTime} view={view} />

			<Box marginTop={1}>
				<Text dimColor>
					View: [{view === 'today' ? '●' : '○'} Today] [{view === 'next-shift' ? '●' : '○'}{' '}
					Next Shift] [{view === 'transfers' ? '●' : '○'} Transfers]
				</Text>
			</Box>

			<Box marginTop={1} marginBottom={1}>
				<Text dimColor>
					Selected Team: <Text bold color="cyan">Team {selectedTeam}</Text>
				</Text>
			</Box>

			{view === 'today' && (
				<TeamList
					date={currentDate}
					selectedTeam={selectedTeam}
					currentTime={currentTime}
				/>
			)}

			{view === 'next-shift' && (
				<NextShiftView
					selectedTeam={selectedTeam}
					fromDate={currentDate}
				/>
			)}

			{view === 'transfers' && (
				<TransfersView
					selectedTeam={selectedTeam}
					fromDate={currentDate}
				/>
			)}

			<Box marginTop={1} borderStyle="round" borderColor="gray" paddingX={1}>
				<Text dimColor>
					Keys: [1-5] Select team | [←→] Switch team | [Tab] Change view | [j/k] ±1 day | [t] Today | [q] Quit
				</Text>
			</Box>
		</Box>
	);
}
