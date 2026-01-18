const API_BASE = '/modules';

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
    } catch (error) {
        console.error('Error loading module:', error);
        alert('Failed to load module');
    }
}

function showModuleList() {
    document.getElementById('module-content').innerHTML = '';
    document.getElementById('module-list').style.display = 'grid';
}

document.addEventListener('DOMContentLoaded', () => {
    loadModules();
    document.getElementById('app-header').innerHTML = '';
    fetch('/app-header.html')
        .then(r => r.text())
        .then(html => {
            document.getElementById('app-header').innerHTML = html;
        });
});
