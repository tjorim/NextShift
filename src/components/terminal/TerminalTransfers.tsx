import { useState, useEffect } from 'react';
import type { Dayjs } from 'dayjs';
import { calculateShift, type ShiftType } from '../../utils/shiftCalculations';
import { formatYYWWD } from '../../utils/dateTimeUtils';

interface TerminalTransfersProps {
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

export default function TerminalTransfers({
	selectedTeam,
	fromDate,
}: TerminalTransfersProps) {
	const otherTeams = [1, 2, 3, 4, 5].filter((t) => t !== selectedTeam);
	const [compareTeam, setCompareTeam] = useState(otherTeams[0] || 1);

	// Update compareTeam when selectedTeam changes
	useEffect(() => {
		const newOtherTeams = [1, 2, 3, 4, 5].filter((t) => t !== selectedTeam);
		setCompareTeam(newOtherTeams[0] || 1);
	}, [selectedTeam]);

	const transfers = calculateTransfers(selectedTeam, compareTeam, fromDate, 10);

	return (
		<div>
			<div style={{ marginBottom: '1rem' }}>
				<span className="terminal-text bold cyan">
					Transfer Analysis: Team {selectedTeam} ↔ Team {compareTeam}
				</span>
			</div>

			<div className="terminal-box">
				{transfers.length === 0 ? (
					<span className="terminal-text dim">
						No transfers found in the next 365 days.
					</span>
				) : (
					<>
						<div style={{ marginBottom: '0.75rem' }}>
							<span className="terminal-text bold">
								Upcoming Transfers (Next {transfers.length})
							</span>
						</div>
						{transfers.map((transfer, idx) => {
							const dateStr = transfer.date.format('MMM D, YYYY');
							const dateCode = formatYYWWD(transfer.date);
							const isHandover = transfer.type === 'handover';
							const arrow = isHandover ? '→' : '←';
							const color = isHandover ? 'green' : 'blue';

							return (
								<div key={idx} className="terminal-transfer-item">
									<span className="terminal-transfer-date">{dateStr}</span>
									<span className="terminal-transfer-code">({dateCode})</span>
									<span className="terminal-transfer-info">
										<span className={`terminal-text bold ${color}`}>
											{isHandover ? 'Handover' : 'Takeover'}:{' '}
										</span>
										<span
											className={`terminal-text ${getShiftColor(transfer.fromShiftType)}`}
										>
											{transfer.fromShiftType}
										</span>
										<span className="terminal-text"> {arrow} </span>
										<span
											className={`terminal-text ${getShiftColor(transfer.toShiftType)}`}
										>
											{transfer.toShiftType}
										</span>
									</span>
								</div>
							);
						})}
					</>
				)}
			</div>
		</div>
	);
}
