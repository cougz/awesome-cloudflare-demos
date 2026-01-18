const API_BASE = '/modules';

// ============================================
//   THEME MANAGEMENT
//   ============================================

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function loadTheme() {
    // Check for saved preference first
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // Use saved preference
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        updateThemeIcon(systemTheme);
    }
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    
    if (theme === 'dark') {
        // Sun icon for dark mode (to switch to light)
        icon.innerHTML = `
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2m0 10h-2a8 8 0 00-16 0m16 16v-2h2a10 10 0 0020 0m0-12v2a2 2 0 012 2m-2 2a2 2 0 012 2" />
        `;
    } else {
        // Moon icon for light mode (to switch to dark)
        icon.innerHTML = `
            <path d="M12 3a6 6 0 006 6v12a6 6 0 00-6-6v-12a6 6 0 006-6m0 4a2 2 0 012-2m-2 2a2 2 0 012-2 0 2 2 0 002-2m0 4a2 2 0 012-2m-2 2a2 2 0 002 2"/>
        `;
    }
}

// ============================================
//   FLOATING DOTS GENERATION
//   ============================================

function createFloatingDots() {
    const container = document.getElementById('dots-container');
    if (!container) return;
    
    // Clear existing dots
    container.innerHTML = '';
    
    // Create 16 dots (balanced)
    const dotCount = 16;
    
    for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        
        // Random position
        dot.style.left = Math.random() * 100 + '%';
        dot.style.top = Math.random() * 100 + '%';
        
        // Staggered animation timing for organic feel
        dot.style.animationDelay = (Math.random() * 10) + 's';
        dot.style.animationDuration = (18 + Math.random() * 8) + 's';
        
        // Slight size variation
        const size = 6 + Math.random() * 2;
        dot.style.width = size + 'px';
        dot.style.height = size + 'px';
        
        container.appendChild(dot);
    }
}

// ============================================
//   ORIGINAL MODULE LOADING LOGIC
//   ============================================

async function loadModules() {
    try {
        const response = await fetch(`${API_BASE}/`);
        if (!response.ok) {
            throw new Error('Failed to load modules');
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a[href]');

        const moduleDirs = Array.from(links)
            .map(link => link.getAttribute('href').replace(/\/$/, ''))
            .filter(dir => dir && dir !== '.' && dir !== '..');

        const modules = [];
        for (const dir of moduleDirs) {
            try {
                const configResponse = await fetch(`${API_BASE}/${dir}/config.json`);
                if (configResponse.ok) {
                    const config = await configResponse.json();
                    if (config.enabled) {
                        modules.push({
                            ...config,
                            dir: dir
                        });
                    }
                }
            } catch (e) {
                console.error(`Failed to load config for ${dir}:`, e);
            }
        }

        modules.sort((a, b) => (a.order || 999) - (b.order || 999));
        renderModuleList(modules);
    } catch (error) {
        console.error('Error loading modules:', error);
        document.getElementById('module-list').innerHTML = '<p style="color: red;">Error loading modules</p>';
    }
}

function renderModuleList(modules) {
    const moduleList = document.getElementById('module-list');

    if (modules.length === 0) {
        moduleList.innerHTML = '<p>No modules available</p>';
        return;
    }

    moduleList.innerHTML = modules.map(module => `
        <div class="module-card" onclick="loadModule('${module.dir}')">
            <div class="module-card-icon">${module.icon || '📦'}</div>
            <h2 class="module-card-title">${module.name}</h2>
            <p class="module-card-description">${module.description || ''}</p>
        </div>
    `).join('');
}

async function loadModule(moduleDir) {
    try {
        const response = await fetch(`${API_BASE}/${moduleDir}/ui.html`);
        if (!response.ok) {
            throw new Error('Failed to load module UI');
        }

        const html = await response.text();
        document.getElementById('module-list').style.display = 'none';
        const moduleContent = document.getElementById('module-content');
        moduleContent.innerHTML = html;

        const backBtn = document.createElement('a');
        backBtn.href = '#';
        backBtn.className = 'back-button';
        backBtn.textContent = '← Back to Modules';
        backBtn.onclick = (e) => {
            e.preventDefault();
            showModuleList();
        };
        moduleContent.insertBefore(backBtn, moduleContent.firstChild);
        
        // Execute any inline scripts from the loaded HTML
        executeScripts(moduleContent);
        
        // Replace YOUR_DOMAIN in all curl commands
        replaceDomainInCurlCommands();
    } catch (error) {
        console.error('Error loading module:', error);
        alert('Failed to load module');
    }
}

function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
    });
}

function replaceDomainInCurlCommands() {
    const currentHostname = window.location.hostname;
    console.log('Domain replacement: Replacing YOUR_DOMAIN with', currentHostname);
    const curlElements = document.querySelectorAll('.curl-command');
    console.log('Found', curlElements.length, 'curl-command elements');

    curlElements.forEach((element, index) => {
        const oldContent = element.textContent;
        element.textContent = oldContent.replace(/YOUR_DOMAIN/g, currentHostname);
        console.log('Replaced in element', index, ':', oldContent.includes('YOUR_DOMAIN') ? 'YES' : 'NO');
    });
}

function showModuleList() {
    document.getElementById('module-content').innerHTML = '';
    document.getElementById('module-list').style.display = 'grid';
}

// ============================================
//   INITIALIZATION
//   ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Load theme
    loadTheme();
    
    // Create floating dots
    createFloatingDots();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            updateThemeIcon(e.matches ? 'dark' : 'light');
        }
    });
    
    // Load modules and app header
    loadModules();
    document.getElementById('app-header').innerHTML = '';
    fetch('/app-header.html')
        .then(r => r.text())
        .then(html => {
            document.getElementById('app-header').innerHTML = html;
        });
});
