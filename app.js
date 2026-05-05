// DevDash - Developer Dashboard App
// State Management
let state = {
    theme: 'light',
    todos: [],
    snippets: [],
    notes: '',
    githubUsername: '',
    timerRunning: false,
    timerStart: null,
    timerInterval: null,
    currentProject: '',
    timeLogs: []
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    showOnboarding();
    applyTheme();
    loadState();
    updateTime();
    setInterval(updateTime, 1000);
    loadGithubActivity();
    renderTodos();
    renderSnippets();
    renderTimeLogs();
    updateStats();
    
    // Load notes
    document.getElementById('quickNotes').value = state.notes;
});

// Time Display
function updateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Vladivostok'
    };
    document.getElementById('currentTime').textContent = now.toLocaleString('en-US', options);
}

// GitHub Activity
async function loadGithubActivity() {
    const username = state.githubUsername || 'JustCheburek';
    const content = document.getElementById('githubContent');
    
    try {
        // Fetch user events
        const response = await fetch(`https://api.github.com/users/${username}/events/public?per_page=5`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch GitHub data');
        }
        
        const events = await response.json();
        
        if (events.length === 0) {
            content.innerHTML = '<div class="text-white/70 text-sm">No recent activity</div>';
            return;
        }
        
        let html = '<div class="space-y-3">';
        
        events.slice(0, 3).forEach(event => {
            const date = new Date(event.created_at);
            const timeAgo = getTimeAgo(date);
            let icon = 'fa-code';
            let action = event.type.replace('Event', '');
            
            switch(event.type) {
                case 'PushEvent':
                    icon = 'fa-code-branch';
                    action = `Pushed ${event.payload.commits?.length || 0} commit(s)`;
                    break;
                case 'CreateEvent':
                    icon = 'fa-plus-circle';
                    action = `Created ${event.payload.ref_type}`;
                    break;
                case 'IssuesEvent':
                    icon = 'fa-exclamation-circle';
                    action = `${event.payload.action} issue`;
                    break;
                case 'PullRequestEvent':
                    icon = 'fa-code-pull-request';
                    action = `${event.payload.action} PR`;
                    break;
                case 'WatchEvent':
                    icon = 'fa-star';
                    action = 'Starred repo';
                    break;
            }
            
            html += `
                <div class="bg-white/10 rounded-lg p-3">
                    <div class="flex items-start gap-3">
                        <i class="fas ${icon} text-white/70 mt-1"></i>
                        <div class="flex-1 min-w-0">
                            <div class="text-white text-sm font-medium truncate">${action}</div>
                            <div class="text-white/60 text-xs truncate">${event.repo.name}</div>
                            <div class="text-white/40 text-xs mt-1">${timeAgo}</div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        content.innerHTML = html;
        
    } catch (error) {
        console.error('GitHub API Error:', error);
        content.innerHTML = `
            <div class="text-white/70 text-sm">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                Unable to load GitHub activity
            </div>
            <div class="text-white/50 text-xs mt-2">
                Set your username in settings
            </div>
        `;
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (let [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }
    
    return 'just now';
}

// Notes
function saveNotes() {
    state.notes = document.getElementById('quickNotes').value;
    saveState();
    showNotification('Notes saved!');
}

// TODO List
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    state.todos.push({
        id: Date.now(),
        text: text,
        completed: false,
        priority: 'normal',
        createdAt: new Date().toISOString()
    });
    
    input.value = '';
    saveState();
    renderTodos();
    updateStats();
}

function toggleTodo(id) {
    const todo = state.todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        if (todo.completed) {
            todo.completedAt = new Date().toISOString();
        } else {
            delete todo.completedAt;
        }
        saveState();
        renderTodos();
        updateStats();
    }
}

function deleteTodo(id) {
    state.todos = state.todos.filter(t => t.id !== id);
    saveState();
    renderTodos();
    updateStats();
}

function renderTodos() {
    const list = document.getElementById('todoList');
    
    if (state.todos.length === 0) {
        list.innerHTML = '<div class="text-white/50 text-sm text-center py-4">No tasks yet</div>';
        return;
    }
    
    const activeTodos = state.todos.filter(t => !t.completed);
    const completedTodos = state.todos.filter(t => t.completed);
    const sortedTodos = [...activeTodos, ...completedTodos];
    
    list.innerHTML = sortedTodos.map(todo => `
        <div class="bg-white/10 rounded-lg p-3 flex items-center gap-3 ${todo.completed ? 'opacity-60' : ''}">
            <input 
                type="checkbox" 
                ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo(${todo.id})"
                class="w-5 h-5 rounded cursor-pointer"
            >
            <div class="flex-1 text-white text-sm ${todo.completed ? 'line-through' : ''}">${todo.text}</div>
            <button onclick="deleteTodo(${todo.id})" class="text-red-400 hover:text-red-300 transition">
                <i class="fas fa-trash text-xs"></i>
            </button>
        </div>
    `).join('');
}

// Time Tracker
function startTimer() {
    const projectName = document.getElementById('projectName').value.trim();
    
    if (!projectName) {
        showNotification('Enter project name first!', 'error');
        return;
    }
    
    if (state.timerRunning) {
        showNotification('Timer already running!', 'error');
        return;
    }
    
    state.timerRunning = true;
    state.timerStart = Date.now();
    state.currentProject = projectName;
    
    state.timerInterval = setInterval(updateTimerDisplay, 100);
    saveState();
}

function stopTimer() {
    if (!state.timerRunning) return;
    
    clearInterval(state.timerInterval);
    
    const duration = Date.now() - state.timerStart;
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    state.timeLogs.push({
        project: state.currentProject,
        duration: duration,
        durationText: `${hours}h ${minutes}m ${seconds}s`,
        timestamp: new Date().toISOString()
    });
    
    state.timerRunning = false;
    state.timerStart = null;
    state.currentProject = '';
    
    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('projectName').value = '';
    
    saveState();
    renderTimeLogs();
    showNotification('Time logged!');
}

function updateTimerDisplay() {
    if (!state.timerRunning) return;
    
    const elapsed = Date.now() - state.timerStart;
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    
    document.getElementById('timerDisplay').textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function renderTimeLogs() {
    const log = document.getElementById('timeLog');
    
    if (state.timeLogs.length === 0) {
        log.innerHTML = '';
        return;
    }
    
    const recent = state.timeLogs.slice(-5).reverse();
    
    log.innerHTML = recent.map(entry => `
        <div class="bg-white/10 rounded-lg p-2 text-xs">
            <div class="text-white font-medium">${entry.project}</div>
            <div class="text-white/60">${entry.durationText}</div>
        </div>
    `).join('');
}

// Code Snippets
function addSnippet() {
    const title = document.getElementById('snippetTitle').value.trim();
    const code = document.getElementById('snippetCode').value.trim();
    
    if (!title || !code) {
        showNotification('Fill in both title and code!', 'error');
        return;
    }
    
    state.snippets.push({
        id: Date.now(),
        title: title,
        code: code,
        createdAt: new Date().toISOString()
    });
    
    document.getElementById('snippetTitle').value = '';
    document.getElementById('snippetCode').value = '';
    
    saveState();
    renderSnippets();
    updateStats();
}

function deleteSnippet(id) {
    state.snippets = state.snippets.filter(s => s.id !== id);
    saveState();
    renderSnippets();
    updateStats();
}

function copySnippet(id) {
    const snippet = state.snippets.find(s => s.id === id);
    if (snippet) {
        navigator.clipboard.writeText(snippet.code);
        showNotification('Copied to clipboard!');
    }
}

function renderSnippets() {
    const list = document.getElementById('snippetList');
    
    if (state.snippets.length === 0) {
        list.innerHTML = '<div class="text-white/50 text-sm text-center py-4">No snippets yet</div>';
        return;
    }
    
    list.innerHTML = state.snippets.slice(-5).reverse().map(snippet => `
        <div class="bg-white/10 rounded-lg p-3">
            <div class="flex items-center justify-between mb-2">
                <div class="text-white text-sm font-medium">${snippet.title}</div>
                <div class="flex gap-2">
                    <button onclick="copySnippet(${snippet.id})" class="text-blue-400 hover:text-blue-300 transition">
                        <i class="fas fa-copy text-xs"></i>
                    </button>
                    <button onclick="deleteSnippet(${snippet.id})" class="text-red-400 hover:text-red-300 transition">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
            <pre class="bg-black/30 text-green-300 text-xs p-2 rounded overflow-x-auto"><code>${escapeHtml(snippet.code)}</code></pre>
        </div>
    `).join('');
}

// Settings
function openSettings() {
    document.getElementById('settingsModal').classList.remove('hidden');
    document.getElementById('githubUsername').value = state.githubUsername;
    document.getElementById('pomodoroWork').value = state.pomodoro.workDuration / 60;
    document.getElementById('pomodoroBreak').value = state.pomodoro.breakDuration / 60;
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function saveSettings() {
    state.githubUsername = document.getElementById('githubUsername').value.trim();
    
    const workDuration = parseInt(document.getElementById('pomodoroWork').value);
    const breakDuration = parseInt(document.getElementById('pomodoroBreak').value);
    
    if (workDuration && workDuration > 0 && workDuration <= 60) {
        state.pomodoro.workDuration = workDuration * 60;
        if (!state.pomodoro.isRunning && state.pomodoro.mode === 'work') {
            state.pomodoro.timeRemaining = workDuration * 60;
        }
    }
    
    if (breakDuration && breakDuration > 0 && breakDuration <= 30) {
        state.pomodoro.breakDuration = breakDuration * 60;
        if (!state.pomodoro.isRunning && state.pomodoro.mode === 'break') {
            state.pomodoro.timeRemaining = breakDuration * 60;
        }
    }
    
    saveState();
    closeSettings();
    loadGithubActivity();
    updatePomodoroDisplay();
    showNotification('Settings saved!');
}

// Stats
function updateStats() {
    document.getElementById('todoCount').textContent = state.todos.filter(t => !t.completed).length;
    document.getElementById('snippetCount').textContent = state.snippets.length;
}

// Refresh All
function refreshAll() {
    loadGithubActivity();
    showNotification('Refreshed!');
}

// Utilities
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 glass rounded-lg px-6 py-3 text-white z-50 fade-in ${
        type === 'error' ? 'bg-red-500/50' : 'bg-green-500/50'
    }`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'} mr-2"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// Theme Toggle
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
    saveState();
}

function applyTheme() {
    const icon = document.getElementById('themeIcon');
    if (state.theme === 'dark') {
        document.body.classList.add('dark-theme');
        if (icon) icon.className = 'fas fa-sun';
    } else {
        document.body.classList.remove('dark-theme');
        if (icon) icon.className = 'fas fa-moon';
    }
}

// State Persistence
function saveState() {
    localStorage.setItem('devdash_state', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('devdash_state');
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            state = { ...state, ...loaded };
            
            // Don't restore timer running state
            state.timerRunning = false;
            state.timerInterval = null;
        } catch (e) {
            console.error('Failed to load state:', e);
        }
    }
}


// Onboarding
function showOnboarding() {
    if (!localStorage.getItem('devdash_onboarding_seen')) {
        document.getElementById('onboardingOverlay').classList.remove('hidden');
    }
}

function closeOnboarding() {
    document.getElementById('onboardingOverlay').classList.add('hidden');
    localStorage.setItem('devdash_onboarding_seen', 'true');
}
// Close settings on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSettings();
    }
});
