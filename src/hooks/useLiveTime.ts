import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

/**
 * Hook that provides live updating time that refreshes every second
 * @returns Current time as Dayjs object, updated every second
 */
export function useLiveTime(): Dayjs {
    const [currentTime, setCurrentTime] = useState(dayjs());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(dayjs());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return currentTime;
}
