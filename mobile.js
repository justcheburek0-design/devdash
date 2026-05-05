// Mobile Responsive Utilities
// Enhanced mobile experience and touch gestures

// Touch gesture support
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function initTouchGestures() {
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleGesture();
    }, false);
}

function handleGesture() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // Swipe detection
    if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe right
                onSwipeRight();
            } else {
                // Swipe left
                onSwipeLeft();
            }
        }
    } else {
        if (Math.abs(diffY) > 50) {
            if (diffY > 0) {
                // Swipe down
                onSwipeDown();
            } else {
                // Swipe up
                onSwipeUp();
            }
        }
    }
}

function onSwipeRight() {
    // Could be used for navigation
    console.log('Swipe right detected');
}

function onSwipeLeft() {
    // Could be used for navigation
    console.log('Swipe left detected');
}

function onSwipeDown() {
    // Refresh on swipe down
    refreshAll();
}

function onSwipeUp() {
    // Could show command palette
    console.log('Swipe up detected');
}

// Pull to refresh
let pullStartY = 0;
let pullDistance = 0;
const pullThreshold = 80;

function initPullToRefresh() {
    const container = document.querySelector('body');
    
    container.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            pullStartY = e.touches[0].clientY;
        }
    });
    
    container.addEventListener('touchmove', (e) => {
        if (window.scrollY === 0 && pullStartY > 0) {
            pullDistance = e.touches[0].clientY - pullStartY;
            
            if (pullDistance > 0 && pullDistance < pullThreshold * 2) {
                e.preventDefault();
                showPullIndicator(pullDistance);
            }
        }
    });
    
    container.addEventListener('touchend', () => {
        if (pullDistance > pullThreshold) {
            refreshAll();
            showNotification('Refreshing...');
        }
        hidePullIndicator();
        pullStartY = 0;
        pullDistance = 0;
    });
}

function showPullIndicator(distance) {
    let indicator = document.getElementById('pullIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'pullIndicator';
        indicator.className = 'fixed top-0 left-0 right-0 flex items-center justify-center bg-white/10 backdrop-blur-sm transition-all z-50';
        indicator.innerHTML = '<i class="fas fa-sync-alt text-white"></i>';
        document.body.appendChild(indicator);
    }
    
    const height = Math.min(distance, pullThreshold);
    indicator.style.height = `${height}px`;
    indicator.style.opacity = Math.min(distance / pullThreshold, 1);
    
    if (distance > pullThreshold) {
        indicator.querySelector('i').classList.add('fa-spin');
    } else {
        indicator.querySelector('i').classList.remove('fa-spin');
    }
}

function hidePullIndicator() {
    const indicator = document.getElementById('pullIndicator');
    if (indicator) {
        indicator.style.height = '0px';
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 300);
    }
}

// Mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Responsive grid adjustment
function adjustGridForMobile() {
    const isMobile = window.innerWidth < 768;
    const grid = document.querySelector('.grid');
    
    if (grid && isMobile) {
        grid.classList.remove('md:grid-cols-2', 'lg:grid-cols-3');
        grid.classList.add('grid-cols-1');
    }
}

// Vibration feedback (mobile)
function vibrate(pattern = 50) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

// Add vibration to button clicks on mobile
function addVibrationFeedback() {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
            vibrate(10);
        });
    });
}

