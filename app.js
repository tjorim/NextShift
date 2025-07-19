// NextShift v3 - Team Shift Tracker
// Configuration
const CONFIG = {
    VERSION: '3.0.0',
    REFERENCE_DATE: new Date('2025-01-06'), // Configure this during setup
    REFERENCE_TEAM: 1, // Configure this during setup
    SHIFT_CYCLE_DAYS: 10,
    TEAMS_COUNT: 5
};

// Shift definitions
const SHIFTS = {
    MORNING: { code: 'M', name: 'Morning', hours: '07:00-15:00', start: 7, end: 15 },
    EVENING: { code: 'E', name: 'Evening', hours: '15:00-23:00', start: 15, end: 23 },
    NIGHT: { code: 'N', name: 'Night', hours: '23:00-07:00', start: 23, end: 7 },
    OFF: { code: 'O', name: 'Off', hours: 'Not working', start: null, end: null }
};

// Initialize day.js plugins
dayjs.extend(dayjs_plugin_weekOfYear);
dayjs.extend(dayjs_plugin_timezone);
dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isSameOrAfter);
dayjs.extend(dayjs_plugin_localizedFormat);

// App state
let userTeam = null;
let currentViewDate = dayjs();

// DOM elements
let elements = {};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeApp();
    setupEventListeners();
    checkOnlineStatus();
});

/**
 * Initializes and caches references to key DOM elements used throughout the application.
 */
function initializeElements() {
    elements = {
        teamModal: new bootstrap.Modal(document.getElementById('teamModal')),
        connectionStatus: document.getElementById('connectionStatus'),
        currentDate: document.getElementById('currentDate'),
        myTeamShift: document.getElementById('myTeamShift'),
        nextShift: document.getElementById('nextShift'),
        todayShifts: document.getElementById('todayShifts'),
        scheduleView: document.getElementById('scheduleView'),
        transferInfo: document.getElementById('transferInfo'),
        compareTeam: document.getElementById('compareTeam'),
        changeTeamBtn: document.getElementById('changeTeamBtn'),
        todayBtn: document.getElementById('todayBtn'),
        prevBtn: document.getElementById('prevBtn'),
        currentBtn: document.getElementById('currentBtn'),
        nextBtn: document.getElementById('nextBtn')
    };
}

/**
 * Initializes the application state, loads the user's team selection, updates UI views, displays version information, and registers the service worker if supported.
 */
function initializeApp() {
    // Check if user has selected a team
    userTeam = localStorage.getItem('userTeam');

    if (!userTeam) {
        elements.teamModal.show();
    } else {
        userTeam = parseInt(userTeam);
        updateCompareTeamOptions();
        updateAllViews();
    }

    // Update version displays
    updateVersionDisplays();

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('serviceWorker.js')
            .then(() => {
                console.log('ServiceWorker registered');
                // Get service worker version
                getServiceWorkerVersion();
            })
            .catch(error => console.error('ServiceWorker registration failed:', error));
    }
}

/**
 * Sets up all event listeners for user interactions and UI updates.
 *
 * Handles team selection, navigation controls, compare team changes, tab switches, and online/offline status updates to ensure the application responds dynamically to user actions and connectivity changes.
 */
function setupEventListeners() {
    // Team selection
    document.querySelectorAll('.team-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const team = parseInt(this.dataset.team);
            selectTeam(team);
        });
    });

    // Change team button
    elements.changeTeamBtn.addEventListener('click', function() {
        elements.teamModal.show();
    });

    // Navigation buttons
    elements.todayBtn.addEventListener('click', function() {
        currentViewDate = dayjs();
        updateAllViews();
    });

    elements.prevBtn.addEventListener('click', function() {
        currentViewDate = currentViewDate.subtract(7, 'day');
        updateScheduleView();
    });

    elements.currentBtn.addEventListener('click', function() {
        currentViewDate = dayjs();
        updateScheduleView();
    });

    elements.nextBtn.addEventListener('click', function() {
        currentViewDate = currentViewDate.add(7, 'day');
        updateScheduleView();
    });

    // Compare team selection
    elements.compareTeam.addEventListener('change', function() {
        updateTransferView();
    });

    // Tab switching
    document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(event) {
            const target = event.target.getAttribute('data-bs-target');
            if (target === '#schedule') {
                updateScheduleView();
            } else if (target === '#transfer') {
                updateTransferView();
            }
        });
    });

    // Online/offline detection
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

