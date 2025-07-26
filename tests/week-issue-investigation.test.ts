import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

describe('Week number issue investigation', () => {
    test('should investigate the Sunday week number issue', () => {
        // According to the image, we have "Week of Jul 21 - Jul 27, 2025"
        // Let's check the dates mentioned
        
        const weekStart = dayjs('2025-07-21'); // Monday
        const weekEnd = dayjs('2025-07-27'); // Sunday

        console.log('Week Analysis for Jul 21-27, 2025:');
        console.log('=====================================');

        for (let i = 0; i <= 6; i++) {
            const date = weekStart.add(i, 'day');
            const dayOfWeek = date.day() === 0 ? 7 : date.day(); // Sunday = 7, Monday = 1
            const week = date.week();
            const isoWeekNum = date.isoWeek();
            const year = date.year().toString().slice(-2);
            const weekStr = week.toString().padStart(2, '0');
            const dateCode = `${year}${weekStr}.${dayOfWeek}`;
            
            console.log(`${date.format('ddd MMM DD')}: Week ${week}, ISO Week ${isoWeekNum}, Day ${dayOfWeek}, Code: ${dateCode}`);
        }

        console.log('\nDay.js week() vs isoWeek() behavior:');
        console.log('===================================');
        console.log('Sunday July 27, 2025:');
        const sunday = dayjs('2025-07-27');
        console.log(`- Calendar date: ${sunday.format('YYYY-MM-DD')}`);
        console.log(`- Day of week: ${sunday.day()} (0=Sunday)`);
        console.log(`- ISO week: ${sunday.isoWeek()}`);
        console.log(`- Week (US): ${sunday.week()}`);
        console.log(`- Start of week: ${sunday.startOf('week').format('YYYY-MM-DD')}`);
        console.log(`- Start of ISO week: ${sunday.startOf('isoWeek').format('YYYY-MM-DD')}`);

        // The issue: Sunday shows week 31 instead of week 30
        // This is because day.js.week() uses US week numbering where Sunday starts a new week
        // But the app displays Monday-Sunday as one week (ISO week)
        
        expect(sunday.week()).toBe(31); // Current (problematic) behavior
        expect(sunday.isoWeek()).toBe(30); // What we want for Sunday in the same week as Monday-Saturday
    });
});