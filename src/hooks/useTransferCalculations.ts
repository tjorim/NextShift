import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { CONFIG } from '../utils/config';
import { calculateShift, type ShiftType } from '../utils/shiftCalculations';

export interface TransferInfo {
    date: Dayjs;
    fromTeam: number;
    toTeam: number;
    fromShiftType: ShiftType;
    fromShiftName: string;
    toShiftType: ShiftType;
    toShiftName: string;
    isHandover: boolean;
}

interface UseTransferCalculationsProps {
    selectedTeam: number | null;
    compareTeam?: number;
    dateRange?: string;
    customStartDate?: string;
    customEndDate?: string;
}

interface UseTransferCalculationsReturn {
    transfers: TransferInfo[];
    availableTeams: number[];
    compareTeam: number;
    setCompareTeam: (team: number) => void;
    dateRange: string;
    setDateRange: (range: string) => void;
    customStartDate: string;
    setCustomStartDate: (date: string) => void;
    customEndDate: string;
    setCustomEndDate: (date: string) => void;
}

/**
 * Helper function to check for transfer between two shifts and create TransferInfo if match is found
 */
function checkTransfer(
    shift1: { code: ShiftType; name: string },
    shift2: { code: ShiftType; name: string },
    fromShift: ShiftType,
    toShift: ShiftType,
    date: Dayjs,
    fromTeam: number,
    toTeam: number,
    isHandover: boolean,
): TransferInfo | null {
    if (shift1.code === fromShift && shift2.code === toShift) {
        return {
            date,
            fromTeam,
            toTeam,
            fromShiftType: shift1.code,
            fromShiftName: shift1.name,
            toShiftType: shift2.code,
            toShiftName: shift2.name,
            isHandover,
        };
    }
    return null;
}

/**
 * Custom hook for managing transfer calculations between teams over a date range.
 *
 * This hook encapsulates all the complex logic for:
 * - Managing available teams (excluding selected team)
 * - Handling date range selection (preset or custom)
 * - Calculating shift transfers between teams
 * - Detecting handover/takeover patterns
 */
export function useTransferCalculations({
    selectedTeam,
    compareTeam: initialCompareTeam,
    dateRange: initialDateRange = '14',
    customStartDate: initialCustomStartDate = '',
    customEndDate: initialCustomEndDate = '',
}: UseTransferCalculationsProps): UseTransferCalculationsReturn {
    // Get available teams (excluding selected team)
    const availableTeams = useMemo(() => {
        const allTeams = Array.from(
            { length: CONFIG.TEAMS_COUNT },
            (_, i) => i + 1,
        );
        return allTeams.filter((team) => team !== selectedTeam);
    }, [selectedTeam]);

    // Default to first available team
    const defaultCompareTeam = availableTeams[0] || 1;
    const [compareTeam, setCompareTeam] = useState<number>(
        initialCompareTeam || defaultCompareTeam,
    );
    const [dateRange, setDateRange] = useState<string>(initialDateRange);
    const [customStartDate, setCustomStartDate] = useState<string>(
        initialCustomStartDate,
    );
    const [customEndDate, setCustomEndDate] =
        useState<string>(initialCustomEndDate);

    // Update compareTeam when selectedTeam changes and current compareTeam is not available
    useEffect(() => {
        if (!availableTeams.includes(compareTeam)) {
            setCompareTeam(defaultCompareTeam);
        }
    }, [availableTeams, compareTeam, defaultCompareTeam]);

    // Calculate transfers based on current parameters
    const transfers = useMemo((): TransferInfo[] => {
        if (!selectedTeam) return [];

        const transfers: TransferInfo[] = [];
        let endDate: Dayjs;

        if (dateRange === 'custom') {
            if (!customStartDate || !customEndDate) return [];
            endDate = dayjs(customEndDate);
        } else {
            endDate = dayjs().add(parseInt(dateRange), 'day');
        }

        const startDate =
            dateRange === 'custom' ? dayjs(customStartDate) : dayjs();

        for (
            let date = startDate;
            date.isBefore(endDate) || date.isSame(endDate);
            date = date.add(1, 'day')
        ) {
            const myShift = calculateShift(date, selectedTeam);
            const compareShift = calculateShift(date, compareTeam);

            // Check for same-day transfers (shift-to-shift)
            const nextDate = date.add(1, 'day');
            const myNextShift = calculateShift(nextDate, selectedTeam);
            const compareNextShift = calculateShift(nextDate, compareTeam);

            // Check all possible transfer patterns
            const transferChecks = [
                // Same-day transfers (my team to compare team)
                checkTransfer(
                    myShift,
                    compareShift,
                    'M',
                    'E',
                    date,
                    selectedTeam,
                    compareTeam,
                    true,
                ),
                checkTransfer(
                    myShift,
                    compareShift,
                    'E',
                    'N',
                    date,
                    selectedTeam,
                    compareTeam,
                    true,
                ),
                // Night to Morning transfer (next day)
                !nextDate.isAfter(endDate)
                    ? checkTransfer(
                          myShift,
                          compareNextShift,
                          'N',
                          'M',
                          nextDate,
                          selectedTeam,
                          compareTeam,
                          true,
                      )
                    : null,

                // Reverse transfers (compare team to my team)
                checkTransfer(
                    compareShift,
                    myShift,
                    'M',
                    'E',
                    date,
                    compareTeam,
                    selectedTeam,
                    false,
                ),
                checkTransfer(
                    compareShift,
                    myShift,
                    'E',
                    'N',
                    date,
                    compareTeam,
                    selectedTeam,
                    false,
                ),
                // Night to Morning transfer (next day, reverse)
                !nextDate.isAfter(endDate)
                    ? checkTransfer(
                          compareShift,
                          myNextShift,
                          'N',
                          'M',
                          nextDate,
                          compareTeam,
                          selectedTeam,
                          false,
                      )
                    : null,
            ];

            // Add valid transfers to the list
            transferChecks.forEach((transfer) => {
                if (transfer) {
                    transfers.push(transfer);
                }
            });
        }

        return transfers.slice(0, CONFIG.MAX_TRANSFERS_DISPLAY);
    }, [selectedTeam, compareTeam, dateRange, customStartDate, customEndDate]);

    return {
        transfers,
        availableTeams,
        compareTeam,
        setCompareTeam,
        dateRange,
        setDateRange,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
    };
}
