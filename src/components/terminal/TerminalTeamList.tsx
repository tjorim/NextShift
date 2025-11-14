import type { Dayjs } from 'dayjs';
import {
	getAllTeamsShifts,
	getCurrentShiftDay,
} from '../../utils/shiftCalculations';
import { formatYYWWD } from '../../utils/dateTimeUtils';

interface TerminalTeamListProps {
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

export default function TerminalTeamList({
	date,
	selectedTeam,
	currentTime,
}: TerminalTeamListProps) {
	const teams = getAllTeamsShifts(date);
	const dateCode = formatYYWWD(date);
	const displayDate = date.format('dddd, MMMM D, YYYY');

	return (
		<div>
			<div className="terminal-date-header">
				📅 {displayDate} ({dateCode})
			</div>

			{teams.map((team) => {
				const isSelected = team.teamNumber === selectedTeam;
				const shiftColor = getShiftColor(team.shift.code);
				const emoji = getShiftEmoji(team.shift.code);
				const isWorking = isCurrentlyWorking(team.shift, date, currentTime);

				return (
					<div
						key={team.teamNumber}
						className={`terminal-team-row ${isSelected ? 'selected' : ''}`}
					>
						<span className="terminal-team-col name">
							{isSelected ? '▶ ' : '  '}Team {team.teamNumber}
						</span>
						<span className={`terminal-team-col shift terminal-text ${shiftColor}`}>
							{emoji} {team.shift.name}
						</span>
						<span className="terminal-team-col hours terminal-text dim">
							{team.shift.hours}
						</span>
						<span className="terminal-team-col code">
							<span className={`terminal-text bold ${shiftColor}`}>
								{team.code}
							</span>
							{isWorking && (
								<span className="terminal-text green"> ← WORKING NOW</span>
							)}
						</span>
					</div>
				);
			})}
		</div>
	);
}
