// Notifications and Reminders System
// Advanced notification management with scheduling

state.reminders = state.reminders || [];
state.notifications = state.notifications || [];

// Reminder Functions
function addReminder() {
    const title = document.getElementById('reminderTitle')?.value.trim();
    const datetime = document.getElementById('reminderDatetime')?.value;
    const repeat = document.getElementById('reminderRepeat')?.value || 'none';
    
    if (!title || !datetime) {
        showNotification('Please enter title and time!', 'error');
        return;
    }
    
    const reminder = {
        id: Date.now(),
        title: title,
        datetime: datetime,
        repeat: repeat,
        active: true,
        createdAt: new Date().toISOString()
    };
    
    state.reminders.push(reminder);
    
    if (document.getElementById('reminderTitle')) {
        document.getElementById('reminderTitle').value = '';
        document.getElementById('reminderDatetime').value = '';
    }
    
    saveState();
    renderReminders();
    scheduleReminder(reminder);
    showNotification('Reminder set!');
}

function scheduleReminder(reminder) {
    const now = new Date();
    const reminderTime = new Date(reminder.datetime);
    const delay = reminderTime - now;
    
    if (delay > 0 && delay < 86400000) { // Within 24 hours
        setTimeout(() => {
            triggerReminder(reminder);
        }, delay);
    }
}

function triggerReminder(reminder) {
    // Show notification
    showNotification(`⏰ Reminder: ${reminder.title}`, 'info');
    
    // Play sound
    if (state.soundEnabled) {
        playNotificationSound();
    }
    
    // Browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('DevDash Reminder', {
            body: reminder.title,
            icon: '/favicon.ico'
        });
    }
    
    // Handle repeat
    if (reminder.repeat !== 'none') {
        const nextTime = calculateNextRepeat(reminder.datetime, reminder.repeat);
        reminder.datetime = nextTime;
        saveState();
        scheduleReminder(reminder);
    } else {
        reminder.active = false;
        saveState();
    }
    
    renderReminders();
}

function calculateNextRepeat(datetime, repeat) {
    const date = new Date(datetime);
    
    switch (repeat) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            break;
    }
    
    return date.toISOString().slice(0, 16);
}

function deleteReminder(id) {
    state.reminders = state.reminders.filter(r => r.id !== id);
    saveState();
    renderReminders();
}

