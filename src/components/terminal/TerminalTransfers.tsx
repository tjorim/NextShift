import type { Dayjs } from 'dayjs';
import { useTransferCalculations } from '../../hooks/useTransferCalculations';
import { formatYYWWD } from '../../utils/dateTimeUtils';
import { getShiftColor } from './terminalUtils';

interface TerminalTransfersProps {
    selectedTeam: number;
    fromDate: Dayjs;
}

export default function TerminalTransfers({
    selectedTeam,
    fromDate,
}: TerminalTransfersProps) {
    const { transfers, otherTeam } = useTransferCalculations({
        myTeam: selectedTeam,
        limit: 10,
        customStartDate: fromDate.format('YYYY-MM-DD'),
    });

    return (
        <div>
            <div style={{ marginBottom: '1rem' }}>
                <span className="terminal-text bold cyan">
                    Transfer Analysis: Team {selectedTeam} ↔ Team {otherTeam}
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
                        {transfers.map((transfer) => {
                            const dateStr = transfer.date.format('MMM D, YYYY');
                            const dateCode = formatYYWWD(transfer.date);
                            const isHandover = transfer.type === 'handover';
                            const arrow = isHandover ? '→' : '←';
                            const color = isHandover ? 'green' : 'blue';
                            const uniqueKey = `${transfer.date.format('YYYY-MM-DD')}-${transfer.type}-${transfer.fromShiftType}-${transfer.toShiftType}`;

                            return (
                                <div
                                    key={uniqueKey}
                                    className="terminal-transfer-item"
                                >
                                    <span className="terminal-transfer-date">
                                        {dateStr}
                                    </span>
                                    <span className="terminal-transfer-code">
                                        ({dateCode})
                                    </span>
                                    <span className="terminal-transfer-info">
                                        <span
                                            className={`terminal-text bold ${color}`}
                                        >
                                            {isHandover
                                                ? 'Handover'
                                                : 'Takeover'}
                                            :{' '}
                                        </span>
                                        <span
                                            className={`terminal-text ${getShiftColor(transfer.fromShiftType)}`}
                                        >
                                            {transfer.fromShiftType}
                                        </span>
                                        <span className="terminal-text">
                                            {' '}
                                            {arrow}{' '}
                                        </span>
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
