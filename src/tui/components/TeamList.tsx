import React from 'react';
import { Box, Text } from 'ink';
import type { Dayjs } from 'dayjs';
import { getAllTeamsShifts, getCurrentShiftDay } from '../../utils/shiftCalculations';
import { formatYYWWD } from '../../utils/dateTimeUtils';

interface TeamListProps {
	date: Dayjs;
	selectedTeam: number;
	currentTime: Dayjs;
}

function getShiftColor(shiftCode: string): string {
	if (shiftCode === 'M') return 'yellow';
	if (shiftCode === 'E') return 'magenta';
	if (shiftCode === 'N') return 'blue';
	return 'gray';
}

function getShiftEmoji(shiftCode: string): string {
	if (shiftCode === 'M') return '🌅';
	if (shiftCode === 'E') return '🌆';
	if (shiftCode === 'N') return '🌙';
	return '🏠';
}

function isCurrentlyWorking(
	shift: { code: string; start: number | null; end: number | null },
	date: Dayjs,
	currentTime: Dayjs,
): boolean {
	if (!shift.start || !shift.end) return false;

	const shiftDay = getCurrentShiftDay(currentTime);
	if (!shiftDay.isSame(date, 'day')) return false;

	const hour = currentTime.hour();

	// Night shift spans midnight
	if (shift.code === 'N') {
		return hour >= shift.start || hour < shift.end;
	}

	return hour >= shift.start && hour < shift.end;
}

export default function TeamList({ date, selectedTeam, currentTime }: TeamListProps) {
	const teams = getAllTeamsShifts(date);
	const dateCode = formatYYWWD(date);
	const displayDate = date.format('dddd, MMMM D, YYYY');

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold color="green">
					📅 {displayDate} ({dateCode})
				</Text>
			</Box>

			{teams.map((team) => {
				const isSelected = team.teamNumber === selectedTeam;
				const shiftColor = getShiftColor(team.shift.code);
				const emoji = getShiftEmoji(team.shift.code);
				const isWorking = isCurrentlyWorking(team.shift, date, currentTime);

				return (
					<Box key={team.teamNumber} marginBottom={0}>
						<Box width={15}>
							<Text bold={isSelected} color={isSelected ? 'cyan' : undefined}>
								{isSelected ? '▶ ' : '  '}Team {team.teamNumber}
							</Text>
						</Box>
						<Box width={20}>
							<Text color={shiftColor}>
								{emoji} {team.shift.name}
							</Text>
						</Box>
						<Box width={20}>
							<Text dimColor>{team.shift.hours}</Text>
						</Box>
						<Box>
							<Text bold color={shiftColor}>
								{team.code}
							</Text>
							{isWorking && (
								<Text color="green"> ← WORKING NOW</Text>
							)}
						</Box>
					</Box>
				);
			})}
		</Box>
	);
}
