import type { Dayjs } from 'dayjs';
import { formatYYWWD } from '../../utils/dateTimeUtils';
import { getAllTeamsShifts } from '../../utils/shiftCalculations';
import {
    getShiftColor,
    getShiftEmoji,
    isCurrentlyWorking,
} from './terminalUtils';

interface TerminalTeamListProps {
    date: Dayjs;
    selectedTeam: number;
    currentTime: Dayjs;
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
                const isWorking = isCurrentlyWorking(
                    team.shift,
                    date,
                    currentTime,
                );

                return (
                    <div
                        key={team.teamNumber}
                        className={`terminal-team-row ${isSelected ? 'selected' : ''}`}
                    >
                        <span className="terminal-team-col name">
                            {isSelected ? '▶ ' : '  '}Team {team.teamNumber}
                        </span>
                        <span
                            className={`terminal-team-col shift terminal-text ${shiftColor}`}
                        >
                            {emoji} {team.shift.name}
                        </span>
                        <span className="terminal-team-col hours terminal-text dim">
                            {team.shift.hours}
                        </span>
                        <span className="terminal-team-col code">
                            <span
                                className={`terminal-text bold ${shiftColor}`}
                            >
                                {team.code}
                            </span>
                            {isWorking && (
                                <span className="terminal-text green">
                                    {' '}
                                    ← WORKING NOW
                                </span>
                            )}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