function renderReminders() {
    const container = document.getElementById('reminderList');
    if (!container) return;
    
    const activeReminders = state.reminders.filter(r => r.active);
    
    if (activeReminders.length === 0) {
        container.innerHTML = '<div class="text-white/50 text-sm text-center py-4">No active reminders</div>';
        return;
    }
    
    container.innerHTML = activeReminders.map(reminder => {
        const time = new Date(reminder.datetime);
        const timeStr = time.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <div class="bg-white/10 rounded-lg p-3 mb-2">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <div class="text-white text-sm font-medium">${reminder.title}</div>
                        <div class="text-white/60 text-xs mt-1">
                            ${timeStr}
                            ${reminder.repeat !== 'none' ? `• Repeats ${reminder.repeat}` : ''}
                        </div>
                    </div>
                    <button onclick="deleteReminder(${reminder.id})" class="text-red-400 hover:text-red-300 transition">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Check reminders on load
function checkReminders() {
    state.reminders.filter(r => r.active).forEach(reminder => {
        scheduleReminder(reminder);
    });
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Bookmarks Manager
state.bookmarks = state.bookmarks || [];

function addBookmark() {
    const title = document.getElementById('bookmarkTitle')?.value.trim();
    const url = document.getElementById('bookmarkUrl')?.value.trim();
    const category = document.getElementById('bookmarkCategory')?.value || 'General';
    
    if (!title || !url) {
        showNotification('Please enter title and URL!', 'error');
        return;
    }
    
    state.bookmarks.push({
        id: Date.now(),
        title: title,
        url: url,
        category: category,
        createdAt: new Date().toISOString()
    });
    
    if (document.getElementById('bookmarkTitle')) {
        document.getElementById('bookmarkTitle').value = '';
        document.getElementById('bookmarkUrl').value = '';
    }
    
    saveState();
    renderBookmarks();
    showNotification('Bookmark added!');
}

function deleteBookmark(id) {
    state.bookmarks = state.bookmarks.filter(b => b.id !== id);
    saveState();
    renderBookmarks();
}

function renderBookmarks() {
    const container = document.getElementById('bookmarkList');
    if (!container) return;
    
    if (state.bookmarks.length === 0) {
        container.innerHTML = '<div class="text-white/50 text-sm text-center py-4">No bookmarks yet</div>';
        return;
    }
    
    // Group by category
    const categories = {};
    state.bookmarks.forEach(bookmark => {
        if (!categories[bookmark.category]) {
            categories[bookmark.category] = [];
        }
        categories[bookmark.category].push(bookmark);
    });
    
    let html = '';
    
    Object.keys(categories).forEach(category => {
        html += `<div class="mb-4">`;
        html += `<div class="text-white/80 text-sm font-semibold mb-2">${category}</div>`;
        
        categories[category].forEach(bookmark => {
            html += `
                <a href="${bookmark.url}" target="_blank" class="block bg-white/10 rounded-lg p-3 mb-2 hover:bg-white/20 transition group">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3 flex-1">
                            <i class="fas fa-bookmark text-white/60"></i>
                            <div>
                                <div class="text-white text-sm font-medium">${bookmark.title}</div>
                                <div class="text-white/60 text-xs truncate max-w-xs">${bookmark.url}</div>
                            </div>
                        </div>
                        <button onclick="event.preventDefault(); deleteBookmark(${bookmark.id})" class="text-red-400 hover:text-red-300 transition opacity-0 group-hover:opacity-100">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                </a>
            `;
        });
        
        html += `</div>`;
    });
    
    container.innerHTML = html;
}

// Quick Links
const quickLinks = [
    { name: 'GitHub', url: 'https://github.com', icon: 'fab fa-github' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'fab fa-stack-overflow' },
    { name: 'MDN', url: 'https://developer.mozilla.org', icon: 'fas fa-book' },
    { name: 'DevDocs', url: 'https://devdocs.io', icon: 'fas fa-file-code' },
    { name: 'Can I Use', url: 'https://caniuse.com', icon: 'fas fa-check-circle' },
    { name: 'Regex101', url: 'https://regex101.com', icon: 'fas fa-code' }
];

function renderQuickLinks() {
    const container = document.getElementById('quickLinks');
    if (!container) return;
    
    container.innerHTML = quickLinks.map(link => `
        <a href="${link.url}" target="_blank" class="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition flex flex-col items-center justify-center gap-2 text-center">
            <i class="${link.icon} text-2xl text-white"></i>
            <div class="text-white text-xs">${link.name}</div>
        </a>
    `).join('');
}

// Command Palette
let commandPaletteOpen = false;

function toggleCommandPalette() {
    commandPaletteOpen = !commandPaletteOpen;
    const palette = document.getElementById('commandPalette');
    
    if (palette) {
        if (commandPaletteOpen) {
            palette.classList.remove('hidden');
            document.getElementById('commandInput')?.focus();
        } else {
            palette.classList.add('hidden');
        }
    }
}

function executeCommand(command) {
    const cmd = command.toLowerCase().trim();
    
    const commands = {
        'new task': () => document.getElementById('todoInput')?.focus(),
        'new note': () => document.getElementById('quickNotes')?.focus(),
        'new habit': () => document.getElementById('habitInput')?.focus(),
        'new project': () => document.getElementById('projectInput')?.focus(),
        'new snippet': () => document.getElementById('snippetTitle')?.focus(),
        'start pomodoro': () => startPomodoro(),
        'start timer': () => document.getElementById('projectName')?.focus(),
        'settings': () => openSettings(),
        'export data': () => exportData(),
        'import data': () => importData(),
        'clear completed': () => clearAllCompleted(),
        'focus mode': () => toggleFocusMode(),
        'refresh': () => refreshAll(),
        'show stats': () => displayStatsSummary()
    };
    
    if (commands[cmd]) {
        commands[cmd]();
        toggleCommandPalette();
        showNotification(`Executed: ${cmd}`);
    } else {
        showNotification('Command not found!', 'error');
    }
}

// Command palette keyboard shortcut
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandPalette();
    }
});

// Search commands
function searchCommands(query) {
    const commands = [
        'new task', 'new note', 'new habit', 'new project', 'new snippet',
        'start pomodoro', 'start timer', 'settings', 'export data', 'import data',
        'clear completed', 'focus mode', 'refresh', 'show stats'
    ];
    
    return commands.filter(cmd => cmd.includes(query.toLowerCase()));
}

function renderCommandSuggestions(suggestions) {
    const container = document.getElementById('commandSuggestions');
    if (!container) return;
    
    if (suggestions.length === 0) {
        container.innerHTML = '<div class="text-white/50 text-sm p-4">No commands found</div>';
        return;
    }
    
    container.innerHTML = suggestions.map(cmd => `
        <div onclick="executeCommand('${cmd}')" class="px-4 py-3 hover:bg-white/10 cursor-pointer text-white text-sm">
            ${cmd}
        </div>
    `).join('');
}

// Initialize command input
function initCommandPalette() {
    const input = document.getElementById('commandInput');
    if (!input) return;
    
    input.addEventListener('input', (e) => {
        const query = e.target.value;
        const suggestions = searchCommands(query);
        renderCommandSuggestions(suggestions);
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            executeCommand(e.target.value);
        } else if (e.key === 'Escape') {
            toggleCommandPalette();
        }
    });
}

// Drag and Drop for file uploads
function initDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    if (!dropZone) return;
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('bg-white/20');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('bg-white/20');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('bg-white/20');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
}

function handleFileUpload(file) {
    if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.version && data.state) {
                    state = { ...state, ...data.state };
                    saveState();
                    location.reload();
                }
            } catch (error) {
                showNotification('Invalid file!', 'error');
            }
        };
        reader.readAsText(file);
    } else {
        showNotification('Only JSON files are supported!', 'error');
    }
}

// Offline Detection
function initOfflineDetection() {
    window.addEventListener('online', () => {
        showNotification('Back online! 🌐');
    });
    
    window.addEventListener('offline', () => {
        showNotification('You are offline! ⚠️', 'warning');
    });
}

// Auto-save indicator
let autoSaveTimeout;

function showAutoSaveIndicator() {
    const indicator = document.getElementById('autoSaveIndicator');
    if (!indicator) return;
    
    indicator.classList.remove('hidden');
    indicator.textContent = 'Saving...';
    
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        indicator.textContent = 'Saved ✓';
        setTimeout(() => {
            indicator.classList.add('hidden');
        }, 1000);
    }, 500);
}

// Override saveState to show indicator
const originalSaveState = saveState;
saveState = function() {
    originalSaveState();
    showAutoSaveIndicator();
};

// Initialize all features
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        checkReminders();
        requestNotificationPermission();
        renderReminders();
        renderBookmarks();
        renderQuickLinks();
        initCommandPalette();
        initDragAndDrop();
        initOfflineDetection();
    });
}

// Periodic reminder check
setInterval(checkReminders, 60000); // Check every minute
