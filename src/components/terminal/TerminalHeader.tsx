import type { Dayjs } from 'dayjs';

interface TerminalHeaderProps {
    currentTime: Dayjs;
}

export default function TerminalHeader({ currentTime }: TerminalHeaderProps) {
    const formattedDate = currentTime.format('dddd, MMMM D, YYYY');
    const formattedTime = currentTime.format('HH:mm:ss');

    return (
        <div className="terminal-header">
            <div className="terminal-title">⚡ NextShift TUI ⚡</div>
            <div className="terminal-subtitle">
                {formattedDate} • {formattedTime}
            </div>
        </div>
    );
}
