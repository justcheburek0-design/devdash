// Calendar Integration Module
// Provides calendar view and event management

state.events = state.events || [];

// Calendar Functions
function initCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const container = document.getElementById('calendarView');
    if (!container) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    let html = `
        <div class="mb-4 flex items-center justify-between">
            <button onclick="previousMonth()" class="text-white/80 hover:text-white transition">
                <i class="fas fa-chevron-left"></i>
            </button>
            <div class="text-white font-semibold">${monthNames[month]} ${year}</div>
            <button onclick="nextMonth()" class="text-white/80 hover:text-white transition">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        <div class="grid grid-cols-7 gap-1 mb-2">
            <div class="text-white/60 text-xs text-center py-1">Sun</div>
            <div class="text-white/60 text-xs text-center py-1">Mon</div>
            <div class="text-white/60 text-xs text-center py-1">Tue</div>
            <div class="text-white/60 text-xs text-center py-1">Wed</div>
            <div class="text-white/60 text-xs text-center py-1">Thu</div>
            <div class="text-white/60 text-xs text-center py-1">Fri</div>
            <div class="text-white/60 text-xs text-center py-1">Sat</div>
        </div>
        <div class="grid grid-cols-7 gap-1">
    `;
    
    // Empty cells before first day
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div class="aspect-square"></div>';
    }
    
    // Days of month
    const today = now.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = day === today;
        const hasEvents = state.events.some(e => e.date === dateStr);
        
        html += `
            <div class="aspect-square bg-white/10 rounded flex flex-col items-center justify-center text-white text-sm cursor-pointer hover:bg-white/20 transition ${isToday ? 'ring-2 ring-white' : ''}" onclick="showDayEvents('${dateStr}')">
                <div>${day}</div>
                ${hasEvents ? '<div class="w-1 h-1 bg-blue-400 rounded-full mt-1"></div>' : ''}
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function showDayEvents(dateStr) {
    const events = state.events.filter(e => e.date === dateStr);
    
    if (events.length === 0) {
        showNotification('No events on this day');
        return;
    }
    
    let html = `<div class="text-white text-sm mb-2 font-semibold">${dateStr}</div>`;
    events.forEach(event => {
        html += `
            <div class="bg-white/10 rounded p-2 mb-2">
                <div class="text-white text-sm">${event.title}</div>
                ${event.time ? `<div class="text-white/60 text-xs">${event.time}</div>` : ''}
            </div>
        `;
    });
    
    // Show in modal or notification
    showNotification(html);
}

function addEvent() {
    const title = document.getElementById('eventTitle')?.value.trim();
    const date = document.getElementById('eventDate')?.value;
    const time = document.getElementById('eventTime')?.value;
    
    if (!title || !date) {
        showNotification('Please enter title and date!', 'error');
        return;
    }
    
    state.events.push({
        id: Date.now(),
        title: title,
        date: date,
        time: time || null,
        createdAt: new Date().toISOString()
    });
    
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventTime').value = '';
    
    saveState();
    renderCalendar();
    renderUpcomingEvents();
    showNotification('Event added!');
}

function renderUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;
    
    const today = new Date().toISOString().split('T')[0];
    const upcoming = state.events
        .filter(e => e.date >= today)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5);
    
    if (upcoming.length === 0) {
        container.innerHTML = '<div class="text-white/50 text-sm text-center py-4">No upcoming events</div>';
        return;
    }
    
    container.innerHTML = upcoming.map(event => `
        <div class="bg-white/10 rounded-lg p-3 mb-2">
            <div class="text-white text-sm font-medium">${event.title}</div>
            <div class="text-white/60 text-xs mt-1">
                ${event.date} ${event.time ? `at ${event.time}` : ''}
            </div>
        </div>
    `).join('');
}

// Focus Mode
let focusModeActive = false;

function toggleFocusMode() {
    focusModeActive = !focusModeActive;
    
    if (focusModeActive) {
        document.body.classList.add('focus-mode');
        showNotification('Focus mode activated! 🎯');
        
        // Hide distracting elements
        document.querySelectorAll('.card-hover').forEach(card => {
            if (!card.querySelector('#pomodoroDisplay') && !card.querySelector('#todoList')) {
                card.style.opacity = '0.3';
                card.style.pointerEvents = 'none';
            }
        });
    } else {
        document.body.classList.remove('focus-mode');
        showNotification('Focus mode deactivated');
        
        // Restore elements
        document.querySelectorAll('.card-hover').forEach(card => {
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        });
    }
}

// Goal Setting
state.goals = state.goals || {
    daily: [],
    weekly: [],
    monthly: []
};

function addGoal(type) {
    const input = document.getElementById(`${type}GoalInput`);
    const text = input?.value.trim();
    
    if (!text) return;
    
    state.goals[type].push({
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    });
    
    input.value = '';
    saveState();
    renderGoals(type);
}

function toggleGoal(type, id) {
    const goal = state.goals[type].find(g => g.id === id);
    if (goal) {
        goal.completed = !goal.completed;
        saveState();
        renderGoals(type);
    }
}

function deleteGoal(type, id) {
    state.goals[type] = state.goals[type].filter(g => g.id !== id);
    saveState();
    renderGoals(type);
}

function renderGoals(type) {
    const container = document.getElementById(`${type}Goals`);
    if (!container) return;
    
    const goals = state.goals[type];
    
    if (goals.length === 0) {
        container.innerHTML = '<div class="text-white/50 text-sm text-center py-4">No goals set</div>';
        return;
    }
    
    container.innerHTML = goals.map(goal => `
        <div class="bg-white/10 rounded-lg p-3 flex items-center gap-3 ${goal.completed ? 'opacity-60' : ''}">
            <input 
                type="checkbox" 
                ${goal.completed ? 'checked' : ''} 
                onchange="toggleGoal('${type}', ${goal.id})"
                class="w-5 h-5 rounded cursor-pointer"
            >
            <div class="flex-1 text-white text-sm ${goal.completed ? 'line-through' : ''}">${goal.text}</div>
            <button onclick="deleteGoal('${type}', ${goal.id})" class="text-red-400 hover:text-red-300 transition">
                <i class="fas fa-trash text-xs"></i>
            </button>
        </div>
    `).join('');
}

// Distraction Blocker
const distractingSites = [
    'youtube.com',
    'facebook.com',
    'twitter.com',
    'reddit.com',
    'instagram.com',
    'tiktok.com'
];

function checkDistractingSite() {
    const currentUrl = window.location.href;
    
    for (let site of distractingSites) {
        if (currentUrl.includes(site)) {
            if (focusModeActive) {
                showNotification('⚠️ Focus mode is active! Stay focused!', 'error');
                return true;
            }
        }
    }
    
    return false;
}

// Backup Reminder
function checkBackupReminder() {
    const lastBackup = state.lastBackup || 0;
    const daysSinceBackup = (Date.now() - lastBackup) / (1000 * 60 * 60 * 24);
    
    if (daysSinceBackup > 7) {
        showNotification('💾 Reminder: Back up your data!');
    }
}

// Stats Summary
function generateStatsSummary() {
    const today = new Date().toISOString().split('T')[0];
    const stats = state.analytics.dailyStats[today] || {};
    
    const summary = {
        todosCompleted: stats.todosCompleted || 0,
        pomodorosCompleted: stats.pomodorosCompleted || 0,
        timeTracked: stats.timeTracked || 0,
        habitsCompleted: stats.habitsCompleted || 0,
        totalTodos: state.todos.length,
        totalSnippets: state.snippets.length,
        totalHabits: state.habits.length,
        totalProjects: state.projects.length,
        activeProjects: state.projects.filter(p => p.status === 'active').length,
        longestStreak: Math.max(...state.habits.map(h => h.streak), 0)
    };
    
    return summary;
}

function displayStatsSummary() {
    const summary = generateStatsSummary();
    const hours = Math.floor(summary.timeTracked / 3600000);
    const minutes = Math.floor((summary.timeTracked % 3600000) / 60000);
    
    const message = `
        📊 Today's Summary:
        ✅ ${summary.todosCompleted} tasks completed
        🍅 ${summary.pomodorosCompleted} pomodoros
        ⏱️ ${hours}h ${minutes}m tracked
        🔥 ${summary.habitsCompleted} habits done
        
        📈 Overall:
        📝 ${summary.totalTodos} total tasks
        💻 ${summary.totalSnippets} code snippets
        🎯 ${summary.activeProjects} active projects
        🔥 ${summary.longestStreak} day longest streak
    `;
    
    console.log(message);
    return summary;
}

// Initialize calendar and goals
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initCalendar();
        renderUpcomingEvents();
        renderGoals('daily');
        renderGoals('weekly');
        renderGoals('monthly');
        
        // Check backup reminder on load
        setTimeout(checkBackupReminder, 5000);
    });
}

// Notification sound toggle
state.soundEnabled = state.soundEnabled !== false;

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    saveState();
    showNotification(`Sound ${state.soundEnabled ? 'enabled' : 'disabled'}`);
}

// Dark mode toggle (in addition to themes)
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    state.darkMode = isDark;
    saveState();
    
    if (isDark) {
        document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
    } else {
        initTheme();
    }
}

// Auto-refresh GitHub activity every 5 minutes
setInterval(() => {
    if (state.githubUsername) {
        loadGithubActivity();
    }
}, 300000);

// Session persistence warning
window.addEventListener('beforeunload', (e) => {
    if (state.timerRunning || state.pomodoro.isRunning) {
        e.preventDefault();
        e.returnValue = 'You have active timers. Are you sure you want to leave?';
        return e.returnValue;
    }
});