/**
 * Sets the user's team selection, updates local storage, hides the team selection modal, and refreshes related UI views.
 * @param {number} team - The team number selected by the user.
 */
function selectTeam(team) {
    userTeam = team;
    localStorage.setItem('userTeam', team.toString());
    elements.teamModal.hide();
    updateCompareTeamOptions();
    updateAllViews();
}

/**
 * Populates the compare team dropdown with all teams except the user's selected team.
 */
function updateCompareTeamOptions() {
    elements.compareTeam.innerHTML = '';
    for (let i = 1; i <= CONFIG.TEAMS_COUNT; i++) {
        if (i !== userTeam) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Team ${i}`;
            elements.compareTeam.appendChild(option);
        }
    }
}

/**
 * Returns the current shift day, adjusting for night shifts that span midnight.
 *
 * If the current time is before 07:00, the shift day is considered to be the previous calendar day; otherwise, it is today.
 * @return {dayjs.Dayjs} The dayjs object representing the current shift day.
 */
function getCurrentShiftDay() {
    const now = dayjs();
    const currentHour = now.hour();

    if (currentHour < 7) {
        // Before 07:00: we're in a night shift that started yesterday
        return now.subtract(1, 'day');
    } else {
        // 07:00 and after: we're in a shift that starts today
        return now;
    }
}

/**
 * Determines if the given date matches the current shift day, accounting for night shifts spanning midnight.
 * @param {string|Date|dayjs.Dayjs} date - The date to check.
 * @return {boolean} True if the date is the current shift day; otherwise, false.
 */
function isCurrentShiftDay(date) {
    const currentShiftDay = getCurrentShiftDay();
    return dayjs(date).isSame(currentShiftDay, 'day');
}

/**
 * Returns the start and end dates of the week containing the given date, with the week starting on Monday.
 * @param {dayjs.ConfigType} date - The date for which to determine the week range.
 * @return {{start: dayjs.Dayjs, end: dayjs.Dayjs}} An object with `start` as the Monday and `end` as the Sunday of the week.
 */
function getWeekRange(date) {
    const startOfWeek = dayjs(date).startOf('week').add(1, 'day'); // Monday start
    const endOfWeek = startOfWeek.add(6, 'day');
    return {
        start: startOfWeek,
        end: endOfWeek
    };
}

// Utility function for future use
// function isWithinDateRange(date, startDate, endDate) {
//     const checkDate = dayjs(date);
//     return checkDate.isSameOrAfter(dayjs(startDate)) &&
//            checkDate.isSameOrBefore(dayjs(endDate));
/**
 * Determines whether two dates fall on the same calendar day.
 * @param {string|Date|dayjs.Dayjs} date1 - The first date to compare.
 * @param {string|Date|dayjs.Dayjs} date2 - The second date to compare.
 * @return {boolean} True if both dates are on the same day; otherwise, false.
 */

function isSameDay(date1, date2) {
    return dayjs(date1).isSame(dayjs(date2), 'day');
}

/**
 * Determines the shift assigned to a specific team on a given date based on the configured shift cycle and team offset.
 * @param {string|Date|dayjs.Dayjs} date - The date for which to calculate the shift.
 * @param {number} teamNumber - The team number to calculate the shift for.
 * @return {Object} The shift object (MORNING, EVENING, NIGHT, or OFF) assigned to the team on the specified date.
 */
function calculateShift(date, teamNumber) {
    const targetDate = dayjs(date).startOf('day');
    const referenceDate = dayjs(CONFIG.REFERENCE_DATE).startOf('day');

    // Calculate days since reference
    const daysSinceReference = targetDate.diff(referenceDate, 'day');

    // Calculate team offset (each team starts 2 days later)
    const teamOffset = (teamNumber - CONFIG.REFERENCE_TEAM) * 2;

    // Calculate position in 10-day cycle
    const adjustedDays = daysSinceReference - teamOffset;
    const cyclePosition = ((adjustedDays % CONFIG.SHIFT_CYCLE_DAYS) + CONFIG.SHIFT_CYCLE_DAYS) % CONFIG.SHIFT_CYCLE_DAYS;

    // Determine shift based on cycle position
    if (cyclePosition < 2) {
        return SHIFTS.MORNING;
    }
    if (cyclePosition < 4) {
        return SHIFTS.EVENING;
    }
    if (cyclePosition < 6) {
        return SHIFTS.NIGHT;
    }
    return SHIFTS.OFF;
}

/**
 * Formats a date as a compact code combining two-digit year, ISO week number, and day of week (Monday=1 to Sunday=7).
 * @param {string|Date|dayjs.Dayjs} date - The date to format.
 * @return {string} The formatted date code in the format 'YYWW.D', e.g., '2415.3' for Wednesday of week 15 in 2024.
 */
function formatDateCode(date) {
    const d = dayjs(date);
    const year = d.year().toString().slice(-2);
    const week = d.week().toString().padStart(2, '0');
    const day = d.day() === 0 ? 7 : d.day(); // Sunday = 7, Monday = 1, etc.
    return `${year}${week}.${day}`;
}

/**
 * Returns the shift code for a given date and team, adjusting for night shifts to use the previous day's date code.
 * @param {dayjs.Dayjs|string|Date} date - The date for which to generate the shift code.
 * @param {number} teamNumber - The team number.
 * @return {string} The shift code in the format YYWW.DX, where X is the shift code.
 */
function getShiftCode(date, teamNumber) {
    const shift = calculateShift(date, teamNumber);
    const dateCode = formatDateCode(date);

    // For night shifts, use previous day's date code
    if (shift === SHIFTS.NIGHT) {
        const prevDay = dayjs(date).subtract(1, 'day');
        const prevDateCode = formatDateCode(prevDay);
        return `${prevDateCode}${shift.code}`;
    }

    return `${dateCode}${shift.code}`;
}

/**
 * Finds the next non-off shift for a given team after a specified date.
 * @param {dayjs.Dayjs|string|Date} fromDate - The date after which to search for the next shift.
 * @param {number} teamNumber - The team number to check shifts for.
 * @return {{date: dayjs.Dayjs, shift: Object, code: string} | null} The next shift's date, shift object, and shift code, or null if none found within the cycle.
 */
function getNextShift(fromDate, teamNumber) {
    let checkDate = dayjs(fromDate).add(1, 'day');

    for (let i = 0; i < CONFIG.SHIFT_CYCLE_DAYS; i++) {
        const shift = calculateShift(checkDate, teamNumber);
        if (shift !== SHIFTS.OFF) {
            return {
                date: checkDate,
                shift: shift,
                code: getShiftCode(checkDate, teamNumber)
            };
        }
        checkDate = checkDate.add(1, 'day');
    }

    return null;
}

/**
 * Finds upcoming days where two teams have consecutive working shifts, indicating a handover or takeover opportunity.
 *
 * Checks each day in the specified range to identify when both teams are working and their shifts are consecutive (e.g., Morning followed by Evening, Evening followed by Night, Night followed by Morning).
 *
 * @param {number} myTeam - The user's team number.
 * @param {number} otherTeam - The comparison team number.
 * @param {dayjs.Dayjs|string|Date} fromDate - The start date for the search.
 * @param {number} [daysToCheck=14] - The number of days to check from the start date.
 * @return {Array<Object>} An array of transfer objects, each containing the date, both teams' shifts and codes, and the transfer type ('handover' or 'takeover').
 */
function getTransferDays(myTeam, otherTeam, fromDate, daysToCheck = 14) {
    const transfers = [];

    for (let i = 0; i < daysToCheck; i++) {
        const checkDate = dayjs(fromDate).add(i, 'day');
        const myShift = calculateShift(checkDate, myTeam);
        const otherShift = calculateShift(checkDate, otherTeam);

        // Check if both teams are working and shifts are consecutive
        if (myShift !== SHIFTS.OFF && otherShift !== SHIFTS.OFF) {
            const myShiftOrder = getShiftOrder(myShift);
            const otherShiftOrder = getShiftOrder(otherShift);

            // Transfer if shifts are consecutive (e.g., Morning -> Evening, Evening -> Night, Night -> Morning)
            if ((myShiftOrder + 1) % 3 === otherShiftOrder || (otherShiftOrder + 1) % 3 === myShiftOrder) {
                transfers.push({
                    date: checkDate,
                    myShift: myShift,
                    otherShift: otherShift,
                    myCode: getShiftCode(checkDate, myTeam),
                    otherCode: getShiftCode(checkDate, otherTeam),
                    type: (myShiftOrder + 1) % 3 === otherShiftOrder ? 'handover' : 'takeover'
                });
            }
        }
    }

    return transfers;
}

/**
 * Returns the numeric order of a shift type for sequencing purposes.
 * @param {Object} shift - The shift object to evaluate.
 * @return {number} The order of the shift: 0 for Morning, 1 for Evening, 2 for Night, or -1 if not a recognized shift.
 */
function getShiftOrder(shift) {
    if (shift === SHIFTS.MORNING) {
        return 0;
    }
    if (shift === SHIFTS.EVENING) {
        return 1;
    }
    if (shift === SHIFTS.NIGHT) {
        return 2;
    }
    return -1;
}

/**
 * Updates all main UI views, including current status, today's shifts, and, if their tabs are active, the weekly schedule and transfer views.
 */
function updateAllViews() {
    updateCurrentStatus();
    updateTodayView();
    if (document.querySelector('#schedule-tab').classList.contains('active')) {
        updateScheduleView();
    }
    if (document.querySelector('#transfer-tab').classList.contains('active')) {
        updateTransferView();
    }
}

/**
 * Updates the current shift status display, showing the current shift day, the user's team shift with timing details, and the next upcoming shift.
 */
function updateCurrentStatus() {
    const now = dayjs();
    const currentShiftDay = getCurrentShiftDay();
    const dateCode = formatDateCode(currentShiftDay);
    const myShift = calculateShift(currentShiftDay, userTeam);
    const nextShift = getNextShift(currentShiftDay, userTeam);

    // Display the current shift day (may be different from calendar day for night shifts)
    const displayText = isCurrentShiftDay(now) && now.hour() < 7 ?
        `${currentShiftDay.format('dddd, MMMM D, YYYY')} (Night shift from ${now.subtract(1, 'day').format('MMM D')})` :
        `${now.format('dddd, MMMM D, YYYY')}`;

    elements.currentDate.textContent = `${displayText} (${dateCode})`;

    // My team shift status with enhanced timing info
    const currentHour = now.hour();
    let timingInfo = myShift.hours;

    if (myShift !== SHIFTS.OFF) {
        if (myShift === SHIFTS.NIGHT && currentHour < 7) {
            timingInfo = `${myShift.hours} (ends at 07:00)`;
        } else if (myShift === SHIFTS.MORNING && currentHour < 7) {
            timingInfo = `${myShift.hours} (starts at 07:00)`;
        } else if (myShift === SHIFTS.EVENING && currentHour < 15) {
            timingInfo = `${myShift.hours} (starts at 15:00)`;
        } else if (myShift === SHIFTS.NIGHT && currentHour < 23) {
            timingInfo = `${myShift.hours} (starts at 23:00)`;
        }
    }

    const shiftHtml = `
        <div class="d-flex align-items-center">
            <span class="badge shift-${myShift.name.toLowerCase()} me-2 shift-code">${myShift.code}</span>
            <div>
                <div class="fw-bold">Team ${userTeam} - ${myShift.name}</div>
                <small class="text-muted">${timingInfo}</small>
            </div>
        </div>
    `;
    elements.myTeamShift.innerHTML = shiftHtml;

    // Next shift
    if (nextShift) {
        elements.nextShift.innerHTML = `
            <small class="text-muted">Next shift:</small><br>
            <strong>${nextShift.shift.name}</strong> on ${nextShift.date.format('ddd, MMM D')} (${nextShift.code})
        `;
    } else {
        elements.nextShift.innerHTML = '<small class="text-muted">No upcoming shifts found</small>';
    }
}

/**
 * Updates the UI to display today's shifts for all teams, highlighting the user's team and indicating if it is currently active.
 */
function updateTodayView() {
    const currentShiftDay = getCurrentShiftDay();
    const shiftsHtml = [];

    for (let team = 1; team <= CONFIG.TEAMS_COUNT; team++) {
        const shift = calculateShift(currentShiftDay, team);
        const code = getShiftCode(currentShiftDay, team);
        const isMyTeam = team === userTeam;
        const isCurrentTeamDay = isCurrentShiftDay(currentShiftDay) && team === userTeam;

        shiftsHtml.push(`
            <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
                <div class="card h-100 ${isMyTeam ? 'my-team' : ''} ${isCurrentTeamDay ? 'border-success border-2' : ''}">
                    <div class="card-body text-center">
                        <h6 class="card-title">
                            Team ${team}
                            ${isCurrentTeamDay ? '<span class="badge bg-success ms-1">Active</span>' : ''}
                        </h6>
                        <span class="badge shift-${shift.name.toLowerCase()} shift-code mb-2">${code}</span>
                        <div class="small text-muted">${shift.name}</div>
                        <div class="small text-muted">${shift.hours}</div>
                    </div>
                </div>
            </div>
        `);
    }

    elements.todayShifts.innerHTML = shiftsHtml.join('');
}

/**
 * Generates the HTML for the schedule table header with day columns.
 * @param {Array} days - Array of day.js objects representing the week
 * @param {Object} currentShiftDay - The current shift day for highlighting
 * @returns {string} HTML string for the table header
 */
function generateScheduleTableHeader(days, currentShiftDay) {
    return `
        <tr>
            <th class="team-header">Team</th>
            ${days.map(day => {
        const isToday = isSameDay(day, currentShiftDay);
        return `<th class="${isToday ? 'bg-light border-success' : ''}">${day.format('ddd')}<br><small>${day.format('M/D')}</small>${isToday ? '<br><span class="badge badge-sm bg-success">Today</span>' : ''}</th>`;
    }).join('')}
        </tr>
    `;
}

/**
 * Generates the HTML for a single team row in the schedule table.
 * @param {number} team - Team number
 * @param {Array} days - Array of day.js objects representing the week
 * @param {number} userTeam - The user's team number for highlighting
 * @param {Object} currentShiftDay - The current shift day for highlighting
 * @returns {string} HTML string for the team row
 */
function generateScheduleTableRow(team, days, userTeam, currentShiftDay) {
    const isMyTeam = team === userTeam;
    let rowHtml = `<tr ${isMyTeam ? 'class="table-primary"' : ''}>`;
    rowHtml += `<td class="team-header">Team ${team}</td>`;

    days.forEach(day => {
        const shift = calculateShift(day, team);
        const isToday = isSameDay(day, currentShiftDay);
        const isCurrentTeamToday = isToday && team === userTeam;

        rowHtml += `
            <td class="${isToday ? 'bg-light' : ''} ${isCurrentTeamToday ? 'border-success border-2' : ''}">
                <span class="badge shift-${shift.name.toLowerCase()} shift-code">${shift.code}</span>
                <br><small>${shift.name}</small>
                ${isCurrentTeamToday ? '<br><span class="badge badge-sm bg-success">Active</span>' : ''}
            </td>
        `;
    });

    rowHtml += '</tr>';
    return rowHtml;
}

/**
 * Updates the weekly schedule table view, displaying each team's shifts for the current week.
 *
 * Highlights the user's team and the current shift day, and marks the active shift for the user's team. The schedule covers a Monday-to-Sunday week based on the selected view date.
 */
function updateScheduleView() {
    const weekRange = getWeekRange(currentViewDate);
    const days = [];

    // Generate 7 days starting from Monday using the new utility
    for (let i = 0; i < 7; i++) {
        days.push(weekRange.start.add(i, 'day'));
    }

    const currentShiftDay = getCurrentShiftDay();

    // Generate table HTML using helper functions
    let tableHtml = `
        <table class="table table-bordered schedule-table">
            <thead>
                ${generateScheduleTableHeader(days, currentShiftDay)}
            </thead>
            <tbody>
    `;

    // Generate rows for each team
    for (let team = 1; team <= CONFIG.TEAMS_COUNT; team++) {
        tableHtml += generateScheduleTableRow(team, days, userTeam, currentShiftDay);
    }

    tableHtml += '</tbody></table>';

    elements.scheduleView.innerHTML = tableHtml;
}

/**
 * Updates the transfer view to display upcoming transfer days between the user's team and the selected comparison team.
 *
 * Shows a list of days within the next 14 days where the user's team and the compared team have consecutive shifts, indicating handover or takeover opportunities. Highlights the current day if it is a transfer day. If no transfers are found, displays an informational message.
 */
function updateTransferView() {
    const compareTeam = parseInt(elements.compareTeam.value);
    if (!compareTeam || compareTeam === userTeam) {
        return;
    }

    const currentShiftDay = getCurrentShiftDay();
    const transfers = getTransferDays(userTeam, compareTeam, currentShiftDay);

    if (transfers.length === 0) {
        elements.transferInfo.innerHTML = `
            <div class="alert alert-info">
                No transfers found between Team ${userTeam} and Team ${compareTeam} in the next 14 days.
            </div>
        `;
        return;
    }

    let transferHtml = `
        <div class="alert alert-info">
            <strong>Transfers between Team ${userTeam} and Team ${compareTeam}:</strong>
        </div>
        <div class="row g-3">
    `;

    transfers.forEach(transfer => {
        const typeClass = transfer.type === 'handover' ? 'success' : 'warning';
        const typeText = transfer.type === 'handover' ? 'You hand over to' : 'You take over from';
        const isToday = isSameDay(transfer.date, currentShiftDay);

        transferHtml += `
            <div class="col-12 col-md-6">
                <div class="card border-${typeClass} ${isToday ? 'border-3 bg-light' : ''}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="card-title">
                                    ${transfer.date.format('ddd, MMM D')}
                                    ${isToday ? '<span class="badge bg-success ms-1">Today</span>' : ''}
                                </h6>
                                <p class="card-text small mb-1">${typeText} Team ${compareTeam}</p>
                                <div class="d-flex gap-2">
                                    <span class="badge shift-${transfer.myShift.name.toLowerCase()}">${transfer.myCode}</span>
                                    <span class="text-muted">→</span>
                                    <span class="badge shift-${transfer.otherShift.name.toLowerCase()}">${transfer.otherCode}</span>
                                </div>
                                ${isToday ? '<small class="text-success fw-bold">Active transfer day</small>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    transferHtml += '</div>';
    elements.transferInfo.innerHTML = transferHtml;
}

/**
 * Starts periodic checks of the application's online status, updating the status indicator every 30 seconds.
 */
function checkOnlineStatus() {
    updateOnlineStatus();
    // Check every 30 seconds
    const onlineStatusInterval = setInterval(updateOnlineStatus, 30000);
    return onlineStatusInterval;
}

/**
 * Updates the connection status badge to reflect the current online or offline state.
 */
function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    elements.connectionStatus.textContent = isOnline ? 'Online' : 'Offline';
    elements.connectionStatus.className = `badge ${isOnline ? 'bg-success' : 'bg-danger'}`;
}

/**
 * Updates all version display elements in the UI with the current application version.
 */
function updateVersionDisplays() {
    const versionElements = document.querySelectorAll('#appVersion, #aboutVersion');
    versionElements.forEach(el => {
        if (el) {
            el.textContent = `v${CONFIG.VERSION}`;
        }
    });
}

/**
 * Requests the version of the active service worker and updates the corresponding UI element with the version information if available.
 * If the service worker controller is not yet available, sets up a listener to retry when it becomes available.
 */
function getServiceWorkerVersion() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            const swVersionEl = document.getElementById('swVersion');
            if (swVersionEl && event.data && event.data.version) {
                swVersionEl.textContent = event.data.version;
            }
        };

        navigator.serviceWorker.controller.postMessage(
            { type: 'GET_VERSION' },
            [channel.port2]
        );
    } else if ('serviceWorker' in navigator) {
        // Wait for controller to be available
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            getServiceWorkerVersion();
        });
    }
}

// Auto-refresh every minute to keep current time accurate
let autoRefreshInterval = null;

function startAutoRefresh() {
    // Clear any existing interval to prevent duplicates
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }

    autoRefreshInterval = setInterval(function() {
        if (userTeam) {
            updateCurrentStatus();
        }
    }, 60000);
}

// Start auto-refresh when app loads
startAutoRefresh();
