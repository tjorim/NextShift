
import { Box, Text } from 'ink';
import type { Dayjs } from 'dayjs';

interface HeaderProps {
	currentTime: Dayjs;
}

export default function Header({ currentTime }: HeaderProps) {
	const formattedDate = currentTime.format('dddd, MMMM D, YYYY');
	const formattedTime = currentTime.format('HH:mm:ss');

	return (
		<Box flexDirection="column" borderStyle="double" borderColor="cyan" paddingX={1}>
			<Box justifyContent="center">
				<Text bold color="cyan">
					⚡ NextShift TUI ⚡
				</Text>
			</Box>
			<Box justifyContent="center">
				<Text dimColor>
					{formattedDate} • {formattedTime}
				</Text>
			</Box>
		</Box>
	);
}
