// DevDash - Advanced Features Module
// Pomodoro Timer, Habit Tracker, Project Manager, Analytics

// Extended State
state.pomodoro = {
    workDuration: 25 * 60,
    breakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    currentSession: 0,
    sessionsUntilLongBreak: 4,
    isRunning: false,
    isPaused: false,
    timeRemaining: 25 * 60,
    mode: 'work', // work, break, longBreak
    interval: null,
    completedSessions: []
};

state.habits = [];
state.projects = [];
state.analytics = {
    dailyStats: {},
    weeklyGoals: {},
    productivity: []
};

// Pomodoro Timer
function initPomodoro() {
    updatePomodoroDisplay();
}

function startPomodoro() {
    if (state.pomodoro.isRunning) return;
    
    state.pomodoro.isRunning = true;
    state.pomodoro.isPaused = false;
    
    state.pomodoro.interval = setInterval(() => {
        if (state.pomodoro.timeRemaining > 0) {
            state.pomodoro.timeRemaining--;
            updatePomodoroDisplay();
        } else {
            completePomodoroSession();
        }
    }, 1000);
    
    updatePomodoroButtons();
}

function pausePomodoro() {
    if (!state.pomodoro.isRunning) return;
    
    clearInterval(state.pomodoro.interval);
    state.pomodoro.isRunning = false;
    state.pomodoro.isPaused = true;
    updatePomodoroButtons();
}

function resetPomodoro() {
    clearInterval(state.pomodoro.interval);
    state.pomodoro.isRunning = false;
    state.pomodoro.isPaused = false;
    
    if (state.pomodoro.mode === 'work') {
        state.pomodoro.timeRemaining = state.pomodoro.workDuration;
    } else if (state.pomodoro.mode === 'break') {
        state.pomodoro.timeRemaining = state.pomodoro.breakDuration;
    } else {
        state.pomodoro.timeRemaining = state.pomodoro.longBreakDuration;
    }
    
    updatePomodoroDisplay();
    updatePomodoroButtons();
}

function completePomodoroSession() {
    clearInterval(state.pomodoro.interval);
    state.pomodoro.isRunning = false;
    
    // Play notification sound (if available)
    playNotificationSound();
    
    if (state.pomodoro.mode === 'work') {
        state.pomodoro.currentSession++;
        state.pomodoro.completedSessions.push({
            timestamp: new Date().toISOString(),
            duration: state.pomodoro.workDuration
        });
        
        // Determine next mode
        if (state.pomodoro.currentSession % state.pomodoro.sessionsUntilLongBreak === 0) {
            state.pomodoro.mode = 'longBreak';
            state.pomodoro.timeRemaining = state.pomodoro.longBreakDuration;
            showNotification('Great work! Time for a long break! 🎉');
        } else {
            state.pomodoro.mode = 'break';
            state.pomodoro.timeRemaining = state.pomodoro.breakDuration;
            showNotification('Work session complete! Take a break! ☕');
        }
    } else {
        state.pomodoro.mode = 'work';
        state.pomodoro.timeRemaining = state.pomodoro.workDuration;
        showNotification('Break over! Ready to focus? 💪');
    }
    
    updatePomodoroDisplay();
    updatePomodoroButtons();
    saveState();
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(state.pomodoro.timeRemaining / 60);
    const seconds = state.pomodoro.timeRemaining % 60;
    
    const display = document.getElementById('pomodoroDisplay');
    if (display) {
        display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    
    const modeDisplay = document.getElementById('pomodoroMode');
    if (modeDisplay) {
        const modes = {
            work: '🎯 Focus Time',
            break: '☕ Short Break',
            longBreak: '🎉 Long Break'
        };
        modeDisplay.textContent = modes[state.pomodoro.mode];
    }
    
    const sessionDisplay = document.getElementById('pomodoroSession');
    if (sessionDisplay) {
        sessionDisplay.textContent = `Session ${state.pomodoro.currentSession + 1}`;
    }
}

function updatePomodoroButtons() {
    const startBtn = document.getElementById('pomodoroStart');
    const pauseBtn = document.getElementById('pomodoroPause');
    
    if (startBtn && pauseBtn) {
        if (state.pomodoro.isRunning) {
            startBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
        } else {
            startBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
        }
    }
}

function playNotificationSound() {
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not available');
    }
}

// Habit Tracker
function addHabit() {
    const input = document.getElementById('habitInput');
    const name = input.value.trim();
    
    if (!name) return;
    
    state.habits.push({
        id: Date.now(),
        name: name,
        streak: 0,
        completedDates: [],
        createdAt: new Date().toISOString()
    });
    
    input.value = '';
    saveState();
    renderHabits();
}

