// NextShift v3 - Team Shift Tracker
// Configuration
const CONFIG = {
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
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('serviceWorker.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(error => console.log('ServiceWorker registration failed'));
    }
}

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

function selectTeam(team) {
    userTeam = team;
    localStorage.setItem('userTeam', team.toString());
    elements.teamModal.hide();
    updateCompareTeamOptions();
    updateAllViews();
}

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

// Core shift calculation functions
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
    if (cyclePosition < 2) return SHIFTS.MORNING;
    if (cyclePosition < 4) return SHIFTS.EVENING;
    if (cyclePosition < 6) return SHIFTS.NIGHT;
    return SHIFTS.OFF;
}

function formatDateCode(date) {
    const d = dayjs(date);
    const year = d.year().toString().slice(-2);
    const week = d.week().toString().padStart(2, '0');
    const day = d.day() === 0 ? 7 : d.day(); // Sunday = 7, Monday = 1, etc.
    return `${year}${week}.${day}`;
}

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

function getShiftOrder(shift) {
    if (shift === SHIFTS.MORNING) return 0;
    if (shift === SHIFTS.EVENING) return 1;
    if (shift === SHIFTS.NIGHT) return 2;
    return -1;
}

// UI Update functions
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

function updateCurrentStatus() {
    const now = dayjs();
    const dateCode = formatDateCode(now);
    const myShift = calculateShift(now, userTeam);
    const nextShift = getNextShift(now, userTeam);
    
    elements.currentDate.textContent = `${now.format('dddd, MMMM D, YYYY')} (${dateCode})`;
    
    // My team shift status
    const shiftHtml = `
        <div class="d-flex align-items-center">
            <span class="badge shift-${myShift.name.toLowerCase()} me-2 shift-code">${myShift.code}</span>
            <div>
                <div class="fw-bold">Team ${userTeam} - ${myShift.name}</div>
                <small class="text-muted">${myShift.hours}</small>
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

function updateTodayView() {
    const today = dayjs();
    const shiftsHtml = [];
    
    for (let team = 1; team <= CONFIG.TEAMS_COUNT; team++) {
        const shift = calculateShift(today, team);
        const code = getShiftCode(today, team);
        const isMyTeam = team === userTeam;
        
        shiftsHtml.push(`
            <div class="col-12 col-sm-6 col-lg-4 col-xl-3">
                <div class="card h-100 ${isMyTeam ? 'my-team' : ''}">
                    <div class="card-body text-center">
                        <h6 class="card-title">Team ${team}</h6>
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

function updateScheduleView() {
    const startOfWeek = currentViewDate.startOf('week').add(1, 'day'); // Start from Monday
    const days = [];
    
    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
        days.push(startOfWeek.add(i, 'day'));
    }
    
    let tableHtml = `
        <table class="table table-bordered schedule-table">
            <thead>
                <tr>
                    <th class="team-header">Team</th>
                    ${days.map(day => `<th>${day.format('ddd')}<br><small>${day.format('M/D')}</small></th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    for (let team = 1; team <= CONFIG.TEAMS_COUNT; team++) {
        const isMyTeam = team === userTeam;
        tableHtml += `<tr ${isMyTeam ? 'class="table-primary"' : ''}>`;
        tableHtml += `<td class="team-header">Team ${team}</td>`;
        
        days.forEach(day => {
            const shift = calculateShift(day, team);
            const code = getShiftCode(day, team);
            tableHtml += `
                <td>
                    <span class="badge shift-${shift.name.toLowerCase()} shift-code">${shift.code}</span>
                    <br><small>${shift.name}</small>
                </td>
            `;
        });
        
        tableHtml += '</tr>';
    }
    
    tableHtml += '</tbody></table>';
    
    elements.scheduleView.innerHTML = tableHtml;
}

function updateTransferView() {
    const compareTeam = parseInt(elements.compareTeam.value);
    if (!compareTeam || compareTeam === userTeam) return;
    
    const transfers = getTransferDays(userTeam, compareTeam, dayjs());
    
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
        
        transferHtml += `
            <div class="col-12 col-md-6">
                <div class="card border-${typeClass}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 class="card-title">${transfer.date.format('ddd, MMM D')}</h6>
                                <p class="card-text small mb-1">${typeText} Team ${compareTeam}</p>
                                <div class="d-flex gap-2">
                                    <span class="badge shift-${transfer.myShift.name.toLowerCase()}">${transfer.myCode}</span>
                                    <span class="text-muted">→</span>
                                    <span class="badge shift-${transfer.otherShift.name.toLowerCase()}">${transfer.otherCode}</span>
                                </div>
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

function checkOnlineStatus() {
    updateOnlineStatus();
    // Check every 30 seconds
    setInterval(updateOnlineStatus, 30000);
}

function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    elements.connectionStatus.textContent = isOnline ? 'Online' : 'Offline';
    elements.connectionStatus.className = `badge ${isOnline ? 'bg-success' : 'bg-danger'}`;
}

// Auto-refresh every minute to keep current time accurate
setInterval(function() {
    if (userTeam) {
        updateCurrentStatus();
    }
}, 60000);