// Install as PWA prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    const prompt = document.createElement('div');
    prompt.className = 'fixed bottom-4 left-4 right-4 glass rounded-lg p-4 z-50 fade-in';
    prompt.innerHTML = `
        <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <i class="fas fa-download text-white text-xl"></i>
                <div>
                    <div class="text-white text-sm font-semibold">Install DevDash</div>
                    <div class="text-white/70 text-xs">Add to home screen for quick access</div>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="installPWA()" class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm transition">
                    Install
                </button>
                <button onclick="dismissInstallPrompt()" class="text-white/60 hover:text-white px-2 transition">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    prompt.id = 'installPrompt';
    document.body.appendChild(prompt);
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showNotification('Thanks for installing DevDash! 🎉');
            }
            deferredPrompt = null;
            dismissInstallPrompt();
        });
    }
}

function dismissInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
        prompt.remove();
    }
}

// Screen orientation handling
function handleOrientationChange() {
    const orientation = screen.orientation?.type || 'unknown';
    
    if (orientation.includes('landscape')) {
        // Adjust layout for landscape
        document.body.classList.add('landscape-mode');
    } else {
        document.body.classList.remove('landscape-mode');
    }
}

window.addEventListener('orientationchange', handleOrientationChange);

// Battery status (if available)
async function checkBatteryStatus() {
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            
            if (battery.level < 0.2 && !battery.charging) {
                showNotification('⚠️ Low battery! Consider saving your work.', 'warning');
            }
            
            battery.addEventListener('levelchange', () => {
                if (battery.level < 0.1 && !battery.charging) {
                    showNotification('🔋 Critical battery! Save your work now!', 'error');
                }
            });
        } catch (error) {
            console.log('Battery API not available');
        }
    }
}

// Network information
function checkNetworkStatus() {
    if ('connection' in navigator) {
        const connection = navigator.connection;
        
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            showNotification('Slow connection detected. Some features may be limited.', 'warning');
        }
        
        connection.addEventListener('change', () => {
            if (connection.effectiveType === '4g' || connection.effectiveType === 'wifi') {
                showNotification('Fast connection restored! 🚀');
            }
        });
    }
}

// Share API
function shareData(title, text, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: text,
            url: url
        }).then(() => {
            showNotification('Shared successfully!');
        }).catch((error) => {
            console.log('Share failed:', error);
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(url || text);
        showNotification('Link copied to clipboard!');
    }
}

// Export stats as shareable text
function shareStats() {
    const summary = generateStatsSummary();
    const text = `
📊 My DevDash Stats:
✅ ${summary.todosCompleted} tasks completed today
🍅 ${summary.pomodorosCompleted} pomodoros
🔥 ${summary.longestStreak} day longest streak
📝 ${summary.totalTodos} total tasks

Track your productivity with DevDash!
    `.trim();
    
    shareData('My DevDash Stats', text, window.location.href);
}

// Screenshot functionality (experimental)
async function takeScreenshot() {
    try {
        if ('mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices) {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            
            video.onloadedmetadata = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `devdash-${Date.now()}.png`;
                    a.click();
                    
                    stream.getTracks().forEach(track => track.stop());
                    showNotification('Screenshot saved!');
                });
            };
        } else {
            showNotification('Screenshot not supported on this device', 'error');
        }
    } catch (error) {
        console.log('Screenshot failed:', error);
    }
}

// Accessibility improvements
function initAccessibility() {
    // Add ARIA labels
    document.querySelectorAll('button').forEach(button => {
        if (!button.getAttribute('aria-label') && button.textContent) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });
    
    // Keyboard navigation for cards
    document.querySelectorAll('.card-hover').forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                card.click();
            }
        });
    });
    
    // Focus visible styles
    const style = document.createElement('style');
    style.textContent = `
        *:focus-visible {
            outline: 2px solid rgba(255, 255, 255, 0.5);
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
}

// Performance monitoring
function monitorPerformance() {
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        
        if (perfData) {
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            
            if (loadTime > 3000) {
                console.warn('Slow page load detected:', loadTime, 'ms');
            }
        }
    }
}

// Memory usage warning
function checkMemoryUsage() {
    if ('memory' in performance) {
        const memory = performance.memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        if (usedPercent > 90) {
            showNotification('High memory usage detected. Consider refreshing the page.', 'warning');
        }
    }
}

// Initialize mobile features
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initTouchGestures();
        initPullToRefresh();
        adjustGridForMobile();
        addVibrationFeedback();
        handleOrientationChange();
        checkBatteryStatus();
        checkNetworkStatus();
        initAccessibility();
        monitorPerformance();
        
        // Check memory every 5 minutes
        setInterval(checkMemoryUsage, 300000);
        
        // Adjust grid on resize
        window.addEventListener('resize', adjustGridForMobile);
    });
}

// Service Worker registration (for PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('ServiceWorker registered:', registration);
        }).catch((error) => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}
