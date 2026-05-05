// API Integration Module
// Integrates with various developer APIs

// GitHub Stats
async function fetchGitHubStats(username) {
    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`)
        ]);
        
        if (!userResponse.ok || !reposResponse.ok) {
            throw new Error('Failed to fetch GitHub stats');
        }
        
        const user = await userResponse.json();
        const repos = await reposResponse.json();
        
        // Calculate stats
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
        const languages = {};
        
        repos.forEach(repo => {
            if (repo.language) {
                languages[repo.language] = (languages[repo.language] || 0) + 1;
            }
        });
        
        const topLanguages = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([lang, count]) => ({ language: lang, count: count }));
        
        return {
            username: user.login,
            name: user.name,
            avatar: user.avatar_url,
            bio: user.bio,
            publicRepos: user.public_repos,
            followers: user.followers,
            following: user.following,
            totalStars: totalStars,
            totalForks: totalForks,
            topLanguages: topLanguages,
            createdAt: user.created_at
        };
    } catch (error) {
        console.error('GitHub Stats Error:', error);
        return null;
    }
}

function renderGitHubStats(stats) {
    const container = document.getElementById('githubStats');
    if (!container || !stats) return;
    
    container.innerHTML = `
        <div class="flex items-center gap-4 mb-4">
            <img src="${stats.avatar}" alt="${stats.username}" class="w-16 h-16 rounded-full border-2 border-white/20">
            <div>
                <div class="text-white font-semibold">${stats.name || stats.username}</div>
                <div class="text-white/60 text-sm">@${stats.username}</div>
            </div>
        </div>
        
        ${stats.bio ? `<div class="text-white/80 text-sm mb-4">${stats.bio}</div>` : ''}
        
        <div class="grid grid-cols-3 gap-3 mb-4">
            <div class="bg-white/10 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-white">${stats.publicRepos}</div>
                <div class="text-white/60 text-xs">Repos</div>
            </div>
            <div class="bg-white/10 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-white">${stats.totalStars}</div>
                <div class="text-white/60 text-xs">Stars</div>
            </div>
            <div class="bg-white/10 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-white">${stats.followers}</div>
                <div class="text-white/60 text-xs">Followers</div>
            </div>
        </div>
        
        <div class="bg-white/10 rounded-lg p-3">
            <div class="text-white/80 text-sm mb-2">Top Languages</div>
            ${stats.topLanguages.map(lang => `
                <div class="flex items-center justify-between text-white/70 text-xs mb-1">
                    <span>${lang.language}</span>
                    <span>${lang.count} repos</span>
                </div>
            `).join('')}
        </div>
    `;
}

// Weather API Integration
async function fetchWeather(city) {
    try {
        // Using free weather API (no key required)
        const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch weather');
        }
        
        const data = await response.json();
        const current = data.current_condition[0];
        const forecast = data.weather[0];
        
        return {
            temperature: current.temp_C,
            feelsLike: current.FeelsLikeC,
            condition: current.weatherDesc[0].value,
            humidity: current.humidity,
            windSpeed: current.windspeedKmph,
            icon: getWeatherIcon(current.weatherCode),
            forecast: {
                maxTemp: forecast.maxtempC,
                minTemp: forecast.mintempC
            }
        };
    } catch (error) {
        console.error('Weather API Error:', error);
        return null;
    }
}

function getWeatherIcon(code) {
    const icons = {
        '113': '☀️', // Sunny
        '116': '⛅', // Partly cloudy
        '119': '☁️', // Cloudy
        '122': '☁️', // Overcast
        '143': '🌫️', // Mist
        '176': '🌦️', // Patchy rain
        '179': '🌨️', // Patchy snow
        '200': '⛈️', // Thundery
        '227': '🌨️', // Blowing snow
        '230': '❄️', // Blizzard
        '248': '🌫️', // Fog
        '260': '🌫️', // Freezing fog
        '263': '🌦️', // Patchy light drizzle
        '266': '🌧️', // Light drizzle
        '281': '🌧️', // Freezing drizzle
        '284': '🌧️', // Heavy freezing drizzle
        '293': '🌦️', // Patchy light rain
        '296': '🌧️', // Light rain
        '299': '🌧️', // Moderate rain
        '302': '🌧️', // Heavy rain
        '305': '🌧️', // Heavy rain
        '308': '🌧️', // Heavy rain
        '311': '🌧️', // Light freezing rain
        '314': '🌧️', // Moderate or heavy freezing rain
        '317': '🌨️', // Light sleet
        '320': '🌨️', // Moderate or heavy sleet
        '323': '🌨️', // Patchy light snow
        '326': '❄️', // Light snow
        '329': '❄️', // Patchy moderate snow
        '332': '❄️', // Moderate snow
        '335': '❄️', // Patchy heavy snow
        '338': '❄️', // Heavy snow
        '350': '🌨️', // Ice pellets
        '353': '🌦️', // Light rain shower
        '356': '🌧️', // Moderate or heavy rain shower
        '359': '🌧️', // Torrential rain shower
        '362': '🌨️', // Light sleet showers
        '365': '🌨️', // Moderate or heavy sleet showers
        '368': '🌨️', // Light snow showers
        '371': '❄️', // Moderate or heavy snow showers
        '374': '🌨️', // Light showers of ice pellets
        '377': '🌨️', // Moderate or heavy showers of ice pellets
        '386': '⛈️', // Patchy light rain with thunder
        '389': '⛈️', // Moderate or heavy rain with thunder
        '392': '⛈️', // Patchy light snow with thunder
        '395': '⛈️'  // Moderate or heavy snow with thunder
    };
    
    return icons[code] || '🌡️';
}

function renderWeather(weather) {
    const container = document.getElementById('weatherWidget');
    if (!container || !weather) return;
    
    container.innerHTML = `
        <div class="text-center">
            <div class="text-6xl mb-2">${weather.icon}</div>
            <div class="text-4xl font-bold text-white mb-1">${weather.temperature}°C</div>
            <div class="text-white/80 text-sm mb-3">${weather.condition}</div>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="bg-white/10 rounded p-2">
                    <div class="text-white/60">Feels like</div>
                    <div class="text-white font-semibold">${weather.feelsLike}°C</div>
                </div>
                <div class="bg-white/10 rounded p-2">
                    <div class="text-white/60">Humidity</div>
                    <div class="text-white font-semibold">${weather.humidity}%</div>
                </div>
                <div class="bg-white/10 rounded p-2">
                    <div class="text-white/60">Wind</div>
                    <div class="text-white font-semibold">${weather.windSpeed} km/h</div>
                </div>
                <div class="bg-white/10 rounded p-2">
                    <div class="text-white/60">Today</div>
                    <div class="text-white font-semibold">${weather.forecast.minTemp}° / ${weather.forecast.maxTemp}°</div>
                </div>
            </div>
        </div>
    `;
}

// Cryptocurrency Prices
async function fetchCryptoPrices() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano&vs_currencies=usd&include_24hr_change=true');
        
        if (!response.ok) {
            throw new Error('Failed to fetch crypto prices');
        }
        
        const data = await response.json();
        
        return {
            bitcoin: {
                price: data.bitcoin.usd,
                change: data.bitcoin.usd_24h_change
            },
            ethereum: {
                price: data.ethereum.usd,
                change: data.ethereum.usd_24h_change
            },
            cardano: {
                price: data.cardano.usd,
                change: data.cardano.usd_24h_change
            }
        };
    } catch (error) {
        console.error('Crypto API Error:', error);
        return null;
    }
}

function renderCryptoPrices(prices) {
    const container = document.getElementById('cryptoWidget');
    if (!container || !prices) return;
    
    const cryptos = [
        { name: 'Bitcoin', symbol: 'BTC', data: prices.bitcoin, icon: '₿' },
        { name: 'Ethereum', symbol: 'ETH', data: prices.ethereum, icon: 'Ξ' },
        { name: 'Cardano', symbol: 'ADA', data: prices.cardano, icon: '₳' }
    ];
    
    container.innerHTML = cryptos.map(crypto => {
        const isPositive = crypto.data.change >= 0;
        const changeColor = isPositive ? 'text-green-400' : 'text-red-400';
        const changeIcon = isPositive ? '▲' : '▼';
        
        return `
            <div class="bg-white/10 rounded-lg p-3 mb-2">
                <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2">
                        <span class="text-2xl">${crypto.icon}</span>
                        <div>
                            <div class="text-white text-sm font-semibold">${crypto.name}</div>
                            <div class="text-white/60 text-xs">${crypto.symbol}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-white font-semibold">$${crypto.data.price.toLocaleString()}</div>
                        <div class="${changeColor} text-xs">
                            ${changeIcon} ${Math.abs(crypto.data.change).toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// News Headlines (Dev News)
async function fetchDevNews() {
    try {
        // Using Hacker News API
        const topStoriesResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const topStories = await topStoriesResponse.json();
        
        // Fetch first 5 stories
        const stories = await Promise.all(
            topStories.slice(0, 5).map(id =>
                fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
            )
        );
        
        return stories.map(story => ({
            title: story.title,
            url: story.url,
            score: story.score,
            author: story.by,
            time: new Date(story.time * 1000)
        }));
    } catch (error) {
        console.error('News API Error:', error);
        return null;
    }
}

function renderDevNews(news) {
    const container = document.getElementById('newsWidget');
    if (!container || !news) return;
    
    container.innerHTML = news.map(story => `
        <a href="${story.url}" target="_blank" class="block bg-white/10 rounded-lg p-3 mb-2 hover:bg-white/20 transition">
            <div class="text-white text-sm font-medium mb-1">${story.title}</div>
            <div class="flex items-center gap-3 text-white/60 text-xs">
                <span>⬆️ ${story.score}</span>
                <span>by ${story.author}</span>
                <span>${getTimeAgo(story.time)}</span>
            </div>
        </a>
    `).join('');
}

// Stack Overflow Questions
async function fetchStackOverflowQuestions(tag) {
    try {
        const response = await fetch(`https://api.stackexchange.com/2.3/questions?order=desc&sort=activity&tagged=${tag}&site=stackoverflow&pagesize=5`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch Stack Overflow questions');
        }
        
        const data = await response.json();
        
        return data.items.map(item => ({
            title: item.title,
            url: item.link,
            score: item.score,
            answers: item.answer_count,
            views: item.view_count,
            tags: item.tags,
            author: item.owner.display_name,
            time: new Date(item.creation_date * 1000)
        }));
    } catch (error) {
        console.error('Stack Overflow API Error:', error);
        return null;
    }
}

function renderStackOverflowQuestions(questions) {
    const container = document.getElementById('stackOverflowWidget');
    if (!container || !questions) return;
    
    container.innerHTML = questions.map(q => `
        <a href="${q.url}" target="_blank" class="block bg-white/10 rounded-lg p-3 mb-2 hover:bg-white/20 transition">
            <div class="text-white text-sm font-medium mb-2">${q.title}</div>
            <div class="flex flex-wrap gap-1 mb-2">
                ${q.tags.slice(0, 3).map(tag => `
                    <span class="bg-blue-500/30 text-blue-200 text-xs px-2 py-1 rounded">${tag}</span>
                `).join('')}
            </div>
            <div class="flex items-center gap-3 text-white/60 text-xs">
                <span>⬆️ ${q.score}</span>
                <span>💬 ${q.answers}</span>
                <span>👁️ ${q.views}</span>
            </div>
        </a>
    `).join('');
}

// Initialize API integrations
async function initAPIIntegrations() {
    // GitHub Stats
    if (state.githubUsername) {
        const stats = await fetchGitHubStats(state.githubUsername);
        if (stats) {
            renderGitHubStats(stats);
        }
    }
    
    // Weather
    const weather = await fetchWeather('Bolshoy Kamen');
    if (weather) {
        renderWeather(weather);
    }
    
    // Crypto Prices
    const crypto = await fetchCryptoPrices();
    if (crypto) {
        renderCryptoPrices(crypto);
    }
    
    // Dev News
    const news = await fetchDevNews();
    if (news) {
        renderDevNews(news);
    }
    
    // Stack Overflow
    const soQuestions = await fetchStackOverflowQuestions('javascript');
    if (soQuestions) {
        renderStackOverflowQuestions(soQuestions);
    }
}

// Refresh API data periodically
function startAPIRefreshInterval() {
    // Refresh every 10 minutes
    setInterval(async () => {
        await initAPIIntegrations();
    }, 600000);
}

// Initialize on load
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initAPIIntegrations();
        startAPIRefreshInterval();
    });
}
