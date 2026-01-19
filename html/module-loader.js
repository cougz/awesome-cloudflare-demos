const API_BASE = '/modules';

function toggleTheme() {
    try {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    } catch (error) {
        console.error('Error in toggleTheme:', error);
    }
}

function loadTheme() {
    try {
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const systemTheme = prefersDark ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', systemTheme);
            updateThemeIcon(systemTheme);
        }
    } catch (error) {
        console.error('Error in loadTheme:', error);
    }
}

function updateThemeIcon(theme) {
    try {
        const icon = document.getElementById('theme-icon');
        if (!icon) return;

        if (theme === 'dark') {
            icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            `;
        } else {
            icon.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
            `;
        }
    } catch (error) {
        console.error('Error in updateThemeIcon:', error);
    }
}

function createFloatingDots() {
    const container = document.getElementById('dots-container');
    if (!container) return;

    container.innerHTML = '';
    const dotCount = 16;

    for (let i = 0; i < dotCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';

        dot.style.left = Math.random() * 100 + '%';
        dot.style.top = Math.random() * 100 + '%';
        dot.style.animationDelay = (Math.random() * 10) + 's';
        dot.style.animationDuration = (18 + Math.random() * 8) + 's';

        const size = 6 + Math.random() * 2;
        dot.style.width = size + 'px';
        dot.style.height = size + 'px';

        container.appendChild(dot);
    }
}

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
        document.getElementById('module-list').innerHTML = '<p style="color: red;">Error loading modules: ' + error.message + '</p>';
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

        executeScripts(moduleContent);
        addCopyButtonsToNginxConfig(moduleContent);
        replaceDomainInCurlCommands();
        setupCopyButtons(moduleContent);
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

    // Remove all inline onclick handlers from copy buttons
    const copyBtns = container.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        if (btn.hasAttribute('onclick')) {
            btn.removeAttribute('onclick');
        }
    });
}

function replaceDomainInCurlCommands() {
    const currentHostname = window.location.hostname;
    console.log('Domain replacement: Replacing YOUR_DOMAIN with', currentHostname);
    const curlPres = document.querySelectorAll('.curl-command pre');
    console.log('Found', curlPres.length, 'curl-command pre elements');

    curlPres.forEach((pre, index) => {
        const oldContent = pre.textContent;
        pre.textContent = oldContent.replace(/YOUR_DOMAIN/g, currentHostname);
        console.log('Replaced in pre', index, ':', oldContent.includes('YOUR_DOMAIN') ? 'YES' : 'NO');
    });
}

function copyCommand(button) {
    let pre = button.previousElementSibling;
    if (!pre || pre.tagName !== 'PRE') {
        pre = button.parentElement.querySelector('pre');
    }
    if (!pre) {
        console.error('No <pre> element found');
        return;
    }
    const text = pre.textContent.trim();
    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓ Copied';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        button.textContent = '✗ Failed';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

function addCopyButtonsToNginxConfig(container) {
    const nginxConfigs = container.querySelectorAll('.nginx-config');
    nginxConfigs.forEach(config => {
        if (!config.querySelector('.copy-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = '📋 Copy';
            copyBtn.title = 'Copy to clipboard';
            copyBtn.dataset.type = 'nginx';
            config.appendChild(copyBtn);
        }
    });
}

function setupCopyButtons(container) {
    console.log('Setting up copy buttons...');
    const copyBtns = container.querySelectorAll('.copy-btn');
    console.log('Found copy buttons:', copyBtns.length);

    copyBtns.forEach((btn, index) => {
        if (btn.dataset.hasSetup) {
            console.log(`Button ${index} already has setup, skipping`);
            return;
        }

        console.log(`Setting up button ${index}`);

        btn.dataset.hasSetup = 'true';

        btn.addEventListener('click', (e) => {
            console.log('Copy button clicked!');
            e.preventDefault();
            e.stopPropagation();

            let pre;

            if (btn.dataset.type === 'nginx') {
                const config = btn.parentElement;
                pre = config.querySelector('pre');
                console.log('Nginx config - pre found:', !!pre);
            } else {
                pre = btn.previousElementSibling;
                console.log('Curl command - pre found:', !!pre);
            }

            if (!pre) {
                console.error('No <pre> element found for copy button');
                return;
            }

            const text = pre.textContent.trim();
            console.log('Text to copy:', text.substring(0, 50) + '...');

            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    console.log('Copy successful with Clipboard API!');
                    const originalText = btn.textContent;
                    btn.textContent = '✓ Copied';
                    setTimeout(() => {
                        btn.textContent = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('Clipboard API failed:', err);
                    fallbackCopy(text, btn);
                });
            } else {
                // Fallback for HTTP contexts
                console.log('Clipboard API not available, using fallback');
                fallbackCopy(text, btn);
            }
        });
    });

    console.log('Copy buttons setup complete');
}

function fallbackCopy(text, btn) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
        const successful = document.execCommand('copy');
        console.log('Fallback copy successful:', successful);

        if (successful) {
            const originalText = btn.textContent;
            btn.textContent = '✓ Copied';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        } else {
            btn.textContent = '✗ Failed';
            setTimeout(() => {
                btn.textContent = '📋 Copy';
            }, 2000);
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        btn.textContent = '✗ Failed';
        setTimeout(() => {
            btn.textContent = '📋 Copy';
        }, 2000);
    } finally {
        document.body.removeChild(textarea);
    }
}

function showModuleList() {
    document.getElementById('module-content').innerHTML = '';
    document.getElementById('module-list').style.display = 'grid';
}

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    createFloatingDots();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            updateThemeIcon(e.matches ? 'dark' : 'light');
        }
    });

    loadModules();

    fetch('/app-header.html')
        .then(r => r.text())
        .then(html => {
            const appHeader = document.getElementById('app-header');
            if (appHeader) {
                appHeader.innerHTML = html;
            }
        })
        .catch(error => {
            console.error('Failed to load app-header:', error);
        });
});
