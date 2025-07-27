import type { Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';
import { dayjs } from '../utils/dayjs-setup';
import {
    calculateShift,
    getAllTeamsShifts,
    getCurrentShiftDay,
    getNextShift,
    getShiftCode,
    type NextShiftResult,
    type ShiftResult,
} from '../utils/shiftCalculations';
import { useLocalStorage } from './useLocalStorage';

export interface UseShiftCalculationReturn {
    selectedTeam: number | null;
    setSelectedTeam: (team: number | null) => void;
    currentDate: Dayjs;
    setCurrentDate: (date: Dayjs) => void;
    currentShift: ShiftResult | null;
    nextShift: NextShiftResult | null;
    todayShifts: ShiftResult[];
    currentShiftDay: Dayjs;
}

/**
 * Custom hook for managing shift calculations and state
 * @returns Object containing shift state and calculation functions
 */
export function useShiftCalculation(): UseShiftCalculationReturn {
    // Team selection with localStorage persistence
    const [selectedTeam, setSelectedTeam] = useLocalStorage<number | null>(
        'userTeam',
        null,
    );

    // Current date for calculations
    const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());

    // Calculate current shift for selected team
    const currentShift = useMemo((): ShiftResult | null => {
        if (!selectedTeam) return null;

        const shiftDay = getCurrentShiftDay(currentDate);
        const shift = calculateShift(shiftDay, selectedTeam);

        return {
            date: shiftDay,
            shift,
            code: getShiftCode(shiftDay, selectedTeam),
            teamNumber: selectedTeam,
        };
    }, [selectedTeam, currentDate]);

    // Calculate next shift for selected team
    const nextShift = useMemo((): NextShiftResult | null => {
        if (!selectedTeam) return null;

        return getNextShift(currentDate, selectedTeam);
    }, [selectedTeam, currentDate]);

    // Get all teams' shifts for current date
    const todayShifts = useMemo((): ShiftResult[] => {
        return getAllTeamsShifts(currentDate);
    }, [currentDate]);

    // Calculate current shift day (handles pre-7AM night shift logic)
    const currentShiftDay = useMemo((): Dayjs => {
        return getCurrentShiftDay(currentDate);
    }, [currentDate]);

    return {
        selectedTeam,
        setSelectedTeam,
        currentDate,
        setCurrentDate,
        currentShift,
        nextShift,
        todayShifts,
        currentShiftDay,
    };
}
