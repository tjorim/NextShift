import React, { useState } from 'react';
import { Box, Text } from 'ink';
import type { Dayjs } from 'dayjs';
import { calculateShift, type ShiftType } from '../../utils/shiftCalculations';
import { formatYYWWD } from '../../utils/dateTimeUtils';

interface TransfersViewProps {
	selectedTeam: number;
	fromDate: Dayjs;
}

interface TransferInfo {
	date: Dayjs;
	fromTeam: number;
	toTeam: number;
	fromShiftType: ShiftType;
	toShiftType: ShiftType;
	type: 'handover' | 'takeover';
}

function calculateTransfers(
	myTeam: number,
	otherTeam: number,
	startDate: Dayjs,
	limit: number = 10,
): TransferInfo[] {
	const transfers: TransferInfo[] = [];

	for (let day = 0; day < 365 && transfers.length < limit; day++) {
		const scanDate = startDate.add(day, 'day');
		const nextDate = scanDate.add(1, 'day');

		const myTeamShift = calculateShift(scanDate, myTeam);
		const otherTeamShift = calculateShift(scanDate, otherTeam);
		const myTeamNextShift = calculateShift(nextDate, myTeam);
		const otherTeamNextShift = calculateShift(nextDate, otherTeam);

		// Check for handovers (my team to other team)
		if (myTeamShift.code === 'M' && otherTeamShift.code === 'E') {
			transfers.push({
				date: scanDate,
				fromTeam: myTeam,
				toTeam: otherTeam,
				fromShiftType: 'M',
				toShiftType: 'E',
				type: 'handover',
			});
		}
		if (myTeamShift.code === 'E' && otherTeamShift.code === 'N') {
			transfers.push({
				date: scanDate,
				fromTeam: myTeam,
				toTeam: otherTeam,
				fromShiftType: 'E',
				toShiftType: 'N',
				type: 'handover',
			});
		}
		if (myTeamShift.code === 'N' && otherTeamNextShift.code === 'M') {
			transfers.push({
				date: nextDate,
				fromTeam: myTeam,
				toTeam: otherTeam,
				fromShiftType: 'N',
				toShiftType: 'M',
				type: 'handover',
			});
		}

		// Check for takeovers (other team to my team)
		if (otherTeamShift.code === 'M' && myTeamShift.code === 'E') {
			transfers.push({
				date: scanDate,
				fromTeam: otherTeam,
				toTeam: myTeam,
				fromShiftType: 'M',
				toShiftType: 'E',
				type: 'takeover',
			});
		}
		if (otherTeamShift.code === 'E' && myTeamShift.code === 'N') {
			transfers.push({
				date: scanDate,
				fromTeam: otherTeam,
				toTeam: myTeam,
				fromShiftType: 'E',
				toShiftType: 'N',
				type: 'takeover',
			});
		}
		if (otherTeamShift.code === 'N' && myTeamNextShift.code === 'M') {
			transfers.push({
				date: nextDate,
				fromTeam: otherTeam,
				toTeam: myTeam,
				fromShiftType: 'N',
				toShiftType: 'M',
				type: 'takeover',
			});
		}
	}

	return transfers;
}

function getShiftColor(shiftCode: string): string {
	if (shiftCode === 'M') return 'yellow';
	if (shiftCode === 'E') return 'magenta';
	if (shiftCode === 'N') return 'blue';
	return 'gray';
}

export default function TransfersView({ selectedTeam, fromDate }: TransfersViewProps) {
	const otherTeams = [1, 2, 3, 4, 5].filter((t) => t !== selectedTeam);
	const [compareTeam] = useState(otherTeams[0]);

	const transfers = calculateTransfers(selectedTeam, compareTeam, fromDate, 10);

	return (
		<Box flexDirection="column">
			<Box marginBottom={1}>
				<Text bold color="cyan">
					Transfer Analysis: Team {selectedTeam} ↔ Team {compareTeam}
				</Text>
			</Box>

			<Box flexDirection="column" borderStyle="round" borderColor="gray" paddingX={1}>
				{transfers.length === 0 ? (
					<Text dimColor>No transfers found in the next 365 days.</Text>
				) : (
					<>
						<Text bold>Upcoming Transfers (Next {transfers.length})</Text>
						{transfers.map((transfer, idx) => {
							const dateStr = transfer.date.format('MMM D, YYYY');
							const dateCode = formatYYWWD(transfer.date);
							const isHandover = transfer.type === 'handover';
							const arrow = isHandover ? '→' : '←';
							const color = isHandover ? 'green' : 'blue';

							return (
								<Box key={idx} marginTop={1}>
									<Box width={18}>
										<Text dimColor>{dateStr}</Text>
									</Box>
									<Box width={12}>
										<Text dimColor>({dateCode})</Text>
									</Box>
									<Box>
										<Text>
											<Text color={color} bold>
												{isHandover ? 'Handover' : 'Takeover'}:{' '}
											</Text>
											<Text color={getShiftColor(transfer.fromShiftType)}>
												{transfer.fromShiftType}
											</Text>
											{' '}{arrow}{' '}
											<Text color={getShiftColor(transfer.toShiftType)}>
												{transfer.toShiftType}
											</Text>
										</Text>
									</Box>
								</Box>
							);
						})}
					</>
				)}
			</Box>
		</Box>
	);
}