function toggleHabitToday(id) {
    const habit = state.habits.find(h => h.id === id);
    if (!habit) return;
    
    const today = new Date().toISOString().split('T')[0];
    const index = habit.completedDates.indexOf(today);
    
    if (index > -1) {
        habit.completedDates.splice(index, 1);
        habit.streak = calculateStreak(habit.completedDates);
    } else {
        habit.completedDates.push(today);
        habit.completedDates.sort();
        habit.streak = calculateStreak(habit.completedDates);
    }
    
    saveState();
    renderHabits();
}

function calculateStreak(dates) {
    if (dates.length === 0) return 0;
    
    const sortedDates = [...dates].sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let dateStr of sortedDates) {
        const checkDate = currentDate.toISOString().split('T')[0];
        
        if (dateStr === checkDate) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

function deleteHabit(id) {
    state.habits = state.habits.filter(h => h.id !== id);
    saveState();
    renderHabits();
}

function renderHabits() {
    const list = document.getElementById('habitList');
    if (!list) return;
    
    if (state.habits.length === 0) {
        list.innerHTML = '<div class="text-white/50 text-sm text-center py-4">No habits tracked yet</div>';
        return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    list.innerHTML = state.habits.map(habit => {
        const completedToday = habit.completedDates.includes(today);
        
        return `
            <div class="bg-white/10 rounded-lg p-3">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3 flex-1">
                        <button 
                            onclick="toggleHabitToday(${habit.id})"
                            class="w-8 h-8 rounded-full border-2 ${completedToday ? 'bg-green-500 border-green-500' : 'border-white/40'} flex items-center justify-center transition"
                        >
                            ${completedToday ? '<i class="fas fa-check text-white text-sm"></i>' : ''}
                        </button>
                        <div>
                            <div class="text-white text-sm font-medium">${habit.name}</div>
                            <div class="text-white/60 text-xs">
                                ${habit.streak > 0 ? `🔥 ${habit.streak} day streak` : 'Start your streak!'}
                            </div>
                        </div>
                    </div>
                    <button onclick="deleteHabit(${habit.id})" class="text-red-400 hover:text-red-300 transition">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Project Manager
function addProject() {
    const input = document.getElementById('projectInput');
    const name = input.value.trim();
    
    if (!name) return;
    
    state.projects.push({
        id: Date.now(),
        name: name,
        status: 'active',
        tasks: [],
        timeSpent: 0,
        createdAt: new Date().toISOString(),
        lastWorkedOn: null
    });
    
    input.value = '';
    saveState();
    renderProjects();
}

function deleteProject(id) {
    state.projects = state.projects.filter(p => p.id !== id);
    saveState();
    renderProjects();
}

function toggleProjectStatus(id) {
    const project = state.projects.find(p => p.id === id);
    if (!project) return;
    
    project.status = project.status === 'active' ? 'completed' : 'active';
    saveState();
    renderProjects();
}

function renderProjects() {
    const list = document.getElementById('projectList');
    if (!list) return;
    
    if (state.projects.length === 0) {
        list.innerHTML = '<div class="text-white/50 text-sm text-center py-4">No projects yet</div>';
        return;
    }
    
    const activeProjects = state.projects.filter(p => p.status === 'active');
    const completedProjects = state.projects.filter(p => p.status === 'completed');
    const sortedProjects = [...activeProjects, ...completedProjects];
    
    list.innerHTML = sortedProjects.map(project => {
        const hours = Math.floor(project.timeSpent / 3600000);
        const minutes = Math.floor((project.timeSpent % 3600000) / 60000);
        
        return `
            <div class="bg-white/10 rounded-lg p-3 ${project.status === 'completed' ? 'opacity-60' : ''}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3 flex-1">
                        <button 
                            onclick="toggleProjectStatus(${project.id})"
                            class="w-6 h-6 rounded border-2 ${project.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-white/40'} flex items-center justify-center transition"
                        >
                            ${project.status === 'completed' ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                        </button>
                        <div class="flex-1">
                            <div class="text-white text-sm font-medium ${project.status === 'completed' ? 'line-through' : ''}">${project.name}</div>
                            ${hours > 0 || minutes > 0 ? `<div class="text-white/60 text-xs">${hours}h ${minutes}m logged</div>` : ''}
                        </div>
                    </div>
                    <button onclick="deleteProject(${project.id})" class="text-red-400 hover:text-red-300 transition ml-2">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Analytics
function updateAnalytics() {
    const today = new Date().toISOString().split('T')[0];
    
    if (!state.analytics.dailyStats[today]) {
        state.analytics.dailyStats[today] = {
            todosCompleted: 0,
            pomodorosCompleted: 0,
            timeTracked: 0,
            habitsCompleted: 0
        };
    }
    
    // Calculate today's stats
    const todayStats = state.analytics.dailyStats[today];
    todayStats.todosCompleted = state.todos.filter(t => 
        t.completed && t.completedAt && t.completedAt.startsWith(today)
    ).length;
    
    todayStats.pomodorosCompleted = state.pomodoro.completedSessions.filter(s =>
        s.timestamp.startsWith(today)
    ).length;
    
    todayStats.timeTracked = state.timeLogs
        .filter(log => log.timestamp.startsWith(today))
        .reduce((sum, log) => sum + log.duration, 0);
    
    todayStats.habitsCompleted = state.habits.filter(h =>
        h.completedDates.includes(today)
    ).length;
    
    saveState();
    renderAnalytics();
}

function renderAnalytics() {
    const container = document.getElementById('analyticsContent');
    if (!container) return;
    
    const today = new Date().toISOString().split('T')[0];
    const stats = state.analytics.dailyStats[today] || {
        todosCompleted: 0,
        pomodorosCompleted: 0,
        timeTracked: 0,
        habitsCompleted: 0
    };
    
    const hours = Math.floor(stats.timeTracked / 3600000);
    const minutes = Math.floor((stats.timeTracked % 3600000) / 60000);
    
    container.innerHTML = `
        <div class="grid grid-cols-2 gap-3">
            <div class="bg-white/10 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-white">${stats.todosCompleted}</div>
                <div class="text-white/60 text-xs mt-1">Tasks Done</div>
            </div>
            <div class="bg-white/10 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-white">${stats.pomodorosCompleted}</div>
                <div class="text-white/60 text-xs mt-1">Pomodoros</div>
            </div>
            <div class="bg-white/10 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-white">${hours}h ${minutes}m</div>
                <div class="text-white/60 text-xs mt-1">Time Tracked</div>
            </div>
            <div class="bg-white/10 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-white">${stats.habitsCompleted}</div>
                <div class="text-white/60 text-xs mt-1">Habits Done</div>
            </div>
        </div>
        
        <div class="mt-4 bg-white/10 rounded-lg p-4">
            <div class="text-white/80 text-sm mb-2">Productivity Score</div>
            <div class="flex items-center gap-3">
                <div class="flex-1 bg-white/20 rounded-full h-3 overflow-hidden">
                    <div class="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all" style="width: ${calculateProductivityScore()}%"></div>
                </div>
                <div class="text-white font-bold">${calculateProductivityScore()}%</div>
            </div>
        </div>
    `;
}

function calculateProductivityScore() {
    const today = new Date().toISOString().split('T')[0];
    const stats = state.analytics.dailyStats[today];
    
    if (!stats) return 0;
    
    let score = 0;
    score += Math.min(stats.todosCompleted * 10, 30);
    score += Math.min(stats.pomodorosCompleted * 15, 40);
    score += Math.min(stats.habitsCompleted * 10, 20);
    score += Math.min(Math.floor(stats.timeTracked / 3600000) * 5, 10);
    
    return Math.min(score, 100);
}

// Weekly Overview
function renderWeeklyOverview() {
    const container = document.getElementById('weeklyOverview');
    if (!container) return;
    
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        const stats = state.analytics.dailyStats[dateStr] || {
            todosCompleted: 0,
            pomodorosCompleted: 0,
            timeTracked: 0,
            habitsCompleted: 0
        };
        
        const score = calculateDayScore(stats);
        
        days.push({ dayName, score, dateStr });
    }
    
    container.innerHTML = `
        <div class="flex justify-between items-end gap-2">
            ${days.map(day => `
                <div class="flex-1 flex flex-col items-center gap-2">
                    <div class="w-full bg-white/20 rounded-t-lg overflow-hidden" style="height: 80px;">
                        <div class="bg-gradient-to-t from-green-400 to-blue-500 w-full rounded-t-lg transition-all" style="height: ${day.score}%;"></div>
                    </div>
                    <div class="text-white/60 text-xs">${day.dayName}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function calculateDayScore(stats) {
    let score = 0;
    score += Math.min(stats.todosCompleted * 10, 30);
    score += Math.min(stats.pomodorosCompleted * 15, 40);
    score += Math.min(stats.habitsCompleted * 10, 20);
    score += Math.min(Math.floor(stats.timeTracked / 3600000) * 5, 10);
    return Math.min(score, 100);
}

// Initialize advanced features
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initPomodoro();
        renderHabits();
        renderProjects();
        updateAnalytics();
        renderWeeklyOverview();
        
        // Update analytics every minute
        setInterval(() => {
            updateAnalytics();
            renderWeeklyOverview();
        }, 60000);
    });
}
