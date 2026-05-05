// Keyboard Shortcuts Module
// Provides keyboard shortcuts for common actions

const shortcuts = {
    'ctrl+n': () => document.getElementById('todoInput').focus(),
    'ctrl+s': () => saveNotes(),
    'ctrl+h': () => document.getElementById('habitInput').focus(),
    'ctrl+p': () => document.getElementById('projectInput').focus(),
    'ctrl+t': () => document.getElementById('snippetTitle').focus(),
    'ctrl+,': () => openSettings(),
    'escape': () => closeSettings(),
    'space': (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            if (state.pomodoro.isRunning) {
                pausePomodoro();
            } else {
                startPomodoro();
            }
        }
    }
};

document.addEventListener('keydown', (e) => {
    const key = [];
    if (e.ctrlKey) key.push('ctrl');
    if (e.altKey) key.push('alt');
    if (e.shiftKey) key.push('shift');
    key.push(e.key.toLowerCase());
    
    const combo = key.join('+');
    
    if (shortcuts[combo]) {
        shortcuts[combo](e);
    }
});

// Export/Import Data
function exportData() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        state: state
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devdash-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.version && data.state) {
                    state = { ...state, ...data.state };
                    saveState();
                    
                    // Refresh all UI
                    renderTodos();
                    renderSnippets();
                    renderHabits();
                    renderProjects();
                    renderTimeLogs();
                    updateAnalytics();
                    renderWeeklyOverview();
                    updateStats();
                    
                    document.getElementById('quickNotes').value = state.notes;
                    
                    showNotification('Data imported successfully!');
                } else {
                    showNotification('Invalid backup file!', 'error');
                }
            } catch (error) {
                showNotification('Failed to import data!', 'error');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            clearSearchResults();
            return;
        }
        
        const results = {
            todos: state.todos.filter(t => t.text.toLowerCase().includes(query)),
            snippets: state.snippets.filter(s => 
                s.title.toLowerCase().includes(query) || 
                s.code.toLowerCase().includes(query)
            ),
            habits: state.habits.filter(h => h.name.toLowerCase().includes(query)),
            projects: state.projects.filter(p => p.name.toLowerCase().includes(query)),
            notes: state.notes.toLowerCase().includes(query) ? [{ text: state.notes }] : []
        };
        
        displaySearchResults(results);
    });
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    const totalResults = 
        results.todos.length + 
        results.snippets.length + 
        results.habits.length + 
        results.projects.length + 
        results.notes.length;
    
    if (totalResults === 0) {
        container.innerHTML = '<div class="text-white/50 text-sm p-4">No results found</div>';
        container.classList.remove('hidden');
        return;
    }
    
    let html = '<div class="space-y-3 p-4">';
    
    if (results.todos.length > 0) {
        html += '<div class="text-white/80 text-sm font-semibold mb-2">Tasks</div>';
        results.todos.forEach(todo => {
            html += `<div class="bg-white/10 rounded p-2 text-white text-sm">${todo.text}</div>`;
        });
    }
    
    if (results.snippets.length > 0) {
        html += '<div class="text-white/80 text-sm font-semibold mb-2 mt-3">Snippets</div>';
        results.snippets.forEach(snippet => {
            html += `<div class="bg-white/10 rounded p-2 text-white text-sm">${snippet.title}</div>`;
        });
    }
    
    if (results.habits.length > 0) {
        html += '<div class="text-white/80 text-sm font-semibold mb-2 mt-3">Habits</div>';
        results.habits.forEach(habit => {
            html += `<div class="bg-white/10 rounded p-2 text-white text-sm">${habit.name}</div>`;
        });
    }
    
    if (results.projects.length > 0) {
        html += '<div class="text-white/80 text-sm font-semibold mb-2 mt-3">Projects</div>';
        results.projects.forEach(project => {
            html += `<div class="bg-white/10 rounded p-2 text-white text-sm">${project.name}</div>`;
        });
    }
    
    if (results.notes.length > 0) {
        html += '<div class="text-white/80 text-sm font-semibold mb-2 mt-3">Notes</div>';
        html += '<div class="bg-white/10 rounded p-2 text-white text-sm">Found in notes</div>';
    }
    
    html += '</div>';
    container.innerHTML = html;
    container.classList.remove('hidden');
}

function clearSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) {
        container.classList.add('hidden');
    }
}

// Theme Switcher
const themes = {
    purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    blue: 'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
    green: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    orange: 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)',
    pink: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
    dark: 'linear-gradient(135deg, #232526 0%, #414345 100%)'
};

function changeTheme(themeName) {
    if (themes[themeName]) {
        document.body.style.background = themes[themeName];
        state.theme = themeName;
        saveState();
        showNotification(`Theme changed to ${themeName}!`);
    }
}

function initTheme() {
    if (state.theme && themes[state.theme]) {
        document.body.style.background = themes[state.theme];
    }
}

// Quick Actions
function clearAllCompleted() {
    const completedCount = state.todos.filter(t => t.completed).length;
    
    if (completedCount === 0) {
        showNotification('No completed tasks to clear!', 'error');
        return;
    }
    
    if (confirm(`Clear ${completedCount} completed task(s)?`)) {
        state.todos = state.todos.filter(t => !t.completed);
        saveState();
        renderTodos();
        updateStats();
        showNotification(`Cleared ${completedCount} completed task(s)!`);
    }
}

function clearAllData() {
    if (confirm('⚠️ This will delete ALL your data! Are you sure?')) {
        if (confirm('Really sure? This cannot be undone!')) {
            localStorage.removeItem('devdash_state');
            location.reload();
        }
    }
}

// Motivational Quotes
const quotes = [
    { text: "Code is like humor. When you have to explain it, it's bad.", author: "Cory House" },
    { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
    { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
    { text: "In order to be irreplaceable, one must always be different.", author: "Coco Chanel" },
    { text: "Java is to JavaScript what car is to Carpet.", author: "Chris Heilmann" },
    { text: "Knowledge is power.", author: "Francis Bacon" },
    { text: "Sometimes it pays to stay in bed on Monday, rather than spending the rest of the week debugging Monday's code.", author: "Dan Salomon" },
    { text: "Perfection is achieved not when there is nothing more to add, but rather when there is nothing more to take away.", author: "Antoine de Saint-Exupery" },
    { text: "Code never lies, comments sometimes do.", author: "Ron Jeffries" },
    { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" }
];

function showRandomQuote() {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 glass rounded-lg px-6 py-4 text-white z-50 fade-in max-w-md';
    notification.innerHTML = `
        <div class="text-sm italic mb-2">"${quote.text}"</div>
        <div class="text-xs text-white/60 text-right">— ${quote.author}</div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 8000);
}

// Show random quote on load (20% chance)
if (Math.random() < 0.2) {
    setTimeout(showRandomQuote, 2000);
}

// Productivity Tips
const tips = [
    "💡 Use Pomodoro technique: 25 min focus + 5 min break",
    "💡 Break large tasks into smaller, manageable chunks",
    "💡 Take regular breaks to maintain productivity",
    "💡 Review your goals at the start of each day",
    "💡 Eliminate distractions during focus time",
    "💡 Track your time to understand where it goes",
    "💡 Build habits one at a time for better success",
    "💡 Use keyboard shortcuts to work faster",
    "💡 Keep your workspace organized and clean",
    "💡 Celebrate small wins to stay motivated"
];

function showProductivityTip() {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    showNotification(tip);
}

// Auto-save notes
let notesTimeout;
document.getElementById('quickNotes')?.addEventListener('input', () => {
    clearTimeout(notesTimeout);
    notesTimeout = setTimeout(() => {
        state.notes = document.getElementById('quickNotes').value;
        saveState();
    }, 1000);
});

// Initialize keyboard shortcuts and theme
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initSearch();
        
        // Show productivity tip every hour
        setInterval(showProductivityTip, 3600000);
    });
}
