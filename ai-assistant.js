// AI Assistant Integration Module
// Smart suggestions and productivity insights

// AI-powered task suggestions
function generateTaskSuggestions() {
    const suggestions = [];
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    
    // Time-based suggestions
    if (hour >= 9 && hour < 12) {
        suggestions.push({
            type: 'task',
            priority: 'high',
            text: 'Review and prioritize today\'s tasks',
            reason: 'Morning is best for planning'
        });
    }
    
    if (hour >= 14 && hour < 16) {
        suggestions.push({
            type: 'break',
            priority: 'medium',
            text: 'Take a 15-minute break',
            reason: 'Post-lunch energy dip'
        });
    }
    
    if (hour >= 17 && hour < 19) {
        suggestions.push({
            type: 'review',
            priority: 'medium',
            text: 'Review what you accomplished today',
            reason: 'End-of-day reflection'
        });
    }
    
    // Pattern-based suggestions
    const incompleteTasks = state.todos.filter(t => !t.completed).length;
    if (incompleteTasks > 10) {
        suggestions.push({
            type: 'cleanup',
            priority: 'high',
            text: 'Clean up your task list',
            reason: `You have ${incompleteTasks} pending tasks`
        });
    }
    
    // Habit suggestions
    const today = new Date().toISOString().split('T')[0];
    const habitsNotDone = state.habits.filter(h => !h.completedDates.includes(today));
    if (habitsNotDone.length > 0) {
        suggestions.push({
            type: 'habit',
            priority: 'medium',
            text: `Complete your habits: ${habitsNotDone.map(h => h.name).join(', ')}`,
            reason: 'Keep your streaks alive'
        });
    }
    
    // Pomodoro suggestions
    if (state.pomodoro.completedSessions.length === 0) {
        suggestions.push({
            type: 'pomodoro',
            priority: 'high',
            text: 'Start your first Pomodoro session',
            reason: 'Focus time is productive time'
        });
    }
    
    // Project suggestions
    const activeProjects = state.projects.filter(p => p.status === 'active');
    const staleProjects = activeProjects.filter(p => {
        if (!p.lastWorkedOn) return true;
        const daysSince = (Date.now() - new Date(p.lastWorkedOn)) / (1000 * 60 * 60 * 24);
        return daysSince > 7;
    });
    
    if (staleProjects.length > 0) {
        suggestions.push({
            type: 'project',
            priority: 'medium',
            text: `Check on stale projects: ${staleProjects.map(p => p.name).join(', ')}`,
            reason: 'Haven\'t worked on these in a while'
        });
    }
    
    // Weekend suggestions
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        suggestions.push({
            type: 'planning',
            priority: 'low',
            text: 'Plan your week ahead',
            reason: 'Weekend is great for planning'
        });
    }
    
    return suggestions;
}

