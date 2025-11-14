
import { Box, Text } from 'ink';
import type { Dayjs } from 'dayjs';
import { getNextShift, calculateShift, getShiftCode } from '../../utils/shiftCalculations';

interface NextShiftViewProps {
	selectedTeam: number;
	fromDate: Dayjs;
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

export default function NextShiftView({ selectedTeam, fromDate }: NextShiftViewProps) {
	const currentShift = calculateShift(fromDate, selectedTeam);
	const currentCode = getShiftCode(fromDate, selectedTeam);
	const nextShift = getNextShift(fromDate, selectedTeam);

	const currentShiftColor = getShiftColor(currentShift.code);
	const currentEmoji = getShiftEmoji(currentShift.code);

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold color="cyan">
					Team {selectedTeam} - Shift Information
				</Text>
			</Box>

			<Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1} marginBottom={1}>
				<Text bold>Current Status ({fromDate.format('MMM D, YYYY')})</Text>
				<Box marginTop={1}>
					<Text>
						{currentEmoji} <Text color={currentShiftColor} bold>{currentShift.name}</Text> - {currentShift.hours}
					</Text>
				</Box>
				<Box>
					<Text dimColor>Code: </Text>
					<Text color={currentShiftColor} bold>{currentCode}</Text>
				</Box>
			</Box>

			{nextShift ? (
				<Box flexDirection="column" borderStyle="round" borderColor="green" paddingX={1}>
					<Text bold color="green">Next Working Shift</Text>
					<Box marginTop={1}>
						<Text>
							{getShiftEmoji(nextShift.shift.code)}{' '}
							<Text color={getShiftColor(nextShift.shift.code)} bold>
								{nextShift.shift.name}
							</Text>
						</Text>
					</Box>
					<Box>
						<Text dimColor>Date: </Text>
						<Text bold>{nextShift.date.format('dddd, MMMM D, YYYY')}</Text>
					</Box>
					<Box>
						<Text dimColor>Hours: </Text>
						<Text>{nextShift.shift.hours}</Text>
					</Box>
					<Box>
						<Text dimColor>Code: </Text>
						<Text color={getShiftColor(nextShift.shift.code)} bold>
							{nextShift.code}
						</Text>
					</Box>
					<Box marginTop={1}>
						<Text dimColor>
							Days until next shift: <Text bold>{nextShift.date.diff(fromDate, 'day')}</Text>
						</Text>
					</Box>
				</Box>
			) : (
				<Box borderStyle="round" borderColor="red" paddingX={1}>
					<Text color="red">No upcoming shift found within the next 10 days.</Text>
				</Box>
			)}
		</Box>
	);
}
