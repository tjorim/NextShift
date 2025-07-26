import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import { formatDateCode } from '../src/utils/shiftCalculations';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

describe('Week number issue investigation', () => {
    test('should fix Sunday week number to match the week display', () => {
        // According to the image, we have "Week of Jul 21 - Jul 27, 2025"
        // Let's check the dates mentioned

        const weekStart = dayjs('2025-07-21'); // Monday

        console.log('Week Analysis for Jul 21-27, 2025:');
        console.log('=====================================');

        for (let i = 0; i <= 6; i++) {
            const date = weekStart.add(i, 'day');
            const dayOfWeek = date.day() === 0 ? 7 : date.day(); // Sunday = 7, Monday = 1
            const week = date.week();
            const isoWeekNum = date.isoWeek();
            const dateCode = formatDateCode(date); // Use the actual function

            console.log(
                `${date.format('ddd MMM DD')}: Week ${week}, ISO Week ${isoWeekNum}, Day ${dayOfWeek}, Code: ${dateCode}`,
            );
        }

        console.log('\nDay.js week() vs isoWeek() behavior:');
        console.log('===================================');
        console.log('Sunday July 27, 2025:');
        const sunday = dayjs('2025-07-27');
        console.log(`- Calendar date: ${sunday.format('YYYY-MM-DD')}`);
        console.log(`- Day of week: ${sunday.day()} (0=Sunday)`);
        console.log(`- ISO week: ${sunday.isoWeek()}`);
        console.log(`- Week (US): ${sunday.week()}`);
        console.log(
            `- Start of week: ${sunday.startOf('week').format('YYYY-MM-DD')}`,
        );
        console.log(
            `- Start of ISO week: ${sunday.startOf('isoWeek').format('YYYY-MM-DD')}`,
        );

        // Test the fix: Sunday should now show week 30 (same as the rest of the week)
        const sundayCode = formatDateCode(sunday);
        console.log(`\nSunday date code after fix: ${sundayCode}`);
        expect(sundayCode).toBe('2530.7'); // Should be week 30, not 31

        // Test that all days in the week have the same week number
        for (let i = 0; i <= 6; i++) {
            const date = weekStart.add(i, 'day');
            const dateCode = formatDateCode(date);
            expect(dateCode.substring(0, 4)).toBe('2530'); // All should be in week 30
        }
    });
});
