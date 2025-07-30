import type { Dayjs } from 'dayjs';

/**
 * Configuration options for calendar export
 */
export interface ExportOptions {
    /** Start date for the export range */
    startDate: Dayjs;
    /** End date for the export range */
    endDate: Dayjs;
    /** Team number to export (1-5) */
    teamNumber: number;
    /** Whether to include all shift types or only working shifts */
    includeOffDays: boolean;
    /** Whether to include shift times in event descriptions */
    includeShiftTimes: boolean;
    /** Time zone identifier for events (e.g., 'Europe/Brussels') */
    timeZone: string;
}

/**
 * Calendar event data for iCalendar generation
 */
export interface CalendarEvent {
    /** Unique identifier for the event */
    uid: string;
    /** Event summary/title */
    summary: string;
    /** Event description */
    description: string;
    /** Event start date and time */
    dtStart: string;
    /** Event end date and time */
    dtEnd: string;
    /** Event creation timestamp */
    dtStamp: string;
    /** All-day event flag */
    allDay: boolean;
    /** Event categories/tags */
    categories: string[];
}

/**
 * Export progress information
 */
export interface ExportProgress {
    /** Current step being processed */
    current: number;
    /** Total steps to process */
    total: number;
    /** Current step description */
    step: string;
}

/**
 * Result of export operation
 */
export interface ExportResult {
    /** Whether the export was successful */
    success: boolean;
    /** Error message if export failed */
    error?: string;
    /** Generated filename */
    filename?: string;
    /** Number of events exported */
    eventCount?: number;
}

/**
 * Export modal form data
 */
export interface ExportFormData {
    /** Selected team number */
    teamNumber: number;
    /** Export start date */
    startDate: string;
    /** Export end date */
    endDate: string;
    /** Include off days in export */
    includeOffDays: boolean;
    /** Include shift times in descriptions */
    includeShiftTimes: boolean;
}