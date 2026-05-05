// Data Visualization Module
// Charts and graphs for productivity insights

// Chart.js-like simple charting without dependencies
class SimpleChart {
    constructor(canvas, data, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.data = data;
        this.options = {
            type: options.type || 'bar',
            colors: options.colors || ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
            padding: options.padding || 40,
            showLabels: options.showLabels !== false,
            showGrid: options.showGrid !== false
        };
        this.render();
    }
    
    render() {
        const { width, height } = this.canvas;
        const { padding } = this.options;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, width, height);
        
        // Draw based on type
        if (this.options.type === 'bar') {
            this.drawBarChart(width, height, padding);
        } else if (this.options.type === 'line') {
            this.drawLineChart(width, height, padding);
        } else if (this.options.type === 'pie') {
            this.drawPieChart(width, height);
        }
    }
    
    drawBarChart(width, height, padding) {
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const maxValue = Math.max(...this.data.values);
        const barWidth = chartWidth / this.data.values.length;
        
        // Draw grid
        if (this.options.showGrid) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight / 5) * i;
                this.ctx.beginPath();
                this.ctx.moveTo(padding, y);
                this.ctx.lineTo(width - padding, y);
                this.ctx.stroke();
            }
        }
        
        // Draw bars
        this.data.values.forEach((value, index) => {
            const barHeight = (value / maxValue) * chartHeight;
            const x = padding + index * barWidth + barWidth * 0.1;
            const y = height - padding - barHeight;
            const w = barWidth * 0.8;
            
            // Gradient
            const gradient = this.ctx.createLinearGradient(x, y, x, y + barHeight);
            gradient.addColorStop(0, this.options.colors[index % this.options.colors.length]);
            gradient.addColorStop(1, this.options.colors[(index + 1) % this.options.colors.length]);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, w, barHeight);
            
            // Labels
            if (this.options.showLabels && this.data.labels) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.font = '12px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.data.labels[index], x + w / 2, height - padding + 20);
                
                // Values
                this.ctx.fillText(value, x + w / 2, y - 5);
            }
        });
    }
    
    drawLineChart(width, height, padding) {
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const maxValue = Math.max(...this.data.values);
        const pointSpacing = chartWidth / (this.data.values.length - 1);
        
        // Draw grid
        if (this.options.showGrid) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight / 5) * i;
                this.ctx.beginPath();
                this.ctx.moveTo(padding, y);
                this.ctx.lineTo(width - padding, y);
                this.ctx.stroke();
            }
        }
        
        // Draw line
        this.ctx.strokeStyle = this.options.colors[0];
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        this.data.values.forEach((value, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (value / maxValue) * chartHeight;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();
        
        // Draw points
        this.data.values.forEach((value, index) => {
            const x = padding + index * pointSpacing;
            const y = height - padding - (value / maxValue) * chartHeight;
            
            this.ctx.fillStyle = this.options.colors[0];
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Labels
            if (this.options.showLabels && this.data.labels) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                this.ctx.font = '12px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(this.data.labels[index], x, height - padding + 20);
            }
        });
    }
    
    drawPieChart(width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 40;
        const total = this.data.values.reduce((sum, val) => sum + val, 0);
        
        let currentAngle = -Math.PI / 2;
        
        this.data.values.forEach((value, index) => {
            const sliceAngle = (value / total) * Math.PI * 2;
            
            // Draw slice
            this.ctx.fillStyle = this.options.colors[index % this.options.colors.length];
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            this.ctx.closePath();
            this.ctx.fill();
            
            // Draw label
            if (this.options.showLabels && this.data.labels) {
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
                const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
                
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 14px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(this.data.labels[index], labelX, labelY);
                
                const percentage = ((value / total) * 100).toFixed(1);
                this.ctx.font = '12px sans-serif';
                this.ctx.fillText(`${percentage}%`, labelX, labelY + 15);
            }
            
            currentAngle += sliceAngle;
        });
    }
}

// Productivity Charts
function renderProductivityChart() {
    const canvas = document.getElementById('productivityChart');
    if (!canvas) return;
    
    // Get last 7 days data
    const days = [];
    const scores = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        days.push(dayName);
        
        const stats = state.analytics.dailyStats[dateStr] || {};
        const score = calculateDayScore(stats);
        scores.push(score);
    }
    
    new SimpleChart(canvas, {
        labels: days,
        values: scores
    }, {
        type: 'line',
        colors: ['#667eea', '#764ba2']
    });
}

function renderTimeDistributionChart() {
    const canvas = document.getElementById('timeDistributionChart');
    if (!canvas) return;
    
    // Calculate time spent per project
    const projectTimes = {};
    
    state.timeLogs.forEach(log => {
        projectTimes[log.project] = (projectTimes[log.project] || 0) + log.duration;
    });
    
    const projects = Object.keys(projectTimes).slice(0, 5);
    const times = projects.map(p => Math.floor(projectTimes[p] / 3600000)); // Convert to hours
    
    if (projects.length === 0) {
        return;
    }
    
    new SimpleChart(canvas, {
        labels: projects,
        values: times
    }, {
        type: 'pie',
        colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']
    });
}

