// 全局状态
let allPlugins = [];
let activeTag = null;

// 页面加载
document.addEventListener('DOMContentLoaded', async () => {
    await loadPlugins();
    renderTagFilter();
    renderPlugins();
    bindSearch();
});

async function loadPlugins() {
    try {
        const res = await fetch('data/plugins.json');
        allPlugins = await res.json();
    } catch (e) {
        console.error('加载插件数据失败', e);
        document.getElementById('pluginGrid').innerHTML =
            '<div class="empty">加载失败，请检查 data/plugins.json</div>';
    }
}

function renderTagFilter() {
    const tags = new Set();
    allPlugins.forEach(p => (p.tags || []).forEach(t => tags.add(t)));

    const container = document.getElementById('tagFilter');
    container.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = 'tag-btn active';
    allBtn.textContent = '全部';
    allBtn.onclick = () => {
        activeTag = null;
        updateTagButtons();
        renderPlugins();
    };
    container.appendChild(allBtn);

    tags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.textContent = tag;
        btn.onclick = () => {
            activeTag = tag;
            updateTagButtons();
            renderPlugins();
        };
        container.appendChild(btn);
    });
}

function updateTagButtons() {
    document.querySelectorAll('.tag-btn').forEach(btn => {
        const isAll = btn.textContent === '全部';
        if (isAll) {
            btn.classList.toggle('active', activeTag === null);
        } else {
            btn.classList.toggle('active', btn.textContent === activeTag);
        }
    });
}

function renderPlugins(filterText = '') {
    const grid = document.getElementById('pluginGrid');
    let list = allPlugins;

    if (activeTag) {
        list = list.filter(p => (p.tags || []).includes(activeTag));
    }

    if (filterText) {
        const q = filterText.toLowerCase();
        list = list.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
        );
    }

    if (list.length === 0) {
        grid.innerHTML = '<div class="empty">没有找到匹配的插件</div>';
        return;
    }

    grid.innerHTML = list.map(p => `
        <a class="plugin-card" href="plugin.html?id=${encodeURIComponent(p.id)}">
            <div class="plugin-card-header">
                ${p.icon
                    ? `<img class="plugin-icon" src="${escapeHtml(p.icon)}" alt="${escapeHtml(p.name)}">`
                    : `<div class="plugin-icon-placeholder">${escapeHtml(p.name.charAt(0))}</div>`
                }
                <div>
                    <div class="plugin-name">${escapeHtml(p.name)}</div>
                    <div class="plugin-meta">v${escapeHtml(p.version)} · ${escapeHtml(p.platform)}</div>
                </div>
            </div>
            <div class="plugin-desc">${escapeHtml(p.description || '')}</div>
            <div class="plugin-tags">
                ${(p.tags || []).map(t => `<span class="plugin-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
        </a>
    `).join('');
}

function bindSearch() {
    const input = document.getElementById('search');
    input.addEventListener('input', e => {
        renderPlugins(e.target.value.trim());
    });
}

function escapeHtml(s) {
    if (s == null) return '';
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