function renderAISuggestions() {
    const container = document.getElementById('aiSuggestions');
    if (!container) return;
    
    const suggestions = generateTaskSuggestions();
    
    if (suggestions.length === 0) {
        container.innerHTML = '<div class="text-white/50 text-sm text-center py-4">No suggestions right now</div>';
        return;
    }
    
    const priorityColors = {
        high: 'border-red-500/40 bg-red-500/10',
        medium: 'border-yellow-500/40 bg-yellow-500/10',
        low: 'border-blue-500/40 bg-blue-500/10'
    };
    
    const priorityIcons = {
        high: '🔴',
        medium: '🟡',
        low: '🔵'
    };
    
    container.innerHTML = suggestions.map(suggestion => `
        <div class="border ${priorityColors[suggestion.priority]} rounded-lg p-3 mb-2">
            <div class="flex items-start gap-3">
                <div class="text-xl">${priorityIcons[suggestion.priority]}</div>
                <div class="flex-1">
                    <div class="text-white text-sm font-medium mb-1">${suggestion.text}</div>
                    <div class="text-white/60 text-xs">${suggestion.reason}</div>
                </div>
                <button onclick="dismissSuggestion(this)" class="text-white/40 hover:text-white/80 transition">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function dismissSuggestion(button) {
    button.closest('.border').remove();
}

// Smart task prioritization
function prioritizeTasks() {
    const tasks = state.todos.filter(t => !t.completed);
    
    // Score each task
    const scoredTasks = tasks.map(task => {
        let score = 0;
        
        // Age factor (older tasks get higher priority)
        const age = (Date.now() - new Date(task.createdAt)) / (1000 * 60 * 60 * 24);
        score += Math.min(age * 10, 50);
        
        // Keyword analysis
        const urgentKeywords = ['urgent', 'asap', 'important', 'critical', 'deadline'];
        const text = task.text.toLowerCase();
        urgentKeywords.forEach(keyword => {
            if (text.includes(keyword)) score += 30;
        });
        
        // Length factor (shorter tasks might be quick wins)
        if (task.text.length < 30) score += 10;
        
        return { ...task, priorityScore: score };
    });
    
    // Sort by score
    scoredTasks.sort((a, b) => b.priorityScore - a.priorityScore);
    
    return scoredTasks.slice(0, 5);
}

function renderPrioritizedTasks() {
    const container = document.getElementById('prioritizedTasks');
    if (!container) return;
    
    const tasks = prioritizeTasks();
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="text-white/50 text-sm text-center py-4">No tasks to prioritize</div>';
        return;
    }
    
    container.innerHTML = tasks.map((task, index) => `
        <div class="bg-white/10 rounded-lg p-3 mb-2">
            <div class="flex items-center gap-3">
                <div class="text-white font-bold text-lg">${index + 1}</div>
                <div class="flex-1">
                    <div class="text-white text-sm">${task.text}</div>
                    <div class="text-white/60 text-xs mt-1">Priority score: ${Math.round(task.priorityScore)}</div>
                </div>
                <button onclick="toggleTodo(${task.id})" class="text-green-400 hover:text-green-300 transition">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Productivity patterns analysis
function analyzeProductivityPatterns() {
    const patterns = {
        bestTimeOfDay: null,
        bestDayOfWeek: null,
        averageTasksPerDay: 0,
        averagePomodorosPerDay: 0,
        mostProductiveHour: null
    };
    
    // Analyze time of day
    const hourlyStats = {};
    state.pomodoro.completedSessions.forEach(session => {
        const hour = new Date(session.timestamp).getHours();
        hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
    });
    
    if (Object.keys(hourlyStats).length > 0) {
        const bestHour = Object.entries(hourlyStats).sort((a, b) => b[1] - a[1])[0];
        patterns.mostProductiveHour = parseInt(bestHour[0]);
    }
    
    // Analyze day of week
    const dailyStats = {};
    Object.keys(state.analytics.dailyStats).forEach(dateStr => {
        const date = new Date(dateStr);
        const day = date.getDay();
        const score = calculateDayScore(state.analytics.dailyStats[dateStr]);
        
        if (!dailyStats[day]) {
            dailyStats[day] = { total: 0, count: 0 };
        }
        dailyStats[day].total += score;
        dailyStats[day].count += 1;
    });
    
    if (Object.keys(dailyStats).length > 0) {
        const bestDay = Object.entries(dailyStats)
            .map(([day, data]) => ({ day: parseInt(day), avg: data.total / data.count }))
            .sort((a, b) => b.avg - a.avg)[0];
        
        patterns.bestDayOfWeek = bestDay.day;
    }
    
    // Calculate averages
    const totalDays = Object.keys(state.analytics.dailyStats).length;
    if (totalDays > 0) {
        const totalTasks = Object.values(state.analytics.dailyStats)
            .reduce((sum, stats) => sum + (stats.todosCompleted || 0), 0);
        const totalPomodoros = Object.values(state.analytics.dailyStats)
            .reduce((sum, stats) => sum + (stats.pomodorosCompleted || 0), 0);
        
        patterns.averageTasksPerDay = (totalTasks / totalDays).toFixed(1);
        patterns.averagePomodorosPerDay = (totalPomodoros / totalDays).toFixed(1);
    }
    
    return patterns;
}

function renderProductivityPatterns() {
    const container = document.getElementById('productivityPatterns');
    if (!container) return;
    
    const patterns = analyzeProductivityPatterns();
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    container.innerHTML = `
        <div class="space-y-3">
            ${patterns.mostProductiveHour !== null ? `
                <div class="bg-white/10 rounded-lg p-3">
                    <div class="text-white/80 text-sm mb-1">Most Productive Hour</div>
                    <div class="text-white text-lg font-semibold">${patterns.mostProductiveHour}:00 - ${patterns.mostProductiveHour + 1}:00</div>
                </div>
            ` : ''}
            
            ${patterns.bestDayOfWeek !== null ? `
                <div class="bg-white/10 rounded-lg p-3">
                    <div class="text-white/80 text-sm mb-1">Most Productive Day</div>
                    <div class="text-white text-lg font-semibold">${dayNames[patterns.bestDayOfWeek]}</div>
                </div>
            ` : ''}
            
            <div class="bg-white/10 rounded-lg p-3">
                <div class="text-white/80 text-sm mb-1">Daily Averages</div>
                <div class="text-white text-sm">
                    📝 ${patterns.averageTasksPerDay} tasks completed<br>
                    🍅 ${patterns.averagePomodorosPerDay} pomodoros
                </div>
            </div>
        </div>
    `;
}

// Smart break suggestions
function suggestBreak() {
    const now = Date.now();
    const lastBreak = state.lastBreakTime || 0;
    const timeSinceBreak = now - lastBreak;
    const hoursSinceBreak = timeSinceBreak / (1000 * 60 * 60);
    
    if (hoursSinceBreak > 2) {
        showNotification('💡 You\'ve been working for a while. Time for a break!');
        return true;
    }
    
    return false;
}

function takeBreak() {
    state.lastBreakTime = Date.now();
    saveState();
    showNotification('Break started! Come back refreshed! ☕');
    
    // Start a 5-minute break timer
    setTimeout(() => {
        showNotification('Break over! Ready to get back to work? 💪');
    }, 300000);
}

// Motivational messages based on progress
function getMotivationalMessage() {
    const today = new Date().toISOString().split('T')[0];
    const stats = state.analytics.dailyStats[today] || {};
    const score = calculateDayScore(stats);
    
    if (score >= 80) {
        return '🌟 Outstanding work today! You\'re crushing it!';
    } else if (score >= 60) {
        return '💪 Great progress! Keep up the momentum!';
    } else if (score >= 40) {
        return '👍 Good effort! You\'re making steady progress!';
    } else if (score >= 20) {
        return '🚀 You\'re getting started! Every step counts!';
    } else {
        return '💡 New day, new opportunities! Let\'s make it count!';
    }
}

function showMotivationalMessage() {
    const message = getMotivationalMessage();
    showNotification(message);
}

// Task completion predictions
function predictTaskCompletion(task) {
    // Simple heuristic based on task characteristics
    let estimatedMinutes = 30; // Default
    
    const words = task.text.split(' ').length;
    if (words < 5) estimatedMinutes = 15;
    else if (words > 15) estimatedMinutes = 60;
    
    // Check for complexity keywords
    const complexKeywords = ['implement', 'design', 'research', 'analyze', 'refactor'];
    const simpleKeywords = ['fix', 'update', 'check', 'review', 'test'];
    
    const text = task.text.toLowerCase();
    if (complexKeywords.some(kw => text.includes(kw))) {
        estimatedMinutes *= 2;
    } else if (simpleKeywords.some(kw => text.includes(kw))) {
        estimatedMinutes *= 0.5;
    }
    
    return estimatedMinutes;
}

// Focus score calculation
function calculateFocusScore() {
    const today = new Date().toISOString().split('T')[0];
    const todayPomodoros = state.pomodoro.completedSessions.filter(s => 
        s.timestamp.startsWith(today)
    ).length;
    
    const todayTasks = state.todos.filter(t => 
        t.completed && t.completedAt && t.completedAt.startsWith(today)
    ).length;
    
    // Focus score based on pomodoros and task completion
    const pomodoroScore = Math.min(todayPomodoros * 10, 50);
    const taskScore = Math.min(todayTasks * 5, 30);
    const consistencyScore = todayPomodoros > 0 && todayTasks > 0 ? 20 : 0;
    
    return pomodoroScore + taskScore + consistencyScore;
}

function renderFocusScore() {
    const container = document.getElementById('focusScore');
    if (!container) return;
    
    const score = calculateFocusScore();
    const percentage = Math.min(score, 100);
    
    let emoji = '😴';
    let message = 'Time to focus!';
    
    if (percentage >= 80) {
        emoji = '🔥';
        message = 'On fire!';
    } else if (percentage >= 60) {
        emoji = '💪';
        message = 'Strong focus!';
    } else if (percentage >= 40) {
        emoji = '👍';
        message = 'Good effort!';
    } else if (percentage >= 20) {
        emoji = '🌱';
        message = 'Getting started!';
    }
    
    container.innerHTML = `
        <div class="text-center">
            <div class="text-6xl mb-2">${emoji}</div>
            <div class="text-4xl font-bold text-white mb-2">${percentage}%</div>
            <div class="text-white/80 text-sm mb-4">${message}</div>
            <div class="bg-white/20 rounded-full h-3 overflow-hidden">
                <div class="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all" style="width: ${percentage}%"></div>
            </div>
        </div>
    `;
}

// Initialize AI features
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        renderAISuggestions();
        renderPrioritizedTasks();
        renderProductivityPatterns();
        renderFocusScore();
        
        // Show motivational message on load (50% chance)
        if (Math.random() < 0.5) {
            setTimeout(showMotivationalMessage, 3000);
        }
        
        // Check for break suggestions every 30 minutes
        setInterval(suggestBreak, 1800000);
        
        // Refresh AI features every 10 minutes
        setInterval(() => {
            renderAISuggestions();
            renderPrioritizedTasks();
            renderProductivityPatterns();
            renderFocusScore();
        }, 600000);
    });
}