function renderTaskCompletionChart() {
    const canvas = document.getElementById('taskCompletionChart');
    if (!canvas) return;
    
    // Get last 7 days task completion
    const days = [];
    const completed = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        days.push(dayName);
        
        const stats = state.analytics.dailyStats[dateStr] || {};
        completed.push(stats.todosCompleted || 0);
    }
    
    new SimpleChart(canvas, {
        labels: days,
        values: completed
    }, {
        type: 'bar',
        colors: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
    });
}

function renderHabitStreakChart() {
    const canvas = document.getElementById('habitStreakChart');
    if (!canvas) return;
    
    if (state.habits.length === 0) {
        return;
    }
    
    const habitNames = state.habits.map(h => h.name.substring(0, 10));
    const streaks = state.habits.map(h => h.streak);
    
    new SimpleChart(canvas, {
        labels: habitNames,
        values: streaks
    }, {
        type: 'bar',
        colors: ['#f093fb', '#4facfe', '#43e97b', '#667eea']
    });
}

// Heatmap for activity
function renderActivityHeatmap() {
    const container = document.getElementById('activityHeatmap');
    if (!container) return;
    
    const today = new Date();
    const weeks = 12;
    const days = weeks * 7;
    
    let html = '<div class="grid grid-cols-12 gap-1">';
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const stats = state.analytics.dailyStats[dateStr] || {};
        const score = calculateDayScore(stats);
        
        let color = 'bg-white/5';
        if (score > 75) color = 'bg-green-500';
        else if (score > 50) color = 'bg-green-400';
        else if (score > 25) color = 'bg-green-300';
        else if (score > 0) color = 'bg-green-200';
        
        html += `
            <div class="${color} aspect-square rounded-sm" title="${dateStr}: ${score}%"></div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

// Insights and Recommendations
function generateInsights() {
    const insights = [];
    
    // Analyze productivity trends
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const stats = state.analytics.dailyStats[dateStr] || {};
        last7Days.push(calculateDayScore(stats));
    }
    
    const avgScore = last7Days.reduce((sum, s) => sum + s, 0) / last7Days.length;
    const trend = last7Days[6] - last7Days[0];
    
    if (avgScore > 70) {
        insights.push({
            type: 'success',
            icon: '🎉',
            message: 'Great week! Your productivity is consistently high.'
        });
    } else if (avgScore < 30) {
        insights.push({
            type: 'warning',
            icon: '⚠️',
            message: 'Your productivity has been low this week. Try breaking tasks into smaller chunks.'
        });
    }
    
    if (trend > 20) {
        insights.push({
            type: 'success',
            icon: '📈',
            message: 'Productivity trending up! Keep the momentum going.'
        });
    } else if (trend < -20) {
        insights.push({
            type: 'warning',
            icon: '📉',
            message: 'Productivity declining. Consider taking a break or adjusting your schedule.'
        });
    }
    
    // Habit insights
    const activeHabits = state.habits.filter(h => h.streak > 0);
    if (activeHabits.length > 0) {
        const maxStreak = Math.max(...activeHabits.map(h => h.streak));
        if (maxStreak >= 7) {
            insights.push({
                type: 'success',
                icon: '🔥',
                message: `Amazing! You have a ${maxStreak}-day streak. Don't break it!`
            });
        }
    }
    
    // Time tracking insights
    const totalTime = state.timeLogs.reduce((sum, log) => sum + log.duration, 0);
    const hours = Math.floor(totalTime / 3600000);
    if (hours > 100) {
        insights.push({
            type: 'info',
            icon: '⏱️',
            message: `You've tracked ${hours} hours total. That's dedication!`
        });
    }
    
    // Pomodoro insights
    const totalPomodoros = state.pomodoro.completedSessions.length;
    if (totalPomodoros > 50) {
        insights.push({
            type: 'success',
            icon: '🍅',
            message: `${totalPomodoros} pomodoros completed! You're a focus master.`
        });
    }
    
    return insights;
}

function renderInsights() {
    const container = document.getElementById('insightsWidget');
    if (!container) return;
    
    const insights = generateInsights();
    
    if (insights.length === 0) {
        container.innerHTML = '<div class="text-white/50 text-sm text-center py-4">Keep working to unlock insights!</div>';
        return;
    }
    
    container.innerHTML = insights.map(insight => {
        const colors = {
            success: 'bg-green-500/20 border-green-500/40',
            warning: 'bg-yellow-500/20 border-yellow-500/40',
            info: 'bg-blue-500/20 border-blue-500/40'
        };
        
        return `
            <div class="${colors[insight.type]} border rounded-lg p-3 mb-2">
                <div class="flex items-start gap-3">
                    <div class="text-2xl">${insight.icon}</div>
                    <div class="text-white text-sm">${insight.message}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Initialize charts
function initCharts() {
    renderProductivityChart();
    renderTimeDistributionChart();
    renderTaskCompletionChart();
    renderHabitStreakChart();
    renderActivityHeatmap();
    renderInsights();
}

// Refresh charts periodically
function startChartRefreshInterval() {
    setInterval(() => {
        initCharts();
    }, 300000); // Every 5 minutes
}

// Initialize on load
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait a bit for data to load
        setTimeout(() => {
            initCharts();
            startChartRefreshInterval();
        }, 1000);
    });
}
