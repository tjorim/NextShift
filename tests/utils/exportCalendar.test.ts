import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dayjs } from '../../src/utils/dateTimeUtils';
import { exportCalendar, exportTeamSchedule } from '../../src/utils/exportCalendar';
import type { ExportOptions } from '../../src/types/export';

// Mock DOM APIs
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

// Set up DOM mocks
beforeEach(() => {
    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    
    // Mock document methods
    const mockElement = {
        href: '',
        download: '',
        style: { display: '' },
        click: mockClick,
    };
    
    mockCreateElement.mockReturnValue(mockElement);
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
    
    Object.defineProperty(global, 'document', {
        value: {
            createElement: mockCreateElement,
            body: {
                appendChild: mockAppendChild,
                removeChild: mockRemoveChild,
            },
        },
    });

    // Mock Blob constructor
    global.Blob = vi.fn().mockImplementation((content, options) => ({
        content,
        options,
        type: options?.type || '',
    })) as any;
});

afterEach(() => {
    vi.clearAllMocks();
});

describe('exportCalendar', () => {
    const baseOptions: ExportOptions = {
        startDate: dayjs('2025-01-01'),
        endDate: dayjs('2025-01-07'),
        teamNumber: 1,
        includeOffDays: true,
        includeShiftTimes: true,
        timeZone: 'Europe/Brussels',
    };

    describe('validation', () => {
        it('should reject invalid team numbers', async () => {
            const options = { ...baseOptions, teamNumber: 0 };
            const result = await exportCalendar(options);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid team number');
        });

        it('should reject team numbers above 5', async () => {
            const options = { ...baseOptions, teamNumber: 6 };
            const result = await exportCalendar(options);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid team number');
        });

        it('should reject end date before start date', async () => {
            const options = {
                ...baseOptions,
                startDate: dayjs('2025-01-07'),
                endDate: dayjs('2025-01-01'),
            };
            const result = await exportCalendar(options);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('End date must be after start date');
        });

        it('should reject date ranges exceeding 365 days', async () => {
            const options = {
                ...baseOptions,
                startDate: dayjs('2025-01-01'),
                endDate: dayjs('2025-01-01').add(366, 'days'),
            };
            const result = await exportCalendar(options);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Date range cannot exceed 365 days');
        });
    });

    describe('successful export', () => {
        it('should generate calendar for valid date range', async () => {
            const result = await exportCalendar(baseOptions);
            
            expect(result.success).toBe(true);
            expect(result.filename).toBe('NextShift_Team1_2025-01-01_to_2025-01-07.ics');
            expect(result.eventCount).toBe(7); // 7 days including off days
        });

        it('should exclude off days when includeOffDays is false', async () => {
            const options = { ...baseOptions, includeOffDays: false };
            const result = await exportCalendar(options);
            
            expect(result.success).toBe(true);
            expect(result.eventCount).toBeLessThan(7); // Less than 7 days when excluding off days
        });

        it('should generate single-day filename for same start/end date', async () => {
            const options = {
                ...baseOptions,
                endDate: baseOptions.startDate,
            };
            const result = await exportCalendar(options);
            
            expect(result.success).toBe(true);
            expect(result.filename).toBe('NextShift_Team1_2025-01-01.ics');
        });

        it('should call progress callback during export', async () => {
            const progressCallback = vi.fn();
            await exportCalendar(baseOptions, progressCallback);
            
            expect(progressCallback).toHaveBeenCalled();
            expect(progressCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    current: expect.any(Number),
                    total: expect.any(Number),
                    step: expect.any(String),
                })
            );
        });
    });

    describe('file download', () => {
        it('should create and trigger file download', async () => {
            await exportCalendar(baseOptions);
            
            // Verify Blob was created with correct content type
            expect(global.Blob).toHaveBeenCalledWith(
                [expect.any(String)],
                { type: 'text/calendar;charset=utf-8' }
            );
            
            // Verify download link was created and clicked
            expect(mockCreateElement).toHaveBeenCalledWith('a');
            expect(mockCreateObjectURL).toHaveBeenCalled();
            expect(mockClick).toHaveBeenCalled();
            expect(mockAppendChild).toHaveBeenCalled();
            expect(mockRemoveChild).toHaveBeenCalled();
        });

        it('should clean up object URL after download', async () => {
            await exportCalendar(baseOptions);
            
            // Wait for setTimeout to be called
            await new Promise(resolve => setTimeout(resolve, 150));
            
            expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
        });
    });

    describe('iCalendar content generation', () => {
        it('should generate RFC 5545 compliant content', async () => {
            await exportCalendar(baseOptions);
            
            // Get the content passed to Blob
            const blobCall = (global.Blob as any).mock.calls[0];
            const content = blobCall[0][0];
            
            // Verify basic iCalendar structure
            expect(content).toContain('BEGIN:VCALENDAR');
            expect(content).toContain('END:VCALENDAR');
            expect(content).toContain('VERSION:2.0');
            expect(content).toContain('PRODID:-//NextShift//NextShift Calendar Export//EN');
            expect(content).toContain('BEGIN:VEVENT');
            expect(content).toContain('END:VEVENT');
        });

        it('should include timezone information for timed events', async () => {
            await exportCalendar(baseOptions);
            
            const content = (global.Blob as any).mock.calls[0][0][0];
            
            expect(content).toContain('BEGIN:VTIMEZONE');
            expect(content).toContain('TZID:Europe/Brussels');
            expect(content).toContain('END:VTIMEZONE');
        });

        it('should escape special characters in event content', async () => {
            await exportCalendar(baseOptions);
            
            const content = (global.Blob as any).mock.calls[0][0][0];
            
            // Test that the content is valid iCalendar format
            // Semicolons in timezone rules are valid and should not be escaped
            expect(content).toContain('DTSTART;TZID=Europe/Brussels:');
            expect(content).toContain('DTEND;TZID=Europe/Brussels:');
            expect(content).toContain('DTSTART;VALUE=DATE:');
            
            // Should properly escape newlines in descriptions
            expect(content).toContain('\\n');
        });

        it('should include proper event categories', async () => {
            await exportCalendar(baseOptions);
            
            const content = (global.Blob as any).mock.calls[0][0][0];
            
            expect(content).toContain('CATEGORIES:');
            expect(content).toContain('NextShift');
            expect(content).toContain('Team1');
        });
    });

    describe('team-specific behavior', () => {
        it('should generate different schedules for different teams', async () => {
            const team1Result = await exportCalendar({ ...baseOptions, teamNumber: 1 });
            const team2Result = await exportCalendar({ ...baseOptions, teamNumber: 2 });
            
            expect(team1Result.success).toBe(true);
            expect(team2Result.success).toBe(true);
            
            // Different teams should have different filenames
            expect(team1Result.filename).toContain('Team1');
            expect(team2Result.filename).toContain('Team2');
        });

        it('should handle all valid team numbers', async () => {
            for (let team = 1; team <= 5; team++) {
                const result = await exportCalendar({ ...baseOptions, teamNumber: team });
                expect(result.success).toBe(true);
                expect(result.filename).toContain(`Team${team}`);
            }
        });
    });

    describe('error handling', () => {
        it('should handle errors gracefully', async () => {
            // Force an error by mocking Blob to throw
            global.Blob = vi.fn().mockImplementation(() => {
                throw new Error('Blob creation failed');
            });
            
            const result = await exportCalendar(baseOptions);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Blob creation failed');
        });
    });
});

describe('exportTeamSchedule', () => {
    it('should export 3-month schedule for team', async () => {
        const result = await exportTeamSchedule(1);
        
        expect(result.success).toBe(true);
        expect(result.filename).toContain('Team1');
        expect(result.eventCount).toBeGreaterThan(80); // Roughly 90 days
    });

    it('should use default export options', async () => {
        const progressCallback = vi.fn();
        const result = await exportTeamSchedule(3, progressCallback);
        
        expect(result.success).toBe(true);
        expect(progressCallback).toHaveBeenCalled();
    });

    it('should handle invalid team numbers', async () => {
        const result = await exportTeamSchedule(0);
        
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid team number');
    });
});